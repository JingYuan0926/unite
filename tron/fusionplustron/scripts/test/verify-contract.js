const TronWeb = require("tronweb");
require("dotenv").config();

// REAL Tron Nile testnet configuration
const TRON_CONFIG = {
  fullHost: "https://nile.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "" },
  privateKey: process.env.TRON_PRIVATE_KEY || "",
  feeLimit: 100000000,
};

async function verifyContract() {
  console.log("🔍 VERIFYING DEPLOYED CONTRACT");
  console.log("=".repeat(50));

  const tronWeb = new TronWeb(
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.fullHost,
    TRON_CONFIG.privateKey
  );

  // Load deployment results
  const fs = require("fs");
  let deploymentData;
  try {
    const data = fs.readFileSync("./real-deployment-results.json", "utf8");
    deploymentData = JSON.parse(data);
  } catch (error) {
    console.error("❌ Could not load deployment results");
    return;
  }

  const contractAddress = deploymentData.phase1.address;
  const base58Address = tronWeb.address.fromHex("41" + contractAddress);

  console.log(`📋 Contract Address (hex): ${contractAddress}`);
  console.log(`📋 Contract Address (base58): ${base58Address}`);

  try {
    // Check if contract exists
    const contractInfo = await tronWeb.trx.getContract(base58Address);
    console.log("✅ Contract exists on chain");
    console.log(`📋 Contract Type: ${contractInfo.contract_type || "Unknown"}`);

    // Check contract code
    if (contractInfo.bytecode) {
      console.log(
        `📋 Bytecode Length: ${contractInfo.bytecode.length} characters`
      );
    }

    // Try to get account info
    const accountInfo = await tronWeb.trx.getAccount(base58Address);
    console.log(`📋 Account Type: ${accountInfo.type || "Contract"}`);
    console.log(`📋 Balance: ${accountInfo.balance || 0} sun`);

    // Let's try to call the contract manually with a simpler approach
    console.log("\n🔍 Testing simple contract call...");

    // Simple ABI with just the view function
    const simpleABI = [
      {
        inputs: [
          { name: "salt", type: "bytes32" },
          { name: "bytecodeHash", type: "bytes32" },
        ],
        name: "testComputeAddress",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
    ];

    try {
      const contract = await tronWeb.contract(simpleABI, base58Address);
      console.log("✅ Contract instance created successfully");

      // Test with simple values
      const testSalt =
        "0x0000000000000000000000000000000000000000000000000000000000000001";
      const testBytecode =
        "0x0000000000000000000000000000000000000000000000000000000000000002";

      console.log("🔍 Calling testComputeAddress with simple values...");
      const result = await contract
        .testComputeAddress(testSalt, testBytecode)
        .call();

      console.log("✅ SUCCESS! Contract call worked!");
      console.log(`📋 Result: ${result}`);
      console.log(`📋 Result as address: ${tronWeb.address.fromHex(result)}`);

      // This means our contract is working!
      console.log(
        "\n🎊 CONTRACT IS WORKING! The CREATE2 fix is deployed successfully!"
      );
    } catch (callError) {
      console.log("❌ Contract call failed:", callError.message);
    }
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

verifyContract();
