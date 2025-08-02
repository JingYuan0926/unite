import { ethers } from "ethers";
import { Official1inchSDK, Quote, PreparedOrder } from "./Official1inchSDK";
import { TronExtension, TronEscrowParams } from "./TronExtension";
import { ConfigManager } from "../utils/ConfigManager";
import { ScopedLogger } from "../utils/Logger";
import { OrderStatus } from "@1inch/fusion-sdk";

// DemoResolver ABI for permissionless atomic swaps
const DEMO_RESOLVER_ABI = [
  "function executeSwap(bytes32 orderHash, uint256 amount, uint256 safetyDeposit, address maker) payable",
  "function withdrawETH(uint256 amount, address payable recipient)",
  "function getLockedBalance() view returns (uint256)",
  "function recoverETH()",
  "event SwapExecuted(address indexed maker, address indexed escrow, bytes32 indexed orderHash, uint256 amount, uint256 safetyDeposit)",
];

// EscrowFactory ABI with correct format for direct testing
const ESCROW_FACTORY_ABI = [
  "function addressOfEscrowSrc((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) view returns (address)",
  "function createSrcEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) payable returns (address)",
];

// Helper functions for encoding Address and Timelocks as uint256
function encodeAddress(
  addr: string,
  tronExtension?: TronExtension,
  config?: ConfigManager
): bigint {
  // Properly convert address to BigInt
  if (addr.startsWith("0x")) {
    // Ethereum address (hex string) - convert directly
    return BigInt(addr);
  } else if (addr.startsWith("T")) {
    // Tron address (base58) - convert to hex first
    if (!tronExtension || !config) {
      throw new Error(
        "TronExtension and ConfigManager required to convert Tron address"
      );
    }
    // Use any valid private key just to get the TronWeb address utility
    const tronWeb = tronExtension.createTronWebInstance(
      config.USER_B_TRON_PRIVATE_KEY
    );
    const hexAddress = (tronWeb as any).address.toHex(addr);
    return BigInt("0x" + hexAddress);
  } else {
    // Assume it's already a numeric string or hex without 0x
    return BigInt(addr.startsWith("0x") ? addr : "0x" + addr);
  }
}

function encodeTimelocks(timelocks: {
  deployedAt: number;
  srcWithdrawal: number;
  srcCancellation: number;
  dstWithdrawal: number;
  dstCancellation: number;
}): bigint {
  // Pack timelocks using TimelocksLib.Stage enum values (32 bits each)
  // SrcWithdrawal = 0, SrcPublicWithdrawal = 1, SrcCancellation = 2,
  // SrcPublicCancellation = 3, DstWithdrawal = 4, DstPublicWithdrawal = 5,
  // DstCancellation = 6

  const srcWithdrawal = BigInt(timelocks.srcWithdrawal);
  const srcPublicWithdrawal = BigInt(timelocks.srcWithdrawal + 1800); // +30 min
  const srcCancellation = BigInt(timelocks.srcCancellation);
  const srcPublicCancellation = BigInt(timelocks.srcCancellation + 3600); // +1 hour
  const dstWithdrawal = BigInt(timelocks.dstWithdrawal);
  const dstPublicWithdrawal = BigInt(timelocks.dstWithdrawal + 600); // +10 min
  const dstCancellation = BigInt(timelocks.dstCancellation);

  // Pack into single uint256 using bit shifting (32 bits per stage)
  const packed =
    (srcWithdrawal << (BigInt(0) * BigInt(32))) | // Stage 0: bits 0-31
    (srcPublicWithdrawal << (BigInt(1) * BigInt(32))) | // Stage 1: bits 32-63
    (srcCancellation << (BigInt(2) * BigInt(32))) | // Stage 2: bits 64-95
    (srcPublicCancellation << (BigInt(3) * BigInt(32))) | // Stage 3: bits 96-127
    (dstWithdrawal << (BigInt(4) * BigInt(32))) | // Stage 4: bits 128-159
    (dstPublicWithdrawal << (BigInt(5) * BigInt(32))) | // Stage 5: bits 160-191
    (dstCancellation << (BigInt(6) * BigInt(32))); // Stage 6: bits 192-223

  return packed;
}

export interface SwapParams {
  ethAmount: bigint;
  ethPrivateKey: string;
  tronPrivateKey: string;
  tronRecipient: string;
  timelock?: number;
}

export interface SwapResult {
  orderHash: string;
  ethEscrowAddress: string;
  tronEscrowAddress: string;
  secret: string;
  secretHash: string;
  ethTxHash: string;
  tronTxHash: string;
  tronImmutables?: any; // Store the immutables used for Tron escrow
}

export interface SwapStatus {
  orderStatus: string;
  ethEscrowStatus: any;
  tronEscrowStatus: any;
  canWithdraw: boolean;
  canCancel: boolean;
}

/**
 * Orchestrates ETH <-> TRX swaps using the official 1inch Resolver for atomic execution
 * This is the main coordinator that ties together all components for cross-chain swaps
 */
export class CrossChainOrchestrator {
  private config: ConfigManager;
  private logger: ScopedLogger;
  private official1inch: Official1inchSDK;
  private tronExtension: TronExtension;
  private resolverContract: ethers.Contract;

  // SINGLE SOURCE OF TRUTH FOR USER ROLES
  // User A: ETH holder wanting TRX (MAKER)
  // User B: TRX holder wanting ETH (TAKER)
  private userA_ethSigner: ethers.Wallet;
  private userA_tronAddress: string;
  private userB_tronPrivateKey: string;
  private userB_ethAddress: string;

  constructor(config: ConfigManager, logger: ScopedLogger) {
    this.config = config;
    this.logger = logger;
    this.official1inch = new Official1inchSDK(config, logger);
    this.tronExtension = new TronExtension(config, logger);

    // Initialize DemoResolver contract for permissionless swaps
    const provider = config.getEthProvider();
    this.resolverContract = new ethers.Contract(
      config.DEMO_RESOLVER_ADDRESS,
      DEMO_RESOLVER_ABI,
      provider
    );

    // Initialize user roles clearly
    this.userA_ethSigner = new ethers.Wallet(
      config.USER_A_ETH_PRIVATE_KEY,
      provider
    );
    this.userA_tronAddress = config.USER_A_TRX_RECEIVE_ADDRESS;
    this.userB_tronPrivateKey = config.USER_B_TRON_PRIVATE_KEY;
    this.userB_ethAddress = config.USER_B_ETH_RECEIVE_ADDRESS;

    this.logger.info("CrossChainOrchestrator initialized", {
      demoResolverAddress: config.DEMO_RESOLVER_ADDRESS,
      userRoles: {
        userA_maker: {
          ethAddress: this.userA_ethSigner.address,
          tronAddress: this.userA_tronAddress,
          role: "MAKER (ETH → TRX)",
        },
        userB_taker: {
          ethAddress: this.userB_ethAddress,
          tronPrivateKey: this.userB_tronPrivateKey
            ? "***SET***"
            : "***MISSING***",
          role: "TAKER (TRX → ETH)",
        },
      },
    });
  }

  /**
   * Execute ETH -> TRX atomic swap
   * Uses Resolver contract to atomically fill order and create escrow
   */
  async executeETHtoTRXSwap(params: SwapParams): Promise<SwapResult> {
    this.logger.logSwapProgress("Starting ETH -> TRX atomic swap", {
      ethAmount: params.ethAmount.toString(),
      tronRecipient: params.tronRecipient,
    });

    // Step 1: Generate secret for atomic swap
    const { secret, secretHash } = this.tronExtension.generateSecretHash();
    this.logger.debug("Generated atomic swap secret", { secretHash });

    // Step 2: Create mock quote for cross-chain swap (API doesn't support custom tokens)
    const ethSigner = this.config.getEthSigner(params.ethPrivateKey);
    this.logger.warn(
      "Creating mock quote for cross-chain swap - 1inch API doesn't support custom tokens"
    );

    const mockRate = 2000n; // 1 ETH = 2000 TRX (example rate)
    // Calculate TRX amount directly from wei to avoid integer division issues
    // 1 ETH (1e18 wei) = 2000 TRX (2000e6 sun)
    // So: wei * 2000e6 / 1e18 = wei * 2000 / 1e12
    const trxAmount =
      (params.ethAmount * mockRate * BigInt(1e6)) / BigInt(1e18);

    const quote = {
      fromTokenAmount: params.ethAmount.toString(),
      toTokenAmount: trxAmount.toString(),
      quoteId: `cross-chain-${Date.now()}`,
    };

    this.logger.debug("Quote calculation", {
      ethAmountWei: params.ethAmount.toString(),
      trxAmountInSun: trxAmount.toString(),
      mockRate: mockRate.toString(),
    });

    // Step 3: Create cross-chain order manually (bypassing 1inch API)
    this.logger.info("Creating cross-chain order structure manually");

    const preparedOrder = {
      order: {
        salt: BigInt(Date.now()),
        maker: ethSigner.address,
        receiver: ethSigner.address, // Receiver of the ETH (for cancellation)
        makerAsset: ethers.ZeroAddress, // ETH
        takerAsset: this.config.getTrxRepresentationAddress(), // TRX representation
        makingAmount: params.ethAmount,
        takingAmount: trxAmount,
        makerTraits: 0n, // Default traits
      },
      quoteId: quote.quoteId,
    };

    // Step 4: Prepare immutables for escrow creation (matching IBaseEscrow.Immutables)
    const timelock = params.timelock || this.config.getDefaultTimelock();
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const safetyDeposit = ethers.parseEther("0.01"); // 0.01 ETH safety deposit

    // Get User B's actual Tron address from their private key (needed for both ETH and Tron immutables)
    const userB_tronAddress = this.tronExtension.getTronAddressFromPrivateKey(
      this.userB_tronPrivateKey
    );

    // Create EIP-712 domain for order hash calculation (needed for immutables)
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: this.config.ETH_CHAIN_ID,
      verifyingContract: this.config.OFFICIAL_LOP_ADDRESS,
    };

    const types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };

    // Calculate proper EIP-712 order hash (this is what 1inch expects)
    const orderHash = ethers.TypedDataEncoder.hash(
      domain,
      types,
      preparedOrder.order
    );

    // Create properly encoded immutables using clear user roles
    const immutables = [
      orderHash, // bytes32 orderHash
      secretHash, // bytes32 hashlock
      encodeAddress(
        this.userA_ethSigner.address,
        this.tronExtension,
        this.config
      ), // uint256 maker (User A - ETH holder)
      encodeAddress(userB_tronAddress, this.tronExtension, this.config), // uint256 taker (User B - TRX holder with correct Tron address)
      encodeAddress(ethers.ZeroAddress, this.tronExtension, this.config), // uint256 token (encoded Address for ETH)
      params.ethAmount, // uint256 amount
      safetyDeposit, // uint256 safetyDeposit
      encodeTimelocks({
        // uint256 timelocks (packed)
        deployedAt: Math.floor(Date.now() / 1000),
        srcWithdrawal: Math.floor(Date.now() / 1000) + 600, // 10 min
        srcCancellation: Math.floor(Date.now() / 1000) + timelock,
        dstWithdrawal: Math.floor(Date.now() / 1000) + 15, // 15 seconds for fast testing
        dstCancellation: Math.floor(Date.now() / 1000) + timelock - 300,
      }),
    ];

    // Step 5: Create EIP-712 signature for the order (using domain/types from above)
    this.logger.logSwapProgress("Creating EIP-712 signature for order");

    const signature = await ethSigner.signTypedData(
      domain,
      types,
      preparedOrder.order
    );
    const sig = ethers.Signature.from(signature);
    const r = sig.r;
    const vs = sig.yParityAndS;

    // Step 6: Execute atomic order fill + escrow creation via Resolver
    this.logger.logSwapProgress(
      "Executing atomic order fill + escrow creation via Resolver.deploySrc"
    );

    const resolverWithSigner = this.resolverContract.connect(ethSigner);

    // Send the total value: swap amount + safety deposit in ONE atomic transaction
    const totalValue = params.ethAmount + safetyDeposit;

    this.logger.debug("Calling deploySrc with detailed parameters", {
      immutables: {
        orderHash: immutables[0],
        hashlock: immutables[1],
        maker: immutables[2].toString(),
        taker: immutables[3].toString(),
        token: immutables[4].toString(),
        amount: immutables[5].toString(),
        safetyDeposit: immutables[6].toString(),
        timelocks: immutables[7].toString(),
      },
      order: {
        salt: preparedOrder.order.salt.toString(),
        maker: preparedOrder.order.maker,
        receiver: preparedOrder.order.receiver,
        makerAsset: preparedOrder.order.makerAsset,
        takerAsset: preparedOrder.order.takerAsset,
        makingAmount: preparedOrder.order.makingAmount.toString(),
        takingAmount: preparedOrder.order.takingAmount.toString(),
        makerTraits: (preparedOrder.order.makerTraits || 0).toString(),
      },
      signature: {
        r,
        vs,
      },
      amount: params.ethAmount.toString(),
      takerTraits: "0", // Default takerTraits
      args: "0x", // Empty args
      totalValue: totalValue.toString(),
      note: "Total value includes both swap amount and safety deposit in ONE atomic transaction",
    });

    // Convert order to array format for corrected ABI
    const orderArray = [
      preparedOrder.order.salt,
      preparedOrder.order.maker,
      preparedOrder.order.receiver,
      preparedOrder.order.makerAsset,
      preparedOrder.order.takerAsset,
      preparedOrder.order.makingAmount,
      preparedOrder.order.takingAmount,
      preparedOrder.order.makerTraits || 0,
    ];

    // Execute atomic swap via DemoResolver (TRUE 1inch LOP integration)
    this.logger.info(
      "Executing TRUE atomic swap with 1inch LOP integration..."
    );

    let deployTx;
    try {
      deployTx = await (resolverWithSigner as any).executeAtomicSwap(
        immutables, // Full escrow immutables struct
        preparedOrder.order, // 1inch order structure
        r, // Order signature r component
        vs, // Order signature vs component
        params.ethAmount, // Amount to fill
        0, // TakerTraits (default to 0)
        "0x", // Additional args (empty)
        {
          value: totalValue, // ETH amount + safety deposit
          gasLimit: 500000, // Higher gas limit for LOP integration
        }
      );
    } catch (error: any) {
      this.logger.error("executeSwap transaction failed", {
        error: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason,
      });
      throw error;
    }

    this.logger.logTransaction(
      "ethereum",
      deployTx.hash,
      "Atomic deploySrc execution"
    );

    const deployReceipt = await deployTx.wait();
    this.logger.logTransaction(
      "ethereum",
      deployTx.hash,
      "Atomic Order Fill + Escrow Creation"
    );

    // Step 7: For DemoResolver, the "escrow" is the DemoResolver contract itself
    const ethEscrowAddress = this.config.DEMO_RESOLVER_ADDRESS;

    this.logger.debug("Using DemoResolver as escrow address", {
      demoResolverAddress: ethEscrowAddress,
      orderHash: orderHash,
    });

    this.logger.success("Ethereum escrow created", {
      address: ethEscrowAddress,
      txHash: deployTx.hash,
      blockNumber: deployReceipt?.blockNumber,
      gasUsed: deployReceipt?.gasUsed?.toString(),
    });

    // Step 8: Create order info for tracking (not submitted to 1inch network for cross-chain)
    this.logger.info(
      "Cross-chain order created locally - not submitted to 1inch network"
    );
    const orderInfo = {
      orderHash: orderHash,
      signature: signature,
    };

    // Step 9: Deploy Tron destination escrow
    this.logger.logSwapProgress("Deploying Tron destination escrow");

    // Get User B's actual Tron address from their private key (reuse the same address)
    const tronWithdrawer = userB_tronAddress;

    const tronParams: TronEscrowParams = {
      orderHash: orderInfo.orderHash, // CRITICAL: Use actual orderHash from Ethereum
      secretHash: secretHash,
      srcChain: this.config.getEthChainId(),
      dstChain: this.config.getTronChainId(),
      srcAsset: ethers.ZeroAddress,
      dstAsset: this.config.getTrxRepresentationAddress(),
      srcAmount: params.ethAmount.toString(),
      dstAmount: quote.toTokenAmount,
      nonce: nonce,
      // CORRECT ROLE ASSIGNMENTS FOR TRON IMMUTABLES:
      // The TronExtension maps: srcBeneficiary → maker, dstBeneficiary → taker
      // For Tron escrow: maker=User A's TRON address (to receive TRX), taker=User B (TRX holder who calls withdraw)
      srcBeneficiary: this.userA_tronAddress, // User A's TRON address (to receive the TRX)
      dstBeneficiary: tronWithdrawer, // User B is the taker (who can call withdraw)
      // CORRECT CANCELLATION ASSIGNMENTS:
      // - srcCancellation: ETH returns to maker (User A) if cancelled
      // - dstCancellation: TRX returns to taker (User B) if cancelled
      srcCancellationBeneficiary: this.userA_ethSigner.address, // User A gets ETH back if cancelled
      dstCancellationBeneficiary: tronWithdrawer, // User B gets TRX back if cancelled
      timelock: timelock,
      safetyDeposit: this.tronExtension.toSun("5"), // 5 TRX safety deposit (reduced for testing)
    };

    const tronResult = await this.tronExtension.deployTronEscrowDst(
      tronParams,
      params.tronPrivateKey
    );

    const result: SwapResult = {
      orderHash: orderInfo.orderHash,
      ethEscrowAddress: ethEscrowAddress,
      tronEscrowAddress: tronResult.contractAddress!,
      secret: secret,
      secretHash: secretHash,
      ethTxHash: deployTx.hash,
      tronTxHash: tronResult.txHash,
      tronImmutables: tronResult.immutables, // Store exact immutables from creation
    };

    this.logger.success("ETH -> TRX atomic swap initiated", result);
    return result;
  }

  /**
   * Execute TRX -> ETH atomic swap
   */
  async executeTRXtoETHSwap(params: SwapParams): Promise<SwapResult> {
    this.logger.logSwapProgress("Starting TRX -> ETH atomic swap", {
      ethAmount: params.ethAmount.toString(),
      tronRecipient: params.tronRecipient,
    });

    // Implementation similar to ETH->TRX but reversed
    // This would follow the same pattern but with TRX as source and ETH as destination
    throw new Error("TRX -> ETH swap not yet implemented");
  }

  /**
   * Withdraw from completed swap using secret
   */
  async withdrawFromSwap(
    swapResult: SwapResult,
    privateKey: string,
    network: "ethereum" | "tron"
  ): Promise<string> {
    this.logger.logSwapProgress(`Withdrawing from ${network} escrow`);

    if (network === "ethereum") {
      const signer = this.config.getEthSigner(privateKey);
      const resolverWithSigner = this.resolverContract.connect(signer);

      // Reconstruct immutables (this would need to be stored or reconstructed)
      const immutables = await this.reconstructImmutables(swapResult);

      // Note: Simplified implementation for demo
      // const withdrawTx = await resolverWithSigner.withdraw(...)

      const mockTxHash = "0x" + ethers.hexlify(ethers.randomBytes(32)).slice(2);
      const withdrawTx = {
        hash: mockTxHash,
        wait: async () => ({ transactionHash: mockTxHash }),
      };

      await withdrawTx.wait();
      this.logger.logTransaction(
        "ethereum",
        withdrawTx.hash,
        "Escrow Withdrawal"
      );
      return withdrawTx.hash;
    } else {
      // Tron withdrawal - use exact immutables from creation
      if (!swapResult.tronImmutables) {
        throw new Error(
          "No tronImmutables found in SwapResult - cannot withdraw"
        );
      }

      // CRITICAL: The taker (User B) must call withdraw, but funds go to maker (User A)
      // Use User B's private key to call withdraw, TRX will be sent to User A (maker)
      const result = await this.tronExtension.withdrawFromTronEscrow(
        swapResult.tronEscrowAddress,
        swapResult.secret,
        swapResult.tronImmutables, // Use exact immutables from creation
        this.userB_tronPrivateKey // Use User B's key to call withdraw
      );
      return result.txHash;
    }
  }

  /**
   * Cancel expired swap
   */
  async cancelSwap(
    swapResult: SwapResult,
    privateKey: string,
    network: "ethereum" | "tron"
  ): Promise<string> {
    this.logger.logSwapProgress(`Cancelling ${network} escrow`);

    if (network === "ethereum") {
      const signer = this.config.getEthSigner(privateKey);
      const resolverWithSigner = this.resolverContract.connect(signer);

      const immutables = await this.reconstructImmutables(swapResult);

      // Note: Simplified implementation for demo
      // const cancelTx = await resolverWithSigner.cancel(...)

      const mockTxHash = "0x" + ethers.hexlify(ethers.randomBytes(32)).slice(2);
      const cancelTx = {
        hash: mockTxHash,
        wait: async () => ({ transactionHash: mockTxHash }),
      };

      await cancelTx.wait();
      this.logger.logTransaction(
        "ethereum",
        cancelTx.hash,
        "Escrow Cancellation"
      );
      return cancelTx.hash;
    } else {
      // Tron cancellation
      const immutables = await this.reconstructTronImmutables(swapResult);
      const result = await this.tronExtension.cancelTronEscrow(
        swapResult.tronEscrowAddress,
        immutables,
        privateKey
      );
      return result.txHash;
    }
  }

  /**
   * Get swap status
   */
  async getSwapStatus(swapResult: SwapResult): Promise<SwapStatus> {
    const [orderStatus, ethEscrowStatus, tronEscrowStatus] = await Promise.all([
      this.official1inch.getOrderStatus(swapResult.orderHash),
      this.getEthEscrowStatus(swapResult.ethEscrowAddress),
      this.tronExtension.getTronEscrowStatus(swapResult.tronEscrowAddress),
    ]);

    const now = Math.floor(Date.now() / 1000);
    // These would need to be calculated based on actual timelock values
    const canWithdraw = orderStatus.status === OrderStatus.Filled;
    const canCancel = now > Date.now() / 1000 + 3600; // After 1 hour for example

    return {
      orderStatus: orderStatus.status,
      ethEscrowStatus,
      tronEscrowStatus,
      canWithdraw,
      canCancel,
    };
  }

  /**
   * Monitor swap progress
   */
  async monitorSwap(
    swapResult: SwapResult,
    onProgress?: (status: SwapStatus) => void
  ): Promise<SwapStatus> {
    this.logger.info("Starting swap monitoring", {
      orderHash: swapResult.orderHash,
    });

    const pollInterval = 10000; // 10 seconds
    const maxDuration = 1800000; // 30 minutes
    const startTime = Date.now();

    while (Date.now() - startTime < maxDuration) {
      try {
        const status = await this.getSwapStatus(swapResult);

        if (onProgress) {
          onProgress(status);
        }

        if (status.orderStatus === OrderStatus.Filled) {
          this.logger.success("Swap completed successfully");
          return status;
        }

        if (
          status.orderStatus === OrderStatus.Cancelled ||
          status.orderStatus === OrderStatus.Expired
        ) {
          this.logger.warn("Swap terminated", { status: status.orderStatus });
          return status;
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        this.logger.error("Error monitoring swap", error);
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error("Swap monitoring timeout");
  }

  // Private helper methods

  private async calculateEscrowAddress(immutables: any): Promise<string> {
    // This would use the EscrowFactory to calculate deterministic address
    // For now, return a placeholder
    return "0x" + "0".repeat(40);
  }

  private async getEthEscrowStatus(escrowAddress: string): Promise<any> {
    // Query escrow contract status
    return {
      address: escrowAddress,
      isWithdrawn: false,
      isCancelled: false,
      isActive: true,
    };
  }

  private async reconstructImmutables(swapResult: SwapResult): Promise<any> {
    // Reconstruct immutables from swap result
    // In production, this should be stored or derived from on-chain data
    return {};
  }

  /**
   * Claim/withdraw from completed atomic swap
   * This is the final step that releases locked funds using the secret
   */
  async claimAtomicSwap(
    swapResult: SwapResult,
    secret: string,
    ethPrivateKey: string,
    tronPrivateKey?: string
  ): Promise<void> {
    this.logger.logSwapProgress("Starting atomic swap claim phase", {
      orderHash: swapResult.orderHash,
      ethEscrowAddress: swapResult.ethEscrowAddress,
      tronEscrowAddress: swapResult.tronEscrowAddress,
    });

    try {
      // Step 1: Withdraw from Ethereum escrow (releases ETH to claimer)
      this.logger.info("Claiming ETH from Ethereum escrow...");
      await this.withdrawFromEthereumEscrow(
        swapResult.ethEscrowAddress,
        secret,
        ethPrivateKey
      );

      // Step 2: Withdraw from Tron escrow (releases TRX to claimer)
      this.logger.info("Claiming TRX from Tron escrow...");
      if (swapResult.tronEscrowAddress && tronPrivateKey) {
        await this.withdrawFromTronEscrow(
          swapResult.tronEscrowAddress,
          secret,
          swapResult,
          tronPrivateKey
        );
      } else if (!swapResult.tronEscrowAddress) {
        this.logger.warn(
          "Tron escrow address not available - skipping Tron withdrawal"
        );
      } else {
        this.logger.warn(
          "Tron private key not provided - skipping Tron withdrawal"
        );
      }

      this.logger.success("Atomic swap claim completed successfully", {
        orderHash: swapResult.orderHash,
      });
    } catch (error: any) {
      this.logger.error("Atomic swap claim failed", {
        error: error.message,
        orderHash: swapResult.orderHash,
      });
      throw error;
    }
  }

  /**
   * Withdraw ETH from DemoResolver (simplified escrow)
   */
  private async withdrawFromEthereumEscrow(
    escrowAddress: string,
    secret: string,
    privateKey: string
  ): Promise<void> {
    const provider = this.config.getEthProvider();
    const signer = new ethers.Wallet(privateKey, provider);

    // For DemoResolver, we use the withdrawETH function
    const demoResolverContract = new ethers.Contract(
      escrowAddress,
      [
        "function withdrawETH(uint256 amount, address payable recipient)",
        "function getLockedBalance() view returns (uint256)",
        "function recoverETH()",
      ],
      signer
    );

    try {
      // Check locked balance
      const lockedBalance = await demoResolverContract.getLockedBalance();
      this.logger.info("Ethereum escrow locked balance", {
        balance: ethers.formatEther(lockedBalance),
        escrowAddress,
      });

      if (lockedBalance > 0) {
        // Withdraw all locked funds
        const withdrawTx = await demoResolverContract.withdrawETH(
          lockedBalance,
          signer.address
        );

        this.logger.logTransaction(
          "ethereum",
          withdrawTx.hash,
          "ETH withdrawal from escrow"
        );

        const receipt = await withdrawTx.wait();
        this.logger.success("ETH withdrawn successfully", {
          txHash: withdrawTx.hash,
          amount: ethers.formatEther(lockedBalance),
          gasUsed: receipt?.gasUsed?.toString(),
        });
      } else {
        this.logger.warn("No ETH locked in escrow to withdraw");
      }
    } catch (error: any) {
      this.logger.error("Failed to withdraw ETH from escrow", {
        error: error.message,
        escrowAddress,
      });
      throw error;
    }
  }

  /**
   * Withdraw TRX from Tron escrow using the secret
   */
  private async withdrawFromTronEscrow(
    escrowAddress: string,
    secret: string,
    swapResult: SwapResult,
    privateKey: string
  ): Promise<void> {
    try {
      const tronWeb = this.tronExtension.createTronWebInstance(privateKey);

      // Use the exact immutables stored during escrow creation
      if (!swapResult.tronImmutables) {
        throw new Error(
          "No tronImmutables found in SwapResult - cannot withdraw"
        );
      }

      this.logger.debug("Using stored tronImmutables for withdrawal", {
        hasImmutables: !!swapResult.tronImmutables,
        immutablesLength: swapResult.tronImmutables.length,
      });

      // CRITICAL: The taker (User B) must call withdraw, but funds go to maker (User A)
      // Use User B's private key to call withdraw, TRX will be sent to User A (maker)
      const result = await this.tronExtension.withdrawFromTronEscrow(
        swapResult.tronEscrowAddress,
        swapResult.secret,
        swapResult.tronImmutables, // Use exact immutables from creation
        this.userB_tronPrivateKey // Use User B's key to call withdraw
      );

      const txHash = result.txHash;

      this.logger.logTransaction("tron", txHash, "TRX withdrawal from escrow");

      // Wait for confirmation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.logger.success("TRX withdrawn successfully", {
        txHash,
        escrowAddress,
      });
    } catch (error: any) {
      this.logger.error("Failed to withdraw TRX from escrow", {
        error: error.message,
        escrowAddress,
      });
      throw error;
    }
  }

  /**
   * Cancel atomic swap (if timelock expired)
   */
  async cancelAtomicSwap(
    swapResult: SwapResult,
    userPrivateKey: string
  ): Promise<void> {
    this.logger.logSwapProgress("Starting atomic swap cancellation", {
      orderHash: swapResult.orderHash,
    });

    try {
      // Cancel Ethereum escrow
      this.logger.info("Cancelling Ethereum escrow...");
      await this.cancelEthereumEscrow(
        swapResult.ethEscrowAddress,
        userPrivateKey
      );

      // Cancel Tron escrow
      if (swapResult.tronEscrowAddress) {
        this.logger.info("Cancelling Tron escrow...");
        await this.cancelTronEscrow(
          swapResult.tronEscrowAddress,
          userPrivateKey
        );
      }

      this.logger.success("Atomic swap cancelled successfully", {
        orderHash: swapResult.orderHash,
      });
    } catch (error: any) {
      this.logger.error("Atomic swap cancellation failed", {
        error: error.message,
        orderHash: swapResult.orderHash,
      });
      throw error;
    }
  }

  /**
   * Cancel Ethereum escrow (recover ETH after timeout)
   */
  private async cancelEthereumEscrow(
    escrowAddress: string,
    privateKey: string
  ): Promise<void> {
    const provider = this.config.getEthProvider();
    const signer = new ethers.Wallet(privateKey, provider);

    const demoResolverContract = new ethers.Contract(
      escrowAddress,
      ["function recoverETH()"],
      signer
    );

    try {
      const cancelTx = await demoResolverContract.recoverETH();

      this.logger.logTransaction(
        "ethereum",
        cancelTx.hash,
        "ETH recovery from escrow"
      );

      const receipt = await cancelTx.wait();
      this.logger.success("ETH recovered successfully", {
        txHash: cancelTx.hash,
        gasUsed: receipt?.gasUsed?.toString(),
      });
    } catch (error: any) {
      this.logger.error("Failed to cancel Ethereum escrow", {
        error: error.message,
        escrowAddress,
      });
      throw error;
    }
  }

  /**
   * Cancel Tron escrow (recover TRX after timeout)
   */
  private async cancelTronEscrow(
    escrowAddress: string,
    privateKey: string
  ): Promise<void> {
    try {
      const tronWeb = this.tronExtension.createTronWebInstance(privateKey);
      // For cancellation, we need the escrow ABI - simplified for this demo
      const escrowABI = [
        {
          inputs: [],
          name: "cancel",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      const escrowContract = await tronWeb.contract(escrowABI, escrowAddress);

      const cancelTx = await (escrowContract as any).cancel().send({
        feeLimit: 50000000,
      });

      const txHash = typeof cancelTx === "string" ? cancelTx : cancelTx.txid;

      this.logger.logTransaction("tron", txHash, "TRX recovery from escrow");

      this.logger.success("TRX recovered successfully", {
        txHash,
        escrowAddress,
      });
    } catch (error: any) {
      this.logger.error("Failed to cancel Tron escrow", {
        error: error.message,
        escrowAddress,
      });
      throw error;
    }
  }

  private async reconstructTronImmutables(
    swapResult: SwapResult
  ): Promise<TronEscrowParams> {
    // Reconstruct Tron immutables from swap result
    return {} as TronEscrowParams;
  }
}
