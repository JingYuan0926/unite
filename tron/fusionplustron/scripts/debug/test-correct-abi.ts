import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test EscrowFactory with correct ABI definitions
 * Address = uint256, Timelocks = uint256
 */

async function main() {
  console.log("🔍 TESTING WITH CORRECT ABI DEFINITIONS");
  console.log("=======================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  const escrowFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";

  // CORRECT ABI: Address = uint256, Timelocks = uint256
  const CORRECT_ESCROW_FACTORY_ABI = [
    "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
    "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
    "function limitOrderProtocol() view returns (address)",
    "function owner() view returns (address)",
    "function rescueDelaySrc() view returns (uint32)",
    "function rescueDelayDst() view returns (uint32)",

    // CORRECTED: Immutables struct with uint256 for Address and Timelocks
    "function addressOfEscrowSrc((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) view returns (address)",
    "function addressOfEscrowDst((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) view returns (address)",

    // Create functions
    "function createSrcEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)) payable returns (address)",
    "function createDstEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256), uint256) payable returns (address)",
  ];

  const escrowFactory = new ethers.Contract(
    escrowFactoryAddress,
    CORRECT_ESCROW_FACTORY_ABI,
    wallet
  );

  console.log("1️⃣ TESTING BASIC STATE ACCESS");
  console.log("=============================");

  try {
    const srcImpl = await escrowFactory.ESCROW_SRC_IMPLEMENTATION();
    console.log(`✅ ESCROW_SRC_IMPLEMENTATION: ${srcImpl}`);

    const dstImpl = await escrowFactory.ESCROW_DST_IMPLEMENTATION();
    console.log(`✅ ESCROW_DST_IMPLEMENTATION: ${dstImpl}`);

    // These were failing before - let's see if they work now
    const lop = await escrowFactory.limitOrderProtocol();
    console.log(`✅ limitOrderProtocol: ${lop}`);

    const owner = await escrowFactory.owner();
    console.log(`✅ owner: ${owner}`);

    const rescueDelaySrc = await escrowFactory.rescueDelaySrc();
    console.log(`✅ rescueDelaySrc: ${rescueDelaySrc}`);
  } catch (error: any) {
    console.log(`❌ Basic state access failed: ${error.message}`);
  }

  console.log("\n2️⃣ TESTING IMMUTABLES WITH CORRECT FORMAT");
  console.log("==========================================");

  // Helper function to encode Address (uint256 with address in lower 160 bits)
  function encodeAddress(addr: string): bigint {
    return BigInt(addr);
  }

  // Helper function to encode Timelocks (packed uint256)
  function encodeTimelocks(timelocks: {
    deployedAt: number;
    srcWithdrawal: number;
    srcCancellation: number;
    dstWithdrawal: number;
    dstCancellation: number;
  }): bigint {
    // Pack all timelock values into a single uint256
    // This is based on TimelocksLib.sol implementation
    let packed = BigInt(0);
    packed |= BigInt(timelocks.deployedAt) << BigInt(0); // bits 0-63
    packed |= BigInt(timelocks.srcWithdrawal) << BigInt(64); // bits 64-127
    packed |= BigInt(timelocks.srcCancellation) << BigInt(128); // bits 128-191
    packed |= BigInt(timelocks.dstWithdrawal) << BigInt(192); // bits 192-255
    // Note: dstCancellation might be computed differently
    return packed;
  }

  const testImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
    maker: encodeAddress(wallet.address),
    taker: encodeAddress("0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7"),
    token: encodeAddress(ethers.ZeroAddress), // ETH
    amount: ethers.parseEther("1"),
    safetyDeposit: ethers.parseEther("0.1"),
    timelocks: encodeTimelocks({
      deployedAt: Math.floor(Date.now() / 1000),
      srcWithdrawal: Math.floor(Date.now() / 1000) + 600,
      srcCancellation: Math.floor(Date.now() / 1000) + 3600,
      dstWithdrawal: Math.floor(Date.now() / 1000) + 300,
      dstCancellation: Math.floor(Date.now() / 1000) + 3300,
    }),
  };

  console.log("Test immutables (corrected format):");
  console.log(`- orderHash: ${testImmutables.orderHash}`);
  console.log(`- hashlock: ${testImmutables.hashlock}`);
  console.log(`- maker (uint256): ${testImmutables.maker}`);
  console.log(`- taker (uint256): ${testImmutables.taker}`);
  console.log(`- token (uint256): ${testImmutables.token}`);
  console.log(`- amount: ${ethers.formatEther(testImmutables.amount)} ETH`);
  console.log(
    `- safetyDeposit: ${ethers.formatEther(testImmutables.safetyDeposit)} ETH`
  );
  console.log(`- timelocks (packed uint256): ${testImmutables.timelocks}`);

  // Convert to array format for function call
  const immutablesArray = [
    testImmutables.orderHash,
    testImmutables.hashlock,
    testImmutables.maker,
    testImmutables.taker,
    testImmutables.token,
    testImmutables.amount,
    testImmutables.safetyDeposit,
    testImmutables.timelocks,
  ];

  console.log("\n3️⃣ TESTING addressOfEscrowSrc");
  console.log("=============================");

  try {
    const estimatedGas =
      await escrowFactory.addressOfEscrowSrc.estimateGas(immutablesArray);
    console.log(`✅ Gas estimate: ${estimatedGas}`);

    const escrowAddress = await escrowFactory.addressOfEscrowSrc(
      immutablesArray,
      {
        gasLimit: 1000000,
      }
    );
    console.log(`✅ SUCCESS! Computed escrow address: ${escrowAddress}`);

    // Verify the address is valid
    const code = await provider.getCode(escrowAddress);
    console.log(`✅ Escrow exists: ${code !== "0x"} (${code.length} bytes)`);
  } catch (error: any) {
    console.log(`❌ addressOfEscrowSrc failed: ${error.message}`);
    if (error.data) {
      console.log(`   Error data: ${error.data}`);
    }
    if (error.reason) {
      console.log(`   Reason: ${error.reason}`);
    }
  }

  console.log("\n4️⃣ TESTING WITH ZERO IMMUTABLES");
  console.log("================================");

  const zeroImmutables = [
    ethers.ZeroHash, // orderHash
    ethers.ZeroHash, // hashlock
    BigInt(0), // maker (uint256)
    BigInt(0), // taker (uint256)
    BigInt(0), // token (uint256)
    BigInt(0), // amount
    BigInt(0), // safetyDeposit
    BigInt(0), // timelocks (uint256)
  ];

  try {
    const zeroEscrowAddress = await escrowFactory.addressOfEscrowSrc(
      zeroImmutables,
      {
        gasLimit: 1000000,
      }
    );
    console.log(`✅ Zero immutables test: ${zeroEscrowAddress}`);
  } catch (error: any) {
    console.log(`❌ Zero immutables test failed: ${error.message}`);
  }

  console.log("\n5️⃣ TESTING createSrcEscrow");
  console.log("==========================");

  try {
    // Test creating an actual escrow (this will cost gas)
    console.log("⚠️  This will create a real escrow and cost gas!");
    console.log("Testing with minimal ETH amount...");

    const minimalImmutables = [
      ethers.keccak256(ethers.toUtf8Bytes("minimal-test")),
      ethers.keccak256(ethers.toUtf8Bytes("minimal-secret")),
      encodeAddress(wallet.address),
      encodeAddress("0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7"),
      encodeAddress(ethers.ZeroAddress), // ETH
      ethers.parseEther("0.001"), // 0.001 ETH
      ethers.parseEther("0.0001"), // 0.0001 ETH safety deposit
      encodeTimelocks({
        deployedAt: Math.floor(Date.now() / 1000),
        srcWithdrawal: Math.floor(Date.now() / 1000) + 600,
        srcCancellation: Math.floor(Date.now() / 1000) + 3600,
        dstWithdrawal: Math.floor(Date.now() / 1000) + 300,
        dstCancellation: Math.floor(Date.now() / 1000) + 3300,
      }),
    ];

    const totalValue = ethers.parseEther("0.001") + ethers.parseEther("0.0001"); // amount + safety deposit

    const createTx = await escrowFactory.createSrcEscrow(minimalImmutables, {
      value: totalValue,
      gasLimit: 500000,
    });

    console.log(`✅ Create transaction sent: ${createTx.hash}`);
    const receipt = await createTx.wait();
    console.log(
      `✅ Escrow created successfully! Gas used: ${receipt?.gasUsed}`
    );

    // Find the created escrow address from events
    if (receipt?.logs) {
      for (const log of receipt.logs) {
        console.log(`   Event log: ${log.topics[0]}`);
      }
    }
  } catch (error: any) {
    console.log(`❌ createSrcEscrow failed: ${error.message}`);
    if (error.data) {
      console.log(`   Error data: ${error.data}`);
    }
  }

  console.log("\n🎉 CORRECT ABI TESTING COMPLETE!");
  console.log("================================");
  console.log("If addressOfEscrowSrc works now, the issue was the ABI format.");
  console.log("Address should be uint256, Timelocks should be uint256.");
  console.log("Update CrossChainOrchestrator with the correct ABI format.");
}

main().catch(console.error);
