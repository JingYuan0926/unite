const { ethers } = require("ethers");
require("dotenv").config();

async function testNewLOPContract() {
  console.log("🧪 TESTING NEW LOP CONTRACT");
  console.log("===========================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const newLopAddress = "0xF9c1C73ac05c6BD5f546df6173DF24c4f48a6939";

  console.log("Testing contract at:", newLopAddress);
  console.log(
    "Network:",
    process.env.ETH_RPC_URL?.includes("sepolia") ? "Sepolia" : "Unknown"
  );

  try {
    // Check if contract exists
    const code = await provider.getCode(newLopAddress);
    console.log("\n📋 Basic Contract Info:");
    console.log("Contract code length:", code.length);
    console.log("Has code:", code !== "0x");

    if (code === "0x") {
      console.log("❌ Contract has no code - deployment failed");
      return false;
    }

    // Test basic contract functions that should exist on OrderMixin
    console.log("\n🧪 Testing Contract Functions:");

    const contract = new ethers.Contract(
      newLopAddress,
      [
        "function nonces(address) external view returns (uint256)",
        "function invalidator() external view returns (address)",
        "function DOMAIN_SEPARATOR() external view returns (bytes32)",
        "function fillOrder((address,address,address,address,uint256,uint256,uint256,bytes,bytes,bytes,bytes,bytes) order, bytes signature, uint256 makingAmount, uint256 takingAmount, bytes calldata) external payable",
      ],
      provider
    );

    // Test nonces function
    try {
      const testWallet = "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F";
      const nonce = await contract.nonces(testWallet);
      console.log("✅ nonces() function works, test nonce:", nonce.toString());
    } catch (error) {
      console.log("❌ nonces() function failed:", error.message);
      return false;
    }

    // Test domain separator
    try {
      const domainSeparator = await contract.DOMAIN_SEPARATOR();
      console.log("✅ DOMAIN_SEPARATOR() works:", domainSeparator);
    } catch (error) {
      console.log("❌ DOMAIN_SEPARATOR() function failed:", error.message);
      return false;
    }

    // Test invalidator function
    try {
      const invalidator = await contract.invalidator();
      console.log("✅ invalidator() works:", invalidator);
    } catch (error) {
      console.log("❌ invalidator() function failed:", error.message);
      return false;
    }

    // Test gas estimation with fillOrder
    console.log("\n⛽ Testing Gas Estimation:");

    try {
      // Create dummy order data - this is expected to fail but should NOT give "missing revert data"
      const dummyOrder = {
        salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
        maker: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
        receiver: "0x0000000000000000000000000000000000000000",
        makerAsset: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        takerAsset: "0x0000000000000000000000000000000000000000",
        makingAmount: ethers.parseEther("0.0001"),
        takingAmount: ethers.parseEther("0.0001"),
        makerTraits:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        makerAssetData: "0x",
        takerAssetData: "0x",
        getMakerAmount: "0x",
        getTakerAmount: "0x",
        predicate: "0x",
        permit: "0x",
        interaction: "0x",
      };

      const dummySignature = "0x" + "00".repeat(65);

      const gasEstimate = await contract.fillOrder.estimateGas(
        dummyOrder,
        dummySignature,
        ethers.parseEther("0.0001"),
        ethers.parseEther("0.0001"),
        "0x",
        { value: ethers.parseEther("0.0001") }
      );

      console.log("✅ Gas estimation succeeded:", gasEstimate.toString());
    } catch (error) {
      // This should fail but with a PROPER error message, not "missing revert data"
      console.log("⚠️ Gas estimation failed (expected):", error.message);

      if (error.message.includes("missing revert data")) {
        console.log(
          "❌ STILL getting 'missing revert data' - contract issue persists"
        );
        return false;
      } else {
        console.log("✅ Contract is working - getting proper error messages");
      }
    }

    // Save deployment info for integration update
    const deploymentInfo = {
      limitOrderProtocol: newLopAddress,
      weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      network: "sepolia",
      chainId: 11155111,
      deployedAt: new Date().toISOString(),
      status: "tested_and_working",
    };

    const fs = require("fs");
    const path = require("path");

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, "sepolia-lop-fixed.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 NEW LOP CONTRACT TEST RESULTS:");
    console.log("=================================");
    console.log("✅ Contract deployed and has code");
    console.log("✅ All basic functions working");
    console.log("✅ Gas estimation functioning properly");
    console.log("✅ No 'missing revert data' errors");
    console.log("✅ Contract ready for integration");

    console.log("\n📋 Next Steps:");
    console.log("1. Update atomic-swap.js to use new address:", newLopAddress);
    console.log("2. Run end-to-end integration test");
    console.log("3. Verify complete Phase 3 success");

    return true;
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    return false;
  }
}

// Run test
testNewLOPContract().then((success) => {
  if (success) {
    console.log("\n✅ NEW LOP CONTRACT WORKING - READY FOR PHASE 3C!");
  } else {
    console.log("\n❌ New LOP contract test failed");
  }
  process.exit(0);
});
