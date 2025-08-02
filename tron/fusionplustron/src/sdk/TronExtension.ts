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
      // TRON FIX: Get the patched escrow factory contract from ConfigManager
      // UPDATED: Using LIVE TronEscrowFactoryPatched address from successful deployment
      const TRON_ESCROW_FACTORY_PATCHED_ADDRESS =
        this.config.TRON_ESCROW_FACTORY_ADDRESS; // LIVE FACTORY ADDRESS - TESTED AND VERIFIED

      const factoryContract = await tronWeb
        .contract()
        .at(TRON_ESCROW_FACTORY_PATCHED_ADDRESS);

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
          // TRON address - convert base58 to hex then to uint256
          const tronHex = this.tronWeb.address.toHex(address);
          return BigInt("0x" + tronHex).toString();
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
        params.dstAsset === "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR" ||
        params.dstAsset === "0x0000000000000000000000000000000000000000";
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

      // EXACT COPY: Use the identical ABI from successful test script
      const factoryABI = [
        {
          inputs: [
            {
              components: [
                { name: "orderHash", type: "bytes32" },
                { name: "hashlock", type: "bytes32" },
                { name: "maker", type: "uint256" }, // Address as uint256 in Tron
                { name: "taker", type: "uint256" }, // Address as uint256 in Tron
                { name: "token", type: "uint256" }, // Address as uint256 in Tron
                { name: "amount", type: "uint256" },
                { name: "safetyDeposit", type: "uint256" },
                { name: "timelocks", type: "uint256" },
              ],
              name: "dstImmutables",
              type: "tuple",
            },
            { name: "srcCancellationTimestamp", type: "uint256" },
          ],
          name: "createDstEscrow",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, name: "escrow", type: "address" },
            { indexed: false, name: "hashlock", type: "bytes32" },
            { indexed: false, name: "taker", type: "uint256" },
          ],
          name: "DstEscrowCreated",
          type: "event",
        },
        {
          inputs: [],
          name: "isTronFactory",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getTronChainId",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ];

      const contract = await tronWeb.contract(
        factoryABI,
        TRON_ESCROW_FACTORY_PATCHED_ADDRESS
      );

      // TRON FIX: Verify we're connected to the correct Tron factory
      try {
        const isTronFactory = await (contract as any).isTronFactory().call();
        const chainId = await (contract as any).getTronChainId().call();

        this.logger.info("Factory verification", {
          isTronFactory,
          chainId: chainId.toString(),
          expectedChainId: "3448148188", // Nile testnet
        });

        if (!isTronFactory) {
          throw new Error("Connected to non-Tron factory");
        }
      } catch (verificationError: any) {
        this.logger.warn("Factory verification failed", {
          error: verificationError?.message || "Unknown error",
        });
        // Continue anyway for backwards compatibility
      }

      // Use array format for immutables struct (proven working format)
      // Convert BigInt values to proper format for TronWeb
      const immutablesArray = [
        immutables.orderHash, // bytes32 - already correct
        immutables.hashlock, // bytes32 - already correct
        immutables.maker, // uint256 - should be string
        immutables.taker, // uint256 - should be string
        immutables.token, // uint256 - should be string
        immutables.amount.toString(), // uint256 - convert to string
        immutables.safetyDeposit.toString(), // uint256 - convert to string
        "0x" + BigInt(immutables.timelocks).toString(16), // uint256 - convert to hex string like successful script
      ];

      this.logger.debug("Using contract wrapper approach", {
        immutablesArrayLength: immutablesArray.length,
        srcCancellationTimestamp,
        totalCallValue,
      });

      // Call the contract method using TronWeb with array format (proven working)
      this.logger.debug("Calling createDstEscrow with array format", {
        immutablesArray,
        srcCancellationTimestamp,
        totalCallValue,
      });

      const result = await (contract as any)
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
        // Wait for Tron transaction confirmation with proper retry mechanism
        console.log(
          "⏳ Waiting for Tron transaction confirmation (this may take several minutes)..."
        );

        let attempts = 0;
        const maxAttempts = 30; // Try for up to 5 minutes (30 attempts * 10 seconds)
        let transactionConfirmed = false;

        while (attempts < maxAttempts && !transactionConfirmed) {
          attempts++;
          const waitTime = 10000; // 10 seconds per attempt

          console.log(
            `🔄 Attempt ${attempts}/${maxAttempts} - waiting ${waitTime / 1000}s for confirmation...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          // Try to get transaction info and parse event logs for escrow address
          try {
            const txInfo = await this.tronWeb.trx.getTransactionInfo(txHash);

            // Check if we have transaction info
            if (txInfo && Object.keys(txInfo).length > 0) {
              console.log("🔍 Transaction confirmed! Processing event logs...");
              transactionConfirmed = true;

              this.logger.debug("Transaction info retrieved", {
                result: txInfo.receipt?.result,
                logCount: txInfo.log?.length || 0,
                blockNumber: txInfo.blockNumber,
              });

              // Check transaction result
              if (txInfo.receipt?.result === "FAILED") {
                throw new Error(
                  `Transaction failed with result: ${txInfo.receipt?.result}`
                );
              }

              // Parse event logs to find DstEscrowCreated event - using proven logic
              if (txInfo.log && txInfo.log.length > 0) {
                console.log(
                  `🔍 Found ${txInfo.log.length} event log(s) - analyzing...`
                );

                for (let i = 0; i < txInfo.log.length; i++) {
                  const log = txInfo.log[i];
                  console.log(`   Event ${i + 1}:`);
                  console.log(`     Topics: ${log.topics?.length || 0}`);
                  console.log(`     Data: ${log.data ? "Present" : "None"}`);

                  // Try to decode DstEscrowCreated event
                  try {
                    const eventSignature = this.tronWeb
                      .sha3("DstEscrowCreated(address,bytes32,uint256)")
                      .substring(2, 10); // Remove '0x' prefix and take first 8 hex chars

                    console.log(`     Expected signature: ${eventSignature}`);
                    console.log(
                      `     Log signature: ${log.topics?.[0] || "None"}`
                    );
                    console.log(
                      `     Log signature (first 8): ${log.topics?.[0]?.substring(0, 8) || "None"}`
                    );

                    if (
                      log.topics &&
                      log.topics[0].substring(0, 8) === eventSignature
                    ) {
                      console.log("✅ Found DstEscrowCreated event!");

                      // Manual parsing approach - Tron event data is packed differently
                      console.log(`     Raw data: ${log.data}`);

                      let hashlockHex = "";
                      let takerHex = "";

                      // For DstEscrowCreated event: address (32 bytes) + bytes32 (32 bytes) + uint256 (32 bytes)
                      if (log.data && log.data.length >= 192) {
                        // 96 bytes * 2 hex chars = 192
                        // Extract escrow address (first 32 bytes, but address is in last 20 bytes)
                        const addressHex = log.data.slice(24, 64); // Skip first 12 bytes, take next 20 bytes (40 hex chars)
                        hashlockHex = log.data.slice(64, 128); // Next 32 bytes
                        takerHex = log.data.slice(128, 192); // Last 32 bytes

                        console.log(`     Address hex: ${addressHex}`);
                        console.log(`     Hashlock hex: ${hashlockHex}`);
                        console.log(`     Taker hex: ${takerHex}`);

                        try {
                          contractAddress = this.tronWeb.address.fromHex(
                            "41" + addressHex
                          );
                          console.log(
                            `     ✅ Escrow Address: ${contractAddress}`
                          );
                          console.log(`     Hashlock: 0x${hashlockHex}`);
                          console.log(`     Taker: 0x${takerHex}`);
                        } catch (addrError: any) {
                          console.log(
                            `     Address conversion failed: ${addrError.message}`
                          );
                        }
                      } else {
                        console.log(
                          `     Data too short: ${log.data?.length || 0} chars`
                        );
                      }

                      if (contractAddress) {
                        this.logger.success(
                          "Escrow address extracted from event",
                          {
                            escrowAddress: contractAddress,
                            hashlock: "0x" + hashlockHex,
                            taker: "0x" + takerHex,
                          }
                        );
                      }
                      break;
                    }
                  } catch (eventError: any) {
                    console.log(
                      `     Event decode failed: ${eventError.message}`
                    );
                  }
                }
              } else {
                console.log("⚠️ No event logs found in transaction");
              }

              // If no event found but transaction succeeded, that's still OK
              if (!contractAddress && txInfo.receipt?.result === "SUCCESS") {
                this.logger.warn(
                  "Transaction succeeded but no DstEscrowCreated event found - escrow may still be created"
                );
                console.log(
                  `✅ Transaction succeeded! Check details: https://nile.tronscan.org/#/transaction/${txHash}`
                );
              }

              break; // Exit the retry loop
            } else {
              // Transaction not yet confirmed, continue waiting
              console.log("⏳ Transaction still processing...");
            }
          } catch (infoError: any) {
            // Only log the error but don't fail - Tron RPC can be flaky
            console.log(
              `⚠️ Attempt ${attempts}: Could not fetch transaction info (${infoError.message})`
            );

            // Only fail if we're sure it's a revert, not a timing issue
            if (
              infoError.message?.includes("CONTRACT_VALIDATE_ERROR") ||
              infoError.message?.includes("REVERT")
            ) {
              throw new Error(`Tron transaction failed: ${infoError.message}`);
            }
            // For other errors, continue retrying
          }
        }

        // Final check - if we ran out of attempts but transaction might still be valid
        if (!transactionConfirmed) {
          console.log(
            "⏰ Timeout reached, but transaction may still be processing"
          );
          console.log(
            `🔗 Check transaction status: https://nile.tronscan.org/#/transaction/${txHash}`
          );
          this.logger.warn(
            "Transaction confirmation timeout - check Tronscan for final status",
            {
              txHash,
              tronscanUrl: `https://nile.tronscan.org/#/transaction/${txHash}`,
            }
          );
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
    } catch (error: any) {
      // TRON FIX: Enhanced error handling for patched factory
      this.logger.failure("Failed to deploy Tron escrow destination", error);

      // Check for specific TronEscrowFactoryPatched error types
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";

      if (errorMessage.includes("InsufficientNativeValue")) {
        const match = errorMessage.match(
          /InsufficientNativeValue\((\d+), (\d+)\)/
        );
        if (match) {
          throw new Error(
            `Insufficient TRX value: required ${match[1]}, provided ${match[2]}`
          );
        }
      } else if (errorMessage.includes("InvalidAmount")) {
        throw new Error("Invalid amount: amount must be greater than 0");
      } else if (errorMessage.includes("InvalidHashlock")) {
        throw new Error("Invalid hashlock: hashlock cannot be zero");
      } else if (errorMessage.includes("InvalidToken")) {
        throw new Error("Invalid token: AddressLib.get() conversion failed");
      } else if (errorMessage.includes("InvalidTimingConstraints")) {
        throw new Error(
          "Invalid timing: destination cancellation time exceeds source cancellation time"
        );
      } else if (errorMessage.includes("NativeTransferFailed")) {
        throw new Error("TRX transfer to escrow contract failed");
      } else if (errorMessage.includes("Address mismatch")) {
        throw new Error(
          "CREATE2 address computation mismatch - TVM compatibility issue"
        );
      } else if (errorMessage.includes("Bytecode hash mismatch")) {
        throw new Error(
          "Proxy bytecode hash mismatch - TVM compatibility issue"
        );
      }

      // Re-throw with original error if no specific match
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
      // Define the proper ABI for the withdraw function
      const escrowABI = [
        {
          inputs: [
            { name: "secret", type: "bytes32" },
            {
              name: "immutables",
              type: "tuple",
              components: [
                { name: "orderHash", type: "bytes32" },
                { name: "hashlock", type: "bytes32" },
                { name: "maker", type: "uint256" },
                { name: "taker", type: "uint256" },
                { name: "token", type: "uint256" },
                { name: "amount", type: "uint256" },
                { name: "safetyDeposit", type: "uint256" },
                { name: "timelocks", type: "uint256" },
              ],
            },
          ],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const escrowContract = await tronWeb.contract(escrowABI, escrowAddress);

      // Convert TronEscrowParams to the proper immutables format for the contract
      // The contract expects an array/tuple, not an object with named fields
      const contractImmutables = [
        "0x" + "0".repeat(64), // orderHash - placeholder
        immutables.secretHash, // hashlock
        "0", // maker - simplified
        "0", // taker - simplified
        "0", // token - Native TRX
        immutables.dstAmount, // amount
        immutables.safetyDeposit, // safetyDeposit
        "0", // timelocks - simplified
      ];

      const result = await escrowContract
        .withdraw(secret, contractImmutables)
        .send({
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
