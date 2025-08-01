import { ethers } from "hardhat";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🧪 Testing TronFusionExtension Integration");
  console.log("=========================================");

  // Read deployment data
  const deployment = JSON.parse(
    readFileSync("contracts/deployments/ethereum-sepolia.json", "utf8")
  );

  console.log("📋 Contract Addresses:");
  console.log(
    `   - TronFusionExtension: ${deployment.contracts.TronFusionExtension}`
  );
  console.log(
    `   - LimitOrderProtocol: ${deployment.contracts.LimitOrderProtocol}`
  );
  console.log(`   - EscrowFactory: ${deployment.contracts.EscrowFactory}`);

  // Get contract instances
  const [tester] = await ethers.getSigners();
  console.log(`\n🔧 Testing with account: ${tester.address}`);

  const fusionExtension = await ethers.getContractAt(
    "TronFusionExtension",
    deployment.contracts.TronFusionExtension
  );

  // Test 1: Verify contract configuration
  console.log("\n✅ Test 1: Contract Configuration");
  try {
    const lopAddress = await fusionExtension.LIMIT_ORDER_PROTOCOL();
    const factoryAddress = await fusionExtension.ESCROW_FACTORY();
    const owner = await fusionExtension.owner();
    const trxRepresentation = await fusionExtension.TRX_REPRESENTATION();
    const minTimelock = await fusionExtension.MIN_TIMELOCK();
    const maxTimelock = await fusionExtension.MAX_TIMELOCK();

    console.log(`   ✓ LOP Address: ${lopAddress}`);
    console.log(`   ✓ Factory Address: ${factoryAddress}`);
    console.log(`   ✓ Owner: ${owner}`);
    console.log(`   ✓ TRX Representation: ${trxRepresentation}`);
    console.log(
      `   ✓ Min Timelock: ${minTimelock} seconds (${Number(minTimelock) / 3600} hours)`
    );
    console.log(
      `   ✓ Max Timelock: ${maxTimelock} seconds (${Number(maxTimelock) / 3600} hours)`
    );

    // Verify addresses match deployment
    if (lopAddress !== deployment.contracts.LimitOrderProtocol) {
      throw new Error("LOP address mismatch");
    }
    if (factoryAddress !== deployment.contracts.EscrowFactory) {
      throw new Error("Factory address mismatch");
    }

    console.log("   ✅ Configuration verification passed!");
  } catch (error) {
    console.error("   ❌ Configuration test failed:", error);
    return;
  }

  // Test 2: Test view functions with empty data
  console.log("\n✅ Test 2: View Functions");
  try {
    const testOrderHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

    const hasActiveSwap =
      await fusionExtension.hasActiveTronSwap(testOrderHash);
    const tronRecipient = await fusionExtension.getTronRecipient(testOrderHash);
    const expectedTrxAmount =
      await fusionExtension.getExpectedTrxAmount(testOrderHash);
    const srcEscrowAddress =
      await fusionExtension.getSrcEscrowAddress(testOrderHash);

    console.log(`   ✓ Has Active Swap (empty): ${hasActiveSwap}`);
    console.log(`   ✓ Tron Recipient (empty): "${tronRecipient}"`);
    console.log(`   ✓ Expected TRX Amount (empty): ${expectedTrxAmount}`);
    console.log(`   ✓ Src Escrow Address (empty): ${srcEscrowAddress}`);

    console.log("   ✅ View functions test passed!");
  } catch (error) {
    console.error("   ❌ View functions test failed:", error);
    return;
  }

  // Test 3: Test TronSwapData encoding/decoding
  console.log("\n✅ Test 3: TronSwapData Encoding");
  try {
    const tronSwapData = {
      tronRecipient: "TPUiCeNRjjEpo1NFJ1ZURfU1ziNNMtn8yu",
      tronFactory: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      expectedTrxAmount: ethers.parseEther("100"),
      secretHash: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
      timelock: 3600n, // 1 hour
      tronChainId: 3448148188n, // Tron Nile
      isActive: true,
    };

    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(string,string,uint256,bytes32,uint64,uint256,bool)"],
      [
        [
          tronSwapData.tronRecipient,
          tronSwapData.tronFactory,
          tronSwapData.expectedTrxAmount,
          tronSwapData.secretHash,
          tronSwapData.timelock,
          tronSwapData.tronChainId,
          tronSwapData.isActive,
        ],
      ]
    );

    console.log(`   ✓ Tron Recipient: ${tronSwapData.tronRecipient}`);
    console.log(`   ✓ Tron Factory: ${tronSwapData.tronFactory}`);
    console.log(
      `   ✓ Expected TRX: ${ethers.formatEther(tronSwapData.expectedTrxAmount)} TRX`
    );
    console.log(`   ✓ Secret Hash: ${tronSwapData.secretHash}`);
    console.log(`   ✓ Timelock: ${tronSwapData.timelock} seconds`);
    console.log(`   ✓ Tron Chain ID: ${tronSwapData.tronChainId}`);
    console.log(`   ✓ Encoded Data Length: ${encodedData.length} characters`);

    console.log("   ✅ TronSwapData encoding test passed!");
  } catch (error) {
    console.error("   ❌ TronSwapData encoding test failed:", error);
    return;
  }

  // Test 4: Test contract can receive ETH
  console.log("\n✅ Test 4: ETH Reception");
  try {
    const initialBalance = await ethers.provider.getBalance(
      deployment.contracts.TronFusionExtension
    );
    console.log(
      `   ✓ Initial contract balance: ${ethers.formatEther(initialBalance)} ETH`
    );

    // Send a small amount of ETH to test receive function
    const tx = await tester.sendTransaction({
      to: deployment.contracts.TronFusionExtension,
      value: ethers.parseEther("0.001"),
    });
    await tx.wait();

    const finalBalance = await ethers.provider.getBalance(
      deployment.contracts.TronFusionExtension
    );
    console.log(
      `   ✓ Final contract balance: ${ethers.formatEther(finalBalance)} ETH`
    );

    const difference = finalBalance - initialBalance;
    console.log(`   ✓ Received: ${ethers.formatEther(difference)} ETH`);

    if (difference === ethers.parseEther("0.001")) {
      console.log("   ✅ ETH reception test passed!");
    } else {
      throw new Error("ETH amount mismatch");
    }
  } catch (error) {
    console.error("   ❌ ETH reception test failed:", error);
    return;
  }

  console.log("\n🎉 All integration tests passed!");
  console.log("\n📋 SUMMARY:");
  console.log("============");
  console.log("✅ TronFusionExtension deployed and verified");
  console.log("✅ Contract configuration correct");
  console.log("✅ View functions working");
  console.log("✅ TronSwapData encoding working");
  console.log("✅ Contract can receive ETH");
  console.log("\n🔗 Ready for Phase 5: SDK & Atomic Execution");
  console.log(
    `📍 Contract Address: ${deployment.contracts.TronFusionExtension}`
  );
  console.log(
    `🔍 Etherscan: https://sepolia.etherscan.io/address/${deployment.contracts.TronFusionExtension}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Integration test failed:", error);
    process.exit(1);
  });
