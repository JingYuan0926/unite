// @ts-ignore - TronWeb types are defined in src/types/tronweb.d.ts
import TronWeb from "tronweb";
import { ethers } from "ethers";
import { ConfigManager } from "../utils/ConfigManager";
import { ScopedLogger } from "../utils/Logger";

export interface TronEscrowParams {
  secretHash: string;
  srcChain: number;
  dstChain: number;
  srcAsset: string;
  dstAsset: string;
  srcAmount: string;
  dstAmount: string;
  nonce: string;
  srcBeneficiary: string;
  dstBeneficiary: string;
  srcCancellationBeneficiary: string;
  dstCancellationBeneficiary: string;
  timelock: number;
  safetyDeposit: string;
}

export interface TronNetworkInfo {
  blockNumber: number;
  network: string;
  chainId: number;
}

export interface TronTransactionResult {
  txHash: string;
  success: boolean;
  contractAddress?: string;
}

/**
 * Tron Extension for cross-chain functionality
 * Handles Tron-specific operations for the Fusion+ integration
 */
export class TronExtension {
  private tronWeb: TronWeb;
  private config: ConfigManager;
  private logger: ScopedLogger;

  constructor(config: ConfigManager, logger: ScopedLogger) {
    this.config = config;
    this.logger = logger;

    // Initialize TronWeb
    this.tronWeb = new TronWeb({
      fullHost: config.TRON_RPC_URL,
      privateKey: config.USER_B_TRON_PRIVATE_KEY, // Default to User B's key
    });

    this.logger.info("TronExtension initialized", {
      network: config.TRON_NETWORK,
      rpcUrl: config.TRON_RPC_URL,
    });
  }

  /**
   * Create TronWeb instance with specific private key
   */
  createTronWebInstance(privateKey: string): TronWeb {
    return new TronWeb({
      fullHost: this.config.TRON_RPC_URL,
      privateKey: privateKey,
    });
  }

  /**
   * Deploy Tron escrow destination contract
   */
  async deployTronEscrowDst(
    params: TronEscrowParams,
    privateKey: string
  ): Promise<TronTransactionResult> {
    this.logger.debug("Deploying Tron escrow destination", params);

    const tronWeb = this.createTronWebInstance(privateKey);

    try {
      // Get the escrow factory contract
      const factoryContract = await tronWeb
        .contract()
        .at(this.config.TRON_ESCROW_FACTORY_ADDRESS);

      // Create proper IBaseEscrow.Immutables struct matching the Solidity contract
      // Generate orderHash from TronEscrowParams (missing from our interface)
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const orderHash = ethers.keccak256(
        abiCoder.encode(
          [
            "bytes32",
            "uint256",
            "uint256",
            "string",
            "string",
            "string",
            "string",
          ],
          [
            params.secretHash,
            params.srcChain,
            params.dstChain,
            params.srcAsset,
            params.dstAsset,
            params.srcAmount,
            params.dstAmount,
          ]
        )
      );

      // Helper function to convert address to uint256 (Address type)
      const addressToUint256 = (address: string): string => {
        if (address.startsWith("0x")) {
          // Ethereum address - convert to uint256
          return BigInt(address).toString();
        } else {
          // TRON address - convert base58 to approximate uint256
          // For demo purposes, using hash-based conversion
          return BigInt(
            "0x" + ethers.keccak256(ethers.toUtf8Bytes(address)).slice(2, 42)
          ).toString();
        }
      };

      // Create packed timelocks (NOT the complex object)
      const packedTimelocks = this.createPackedTimelocks(params.timelock);

      // Map TronEscrowParams to IBaseEscrow.Immutables (8 fields exactly)
      const immutables = {
        orderHash: orderHash, // bytes32
        hashlock: params.secretHash, // bytes32 (secretHash)
        maker: addressToUint256(params.srcBeneficiary), // Address as uint256
        taker: addressToUint256(params.dstBeneficiary), // Address as uint256
        token: addressToUint256(
          params.dstAsset === "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"
            ? "0x0000000000000000000000000000000000000000"
            : params.dstAsset
        ), // Address as uint256 (0x0 for native TRX)
        amount: params.dstAmount, // uint256
        safetyDeposit: params.safetyDeposit, // uint256
        timelocks: packedTimelocks.toString(), // Timelocks as uint256 string
      };

      this.logger.debug("Created IBaseEscrow.Immutables", {
        orderHash,
        immutablesFields: Object.keys(immutables).length,
        packedTimelocks: packedTimelocks.toString(),
      });

      // Calculate source cancellation timestamp
      const srcCancellationTimestamp =
        Math.floor(Date.now() / 1000) + params.timelock;

      // Calculate total value needed for native TRX
      // For native TRX: callValue = amount + safetyDeposit
      // For TRC20 tokens: callValue = safetyDeposit only
      const isNativeTRX =
        params.dstAsset === "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
      const totalCallValue = isNativeTRX
        ? (
            parseInt(params.dstAmount) + parseInt(params.safetyDeposit)
          ).toString()
        : params.safetyDeposit;

      this.logger.debug("Calculated call value", {
        isNativeTRX,
        dstAmount: params.dstAmount,
        safetyDeposit: params.safetyDeposit,
        totalCallValue,
      });

      // Use TronWeb contract wrapper for proper struct encoding
      // Based on web search research, this is the recommended approach for struct parameters

      // Define the correct ABI for createDstEscrow
      const ESCROW_FACTORY_ABI = [
        {
          inputs: [
            {
              components: [
                { type: "bytes32", name: "orderHash" },
                { type: "bytes32", name: "hashlock" },
                { type: "uint256", name: "maker" }, // Address -> uint256
                { type: "uint256", name: "taker" }, // Address -> uint256
                { type: "uint256", name: "token" }, // Address -> uint256
                { type: "uint256", name: "amount" },
                { type: "uint256", name: "safetyDeposit" },
                { type: "uint256", name: "timelocks" }, // Timelocks -> uint256
              ],
              internalType: "struct IBaseEscrow.Immutables",
              name: "dstImmutables",
              type: "tuple",
            },
            { type: "uint256", name: "srcCancellationTimestamp" },
          ],
          name: "createDstEscrow",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ];

      // Create contract instance with ABI
      const contract = await tronWeb.contract(
        ESCROW_FACTORY_ABI,
        this.config.TRON_ESCROW_FACTORY_ADDRESS
      );

      // Convert immutables to array format (TronWeb expects arrays for structs)
      const immutablesArray = [
        immutables.orderHash,
        immutables.hashlock,
        immutables.maker,
        immutables.taker,
        immutables.token,
        immutables.amount,
        immutables.safetyDeposit,
        immutables.timelocks,
      ];

      this.logger.debug("Using contract wrapper approach", {
        immutablesArrayLength: immutablesArray.length,
        srcCancellationTimestamp,
        totalCallValue,
      });

      // Call the contract method using the wrapper
      const result = await contract
        .createDstEscrow(immutablesArray, srcCancellationTimestamp)
        .send({
          feeLimit: 100000000,
          callValue: totalCallValue,
        });

      // TronWeb .send() returns the transaction hash directly as a string
      const txHash =
        typeof result === "string"
          ? result
          : result.txid || result.transaction?.txID;

      console.log("✅ TRON Transaction Hash:", txHash);

      // For contract creation, we need to compute the contract address
      // This is a deterministic calculation based on the factory and the transaction
      let contractAddress: string | undefined;

      if (txHash) {
        // Wait a moment for the transaction to be processed
        console.log("⏳ Waiting for transaction confirmation...");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Try to get transaction info to find the created contract address
        try {
          const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash);
          console.log("🔍 Transaction Info:", JSON.stringify(txInfo, null, 2));

          // Look for contract address in various possible locations
          contractAddress =
            txInfo.contract_address ||
            txInfo.contractAddress ||
            txInfo.internal_transactions?.[0]?.contract_address;
        } catch (infoError) {
          console.log("⚠️ Could not fetch transaction info:", infoError);
          // We'll proceed without the contract address for now
        }
      }

      this.logger.success("Tron escrow destination deployed", {
        txHash,
        contractAddress,
      });

      this.logger.logTransaction("tron", txHash, "Escrow Dst Deployment");

      return {
        txHash,
        success: true,
        contractAddress,
      };
    } catch (error) {
      this.logger.failure("Failed to deploy Tron escrow destination", error);
      throw error;
    }
  }

  /**
   * Withdraw from Tron escrow using secret
   */
  async withdrawFromTronEscrow(
    escrowAddress: string,
    secret: string,
    immutables: TronEscrowParams,
    privateKey: string
  ): Promise<TronTransactionResult> {
    this.logger.debug("Withdrawing from Tron escrow", {
      escrowAddress,
      secretHash: immutables.secretHash,
    });

    const tronWeb = this.createTronWebInstance(privateKey);

    try {
      const escrowContract = await tronWeb.contract().at(escrowAddress);

      const result = await escrowContract.withdraw(secret, immutables).send({
        feeLimit: 50000000, // 50 TRX fee limit
      });

      // TronWeb .send() returns the transaction hash directly as a string
      const txHash =
        typeof result === "string"
          ? result
          : result.txid || result.transaction?.txID;

      console.log("✅ TRON Withdrawal Transaction Hash:", txHash);

      this.logger.success("Withdrawn from Tron escrow", { txHash });
      this.logger.logTransaction("tron", txHash, "Escrow Withdrawal");

      return {
        txHash,
        success: true,
      };
    } catch (error) {
      this.logger.failure("Failed to withdraw from Tron escrow", error);
      throw error;
    }
  }

  /**
   * Cancel Tron escrow after timelock expiry
   */
  async cancelTronEscrow(
    escrowAddress: string,
    immutables: TronEscrowParams,
    privateKey: string
  ): Promise<TronTransactionResult> {
    this.logger.debug("Cancelling Tron escrow", {
      escrowAddress,
      secretHash: immutables.secretHash,
    });

    const tronWeb = this.createTronWebInstance(privateKey);

    try {
      const escrowContract = await tronWeb.contract().at(escrowAddress);

      const result = await escrowContract.cancel(immutables).send({
        feeLimit: 50000000, // 50 TRX fee limit
      });

      const txHash = result.txid || result.transaction?.txID;

      this.logger.success("Cancelled Tron escrow", { txHash });
      this.logger.logTransaction("tron", txHash, "Escrow Cancellation");

      return {
        txHash,
        success: true,
      };
    } catch (error) {
      this.logger.failure("Failed to cancel Tron escrow", error);
      throw error;
    }
  }

  /**
   * Get Tron escrow status
   */
  async getTronEscrowStatus(escrowAddress: string): Promise<any> {
    try {
      const escrowContract = await this.tronWeb.contract().at(escrowAddress);

      // Call view functions to get escrow state
      const [isWithdrawn, isCancelled] = await Promise.all([
        escrowContract.isWithdrawn().call(),
        escrowContract.isCancelled().call(),
      ]);

      return {
        address: escrowAddress,
        isWithdrawn,
        isCancelled,
        isActive: !isWithdrawn && !isCancelled,
      };
    } catch (error) {
      this.logger.error("Failed to get Tron escrow status", error);
      throw error;
    }
  }

  /**
   * Generate secret hash for atomic swap
   */
  generateSecretHash(): { secret: string; secretHash: string } {
    try {
      // Generate 32-byte random secret using crypto module
      const crypto = require("crypto");
      const secretBytes = crypto.randomBytes(32);
      const secret = "0x" + secretBytes.toString("hex");

      // Hash the secret using keccak256 (EVM-compatible)
      const secretHash = ethers.keccak256(secret);

      this.logger.debug("Generated secret hash", {
        secretLength: secret.length,
        secretHashLength: secretHash.length,
      });

      return {
        secret: secret,
        secretHash: secretHash,
      };
    } catch (error) {
      this.logger.error("Failed to generate secret hash", error);
      throw error;
    }
  }

  /**
   * Create packed timelocks for EVM contract compatibility
   * Replicates the Solidity _createTimelocks function bit-shifting logic
   *
   * @param timelock - User-defined timelock duration in seconds
   * @returns Packed uint256 value as bigint
   */
  createPackedTimelocks(timelock: number): bigint {
    // TimelocksLib.Stage enum values:
    // SrcWithdrawal = 0, SrcPublicWithdrawal = 1, SrcCancellation = 2,
    // SrcPublicCancellation = 3, DstWithdrawal = 4, DstPublicWithdrawal = 5,
    // DstCancellation = 6

    const srcWithdrawal = BigInt(600); // 10 minutes
    const srcPublicWithdrawal = BigInt(1800); // 30 minutes
    const srcCancellation = BigInt(timelock); // user-defined
    const srcPublicCancellation = BigInt(timelock + 3600); // +1 hour
    const dstWithdrawal = BigInt(300); // 5 minutes
    const dstPublicWithdrawal = BigInt(900); // 15 minutes
    const dstCancellation = BigInt(timelock - 300); // 5 min earlier than src

    // Pack into single uint256 using bit shifting
    // Each stage occupies 32 bits (4 bytes) in the packed value
    const packed =
      (srcWithdrawal << (BigInt(0) * BigInt(32))) | // Stage 0: bits 0-31
      (srcPublicWithdrawal << (BigInt(1) * BigInt(32))) | // Stage 1: bits 32-63
      (srcCancellation << (BigInt(2) * BigInt(32))) | // Stage 2: bits 64-95
      (srcPublicCancellation << (BigInt(3) * BigInt(32))) | // Stage 3: bits 96-127
      (dstWithdrawal << (BigInt(4) * BigInt(32))) | // Stage 4: bits 128-159
      (dstPublicWithdrawal << (BigInt(5) * BigInt(32))) | // Stage 5: bits 160-191
      (dstCancellation << (BigInt(6) * BigInt(32))); // Stage 6: bits 192-223

    this.logger.debug("Created packed timelocks", {
      timelock,
      packedValue: packed.toString(),
      packedHex: "0x" + packed.toString(16),
    });

    return packed;
  }

  /**
   * Create timelocks structure for escrow (legacy - now uses packed timelocks)
   * @deprecated Use createPackedTimelocks() for EVM contract compatibility
   */
  createTimelocks(timelock: number): any {
    // Use the new packed timelocks implementation
    const packedTimelocks = this.createPackedTimelocks(timelock);

    // Return both packed value and individual components for backwards compatibility
    const now = Math.floor(Date.now() / 1000);

    return {
      packed: packedTimelocks,
      srcWithdrawal: now + timelock,
      srcCancellation: now + timelock + 300, // 5 minutes after withdrawal
      dstWithdrawal: now + timelock - 600, // 10 minutes before src
      dstCancellation: now + timelock - 300, // 5 minutes before src
    };
  }

  /**
   * Get Tron network information
   */
  async getTronNetworkInfo(): Promise<TronNetworkInfo> {
    try {
      const blockInfo = await this.tronWeb.trx.getCurrentBlock();

      return {
        blockNumber: blockInfo.block_header.raw_data.number,
        network: this.config.TRON_NETWORK,
        chainId: this.config.getTronChainId(),
      };
    } catch (error) {
      this.logger.error("Failed to get Tron network info", error);
      throw error;
    }
  }

  /**
   * Get TRX balance for address
   */
  async getTrxBalance(address: string): Promise<string> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.tronWeb.fromSun(balance.toString());
    } catch (error) {
      this.logger.error("Failed to get TRX balance", error);
      throw error;
    }
  }

  /**
   * Convert TRX to Sun (smallest unit)
   */
  toSun(trxAmount: string): string {
    return this.tronWeb.toSun(trxAmount);
  }

  /**
   * Convert Sun to TRX
   */
  fromSun(sunAmount: string): string {
    return this.tronWeb.fromSun(sunAmount);
  }

  /**
   * Validate Tron address format
   */
  isValidTronAddress(address: string): boolean {
    return this.tronWeb.isAddress(address);
  }

  /**
   * Get current timestamp
   */
  getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(
    txHash: string,
    timeoutMs: number = 60000
  ): Promise<any> {
    this.logger.debug("Waiting for Tron transaction confirmation", { txHash });

    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    while (Date.now() - startTime < timeoutMs) {
      try {
        const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash);

        if (txInfo && txInfo.id) {
          this.logger.success("Tron transaction confirmed", {
            txHash,
            blockNumber: txInfo.blockNumber,
          });
          return txInfo;
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        // Transaction might not be available yet, continue polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
  }
}
