const { ethers } = require("ethers");
require("dotenv").config();

async function useOfficialLOP() {
  console.log("🔍 TESTING OFFICIAL 1INCH LOP DEPLOYMENTS");
  console.log("=========================================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

  // Known 1inch LOP addresses on various networks
  const knownLOPAddresses = [
    // These are known 1inch LOP deployments - we'll test if they exist on Sepolia
    "0x119c71D3BbAC22029622cbaEc24854d3D32D2828", // Common LOP v4 address
    "0x1111111254EEB25477B68fb85Ed929f73A960582", // 1inch aggregation router
    "0x111111125421ca6dc452d289314280a0f8842a65", // Another 1inch address
  ];

  console.log("Testing known addresses on Sepolia...");

  for (const address of knownLOPAddresses) {
    try {
      const code = await provider.getCode(address);
      if (code !== "0x") {
        console.log("✅ Contract found at:", address);
        console.log("   Code length:", code.length, "bytes");

        // Test if it's a LOP contract
        try {
          const testContract = new ethers.Contract(
            address,
            ["function DOMAIN_SEPARATOR() external view returns (bytes32)"],
            provider
          );
          const domain = await testContract.DOMAIN_SEPARATOR();
          console.log(
            "✅ DOMAIN_SEPARATOR works:",
            domain.substring(0, 10) + "..."
          );

          // If we find a working one, return it
          return address;
        } catch (e) {
          console.log("❌ Not a LOP contract");
        }
      } else {
        console.log("❌ No contract at:", address);
      }
    } catch (e) {
      console.log("❌ Error checking:", address, e.message);
    }
  }

  console.log("\n💡 RECOMMENDED SOLUTION:");
  console.log("========================");
  console.log(
    "Since your contract deployment is working but missing some functions,"
  );
  console.log(
    "let's proceed with the WORKING parts and create a simplified LOP integration."
  );
  console.log("");
  console.log("✅ What works in your contract:");
  console.log("   - owner(), DOMAIN_SEPARATOR(), bitInvalidatorForOrder()");
  console.log("   - Basic EIP-712 functionality");
  console.log("");
  console.log("🔧 Simplified Integration Approach:");
  console.log("   1. Use basic order signing (without complex validation)");
  console.log("   2. Focus on the core atomic swap functionality");
  console.log("   3. Demonstrate LOP integration concept");
  console.log("");

  return null;
}

// Try to find official deployment or recommend proceeding with simplified approach
useOfficialLOP().then((address) => {
  if (address) {
    console.log("\n🎉 Found working LOP at:", address);
  } else {
    console.log("\n🚀 Proceeding with simplified integration approach");
  }
});
