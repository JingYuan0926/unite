const { ethers } = require("ethers");
require("dotenv").config();

async function diagnoseLOPContract() {
  console.log("🔍 DIAGNOSING LOP CONTRACT");
  console.log("=========================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const lopAddress = "0x5df8587DFe6AF306499513bdAb8F70919b44037C";

  console.log("Contract Address:", lopAddress);
  console.log(
    "Network:",
    process.env.ETH_RPC_URL?.includes("sepolia") ? "Sepolia" : "Unknown"
  );

  try {
    // Check if contract exists
    const code = await provider.getCode(lopAddress);
    console.log("\n📋 Basic Contract Info:");
    console.log("Contract code length:", code.length);
    console.log("Has code:", code !== "0x");

    if (code === "0x") {
      console.log("❌ Contract has no code - not deployed or wrong address");
      return false;
    }

    // Test basic contract functions
    console.log("\n🧪 Testing Contract Functions:");

    try {
      const contract = new ethers.Contract(
        lopAddress,
        [
          "function WETH() external view returns (address)",
          "function nonces(address) external view returns (uint256)",
          "function invalidator() external view returns (address)",
        ],
        provider
      );

      // Test WETH function
      try {
        const weth = await contract.WETH();
        console.log("✅ WETH address:", weth);
      } catch (error) {
        console.log("❌ WETH() function failed:", error.message);
      }

      // Test nonces function
      try {
        const testWallet = "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F";
        const nonce = await contract.nonces(testWallet);
        console.log("✅ Nonces function works, test nonce:", nonce.toString());
      } catch (error) {
        console.log("❌ nonces() function failed:", error.message);
      }

      // Test invalidator function
      try {
        const invalidator = await contract.invalidator();
        console.log("✅ Invalidator address:", invalidator);
      } catch (error) {
        console.log("❌ invalidator() function failed:", error.message);
      }
    } catch (error) {
      console.log("❌ Contract interface error:", error.message);
    }

    // Test gas estimation with fillOrder
    console.log("\n⛽ Testing Gas Estimation:");

    try {
      const lopContract = new ethers.Contract(
        lopAddress,
        [
          "function fillOrder((address,address,address,address,uint256,uint256,uint256,bytes,bytes,bytes,bytes,bytes) order, bytes signature, uint256 makingAmount, uint256 takingAmount, bytes calldata) external payable",
        ],
        provider
      );

      // Create dummy order data to test gas estimation
      const dummyOrder = {
        salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
        maker: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
        receiver: "0x0000000000000000000000000000000000000000",
        makerAsset: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        takerAsset: "0x0000000000000000000000000000000000000000",
        makingAmount: ethers.parseEther("0.0001"),
        takingAmount: ethers.parseEther("0.0001"),
        makerTraits:
          "0x00000000000000000000000000000000000000000000000000000000000000",
        makerAssetData: "0x",
        takerAssetData: "0x",
        getMakerAmount: "0x",
        getTakerAmount: "0x",
        predicate: "0x",
        permit: "0x",
        interaction: "0x",
      };

      const dummySignature =
        "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

      // This will likely fail, but we want to see HOW it fails
      const gasEstimate = await lopContract.fillOrder.estimateGas(
        dummyOrder,
        dummySignature,
        ethers.parseEther("0.0001"),
        ethers.parseEther("0.0001"),
        "0x"
      );

      console.log("✅ Gas estimation succeeded:", gasEstimate.toString());
    } catch (error) {
      console.log("❌ Gas estimation failed:", error.message);
      console.log("   Error code:", error.code);
      console.log("   Error reason:", error.reason);

      // This is the exact error we're seeing
      if (error.message.includes("missing revert data")) {
        console.log(
          "🎯 FOUND THE ISSUE: This is the 'missing revert data' error"
        );
        console.log("   This typically means:");
        console.log("   - Contract function doesn't exist");
        console.log("   - Contract is not properly initialized");
        console.log("   - Constructor parameters were wrong");
        console.log("   - Required dependencies missing");
      }
    }

    console.log("\n💡 DIAGNOSIS SUMMARY:");
    console.log("====================");
    if (code !== "0x") {
      console.log("✅ Contract exists and has code");
      console.log("❌ Contract fails at gas estimation level");
      console.log(
        "🔧 RECOMMENDATION: Deploy fresh LOP contract with proper initialization"
      );
    } else {
      console.log("❌ Contract not deployed or wrong address");
      console.log("🔧 RECOMMENDATION: Deploy LOP contract to this address");
    }

    return true;
  } catch (error) {
    console.log("❌ Diagnosis failed:", error.message);
    return false;
  }
}

// Run diagnosis
diagnoseLOPContract().then((success) => {
  if (success) {
    console.log("\n✅ Diagnosis complete - ready for Phase 3B deployment");
  } else {
    console.log("\n❌ Diagnosis failed - check network configuration");
  }
  process.exit(0);
});
