#!/usr/bin/env ts-node

/**
 * Check who owns the Resolver contract
 */

import { ethers } from "ethers";
import { ConfigManager } from "../../src/utils/ConfigManager";

async function checkResolverOwner() {
  const config = new ConfigManager();
  const provider = new ethers.JsonRpcProvider(config.ETH_RPC_URL);

  const resolverABI = ["function owner() view returns (address)"];

  const resolver = new ethers.Contract(
    config.OFFICIAL_RESOLVER_ADDRESS,
    resolverABI,
    provider
  );

  try {
    const owner = await resolver.owner();
    const ourAddress = "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F";

    console.log("🔍 RESOLVER CONTRACT OWNERSHIP CHECK");
    console.log("=====================================");
    console.log(`Resolver Address: ${config.OFFICIAL_RESOLVER_ADDRESS}`);
    console.log(`Contract Owner: ${owner}`);
    console.log(`Our Address: ${ourAddress}`);
    console.log(
      `Are we the owner? ${owner.toLowerCase() === ourAddress.toLowerCase() ? "✅ YES" : "❌ NO"}`
    );

    if (owner.toLowerCase() !== ourAddress.toLowerCase()) {
      console.log("");
      console.log("❌ PROBLEM IDENTIFIED:");
      console.log("   The deploySrc() function has an onlyOwner modifier.");
      console.log("   We need to either:");
      console.log(
        "   1. Use a different approach (not call deploySrc directly)"
      );
      console.log("   2. Deploy our own Resolver contract");
      console.log("   3. Create a test that doesn't require owner privileges");
    }
  } catch (error) {
    console.error("Error checking owner:", error);
  }
}

checkResolverOwner().catch(console.error);
