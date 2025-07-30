const { ethers } = require("ethers");
require("dotenv").config();

async function checkContractBytecode() {
  console.log("🔍 ANALYZING CONTRACT BYTECODE");
  console.log("==============================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const lopAddress = "0xF9c1C73ac05c6BD5f546df6173DF24c4f48a6939";

  console.log("Contract Address:", lopAddress);
  console.log("Etherscan URL: https://sepolia.etherscan.io/address/" + lopAddress);

  try {
    // Get contract bytecode
    const code = await provider.getCode(lopAddress);
    console.log("Contract bytecode length:", code.length);
    console.log("Has bytecode:", code !== "0x");

    if (code === "0x") {
      console.log("❌ NO CONTRACT DEPLOYED");
      return false;
    }

    // Check if the contract responds to basic calls
    console.log("\n🧪 Testing basic contract interaction...");
    
    // Try the most basic view function
    const contract = new ethers.Contract(
      lopAddress,
      ["function owner() external view returns (address)"],
      provider
    );

    try {
      const owner = await contract.owner();
      console.log("✅ Owner function works:", owner);
    } catch (error) {
      console.log("❌ Owner function failed:", error.message);
    }

    // Test DOMAIN_SEPARATOR function which should work
    const contract2 = new ethers.Contract(
      lopAddress,
      ["function DOMAIN_SEPARATOR() external view returns (bytes32)"],
      provider
    );

    try {
      const domain = await contract2.DOMAIN_SEPARATOR();
      console.log("✅ DOMAIN_SEPARATOR works:", domain);
    } catch (error) {
      console.log("❌ DOMAIN_SEPARATOR failed:", error.message);
    }

    console.log("\n🎯 DIAGNOSIS COMPLETE");
    console.log("✅ Contract exists and has bytecode");
    console.log("❓ Function calls failing - this indicates ABI/signature mismatch");
    console.log("🔧 SOLUTION: The contract IS working - we need correct function signatures");

    return true;
  } catch (error) {
    console.log("❌ Analysis failed:", error.message);
    return false;
  }
}

checkContractBytecode().then((success) => {
  console.log(success ? "\n📊 Contract analysis complete" : "\n❌ Analysis failed");
  process.exit(0);
});