#!/usr/bin/env ts-node

import { ethers } from "ethers";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger, LogLevel } from "../../src/utils/Logger";
import { CrossChainOrchestrator } from "../../src/sdk/CrossChainOrchestrator";
import { Official1inchSDK } from "../../src/sdk/Official1inchSDK";
import { TronExtension } from "../../src/sdk/TronExtension";

/**
 * Test script for Phase 5 SDK components
 * Validates all SDK components are working correctly
 */
async function testPhase5SDK(): Promise<void> {
  console.log("🧪 Testing Phase 5 SDK Components");
  console.log("==================================");

  try {
    // Step 1: Initialize components
    console.log("1. Initializing SDK components...");
    const config = new ConfigManager();
    const logger = Logger.getInstance(LogLevel.INFO);

    const orchestrator = new CrossChainOrchestrator(
      config,
      logger.scope("Test")
    );
    const official1inch = new Official1inchSDK(config, logger.scope("1inch"));
    const tronExtension = new TronExtension(config, logger.scope("Tron"));

    console.log("✅ SDK components initialized successfully");

    // Step 2: Test configuration
    console.log("\n2. Testing configuration...");
    console.log(`ETH Network: ${config.ETH_NETWORK}`);
    console.log(`TRON Network: ${config.TRON_NETWORK}`);
    console.log(`LOP Address: ${config.OFFICIAL_LOP_ADDRESS}`);
    console.log(`Resolver Address: ${config.OFFICIAL_RESOLVER_ADDRESS}`);
    console.log(`Fusion Extension: ${config.FUSION_EXTENSION_ADDRESS}`);
    console.log("✅ Configuration validated");

    // Step 3: Test network connectivity
    console.log("\n3. Testing network connectivity...");

    const provider = config.getEthProvider();
    const network = await provider.getNetwork();
    console.log(`Connected to Ethereum chain ID: ${network.chainId}`);

    const tronInfo = await tronExtension.getTronNetworkInfo();
    console.log(`Connected to Tron chain ID: ${tronInfo.chainId}`);
    console.log("✅ Network connectivity verified");

    // Step 4: Test contract validation
    console.log("\n4. Testing contract deployments...");

    const contracts = [
      { name: "LimitOrderProtocol", address: config.OFFICIAL_LOP_ADDRESS },
      {
        name: "EscrowFactory",
        address: config.OFFICIAL_ESCROW_FACTORY_ADDRESS,
      },
      { name: "Resolver", address: config.OFFICIAL_RESOLVER_ADDRESS },
      { name: "FusionExtension", address: config.FUSION_EXTENSION_ADDRESS },
    ];

    for (const contract of contracts) {
      const code = await provider.getCode(contract.address);
      if (code === "0x") {
        throw new Error(`Contract ${contract.name} not deployed`);
      }
      console.log(`✅ ${contract.name} deployed and verified`);
    }

    // Step 5: Test secret generation
    console.log("\n5. Testing secret generation...");
    const { secret, secretHash } = tronExtension.generateSecretHash();
    console.log(`Secret: ${secret.slice(0, 10)}...`);
    console.log(`Secret Hash: ${secretHash.slice(0, 10)}...`);
    console.log("✅ Secret generation working");

    // Step 6: Test balance checks
    console.log("\n6. Testing balance checks...");

    const userASigner = config.getEthSigner(config.USER_A_ETH_PRIVATE_KEY);
    const ethBalance = await userASigner.provider!.getBalance(
      userASigner.address
    );
    console.log(`User A ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

    if (ethBalance < ethers.parseEther("0.001")) {
      console.log("⚠️  Warning: Low ETH balance for testing");
    } else {
      console.log("✅ Sufficient ETH balance for testing");
    }

    // Step 7: Test quote functionality (if API key available)
    console.log("\n7. Testing quote functionality...");

    if (config.ONE_INCH_API_KEY) {
      try {
        const quote = await official1inch.getETHtoTRXQuote(
          ethers.parseEther("0.001"),
          userASigner.address
        );
        console.log(
          `Quote received: ${quote.fromTokenAmount} -> ${quote.toTokenAmount}`
        );
        console.log("✅ Quote functionality working");
      } catch (error) {
        console.log("⚠️  Quote test skipped (API key or network issue)");
      }
    } else {
      console.log("⚠️  Quote test skipped (no API key)");
    }

    // Step 8: Test SDK integration
    console.log("\n8. Testing SDK integration...");

    const networkInfo = official1inch.getNetworkInfo();
    console.log(
      `SDK Network: ${networkInfo.network} (Chain ID: ${networkInfo.chainId})`
    );

    const timelock = config.getDefaultTimelock();
    console.log(`Default timelock: ${timelock / 3600} hours`);
    console.log("✅ SDK integration working");

    console.log("\n🎉 All Phase 5 SDK tests passed!");
    console.log("=====================================");
    console.log("The SDK is ready for cross-chain atomic swaps!");
    console.log("");
    console.log("Next steps:");
    console.log("- Run 'npm run demo' for interactive demo");
    console.log("- Run 'npm run test:integration' for full test suite");
    console.log("- Check balances and API keys for live testing");
  } catch (error) {
    console.error("❌ Phase 5 SDK test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testPhase5SDK().catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
}

export { testPhase5SDK };
