#!/usr/bin/env ts-node

/**
 * Test basic EscrowFactory functionality
 */

import { ethers } from "ethers";
import { ConfigManager } from "../../src/utils/ConfigManager";

async function testFactoryBasic() {
  const config = new ConfigManager();
  const provider = new ethers.JsonRpcProvider(config.ETH_RPC_URL);

  console.log("🔧 Testing basic EscrowFactory functionality");
  console.log("============================================");

  // Test basic contract access
  const basicABI = [
    "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
    "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
  ];

  const factory = new ethers.Contract(
    config.OFFICIAL_ESCROW_FACTORY_ADDRESS,
    basicABI,
    provider
  );

  console.log("Factory address:", config.OFFICIAL_ESCROW_FACTORY_ADDRESS);

  try {
    const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
    console.log("✅ ESCROW_SRC_IMPLEMENTATION:", srcImpl);
  } catch (error: any) {
    console.error("❌ ESCROW_SRC_IMPLEMENTATION failed:", error.message);
  }

  try {
    const dstImpl = await factory.ESCROW_DST_IMPLEMENTATION();
    console.log("✅ ESCROW_DST_IMPLEMENTATION:", dstImpl);
  } catch (error: any) {
    console.error("❌ ESCROW_DST_IMPLEMENTATION failed:", error.message);
  }

  // Check if the contract has code
  const code = await provider.getCode(config.OFFICIAL_ESCROW_FACTORY_ADDRESS);
  console.log("Contract code length:", code.length);
  console.log("Is contract deployed:", code !== "0x");

  if (code === "0x") {
    console.error("🚨 CRITICAL: EscrowFactory has no contract code!");
    console.error("   This means the address is not a deployed contract.");
    console.error(
      "   Check if the address is correct:",
      config.OFFICIAL_ESCROW_FACTORY_ADDRESS
    );
  }
}

testFactoryBasic().catch(console.error);
