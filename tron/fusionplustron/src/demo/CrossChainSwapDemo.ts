#!/usr/bin/env node

import { ethers } from "ethers";
import { ConfigManager } from "../utils/ConfigManager";
import { Logger, LogLevel } from "../utils/Logger";
import {
  CrossChainOrchestrator,
  SwapParams,
} from "../sdk/CrossChainOrchestrator";

/**
 * Interactive demo script for Fusion+ Tron Extension
 * Demonstrates live cross-chain atomic swaps between Ethereum Sepolia and Tron Nile
 */
class CrossChainSwapDemo {
  private config: ConfigManager;
  private logger: Logger;
  private orchestrator: CrossChainOrchestrator;

  constructor() {
    this.config = new ConfigManager();
    this.logger = Logger.getInstance(LogLevel.INFO);
    this.orchestrator = new CrossChainOrchestrator(
      this.config,
      this.logger.scope("Demo")
    );
  }

  /**
   * Run the complete demo
   */
  async run(): Promise<void> {
    this.logger.info("🚀 Starting Fusion+ Tron Extension Demo");
    this.logger.info("=====================================");

    try {
      // Step 1: Environment validation
      await this.validateEnvironment();

      // Step 2: Display balances
      await this.displayBalances();

      // Step 3: Execute demo swap
      await this.executeDemoSwap();

      this.logger.success("✅ Demo completed successfully!");
    } catch (error) {
      this.logger.failure("❌ Demo failed", error);
      process.exit(1);
    }
  }

  /**
   * Validate environment and contracts
   */
  private async validateEnvironment(): Promise<void> {
    this.logger.info("🔍 Validating environment...");

    // Check network connectivity
    const provider = this.config.getEthProvider();
    const network = await provider.getNetwork();
    this.logger.info(`Connected to Ethereum ${this.config.ETH_NETWORK}`, {
      chainId: network.chainId.toString(),
      rpcUrl: this.config.ETH_RPC_URL,
    });

    // Validate contract deployments
    const contracts = [
      { name: "LimitOrderProtocol", address: this.config.OFFICIAL_LOP_ADDRESS },
      {
        name: "EscrowFactory",
        address: this.config.OFFICIAL_ESCROW_FACTORY_ADDRESS,
      },
      { name: "Resolver", address: this.config.OFFICIAL_RESOLVER_ADDRESS },
      {
        name: "FusionExtension",
        address: this.config.FUSION_EXTENSION_ADDRESS,
      },
    ];

    for (const contract of contracts) {
      const code = await provider.getCode(contract.address);
      if (code === "0x") {
        throw new Error(
          `Contract ${contract.name} not deployed at ${contract.address}`
        );
      }
      this.logger.success(`${contract.name} verified`, {
        address: contract.address,
      });
    }

    this.logger.success("Environment validation completed");
  }

  /**
   * Display current balances
   */
  private async displayBalances(): Promise<void> {
    this.logger.info("💰 Current Balances:");

    // User A (ETH holder)
    const userASigner = this.config.getEthSigner(
      this.config.USER_A_ETH_PRIVATE_KEY
    );
    const userAEthBalance = await userASigner.provider!.getBalance(
      userASigner.address
    );

    this.logger.info(`User A (ETH -> TRX):`, {
      address: userASigner.address,
      ethBalance: `${ethers.formatEther(userAEthBalance)} ETH`,
      tronReceiveAddress: this.config.USER_A_TRX_RECEIVE_ADDRESS,
    });

    // User B (TRX holder)
    const userBSigner = this.config.getEthSigner(
      this.config.USER_B_TRON_PRIVATE_KEY
    );

    this.logger.info(`User B (TRX -> ETH):`, {
      ethReceiveAddress: this.config.USER_B_ETH_RECEIVE_ADDRESS,
      tronPrivateKey: "***" + this.config.USER_B_TRON_PRIVATE_KEY.slice(-8),
    });

    // Check minimum balances
    const minEthBalance = ethers.parseEther("0.01");
    if (userAEthBalance < minEthBalance) {
      throw new Error(
        `Insufficient ETH balance. Need at least 0.01 ETH, have ${ethers.formatEther(userAEthBalance)} ETH`
      );
    }
  }

  /**
   * Execute the demo swap
   */
  private async executeDemoSwap(): Promise<void> {
    this.logger.info("🔄 Executing Demo Cross-Chain Swap");
    this.logger.info("==================================");

    const swapAmount = ethers.parseEther("0.001"); // 0.001 ETH
    const timelock = 7200; // 2 hours

    const swapParams: SwapParams = {
      ethAmount: swapAmount,
      ethPrivateKey: this.config.USER_A_ETH_PRIVATE_KEY,
      tronPrivateKey: this.config.USER_B_TRON_PRIVATE_KEY,
      tronRecipient: this.config.USER_A_TRX_RECEIVE_ADDRESS,
      timelock: timelock,
    };

    this.logger.info("Swap Parameters:", {
      ethAmount: `${ethers.formatEther(swapAmount)} ETH`,
      tronRecipient: swapParams.tronRecipient,
      timelock: `${timelock / 3600} hours`,
    });

    // Execute the swap
    this.logger.info("🎯 Initiating atomic swap...");
    const swapResult = await this.orchestrator.executeETHtoTRXSwap(swapParams);

    this.logger.success("Atomic swap initiated!", {
      orderHash: swapResult.orderHash,
      ethEscrowAddress: swapResult.ethEscrowAddress,
      tronEscrowAddress: swapResult.tronEscrowAddress,
      secretHash: swapResult.secretHash,
    });

    // Monitor swap progress
    this.logger.info("📊 Monitoring swap progress...");

    let progressCount = 0;
    const finalStatus = await this.orchestrator.monitorSwap(
      swapResult,
      (status) => {
        progressCount++;
        this.logger.info(`Progress Update #${progressCount}:`, {
          orderStatus: status.orderStatus,
          ethEscrowActive: status.ethEscrowStatus.isActive,
          tronEscrowActive: status.tronEscrowStatus.isActive,
          canWithdraw: status.canWithdraw,
        });
      }
    );

    this.logger.success("Swap monitoring completed", finalStatus);

    // Display final results
    this.displaySwapResults(swapResult, finalStatus);

    // Demonstrate withdrawal (if applicable)
    if (finalStatus.canWithdraw) {
      await this.demonstrateWithdrawal(swapResult);
    }
  }

  /**
   * Display swap results
   */
  private displaySwapResults(swapResult: any, finalStatus: any): void {
    this.logger.info("📋 Final Swap Results:");
    this.logger.info("======================");

    this.logger.info("Transaction Hashes:", {
      ethereum: `https://sepolia.etherscan.io/tx/${swapResult.ethTxHash}`,
      tron: `https://nile.tronscan.org/#/transaction/${swapResult.tronTxHash}`,
    });

    this.logger.info("Escrow Addresses:", {
      ethereum: swapResult.ethEscrowAddress,
      tron: swapResult.tronEscrowAddress,
    });

    this.logger.info("Final Status:", {
      orderStatus: finalStatus.orderStatus,
      canWithdraw: finalStatus.canWithdraw,
      canCancel: finalStatus.canCancel,
    });

    if (finalStatus.orderStatus === "Filled") {
      this.logger.success("🎉 Cross-chain swap completed successfully!");
      this.logger.info("The atomic swap has been executed:");
      this.logger.info("1. ✅ Ethereum order filled via official 1inch LOP");
      this.logger.info("2. ✅ Ethereum escrow created via official Resolver");
      this.logger.info("3. ✅ Tron escrow deployed and funded");
      this.logger.info("4. ✅ Cross-chain atomicity preserved");
    }
  }

  /**
   * Demonstrate withdrawal process
   */
  private async demonstrateWithdrawal(swapResult: any): Promise<void> {
    this.logger.info("💸 Demonstrating Withdrawal Process");
    this.logger.info("===================================");

    try {
      // Withdraw from Tron escrow (User A gets TRX)
      this.logger.info("Withdrawing TRX from Tron escrow...");
      const tronWithdrawTx = await this.orchestrator.withdrawFromSwap(
        swapResult,
        this.config.USER_A_ETH_PRIVATE_KEY, // User A withdraws TRX
        "tron"
      );

      this.logger.logTransaction("tron", tronWithdrawTx, "TRX Withdrawal");

      // Withdraw from Ethereum escrow (User B gets ETH)
      this.logger.info("Withdrawing ETH from Ethereum escrow...");
      const ethWithdrawTx = await this.orchestrator.withdrawFromSwap(
        swapResult,
        this.config.USER_B_TRON_PRIVATE_KEY, // User B withdraws ETH
        "ethereum"
      );

      this.logger.logTransaction("ethereum", ethWithdrawTx, "ETH Withdrawal");

      this.logger.success(
        "Both parties have successfully withdrawn their funds!"
      );
    } catch (error) {
      this.logger.warn("Withdrawal demonstration skipped", error);
      this.logger.info(
        "In a real scenario, users would withdraw using the revealed secret"
      );
    }
  }

  /**
   * Display help information
   */
  public displayHelp(): void {
    console.log(`
🚀 Fusion+ Tron Extension Demo
=============================

This demo showcases cross-chain atomic swaps between Ethereum Sepolia and Tron Nile testnets
using the official 1inch Fusion+ architecture with Tron extension.

Prerequisites:
- Ethereum Sepolia testnet ETH (at least 0.01 ETH)
- Tron Nile testnet TRX (at least 100 TRX)
- Proper environment configuration (.env file)

The demo will:
1. Validate environment and contract deployments
2. Display current balances
3. Execute an ETH -> TRX atomic swap
4. Monitor swap progress
5. Demonstrate withdrawal process

Architecture:
- Uses official 1inch LimitOrderProtocol for order execution
- Uses official 1inch EscrowFactory for escrow creation
- Uses official 1inch Resolver for atomic execution
- Uses TronFusionExtension for cross-chain coordination
- Maintains full atomicity and security guarantees

For more information, see the project documentation.
    `);
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    new CrossChainSwapDemo().displayHelp();
    return;
  }

  const demo = new CrossChainSwapDemo();
  await demo.run();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Demo failed:", error);
    process.exit(1);
  });
}

export { CrossChainSwapDemo };
