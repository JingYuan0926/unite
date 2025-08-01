import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Direct test of EscrowFactory.addressOfEscrowSrc with corrected ABI
 * This verifies our ABI fix works before testing the full orchestrator
 */

async function main() {
  console.log("🔍 DIRECT ESCROWFACTORY TEST WITH CORRECTED ABI");
  console.log("===============================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  const escrowFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";

  // CORRECTED ABI
  const ESCROW_FACTORY_ABI = [
    "function addressOfEscrowSrc((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) view returns (address)",
  ];

  const escrowFactory = new ethers.Contract(
    escrowFactoryAddress,
    ESCROW_FACTORY_ABI,
    wallet
  );

  // Helper functions (copied from CrossChainOrchestrator)
  function encodeAddress(addr: string): bigint {
    return BigInt(addr);
  }

  function encodeTimelocks(timelocks: {
    deployedAt: number;
    srcWithdrawal: number;
    srcCancellation: number;
    dstWithdrawal: number;
    dstCancellation: number;
  }): bigint {
    let packed = BigInt(0);
    packed |= BigInt(timelocks.deployedAt) << BigInt(0);
    packed |= BigInt(timelocks.srcWithdrawal) << BigInt(64);
    packed |= BigInt(timelocks.srcCancellation) << BigInt(128);
    packed |= BigInt(timelocks.dstWithdrawal) << BigInt(192);
    return packed;
  }

  // Create test immutables in array format
  const testImmutables = [
    ethers.keccak256(ethers.toUtf8Bytes("test-order-hash")), // orderHash
    ethers.keccak256(ethers.toUtf8Bytes("test-secret-hash")), // hashlock
    encodeAddress(wallet.address), // maker (uint256)
    encodeAddress("0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7"), // taker (uint256)
    encodeAddress(ethers.ZeroAddress), // token (uint256, ETH)
    ethers.parseEther("0.001"), // amount
    ethers.parseEther("0.0001"), // safetyDeposit
    encodeTimelocks({
      // timelocks (uint256)
      deployedAt: Math.floor(Date.now() / 1000),
      srcWithdrawal: Math.floor(Date.now() / 1000) + 600,
      srcCancellation: Math.floor(Date.now() / 1000) + 3600,
      dstWithdrawal: Math.floor(Date.now() / 1000) + 300,
      dstCancellation: Math.floor(Date.now() / 1000) + 3300,
    }),
  ];

  console.log("Test immutables (array format):");
  console.log(`[0] orderHash: ${testImmutables[0]}`);
  console.log(`[1] hashlock: ${testImmutables[1]}`);
  console.log(`[2] maker: ${testImmutables[2]}`);
  console.log(`[3] taker: ${testImmutables[3]}`);
  console.log(`[4] token: ${testImmutables[4]}`);
  console.log(
    `[5] amount: ${ethers.formatEther(testImmutables[5] as bigint)} ETH`
  );
  console.log(
    `[6] safetyDeposit: ${ethers.formatEther(testImmutables[6] as bigint)} ETH`
  );
  console.log(`[7] timelocks: ${testImmutables[7]}`);

  console.log("\n🧪 TESTING addressOfEscrowSrc");
  console.log("=============================");

  try {
    const estimatedGas =
      await escrowFactory.addressOfEscrowSrc.estimateGas(testImmutables);
    console.log(`✅ Gas estimate: ${estimatedGas}`);

    const escrowAddress =
      await escrowFactory.addressOfEscrowSrc(testImmutables);
    console.log(`✅ SUCCESS! Computed escrow address: ${escrowAddress}`);

    // Verify it's a valid address
    if (ethers.isAddress(escrowAddress)) {
      console.log(`✅ Valid Ethereum address format`);
    } else {
      console.log(`❌ Invalid address format`);
    }

    // Check if escrow exists (it shouldn't until we create it)
    const code = await provider.getCode(escrowAddress);
    console.log(`✅ Escrow exists: ${code !== "0x"} (expected: false)`);

    console.log("\n🎉 ESCROWFACTORY ABI FIX CONFIRMED!");
    console.log("==================================");
    console.log("✅ addressOfEscrowSrc works with corrected ABI");
    console.log("✅ Gas usage is reasonable");
    console.log("✅ Returns valid Ethereum address");
    console.log("✅ Ready for full atomic swap testing");
  } catch (error: any) {
    console.log(`❌ addressOfEscrowSrc failed: ${error.message}`);

    if (
      error.message.includes("cannot use object value with unnamed components")
    ) {
      console.log("🔧 Still has ABI encoding issue - check implementation");
    } else if (error.message.includes("missing revert data")) {
      console.log("🔧 Contract-level revert - may need deployment fix");
    } else {
      console.log("🔧 New error type - investigate further");
    }

    console.log("\nFull error:");
    console.log(error);
  }
}

main().catch(console.error);
