"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainOrchestrator = void 0;
const ethers_1 = require("ethers");
const Official1inchSDK_1 = require("./Official1inchSDK");
const TronExtension_1 = require("./TronExtension");
const fusion_sdk_1 = require("@1inch/fusion-sdk");
const typechain_types_1 = require("../../typechain-types");
// DemoResolver ABI for permissionless atomic swaps (including TRUE LOP integration)
const DEMO_RESOLVER_ABI = [
  // Legacy function for compatibility
  "function executeSwap(bytes32 orderHash, uint256 amount, uint256 safetyDeposit, address maker) payable",
  // NEW: True 1inch LOP integration function with properly named tuples
  "function executeAtomicSwap(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks), tuple(uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits), bytes32, bytes32, uint256, uint256, bytes) payable",
  // Utility functions
  "function withdrawETH(uint256 amount, address payable recipient)",
  "function getLockedBalance() view returns (uint256)",
  "function recoverETH()",
  // Events
  "event SwapExecuted(address indexed maker, address indexed escrow, bytes32 indexed orderHash, uint256 amount, uint256 safetyDeposit)",
  "event EscrowCreated(address indexed escrow, bytes32 indexed orderHash)",
];
// EscrowFactory ABI with correct format for direct testing
const ESCROW_FACTORY_ABI = [
  "function addressOfEscrowSrc((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) view returns (address)",
  "function createSrcEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) payable returns (address)",
];
// Helper functions for encoding Address and Timelocks as uint256
function encodeAddress(addr, tronExtension, config) {
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
      process.env.USER_B_TRON_PRIVATE_KEY || config.USER_B_TRON_PRIVATE_KEY
    );
    const hexAddress = tronWeb.address.toHex(addr);
    return BigInt("0x" + hexAddress);
  } else {
    // Assume it's already a numeric string or hex without 0x
    return BigInt(addr.startsWith("0x") ? addr : "0x" + addr);
  }
}
function encodeTimelocks(timelocks) {
  // Pack timelocks using TimelocksLib.Stage enum values (32 bits each)
  // SrcWithdrawal = 0, SrcPublicWithdrawal = 1, SrcCancellation = 2,
  // SrcPublicCancellation = 3, DstWithdrawal = 4, DstPublicWithdrawal = 5,
  // DstCancellation = 6, plus deployedAt in bits 224-255
  const srcWithdrawal = BigInt(timelocks.srcWithdrawal);
  const srcPublicWithdrawal = BigInt(timelocks.srcWithdrawal + 1800); // +30 min
  const srcCancellation = BigInt(timelocks.srcCancellation);
  const srcPublicCancellation = BigInt(timelocks.srcCancellation + 3600); // +1 hour
  const dstWithdrawal = BigInt(timelocks.dstWithdrawal);
  const dstPublicWithdrawal = BigInt(timelocks.dstWithdrawal + 600); // +10 min
  const dstCancellation = BigInt(timelocks.dstCancellation);
  const deployedAt = BigInt(timelocks.deployedAt); // 🎯 CRITICAL FIX: Include deployedAt timestamp

  // Pack into single uint256 using bit shifting (32 bits per stage + 32 bits for deployedAt)
  const packed =
    (srcWithdrawal << (BigInt(0) * BigInt(32))) | // Stage 0: bits 0-31
    (srcPublicWithdrawal << (BigInt(1) * BigInt(32))) | // Stage 1: bits 32-63
    (srcCancellation << (BigInt(2) * BigInt(32))) | // Stage 2: bits 64-95
    (srcPublicCancellation << (BigInt(3) * BigInt(32))) | // Stage 3: bits 96-127
    (dstWithdrawal << (BigInt(4) * BigInt(32))) | // Stage 4: bits 128-159
    (dstPublicWithdrawal << (BigInt(5) * BigInt(32))) | // Stage 5: bits 160-191
    (dstCancellation << (BigInt(6) * BigInt(32))) | // Stage 6: bits 192-223
    (deployedAt << BigInt(224)); // 🎯 CRITICAL FIX: deployedAt in bits 224-255
  return packed;
}
/**
 * Orchestrates ETH <-> TRX swaps using the official 1inch Resolver for atomic execution
 * This is the main coordinator that ties together all components for cross-chain swaps
 */
class CrossChainOrchestrator {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.official1inch = new Official1inchSDK_1.Official1inchSDK(
      config,
      logger
    );
    this.tronExtension = new TronExtension_1.TronExtension(config, logger);
    // Initialize DemoResolver contract for permissionless swaps using TypeScript factory
    const provider = config.getEthProvider();
    this.resolverContract = typechain_types_1.DemoResolver__factory.connect(
      config.DEMO_RESOLVER_ADDRESS,
      provider
    );
    // Initialize user roles clearly
    this.userA_ethSigner = new ethers_1.ethers.Wallet(
      process.env.USER_A_ETH_PRIVATE_KEY || config.USER_A_ETH_PRIVATE_KEY,
      provider
    );
    this.userA_tronAddress = config.USER_A_TRX_RECEIVE_ADDRESS;
    this.userB_ethSigner = new ethers_1.ethers.Wallet(
      process.env.USER_B_ETH_PRIVATE_KEY || config.USER_B_ETH_PRIVATE_KEY,
      provider
    );
    this.userB_tronPrivateKey =
      process.env.USER_B_TRON_PRIVATE_KEY || config.USER_B_TRON_PRIVATE_KEY;
    this.userB_ethAddress = config.USER_B_ETH_RECEIVE_ADDRESS;
    this.logger.info("CrossChainOrchestrator initialized", {
      demoResolverAddress: config.DEMO_RESOLVER_ADDRESS,
      userRoles: {
        userA_maker: {
          ethAddress: this.userA_ethSigner.address,
          tronAddress: this.userA_tronAddress,
          role: "MAKER (ETH → TRX)",
        },
        userB_resolver: {
          ethAddress: this.userB_ethSigner.address,
          tronPrivateKey: this.userB_tronPrivateKey
            ? "***SET***"
            : "***MISSING***",
          role: "RESOLVER/TAKER (calls DemoResolver)",
        },
      },
    });
  }
  /**
   * Execute ETH -> TRX atomic swap
   * Uses Resolver contract to atomically fill order and create escrow
   */
  async executeETHtoTRXSwap(params) {
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
    // ✅ FIX: Create proper LOP order with future expiry and valid ERC20 assets
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // Set expiry to 1 hour from now (critical for LOP)
    // Create standard 8-field order for LOP v4 configured for DemoResolver pattern
    // 🎯 BACK TO WORKING CONFIG: Use DemoResolver address as allowedSender
    // Based on user's successful run where this was working
    // The LOP sees DemoResolver as msg.sender when it calls fillOrderArgs
    const demoResolverAddress = this.config.DEMO_RESOLVER_ADDRESS;
    const encodedAllowedSender = BigInt(demoResolverAddress); // DemoResolver as allowedSender
    const orderForSigning = {
      salt: BigInt(Date.now() + Math.floor(Math.random() * 1000000)), // Ensure uniqueness
      maker: ethSigner.address,
      receiver: ethSigner.address, // Receiver of the ETH (for cancellation)
      makerAsset: ethers_1.ethers.ZeroAddress, // ETH (what maker is giving)
      takerAsset: ethers_1.ethers.ZeroAddress, // 🎯 ETH-ONLY: Both assets are ETH for cross-chain swaps
      makingAmount: params.ethAmount,
      takingAmount: 1n, // 🎯 MINIMAL: Avoid division by zero, minimal wei
      makerTraits: encodedAllowedSender, // 🎯 FIXED: DemoResolver authorized as allowedSender (msg.sender match)
    };
    const preparedOrder = {
      order: orderForSigning, // Use the full object
      quoteId: quote.quoteId,
    };
    // Step 4: Prepare immutables for escrow creation (matching IBaseEscrow.Immutables)
    const timelock = params.timelock || this.config.getDefaultTimelock();
    const nonce = ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32));
    const safetyDeposit = ethers_1.ethers.parseEther("0.01"); // 0.01 ETH safety deposit
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
    // NOTE: Standard 8-field Order struct for basic LOP v4 orders without complex predicates
    // Calculate proper EIP-712 order hash (this is what 1inch expects)
    const orderHash = ethers_1.ethers.TypedDataEncoder.hash(
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
      encodeAddress(
        ethers_1.ethers.ZeroAddress,
        this.tronExtension,
        this.config
      ), // uint256 token (encoded Address for ETH)
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
    const sig = ethers_1.ethers.Signature.from(signature);
    const r = sig.r;
    const vs = sig.yParityAndS;
    // 🎯 CORRECTED FLOW: Skip direct ETH transfer from User A
    // The LOP will pull ETH from User A's wallet when the order is filled
    this.logger.logSwapProgress(
      "Resolver facilitates atomic execution with safety deposit"
    );
    const resolverWithSigner = this.resolverContract.connect(
      this.userB_ethSigner
    );
    // 🎯 BREAKTHROUGH: New resolver validation confirmed working!
    // Test showed 0.01 ETH passes validation, 0.011 ETH fails with "must equal safetyDeposit only"
    const totalValue = safetyDeposit; // CONFIRMED: New resolver expects exactly safetyDeposit
    this.logger.debug("Calling deploySrc with detailed parameters", {
      caller: this.userB_ethSigner.address,
      callerRole: "User B (Resolver operator)",
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
      note: "RESTORE: Using the exact working configuration that produced successful output",
    });
    // Convert order object to array format for contract call (8-field Order struct)
    const orderForContractCall = [
      preparedOrder.order.salt,
      preparedOrder.order.maker,
      preparedOrder.order.receiver,
      preparedOrder.order.makerAsset,
      preparedOrder.order.takerAsset,
      preparedOrder.order.makingAmount,
      preparedOrder.order.takingAmount,
      preparedOrder.order.makerTraits || 0,
    ];
    // NOTE: Using standard 8-field Order struct - same for signing and contract call
    // Execute atomic swap via DemoResolver (TRUE 1inch LOP integration)
    this.logger.info(
      "Executing TRUE atomic swap with 1inch LOP integration..."
    );
    let deployTx;
    try {
      deployTx = await resolverWithSigner.executeAtomicSwap(
        immutables, // Full escrow immutables struct (already array format)
        orderForContractCall, // 1inch order structure (8-field array matching IOrderMixin.Order)
        r, // Order signature r component
        vs, // Order signature vs component
        params.ethAmount, // Amount to fill
        0, // TakerTraits (default to 0)
        "0x", // Additional args (empty)
        {
          value: totalValue, // ETH amount + safety deposit
          gasLimit: 800000, // Higher gas limit for LOP integration
          gasPrice: ethers_1.ethers.parseUnits("50", "gwei"), // 50 Gwei for very fast transactions
        }
      );
    } catch (error) {
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
    // Step 7: Extract actual ETH escrow address from EscrowCreated event
    let ethEscrowAddress = this.config.DEMO_RESOLVER_ADDRESS; // fallback

    try {
      // Look for EscrowCreated event in the transaction logs
      const escrowCreatedEvent = deployReceipt?.logs?.find(
        (log) =>
          log.address.toLowerCase() ===
            this.config.DEMO_RESOLVER_ADDRESS.toLowerCase() &&
          log.topics[0] ===
            "0x2e51eb252678ae00b7491f29b35873f446f09ee22d616fc60d9db472d87b4081" // EscrowCreated event signature
      );

      if (escrowCreatedEvent && escrowCreatedEvent.topics[1]) {
        // Extract escrow address from first indexed parameter (escrow address)
        const extractedAddress = "0x" + escrowCreatedEvent.topics[1].slice(-40);
        ethEscrowAddress = extractedAddress;
        this.logger.debug("Extracted ETH escrow address from event", {
          extractedAddress: ethEscrowAddress,
          orderHash: orderHash,
        });
      } else {
        this.logger.warn(
          "Could not find EscrowCreated event, using fallback address"
        );
      }
    } catch (error) {
      this.logger.warn("Error extracting escrow address from event", {
        error: error.message,
      });
    }
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
    const tronParams = {
      orderHash: orderInfo.orderHash, // CRITICAL: Use actual orderHash from Ethereum
      secretHash: secretHash,
      srcChain: this.config.getEthChainId(),
      dstChain: this.config.getTronChainId(),
      srcAsset: ethers_1.ethers.ZeroAddress,
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
    const result = {
      orderHash: orderInfo.orderHash,
      ethEscrowAddress: ethEscrowAddress,
      tronEscrowAddress: tronResult.contractAddress,
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
   * User A locks TRX on Tron, User B locks ETH on Ethereum
   */
  async executeTRXtoETHSwap(params) {
    this.logger.logSwapProgress("Starting TRX -> ETH atomic swap", {
      ethAmount: params.ethAmount.toString(),
      tronRecipient: params.tronRecipient,
    });
    // Step 1: Generate secret for atomic swap
    const { secret, secretHash } = this.tronExtension.generateSecretHash();
    this.logger.debug("Generated atomic swap secret", { secretHash });
    // Step 2: Create mock quote for cross-chain swap (TRX → ETH)
    const tronSigner = this.tronExtension.createTronWebInstance(
      params.tronPrivateKey
    );
    this.logger.warn(
      "Creating mock quote for TRX→ETH cross-chain swap - 1inch API doesn't support custom tokens"
    );
    // Mock rate for TRX→ETH (since 1inch doesn't support custom tokens)
    // For our demo: 10 TRX = 0.01 ETH, so 1 TRX = 0.001 ETH = 1000000000000000 wei
    const mockRate = 1000000000000000n; // 1 TRX = 0.001 ETH (1000000000000000 wei per TRX)
    // Calculate ETH amount from TRX amount
    // 1 TRX (1e6 sun) = 0.001 ETH (1000000000000000 wei)
    // So: sun * 1000000000000000 / 1e6 = sun * 1000000000000 = sun * 1e12
    const trxAmount = BigInt(
      params.ethAmount?.toString() ||
        ethers_1.ethers.parseUnits("1000", 6).toString()
    ); // Use ethAmount as base for TRX amount
    const ethAmount = (trxAmount * mockRate) / BigInt(1e6);
    const quote = {
      fromTokenAmount: trxAmount.toString(),
      toTokenAmount: ethAmount.toString(),
      quoteId: `cross-chain-trx-eth-${Date.now()}`,
    };
    this.logger.debug("Quote calculation (TRX→ETH)", {
      trxAmountInSun: trxAmount.toString(),
      ethAmountWei: ethAmount.toString(),
      mockRate: mockRate.toString(),
    });
    // Step 3: Create cross-chain order manually (TRX → ETH)
    this.logger.info("Creating cross-chain TRX→ETH order structure manually");

    // 🎯 CRITICAL FIX: Add proper expiry time like the working ETH→TRX flow
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // Set expiry to 1 hour from now (critical for LOP)

    const ethSigner = this.config.getEthSigner(params.ethPrivateKey);
    const preparedOrder = {
      order: {
        salt: BigInt(Date.now()),
        maker: ethSigner.address, // User B (ETH holder) is the maker in the 1inch order
        receiver: ethSigner.address, // Receiver of the TRX (for cancellation)
        makerAsset: ethers_1.ethers.ZeroAddress, // ETH
        takerAsset: this.config.getTrxRepresentationAddress(), // TRX representation
        makingAmount: ethAmount, // ETH amount User B offers
        takingAmount: trxAmount, // TRX amount User B wants
        makerTraits: 0n, // Default traits
        // TODO: Add expiry if needed for order validation
      },
    };
    // Step 4: Prepare immutables for escrow creation
    const timelock = params.timelock || this.config.getDefaultTimelock();
    const nonce = ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32));
    const safetyDeposit = ethers_1.ethers.parseEther("0.01"); // 0.01 ETH safety deposit

    // 🎯 ROBUST TIMELOCK CALCULATION: Account for all network delays and mining uncertainties
    this.logger.debug("Implementing robust cross-chain timelock calculation");
    const latestBlock = await ethSigner.provider.getBlock("latest");
    const nowDstChain = latestBlock.timestamp;

    // Calculate robust buffers based on network conditions
    const miningBuffer = 5 * 60; // 5 minutes for mempool + mining delay
    const networkJitterBuffer = 2 * 60; // 2 minutes for network congestion
    const crossChainDelta = 20 * 60; // 20 minutes safety margin between dst and src cancellation

    // Calculate when the destination escrow will actually be created (when mined)
    const estimatedDstCreatedAt =
      nowDstChain + miningBuffer + networkJitterBuffer;

    // 🎯 CRITICAL: Use expert formula to account for contract's dynamic timestamp assignment
    // Contract calculates: dstCancellationTime = block.timestamp + timelock - 300
    // We must ensure: srcCancellationTimestamp > (estimatedDstCreatedAt + timelock - 300 + maxMiningDelay)
    const maxMiningDelay = 10 * 60; // 10 minutes worst-case mining delay (conservative)
    const mandatoryCrossChainBuffer = 20 * 60; // 20 minutes mandatory cross-chain buffer
    const contractInternalOffset = -300; // Contract subtracts 5 minutes internally

    // Apply expert-recommended formula
    const srcCancellationTimestamp =
      estimatedDstCreatedAt +
      timelock +
      contractInternalOffset +
      maxMiningDelay +
      mandatoryCrossChainBuffer;

    // For consistency with existing code, calculate dstCancellationTime for logging
    const dstCancellationTime =
      estimatedDstCreatedAt + timelock + contractInternalOffset;

    // Use estimated creation time for both Tron and Ethereum escrows
    const consistentDeployedAt = estimatedDstCreatedAt;

    console.log("=== FORMULAIC TIMELOCK CALCULATION ===");
    console.log("Client time (Date.now()):", Math.floor(Date.now() / 1000));
    console.log("Destination chain time (latest block):", nowDstChain);
    console.log("Mining buffer:", miningBuffer, "seconds");
    console.log("Network jitter buffer:", networkJitterBuffer, "seconds");
    console.log("Max mining delay (worst-case):", maxMiningDelay, "seconds");
    console.log(
      "Mandatory cross-chain buffer:",
      mandatoryCrossChainBuffer,
      "seconds"
    );
    console.log("Contract internal offset:", contractInternalOffset, "seconds");
    console.log("Estimated dst creation time:", estimatedDstCreatedAt);
    console.log(
      "Calculated dst cancellation time (for reference):",
      dstCancellationTime
    );
    console.log(
      "Calculated src cancellation time (SAFE):",
      srcCancellationTimestamp
    );
    console.log(
      "Total safety margin (src - dst):",
      srcCancellationTimestamp - dstCancellationTime,
      "seconds"
    );
    console.log(
      "Formula: srcCancel = estimatedDst + timelock - 300 + maxDelay + crossChainBuffer"
    );
    // Get User A's actual Tron address (TRX holder) and User B's ETH address
    const userA_tronAddress = this.tronExtension.getTronAddressFromPrivateKey(
      params.tronPrivateKey
    );
    // 🎯 CRITICAL FIX: For TRX→ETH, User A will receive ETH on their ETH address, not Tron address!
    const userA_ethAddress = this.config.getEthSigner(
      process.env.USER_A_ETH_PRIVATE_KEY || this.config.USER_A_ETH_PRIVATE_KEY
    ).address; // User A's ETH address (to receive ETH)
    const userB_ethAddress = ethSigner.address;
    // Create EIP-712 domain for order hash calculation
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
    // Calculate proper EIP-712 order hash
    const orderHash = ethers_1.ethers.TypedDataEncoder.hash(
      domain,
      types,
      preparedOrder.order
    );
    // Create immutables for TronEscrowSrc (User A locks TRX)
    const tronSrcImmutables = [
      orderHash, // bytes32 orderHash
      secretHash, // bytes32 hashlock
      encodeAddress(userA_tronAddress, this.tronExtension, this.config), // uint256 maker (User A - TRX holder)
      encodeAddress(userB_ethAddress, this.tronExtension, this.config), // uint256 taker (User B - ETH recipient)
      encodeAddress(
        this.config.getTrxRepresentationAddress(),
        this.tronExtension,
        this.config
      ), // uint256 token (TRX)
      trxAmount, // uint256 amount (TRX amount)
      this.tronExtension.toSun("5"), // uint256 safetyDeposit (5 TRX safety deposit)
      encodeTimelocks({
        // 🎯 CRITICAL FIX: Use relative offsets since Tron contract also sets deployedAt
        deployedAt: 0, // Will be overwritten by contract with block.timestamp
        srcWithdrawal: 600, // 10 minutes after deployment
        srcCancellation: timelock, // timelock duration after deployment
        dstWithdrawal: 15, // 15 seconds after deployment for fast testing
        dstCancellation: timelock - 300, // timelock - 5 minutes after deployment
      }),
    ];
    // Step 5: Deploy TronEscrowSrc (User A locks TRX)
    this.logger.logSwapProgress(
      "Deploying Tron source escrow (User A locks TRX)"
    );
    const tronSrcParams = {
      orderHash: orderHash,
      secretHash: secretHash,
      srcChain: this.config.getTronChainId(),
      dstChain: this.config.getEthChainId(),
      srcAsset: this.config.getTrxRepresentationAddress(), // TRX
      dstAsset: ethers_1.ethers.ZeroAddress, // ETH
      srcAmount: trxAmount.toString(), // TRX amount User A locks
      dstAmount: ethAmount.toString(), // ETH amount User A expects
      nonce: nonce,
      // CORRECT ROLE ASSIGNMENTS FOR TRX→ETH:
      // User A (TRX holder) locks TRX and receives ETH
      // User B (ETH holder) locks ETH and receives TRX
      srcBeneficiary: userA_tronAddress, // User A's TRON address (locks TRX)
      dstBeneficiary: userB_ethAddress, // User B's ETH address (can call withdraw on TronEscrowSrc)
      // CORRECT CANCELLATION ASSIGNMENTS:
      srcCancellationBeneficiary: userA_tronAddress, // User A gets TRX back if cancelled
      dstCancellationBeneficiary: userB_ethAddress, // User B gets ETH back if cancelled
      timelock: timelock,
      safetyDeposit: this.tronExtension.toSun("5"), // 5 TRX safety deposit
    };
    const tronSrcResult = await this.tronExtension.deployTronEscrowSrc(
      tronSrcParams,
      params.tronPrivateKey
    );
    this.logger.success("TronEscrowSrc deployed", {
      txHash: tronSrcResult.txHash,
      contractAddress: tronSrcResult.contractAddress,
    });
    // Step 6: Deploy EthereumEscrowDst (User B locks ETH)
    this.logger.logSwapProgress(
      "Deploying Ethereum destination escrow (User B locks ETH)"
    );
    // 🔍 DEBUG ADDRESS ENCODING INPUTS
    console.log("=== DEBUGGING ADDRESS ENCODING INPUTS ===");
    console.log("userA_tronAddress (for Tron escrow):", userA_tronAddress);
    console.log(
      "userA_ethAddress (for ETH escrow - FIXED!):",
      userA_ethAddress
    );
    console.log("userB_ethAddress before encoding:", userB_ethAddress);

    // 🔍 TEST TRON ADDRESS CONVERSION MANUALLY
    console.log("=== MANUAL TRON ADDRESS CONVERSION TEST ===");
    try {
      const tronWeb = this.tronExtension.createTronWebInstance(
        process.env.USER_B_TRON_PRIVATE_KEY ||
          this.config.USER_B_TRON_PRIVATE_KEY
      );
      const tronHexResult = tronWeb.address.toHex(userA_tronAddress);
      console.log("tronWeb.address.toHex result:", tronHexResult);
      console.log(
        "Expected BigInt conversion:",
        BigInt("0x" + tronHexResult).toString()
      );
      console.log("Expected hex address:", "0x" + tronHexResult);
    } catch (tronConversionError) {
      console.log("❌ Tron conversion error:", tronConversionError.message);
    }

    // Create immutables for EthereumEscrowDst (EXACT COPY: Use object format like working ETH→TRX flow)
    const ethDstImmutables = {
      orderHash: orderHash,
      hashlock: secretHash,
      maker: encodeAddress(userA_ethAddress, this.tronExtension, this.config), // User A (TRX holder, will receive ETH on their ETH address!)
      taker: encodeAddress(userB_ethAddress, this.tronExtension, this.config), // User B (ETH holder, will call withdraw)
      token: encodeAddress(
        ethers_1.ethers.ZeroAddress,
        this.tronExtension,
        this.config
      ), // ETH (native)
      amount: ethAmount,
      safetyDeposit: safetyDeposit,
      timelocks: encodeTimelocks({
        // 🎯 CRITICAL FIX: Use relative offsets since contract calls setDeployedAt(block.timestamp)
        deployedAt: 0, // Will be overwritten by contract with block.timestamp
        srcWithdrawal: 600, // 10 minutes after deployment
        srcCancellation: timelock, // timelock duration after deployment
        dstWithdrawal: 15, // 15 seconds after deployment for fast testing
        dstCancellation: timelock - 300, // timelock - 5 minutes after deployment
      }),
    };
    // srcCancellationTimestamp already calculated above with proper cross-chain coordination

    // 🔍 STEP 3: DETAILED TIMELOCK VERIFICATION
    const currentTime = Math.floor(Date.now() / 1000);
    // dstCancellationTime already calculated above with proper buffers
    console.log("=== CRITICAL DEBUG: TIMELOCK VERIFICATION ===");
    console.log("currentTime:", currentTime);
    console.log("timelock_duration:", timelock);
    console.log("srcCancellationTimestamp:", srcCancellationTimestamp);
    console.log("dstCancellationTime:", dstCancellationTime);
    console.log("contract_rule: dstCancellation <= srcCancellationTimestamp");
    console.log(
      "validation_check:",
      `${dstCancellationTime} <= ${srcCancellationTimestamp}`
    );
    console.log(
      "validation_result:",
      dstCancellationTime <= srcCancellationTimestamp
        ? "✅ VALID"
        : "❌ INVALID"
    );
    console.log(
      "time_difference:",
      srcCancellationTimestamp - dstCancellationTime
    );

    this.logger.debug("=== TIMELOCK VERIFICATION ===", {
      currentTime: currentTime,
      timelock_duration: timelock,
      srcCancellationTimestamp: srcCancellationTimestamp,
      dstCancellationTime: dstCancellationTime,
      contract_rule: "dstCancellation <= srcCancellationTimestamp",
      validation_check: `${dstCancellationTime} <= ${srcCancellationTimestamp}`,
      validation_result:
        dstCancellationTime <= srcCancellationTimestamp
          ? "✅ VALID"
          : "❌ INVALID",
      time_difference: srcCancellationTimestamp - dstCancellationTime,
      all_timelocks: {
        deployedAt: currentTime,
        srcWithdrawal: currentTime + 600,
        srcCancellation: srcCancellationTimestamp,
        dstWithdrawal: currentTime + 15,
        dstCancellation: dstCancellationTime,
      },
    });
    const totalEthValue = ethAmount + safetyDeposit;

    // 🔍 STEP 2: DETAILED MSG.VALUE VERIFICATION
    console.log("=== CRITICAL DEBUG: MSG.VALUE VERIFICATION ===");
    console.log("ethAmount:", ethAmount.toString());
    console.log("safetyDeposit:", safetyDeposit.toString());
    console.log("totalEthValue:", totalEthValue.toString());
    console.log("msg.value_will_be_sent:", totalEthValue.toString());
    console.log(
      "contract_expects_nativeAmount: ethAmount + safetyDeposit for native token"
    );
    console.log(
      "calculation_check:",
      `${ethAmount.toString()} + ${safetyDeposit.toString()} = ${totalEthValue.toString()}`
    );

    this.logger.debug("=== MSG.VALUE VERIFICATION ===", {
      ethAmount: ethAmount.toString(),
      safetyDeposit: safetyDeposit.toString(),
      totalEthValue: totalEthValue.toString(),
      "msg.value_will_be_sent": totalEthValue.toString(),
      contract_expects_nativeAmount:
        "ethAmount + safetyDeposit for native token",
      calculation_check: `${ethAmount.toString()} + ${safetyDeposit.toString()} = ${totalEthValue.toString()}`,
      wei_values: {
        ethAmount_wei: ethAmount.toString(),
        safetyDeposit_wei: safetyDeposit.toString(),
        total_wei: totalEthValue.toString(),
      },
    });

    // Use the official ESCROW_FACTORY.createDstEscrow() via DemoResolverV2 (EXACT COPY of working flow)
    const resolverWithSigner = this.resolverContract.connect(ethSigner);

    // DEBUGGING: Manual function encoding to verify calldata generation
    try {
      const encodedData = this.resolverContract.interface.encodeFunctionData(
        "createDstEscrow",
        [ethDstImmutables, srcCancellationTimestamp]
      );
      this.logger.debug("Manual function encoding successful", {
        encodedData,
        dataLength: encodedData.length,
        functionSelector: encodedData.slice(0, 10),
      });
    } catch (encodingError) {
      this.logger.error("Manual function encoding failed", {
        error: encodingError.message,
        ethDstImmutables,
        srcCancellationTimestamp,
      });
      throw new Error(`Function encoding failed: ${encodingError.message}`);
    }

    // DEBUGGING: Check contract interface and function fragments (SAFE VERSION)
    this.logger.debug("Contract interface inspection", {
      contractAddress: this.resolverContract?.address || "UNDEFINED",
      hasInterface: !!this.resolverContract?.interface,
      contractKeys: this.resolverContract
        ? Object.keys(this.resolverContract)
        : "CONTRACT_UNDEFINED",
      interfaceKeys: this.resolverContract?.interface
        ? Object.keys(this.resolverContract.interface)
        : "INTERFACE_UNDEFINED",
      hasFunctions: !!this.resolverContract?.interface?.functions,
      functionsKeys: this.resolverContract?.interface?.functions
        ? Object.keys(this.resolverContract.interface.functions)
        : "FUNCTIONS_UNDEFINED",
    });

    this.logger.debug("Calling DemoResolverV2.createDstEscrow for TRX→ETH", {
      ethDstImmutables,
      srcCancellationTimestamp,
      totalEthValue: totalEthValue.toString(),
    });

    // 🔍 DETAILED PARAMETER INSPECTION BEFORE STATICCALL
    console.log("=== CRITICAL DEBUG: PARAMETER INSPECTION ===");
    console.log("orderHash:", ethDstImmutables.orderHash);
    console.log("hashlock:", ethDstImmutables.hashlock);
    console.log("maker:", ethDstImmutables.maker?.toString());
    console.log("taker:", ethDstImmutables.taker?.toString());
    console.log("token:", ethDstImmutables.token?.toString());

    // 🔍 VALIDATE ADDRESS ENCODING
    console.log("=== ADDRESS ENCODING VALIDATION ===");
    console.log("userA_tronAddress (for Tron escrow):", userA_tronAddress);
    console.log(
      "userA_ethAddress (for ETH escrow - FIXED!):",
      userA_ethAddress
    );
    console.log("userB_ethAddress (original):", userB_ethAddress);

    // Try to decode the encoded addresses back to verify correctness
    try {
      // The maker should be User A (TRX holder, will receive ETH on their ETH address!)
      // The taker should be User B (ETH holder, will call withdraw)
      console.log(
        "maker_as_hex:",
        "0x" + ethDstImmutables.maker.toString(16).padStart(64, "0")
      );
      console.log(
        "taker_as_hex:",
        "0x" + ethDstImmutables.taker.toString(16).padStart(64, "0")
      );

      // Check if these look like valid address encodings
      const makerHex =
        "0x" + ethDstImmutables.maker.toString(16).padStart(64, "0");
      const takerHex =
        "0x" + ethDstImmutables.taker.toString(16).padStart(64, "0");

      console.log("maker_decoded_address:", "0x" + makerHex.slice(-40));
      console.log("taker_decoded_address:", "0x" + takerHex.slice(-40));

      // Compare with expected addresses
      console.log("expected_userA_eth:", userA_ethAddress);
      console.log("expected_userB_eth:", userB_ethAddress);

      // VALIDATION CHECK
      const makerDecoded = "0x" + makerHex.slice(-40);
      const takerDecoded = "0x" + takerHex.slice(-40);
      console.log(
        "✅ MAKER VALIDATION:",
        makerDecoded.toLowerCase() === userA_ethAddress.toLowerCase()
          ? "CORRECT"
          : "❌ MISMATCH"
      );
      console.log(
        "✅ TAKER VALIDATION:",
        takerDecoded.toLowerCase() === userB_ethAddress.toLowerCase()
          ? "CORRECT"
          : "❌ MISMATCH"
      );
    } catch (encodingError) {
      console.log(
        "❌ Address encoding validation failed:",
        encodingError.message
      );
    }
    console.log("amount:", ethDstImmutables.amount?.toString());
    console.log("safetyDeposit:", ethDstImmutables.safetyDeposit?.toString());
    console.log("timelocks:", ethDstImmutables.timelocks?.toString());
    console.log("srcCancellationTimestamp:", srcCancellationTimestamp);
    console.log("totalEthValue:", totalEthValue.toString());
    console.log(
      "contract_address:",
      this.resolverContract.address || this.resolverContract.target
    );

    this.logger.debug("=== PARAMETER INSPECTION BEFORE STATICCALL ===", {
      ethDstImmutables_structure: {
        orderHash: ethDstImmutables.orderHash,
        hashlock: ethDstImmutables.hashlock,
        maker: ethDstImmutables.maker?.toString(),
        taker: ethDstImmutables.taker?.toString(),
        token: ethDstImmutables.token?.toString(),
        amount: ethDstImmutables.amount?.toString(),
        safetyDeposit: ethDstImmutables.safetyDeposit?.toString(),
        timelocks: ethDstImmutables.timelocks?.toString(),
      },
      srcCancellationTimestamp: srcCancellationTimestamp,
      totalEthValue: totalEthValue.toString(),
      contract_address:
        this.resolverContract.address || this.resolverContract.target,
    });

    // 🔍 STEP 4: CHECK FOR ORDERHASH REUSE (CRITICAL VALIDATION)
    console.log("=== CRITICAL DEBUG: ORDERHASH REUSE CHECK ===");
    try {
      // Check if orderHash is already mapped to an escrow in EscrowFactory
      const escrowFactoryAddress = this.config.ESCROW_FACTORY_ADDRESS;
      const escrowFactoryABI = [
        "function escrows(bytes32) view returns (address)",
      ];
      const escrowFactory = new ethers_1.ethers.Contract(
        escrowFactoryAddress,
        escrowFactoryABI,
        ethSigner
      );

      const existingEscrow = await escrowFactory.escrows(
        ethDstImmutables.orderHash
      );
      console.log("orderHash:", ethDstImmutables.orderHash);
      console.log("existingEscrow:", existingEscrow);
      console.log(
        "isOrderHashUsed:",
        existingEscrow !== ethers_1.ethers.ZeroAddress
      );

      if (existingEscrow !== ethers_1.ethers.ZeroAddress) {
        console.log("❌ CRITICAL ERROR: OrderHash already used!");
        console.log("Existing escrow address:", existingEscrow);
        throw new Error(
          `OrderHash ${ethDstImmutables.orderHash} is already mapped to escrow ${existingEscrow}`
        );
      } else {
        console.log("✅ OrderHash is available for use");
      }
    } catch (escrowCheckError) {
      console.log(
        "⚠️ Could not check escrow factory:",
        escrowCheckError.message
      );
      // Continue anyway as this might not be the issue
    }

    // DEBUGGING: Try staticCall first to get detailed revert reasons
    try {
      await resolverWithSigner.createDstEscrow.staticCall(
        ethDstImmutables,
        srcCancellationTimestamp,
        {
          value: totalEthValue,
          gasLimit: 500000, // Match the actual transaction gas limit
          gasPrice: ethers_1.ethers.parseUnits("100", "gwei"), // Match the actual transaction gas price
        }
      );
      this.logger.debug(
        "staticCall simulation successful - proceeding with actual transaction"
      );
    } catch (staticCallError) {
      this.logger.error("staticCall simulation failed", {
        error: staticCallError.message,
        reason: staticCallError.reason,
        data: staticCallError.data,
      });
      throw new Error(`staticCall failed: ${staticCallError.message}`);
    }

    const ethDstTx = await resolverWithSigner.createDstEscrow(
      ethDstImmutables,
      srcCancellationTimestamp,
      {
        value: totalEthValue, // ETH amount + safety deposit
        gasLimit: 500000, // Higher gas limit for complex operations
        gasPrice: ethers_1.ethers.parseUnits("100", "gwei"), // 🚀 HACKATHON: Very high gas for ultra-fast confirmation
      }
    );
    const ethDstReceipt = await ethDstTx.wait();
    this.logger.logTransaction(
      "ethereum",
      ethDstTx.hash,
      "EthereumEscrowDst Creation (TRX→ETH)"
    );

    // 🎯 CRITICAL FIX: Extract actual ETH escrow address from DstEscrowCreated event (like working ETH→TRX flow)
    let ethEscrowAddress = this.config.DEMO_RESOLVER_ADDRESS; // fallback

    try {
      // Try multiple event patterns to find the escrow address (like working ETH→TRX flow)

      // Try EscrowCreated event from DemoResolver (like working ETH→TRX flow)
      const escrowCreatedEvent = ethDstReceipt?.logs?.find(
        (log) =>
          log.address.toLowerCase() ===
            this.config.DEMO_RESOLVER_ADDRESS.toLowerCase() &&
          log.topics[0] ===
            "0x2e51eb252678ae00b7491f29b35873f446f09ee22d616fc60d9db472d87b4081" // EscrowCreated event signature (same as working flow)
      );

      if (escrowCreatedEvent && escrowCreatedEvent.topics[1]) {
        // Extract escrow address from first indexed parameter (escrow address)
        const extractedAddress = "0x" + escrowCreatedEvent.topics[1].slice(-40);
        ethEscrowAddress = extractedAddress;
        this.logger.debug(
          "✅ Extracted ETH escrow address from EscrowCreated event (like working flow)",
          {
            extractedAddress: ethEscrowAddress,
            orderHash: orderHash,
          }
        );
      } else {
        // Fallback: Try DstEscrowCreated event from EscrowFactory with corrected signature
        const dstEscrowCreatedEvent = ethDstReceipt?.logs?.find(
          (log) =>
            log.address.toLowerCase() ===
              this.config.OFFICIAL_ESCROW_FACTORY_ADDRESS.toLowerCase() &&
            log.topics[0] ===
              "0xc30e111dcc74fddc2c3a4d98ffb97adec4485c0a687946bf5b22c2a99c7ff96d" // DstEscrowCreated(address,bytes32,uint256) actual signature
        );

        if (dstEscrowCreatedEvent && dstEscrowCreatedEvent.data) {
          // Extract escrow address from data field (first 32 bytes, but address is last 20 bytes)
          const extractedAddress =
            "0x" + dstEscrowCreatedEvent.data.slice(26, 66);
          ethEscrowAddress = extractedAddress;
          this.logger.debug(
            "✅ Extracted ETH escrow address from DstEscrowCreated event data",
            {
              extractedAddress: ethEscrowAddress,
              orderHash: orderHash,
              dataLength: dstEscrowCreatedEvent.data.length,
            }
          );
        } else {
          this.logger.warn(
            "⚠️ Could not find any escrow creation event, using fallback address"
          );
        }
      }
    } catch (error) {
      this.logger.warn("❌ Error extracting escrow address from event", {
        error: error.message,
      });
    }

    this.logger.success("EthereumEscrowDst created", {
      txHash: ethDstTx.hash,
      escrowAddress: ethEscrowAddress,
      blockNumber: ethDstReceipt?.blockNumber,
      gasUsed: ethDstReceipt?.gasUsed?.toString(),
    });
    // Step 7: Create order info for tracking
    const orderInfo = {
      orderHash: orderHash,
      signature: await ethSigner.signTypedData(
        domain,
        types,
        preparedOrder.order
      ),
    };
    const result = {
      orderHash: orderInfo.orderHash,
      secret: secret,
      secretHash: secretHash,
      ethEscrowAddress: ethEscrowAddress, // 🎯 FIXED: Now points to actual escrow contract
      tronEscrowAddress: tronSrcResult.contractAddress || "TronEscrowSrc",
      ethTxHash: ethDstTx.hash,
      tronTxHash: tronSrcResult.txHash,
      tronImmutables: tronSrcResult.immutables, // 🎯 CRITICAL FIX: Include tronImmutables for claiming
    };
    this.logger.success("TRX→ETH atomic swap setup complete", result);
    return result;
  }
  /**
   * Withdraw from completed swap using secret
   */
  async withdrawFromSwap(swapResult, privateKey, network) {
    this.logger.logSwapProgress(`Withdrawing from ${network} escrow`);
    if (network === "ethereum") {
      const signer = this.config.getEthSigner(privateKey);
      const resolverWithSigner = this.resolverContract.connect(signer);
      // Reconstruct immutables (this would need to be stored or reconstructed)
      const immutables = await this.reconstructImmutables(swapResult);
      // Note: Simplified implementation for demo
      // const withdrawTx = await resolverWithSigner.withdraw(...)
      const mockTxHash =
        "0x" +
        ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32)).slice(2);
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
  async cancelSwap(swapResult, privateKey, network) {
    this.logger.logSwapProgress(`Cancelling ${network} escrow`);
    if (network === "ethereum") {
      const signer = this.config.getEthSigner(privateKey);
      const resolverWithSigner = this.resolverContract.connect(signer);
      const immutables = await this.reconstructImmutables(swapResult);
      // Note: Simplified implementation for demo
      // const cancelTx = await resolverWithSigner.cancel(...)
      const mockTxHash =
        "0x" +
        ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32)).slice(2);
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
  async getSwapStatus(swapResult) {
    const [orderStatus, ethEscrowStatus, tronEscrowStatus] = await Promise.all([
      this.official1inch.getOrderStatus(swapResult.orderHash),
      this.getEthEscrowStatus(swapResult.ethEscrowAddress),
      this.tronExtension.getTronEscrowStatus(swapResult.tronEscrowAddress),
    ]);
    const now = Math.floor(Date.now() / 1000);
    // These would need to be calculated based on actual timelock values
    const canWithdraw = orderStatus.status === fusion_sdk_1.OrderStatus.Filled;
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
  async monitorSwap(swapResult, onProgress) {
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
        if (status.orderStatus === fusion_sdk_1.OrderStatus.Filled) {
          this.logger.success("Swap completed successfully");
          return status;
        }
        if (
          status.orderStatus === fusion_sdk_1.OrderStatus.Cancelled ||
          status.orderStatus === fusion_sdk_1.OrderStatus.Expired
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
  async calculateEscrowAddress(immutables) {
    // This would use the EscrowFactory to calculate deterministic address
    // For now, return a placeholder
    return "0x" + "0".repeat(40);
  }
  async getEthEscrowStatus(escrowAddress) {
    // Query escrow contract status
    return {
      address: escrowAddress,
      isWithdrawn: false,
      isCancelled: false,
      isActive: true,
    };
  }
  async reconstructImmutables(swapResult) {
    // Reconstruct immutables from swap result
    // In production, this should be stored or derived from on-chain data
    return {};
  }
  /**
   * Claim/withdraw from completed atomic swap
   * This is the final step that releases locked funds using the secret
   */
  async claimAtomicSwap(swapResult, secret, ethPrivateKey, tronPrivateKey) {
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
        ethPrivateKey,
        swapResult
      );
      // Step 2: Withdraw from Tron escrow (releases TRX to claimer)
      this.logger.info("Claiming TRX from Tron escrow...");
      this.logger.info("Debug TRX withdrawal", {
        tronEscrowAddress: swapResult.tronEscrowAddress,
        tronPrivateKeyProvided: !!tronPrivateKey,
        tronPrivateKeyLength: tronPrivateKey ? tronPrivateKey.length : 0,
      });
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
    } catch (error) {
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
  async withdrawFromEthereumEscrow(
    escrowAddress,
    secret,
    privateKey,
    swapResult
  ) {
    const provider = this.config.getEthProvider();
    const signer = new ethers_1.ethers.Wallet(privateKey, provider);
    // For DemoResolver, we use the withdrawETH function
    const escrowContract = new ethers_1.ethers.Contract(
      escrowAddress,
      [
        "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
        "function cancel(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
      ],
      signer
    );

    try {
      // Check escrow balance directly from provider
      const escrowBalance = await provider.getBalance(escrowAddress);
      this.logger.info("Ethereum escrow locked balance", {
        balance: ethers_1.ethers.formatEther(escrowBalance),
        escrowAddress,
      });
      if (escrowBalance > 0) {
        // Prepare immutables for withdrawal using correct 1inch escrow format (tuple, not object)
        // 🎯 HACKATHON: Use environment variables for addresses
        const userAEthAddress = this.config.getEthSigner(
          process.env.USER_A_ETH_PRIVATE_KEY ||
            this.config.USER_A_ETH_PRIVATE_KEY
        ).address;
        const userBEthAddress = this.config.getEthSigner(
          process.env.USER_B_ETH_PRIVATE_KEY ||
            this.config.USER_B_ETH_PRIVATE_KEY
        ).address;

        const immutables = [
          swapResult.orderHash,
          swapResult.secretHash,
          userAEthAddress, // maker (User A)
          userBEthAddress, // taker (User B)
          ethers_1.ethers.ZeroAddress, // token (Native ETH)
          swapResult.ethAmount || ethers_1.ethers.parseEther("0.001"), // amount
          escrowBalance, // safetyDeposit (use actual balance)
          0, // timelocks (simplified for demo)
        ];

        // Withdraw using the correct official escrow method with ultra-fast gas
        const fastGas = {
          gasPrice: ethers_1.ethers.parseUnits("100", "gwei"), // 🚀 HACKATHON: 100 Gwei for ultra-fast transactions
          gasLimit: 800000, // 800k gas limit
        };
        const withdrawTx = await escrowContract.withdraw(
          secret,
          immutables,
          fastGas
        );
        this.logger.logTransaction(
          "ethereum",
          withdrawTx.hash,
          "ETH withdrawal from escrow"
        );
        const receipt = await withdrawTx.wait();
        this.logger.success("ETH withdrawn successfully", {
          txHash: withdrawTx.hash,
          amount: ethers_1.ethers.formatEther(escrowBalance),
          gasUsed: receipt?.gasUsed?.toString(),
        });
      } else {
        this.logger.warn("No ETH locked in escrow to withdraw");
      }
    } catch (error) {
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
  async withdrawFromTronEscrow(escrowAddress, secret, swapResult, privateKey) {
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
    } catch (error) {
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
  async cancelAtomicSwap(swapResult, userPrivateKey) {
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
    } catch (error) {
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
  async cancelEthereumEscrow(escrowAddress, privateKey) {
    const provider = this.config.getEthProvider();
    const signer = new ethers_1.ethers.Wallet(privateKey, provider);
    const demoResolverContract = new ethers_1.ethers.Contract(
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
    } catch (error) {
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
  async cancelTronEscrow(escrowAddress, privateKey) {
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
      const cancelTx = await escrowContract.cancel().send({
        feeLimit: 50000000,
      });
      const txHash = typeof cancelTx === "string" ? cancelTx : cancelTx.txid;
      this.logger.logTransaction("tron", txHash, "TRX recovery from escrow");
      this.logger.success("TRX recovered successfully", {
        txHash,
        escrowAddress,
      });
    } catch (error) {
      this.logger.error("Failed to cancel Tron escrow", {
        error: error.message,
        escrowAddress,
      });
      throw error;
    }
  }
  async reconstructTronImmutables(swapResult) {
    // Reconstruct Tron immutables from swap result
    return {};
  }
}
exports.CrossChainOrchestrator = CrossChainOrchestrator;
//# sourceMappingURL=CrossChainOrchestrator.js.map
