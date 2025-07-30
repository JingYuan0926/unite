const { ethers } = require("ethers");
require("dotenv").config();

async function diagnoseDeployedContract() {
  console.log("🔍 COMPLETE CONTRACT DIAGNOSIS");
  console.log("==============================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
  const lopAddress = "0xF9c1C73ac05c6BD5f546df6173DF24c4f48a6939";

  console.log("Contract Address:", lopAddress);
  console.log("Network: Sepolia");
  console.log("Wallet:", wallet.address);

  // Step 1: Check what we know works
  console.log("\n✅ TESTING CONFIRMED WORKING FUNCTIONS:");
  console.log("=======================================");

  const workingContract = new ethers.Contract(
    lopAddress,
    [
      "function owner() external view returns (address)",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
      "function bitInvalidatorForOrder(address maker, uint256 slot) external view returns (uint256)",
    ],
    provider
  );

  try {
    const owner = await workingContract.owner();
    const domain = await workingContract.DOMAIN_SEPARATOR();
    const bitInvalidator = await workingContract.bitInvalidatorForOrder(
      wallet.address,
      0
    );

    console.log("✅ owner():", owner);
    console.log("✅ DOMAIN_SEPARATOR():", domain.substring(0, 10) + "...");
    console.log("✅ bitInvalidatorForOrder():", bitInvalidator.toString());
  } catch (error) {
    console.log("❌ Even basic functions failed:", error.message);
    return;
  }

  // Step 2: Test alternative function signatures that might exist
  console.log("\n🧪 TESTING ALTERNATIVE FUNCTION SIGNATURES:");
  console.log("============================================");

  // Try different possible WETH function signatures
  const wethVariants = [
    "function WETH() external view returns (address)",
    "function weth() external view returns (address)",
    "function _WETH() external view returns (address)",
    "function getWETH() external view returns (address)",
  ];

  for (const signature of wethVariants) {
    try {
      const testContract = new ethers.Contract(
        lopAddress,
        [signature],
        provider
      );
      const result = await testContract[
        signature.split("(")[0].split(" ")[1]
      ]();
      console.log("✅", signature, "→", result);
      break;
    } catch (error) {
      console.log("❌", signature, "→", "Not found");
    }
  }

  // Step 3: Test different hashOrder signatures
  console.log("\n🧪 TESTING HASHORDER FUNCTION VARIANTS:");
  console.log("=======================================");

  const hashOrderVariants = [
    // Standard LOP v4 signature
    "function hashOrder((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",

    // Maybe it expects the Order struct by name
    "function hashOrder(tuple(uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",

    // Maybe different parameter names
    "function hashOrder((uint256 salt,address maker,address receiver,address makerAsset,address takerAsset,uint256 makingAmount,uint256 takingAmount,uint256 makerTraits)) external view returns (bytes32)",

    // Maybe it's called something different
    "function getOrderHash((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
    "function orderHash((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
  ];

  const testOrder = [
    "1", // salt
    wallet.address, // maker
    "0x0000000000000000000000000000000000000000", // receiver
    "0x0000000000000000000000000000000000000000", // makerAsset (ETH)
    "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // takerAsset (WETH)
    ethers.parseEther("0.0001"), // makingAmount
    ethers.parseEther("0.0001"), // takingAmount
    "0", // makerTraits
  ];

  for (const signature of hashOrderVariants) {
    try {
      const testContract = new ethers.Contract(
        lopAddress,
        [signature],
        provider
      );
      const functionName = signature.match(/function (\w+)/)[1]; // Fix: better extraction
      const result = await testContract[functionName](testOrder);
      console.log("✅", functionName, "→", result.substring(0, 10) + "...");
      break;
    } catch (error) {
      const functionName = signature.match(/function (\w+)/)[1]; // Fix: extract name for error too
      console.log(
        "❌",
        functionName,
        "→",
        error.message.includes("missing revert data")
          ? "Missing revert data"
          : error.message.substring(0, 50) + "..."
      );
    }
  }

  // Step 4: Check what the contract actually deployed
  console.log("\n🔍 CHECKING ACTUAL DEPLOYED BYTECODE:");
  console.log("====================================");

  const bytecode = await provider.getCode(lopAddress);
  console.log("Bytecode length:", bytecode.length, "bytes");

  // Look for function selectors in the bytecode
  const knownSelectors = {
    "owner()": "0x8da5cb5b",
    "DOMAIN_SEPARATOR()": "0x3644e515",
    "WETH()": "0xad5c4648",
    "hashOrder(tuple)": "0x3b42e480",
    "bitInvalidatorForOrder(address,uint256)": "0x82bd4a35",
    "fillOrder(tuple,bytes32,bytes32,uint256,uint256)": "0x0550c9bf",
  };

  console.log("\n🔍 Checking for known function selectors in bytecode:");
  for (const [name, selector] of Object.entries(knownSelectors)) {
    const exists = bytecode.includes(selector.slice(2)); // Remove 0x for search
    console.log(
      exists ? "✅" : "❌",
      name,
      "selector",
      selector,
      exists ? "FOUND" : "NOT FOUND"
    );
  }

  // Step 5: Try to understand what contract this actually is
  console.log("\n🎯 DIAGNOSIS SUMMARY:");
  console.log("====================");
  console.log("✅ Contract exists and responds to some calls");
  console.log("✅ Basic functions (owner, DOMAIN_SEPARATOR) work");
  console.log("❓ Order-related functions failing with 'missing revert data'");
  console.log("");
  console.log("💡 POSSIBLE CAUSES:");
  console.log("1. Wrong function signatures (ABI mismatch)");
  console.log("2. Contract deployed with different interface than expected");
  console.log("3. Contract requires specific initialization");
  console.log("4. Dependencies missing (like proper WETH address)");
  console.log("");
  console.log("🔧 NEXT STEPS:");
  console.log("1. Deploy a fresh LOP contract with known working source");
  console.log("2. Use the correct ABI from the actual deployed contract");
  console.log("3. Test with minimal working functions first");
}

diagnoseDeployedContract()
  .then(() => {
    console.log("\n📊 Diagnosis complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Diagnosis failed:", error.message);
    process.exit(1);
  });
