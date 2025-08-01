import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Comprehensive EscrowFactory diagnosis script
 * Checks all internal state variables and identifies the root cause of addressOfEscrowSrc() failure
 */

const ESCROW_FACTORY_ABI = [
  // State variables
  "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
  "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
  "function limitOrderProtocol() view returns (address)",
  "function feeToken() view returns (address)",
  "function accessToken() view returns (address)",
  "function owner() view returns (address)",
  "function rescueDelaySrc() view returns (uint32)",
  "function rescueDelayDst() view returns (uint32)",

  // Internal state (if accessible)
  "function _PROXY_SRC_BYTECODE_HASH() view returns (bytes32)",
  "function _PROXY_DST_BYTECODE_HASH() view returns (bytes32)",

  // Main functions
  "function addressOfEscrowSrc((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) view returns (address)",
  "function addressOfEscrowDst((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) view returns (address)",

  // Test functions
  "function createSrcEscrow((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) payable returns (address)",
];

async function main() {
  console.log("🔍 ESCROW FACTORY COMPREHENSIVE DIAGNOSIS");
  console.log("=========================================\n");

  // Setup
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  const escrowFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";
  const escrowFactory = new ethers.Contract(
    escrowFactoryAddress,
    ESCROW_FACTORY_ABI,
    wallet
  );

  try {
    // 1. Check basic contract accessibility
    console.log("1️⃣ BASIC CONTRACT ACCESSIBILITY");
    console.log("==============================");

    const code = await provider.getCode(escrowFactoryAddress);
    console.log(`✅ Contract bytecode length: ${code.length} bytes`);
    console.log(`✅ Contract exists: ${code !== "0x"}`);

    // 2. Check all state variables
    console.log("\n2️⃣ STATE VARIABLES INSPECTION");
    console.log("=============================");

    try {
      const srcImpl = await escrowFactory.ESCROW_SRC_IMPLEMENTATION();
      console.log(`✅ ESCROW_SRC_IMPLEMENTATION: ${srcImpl}`);
    } catch (e: any) {
      console.log(`❌ ESCROW_SRC_IMPLEMENTATION failed: ${e.message}`);
    }

    try {
      const dstImpl = await escrowFactory.ESCROW_DST_IMPLEMENTATION();
      console.log(`✅ ESCROW_DST_IMPLEMENTATION: ${dstImpl}`);
    } catch (e: any) {
      console.log(`❌ ESCROW_DST_IMPLEMENTATION failed: ${e.message}`);
    }

    try {
      const lop = await escrowFactory.limitOrderProtocol();
      console.log(`✅ limitOrderProtocol: ${lop}`);
    } catch (e: any) {
      console.log(`❌ limitOrderProtocol failed: ${e.message}`);
    }

    try {
      const owner = await escrowFactory.owner();
      console.log(`✅ owner: ${owner}`);
    } catch (e: any) {
      console.log(`❌ owner failed: ${e.message}`);
    }

    try {
      const rescueDelaySrc = await escrowFactory.rescueDelaySrc();
      console.log(`✅ rescueDelaySrc: ${rescueDelaySrc}`);
    } catch (e: any) {
      console.log(`❌ rescueDelaySrc failed: ${e.message}`);
    }

    // 3. Check critical bytecode hashes
    console.log("\n3️⃣ BYTECODE HASH INSPECTION");
    console.log("===========================");

    try {
      // Try to access internal bytecode hashes (might not be public)
      const srcHash = await escrowFactory._PROXY_SRC_BYTECODE_HASH();
      console.log(`✅ _PROXY_SRC_BYTECODE_HASH: ${srcHash}`);
      if (srcHash === ethers.ZeroHash) {
        console.log("⚠️  WARNING: Source bytecode hash is zero!");
      }
    } catch (e) {
      console.log(
        `⚠️  _PROXY_SRC_BYTECODE_HASH not accessible (expected if private)`
      );
    }

    try {
      const dstHash = await escrowFactory._PROXY_DST_BYTECODE_HASH();
      console.log(`✅ _PROXY_DST_BYTECODE_HASH: ${dstHash}`);
      if (dstHash === ethers.ZeroHash) {
        console.log("⚠️  WARNING: Destination bytecode hash is zero!");
      }
    } catch (e) {
      console.log(
        `⚠️  _PROXY_DST_BYTECODE_HASH not accessible (expected if private)`
      );
    }

    // 4. Test with minimal valid immutables
    console.log("\n4️⃣ MINIMAL IMMUTABLES TEST");
    console.log("==========================");

    const minimalImmutables = {
      orderHash: ethers.keccak256(ethers.toUtf8Bytes("test")),
      hashlock: ethers.keccak256(ethers.toUtf8Bytes("secret")),
      maker: wallet.address,
      taker: wallet.address,
      token: ethers.ZeroAddress, // ETH
      amount: ethers.parseEther("0.001"),
      safetyDeposit: ethers.parseEther("0.0001"),
      timelocks: {
        deployedAt: Math.floor(Date.now() / 1000),
        srcWithdrawal: Math.floor(Date.now() / 1000) + 600,
        srcCancellation: Math.floor(Date.now() / 1000) + 3600,
        dstWithdrawal: Math.floor(Date.now() / 1000) + 300,
        dstCancellation: Math.floor(Date.now() / 1000) + 3300,
      },
    };

    console.log("Testing with minimal immutables:");
    console.log(`- orderHash: ${minimalImmutables.orderHash}`);
    console.log(`- hashlock: ${minimalImmutables.hashlock}`);
    console.log(`- maker: ${minimalImmutables.maker}`);
    console.log(
      `- amount: ${ethers.formatEther(minimalImmutables.amount)} ETH`
    );

    try {
      // Test addressOfEscrowSrc with increased gas limit
      const estimatedGas =
        await escrowFactory.addressOfEscrowSrc.estimateGas(minimalImmutables);
      console.log(`✅ Gas estimate for addressOfEscrowSrc: ${estimatedGas}`);

      const escrowAddress = await escrowFactory.addressOfEscrowSrc(
        minimalImmutables,
        {
          gasLimit: 1000000, // High gas limit to avoid out-of-gas
        }
      );
      console.log(`✅ SUCCESS! Computed escrow address: ${escrowAddress}`);
    } catch (error: any) {
      console.log(`❌ addressOfEscrowSrc failed with minimal immutables:`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Data: ${error.data}`);

      // Try to get more details
      if (error.transaction) {
        console.log(
          `   Transaction: ${JSON.stringify(error.transaction, null, 2)}`
        );
      }

      // Check if it's a gas issue
      try {
        const result = await escrowFactory.addressOfEscrowSrc.staticCall(
          minimalImmutables,
          {
            gasLimit: 10000000, // Very high gas limit
          }
        );
        console.log(`✅ Static call succeeded with high gas: ${result}`);
      } catch (staticError: any) {
        console.log(`❌ Static call also failed: ${staticError.message}`);
      }
    }

    // 5. Test implementation addresses
    console.log("\n5️⃣ IMPLEMENTATION CONTRACT VERIFICATION");
    console.log("======================================");

    try {
      const srcImpl = await escrowFactory.ESCROW_SRC_IMPLEMENTATION();
      const srcCode = await provider.getCode(srcImpl);
      console.log(`✅ Source implementation deployed: ${srcCode !== "0x"}`);
      console.log(
        `✅ Source implementation bytecode length: ${srcCode.length}`
      );

      const dstImpl = await escrowFactory.ESCROW_DST_IMPLEMENTATION();
      const dstCode = await provider.getCode(dstImpl);
      console.log(
        `✅ Destination implementation deployed: ${dstCode !== "0x"}`
      );
      console.log(
        `✅ Destination implementation bytecode length: ${dstCode.length}`
      );
    } catch (e: any) {
      console.log(`❌ Implementation verification failed: ${e.message}`);
    }

    // 6. Test with different gas limits
    console.log("\n6️⃣ GAS LIMIT TESTING");
    console.log("====================");

    const gasLimits = [50000, 100000, 200000, 500000, 1000000];

    for (const gasLimit of gasLimits) {
      try {
        const result = await escrowFactory.addressOfEscrowSrc.staticCall(
          minimalImmutables,
          {
            gasLimit: gasLimit,
          }
        );
        console.log(`✅ Gas limit ${gasLimit}: SUCCESS - ${result}`);
        break;
      } catch (error: any) {
        console.log(
          `❌ Gas limit ${gasLimit}: FAILED - ${error.message.substring(0, 100)}`
        );
      }
    }
  } catch (error: any) {
    console.log(`❌ Diagnosis failed: ${error.message}`);
    console.log(`Full error:`, error);
  }

  console.log("\n🔍 DIAGNOSIS COMPLETE");
  console.log("====================");
  console.log("Review the output above to identify the root cause.");
  console.log("Common issues:");
  console.log("1. Bytecode hashes not initialized (constructor issue)");
  console.log("2. Implementation contracts not deployed properly");
  console.log("3. Gas limit too low for complex computation");
  console.log("4. Library linking issues");
  console.log("5. Invalid immutables structure");
}

main().catch(console.error);
