#!/usr/bin/env node

/**
 * Contract Verification Script
 * This script verifies that the deployed contracts are working correctly
 */

const { ethers } = require("ethers");
require("dotenv").config();

const { EscrowFactoryABI } = require("./abis");

async function verifyEthereumContract() {
  console.log("🔍 Verifying Ethereum EscrowFactory Contract");
  console.log("============================================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const wallet = new ethers.Wallet(process.env.RESOLVER_PRIVATE_KEY, provider);

  console.log(`Contract Address: ${process.env.ETH_ESCROW_FACTORY_ADDRESS}`);
  console.log(`Wallet Address: ${wallet.address}`);

  // Check if contract exists
  const contractCode = await provider.getCode(
    process.env.ETH_ESCROW_FACTORY_ADDRESS
  );
  if (contractCode === "0x") {
    console.error("❌ Contract not found at specified address");
    return false;
  }
  console.log("✅ Contract bytecode found");

  // Create contract instance
  const contract = new ethers.Contract(
    process.env.ETH_ESCROW_FACTORY_ADDRESS,
    EscrowFactoryABI,
    wallet
  );

  try {
    // Test read functions
    console.log("\n📖 Testing read functions...");

    // Check if owner function exists
    try {
      const owner = await contract.owner();
      console.log(`✅ Owner: ${owner}`);
    } catch (error) {
      console.log("❌ Owner function failed:", error.message);
    }

    // Check REVEAL_DELAY
    try {
      const revealDelay = await contract.REVEAL_DELAY();
      console.log(`✅ Reveal Delay: ${revealDelay.toString()} seconds`);
    } catch (error) {
      console.log("❌ REVEAL_DELAY function failed:", error.message);
    }

    // Test a dummy escrow query (should return default values for non-existent escrow)
    try {
      const dummyEscrowId = "0x" + "0".repeat(64);
      const escrowData = await contract.escrows(dummyEscrowId);
      console.log(`✅ Escrows function works`);
      console.log(`   Dummy escrow completed: ${escrowData.completed}`);
    } catch (error) {
      console.log("❌ Escrows function failed:", error.message);
    }

    console.log("\n🔧 Testing createEscrow parameters...");

    // Test with minimal valid parameters
    const testResolver = wallet.address;
    const testToken = "0x0000000000000000000000000000000000000000";
    const testAmount = ethers.parseEther("0.0001");
    const testSecretHash = "0x" + "1".repeat(64);
    const now = Math.floor(Date.now() / 1000);
    const finalityLock = now + 86400; // 1 day
    const cancelLock = now + 172800; // 2 days

    console.log("Test parameters:");
    console.log(`  Resolver: ${testResolver}`);
    console.log(`  Token: ${testToken}`);
    console.log(`  Amount: ${ethers.formatEther(testAmount)} ETH`);
    console.log(`  Secret Hash: ${testSecretHash}`);
    console.log(
      `  Finality Lock: ${finalityLock} (${new Date(
        finalityLock * 1000
      ).toISOString()})`
    );
    console.log(
      `  Cancel Lock: ${cancelLock} (${new Date(
        cancelLock * 1000
      ).toISOString()})`
    );

    // Just estimate gas, don't send transaction
    try {
      const gasEstimate = await contract.createEscrow.estimateGas(
        testResolver,
        testToken,
        testAmount,
        testSecretHash,
        finalityLock,
        cancelLock,
        { value: testAmount }
      );
      console.log(`✅ Gas estimation successful: ${gasEstimate.toString()}`);
      console.log("✅ Contract appears to be working correctly!");
      return true;
    } catch (gasError) {
      console.log("❌ Gas estimation failed:", gasError.message);

      // Try to decode the error
      if (gasError.data) {
        try {
          const decodedError = contract.interface.parseError(gasError.data);
          console.log("   Decoded error:", decodedError);
        } catch {
          console.log("   Raw error data:", gasError.data);
        }
      }

      return false;
    }
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    return false;
  }
}

async function main() {
  const isValid = await verifyEthereumContract();

  if (isValid) {
    console.log("\n🎉 Contract verification successful!");
    console.log("The contract is deployed and working correctly.");
  } else {
    console.log("\n💥 Contract verification failed!");
    console.log("There may be an issue with the contract deployment or ABI.");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyEthereumContract };
