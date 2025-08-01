const TronWeb = require("tronweb");
require("dotenv").config();

/**
 * Verify a specific contract on TRON Nile testnet
 * Usage: node verify-tron-contract.js <CONTRACT_ADDRESS>
 */

async function main() {
  const contractAddress = process.argv[2];

  if (!contractAddress) {
    console.log("❌ Usage: node verify-tron-contract.js <CONTRACT_ADDRESS>");
    console.log(
      "Example: node verify-tron-contract.js TPUiCeNRjjEpo1NFJ1ZURfU1ziNNMtn8yu"
    );
    process.exit(1);
  }

  console.log("🔍 VERIFYING TRON CONTRACT");
  console.log("==========================");
  console.log(`📍 Address: ${contractAddress}`);

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
    });

    // Check if address is valid TRON format
    if (!tronWeb.isAddress(contractAddress)) {
      console.log("❌ Invalid TRON address format");
      process.exit(1);
    }

    // Convert to hex if needed
    const hexAddress = tronWeb.address.toHex(contractAddress);
    console.log(`🔗 Hex Address: ${hexAddress}`);

    // Check if contract exists
    try {
      const contractInfo = await tronWeb.trx.getContract(contractAddress);

      if (contractInfo && contractInfo.bytecode) {
        console.log("✅ Contract found on TRON Nile!");
        console.log(
          `📊 Contract Type: ${contractInfo.contract_type || "Unknown"}`
        );
        console.log(
          `🔗 Explorer: https://nile.tronscan.org/#/contract/${contractAddress}`
        );

        // Try to get more info
        if (contractInfo.abi && contractInfo.abi.entrys) {
          console.log(`📋 Functions: ${contractInfo.abi.entrys.length}`);
        }

        console.log("\n🎉 Contract verification successful!");
        console.log(
          "✅ This contract is deployed and available on TRON Nile testnet"
        );
      } else {
        console.log("❌ Contract not found or has no bytecode");
        console.log("💡 This might be a regular address, not a contract");
      }
    } catch (error) {
      console.log("❌ Contract not found on TRON Nile testnet");
      console.log(`💡 Error: ${error.message}`);
    }

    // Check account info anyway
    try {
      const account = await tronWeb.trx.getAccount(contractAddress);
      if (account && Object.keys(account).length > 0) {
        console.log("\n📊 Account Info:");
        console.log(
          `   Address: ${account.address ? tronWeb.address.fromHex(account.address) : "N/A"}`
        );
        console.log(
          `   Balance: ${account.balance ? tronWeb.fromSun(account.balance) : 0} TRX`
        );
        console.log(
          `   Created: ${account.create_time ? new Date(account.create_time).toLocaleString() : "Unknown"}`
        );
      }
    } catch (error) {
      console.log("ℹ️  Account details not available");
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
