const TronWebModule = require("tronweb");
const TronWeb = TronWebModule.TronWeb;
const fs = require("fs");
require("dotenv").config();

async function extractTronContractABI() {
  console.log("🔍 Extracting Tron Contract ABI...");

  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_RPC_URL,
    privateKey: process.env.TRON_PRIVATE_KEY.startsWith("0x")
      ? process.env.TRON_PRIVATE_KEY.slice(2)
      : process.env.TRON_PRIVATE_KEY,
  });

  const contractAddress = process.env.TRON_ESCROW_FACTORY_ADDRESS;
  console.log("Contract Address:", contractAddress);
  console.log("");

  try {
    // Get contract info from Tron network
    const contractInfo = await tronWeb.trx.getContract(contractAddress);
    console.log("✅ Contract found on Tron network");
    console.log("Contract Name:", contractInfo.contract_name || "N/A");
    console.log("");

    if (contractInfo.abi && contractInfo.abi.entrys) {
      console.log("📋 Available Functions:");

      const functions = contractInfo.abi.entrys.filter(
        (entry) => entry.type === "Function"
      );
      functions.forEach((entry, index) => {
        const inputs = entry.inputs
          ? entry.inputs.map((i) => `${i.type} ${i.name}`).join(", ")
          : "";
        console.log(`  ${index + 1}. ${entry.name}(${inputs})`);
      });

      console.log("");
      console.log("🔍 Looking for key functions...");

      const keyFunctions = [
        "escrows",
        "commitSecret",
        "revealAndWithdraw",
        "createEscrow",
      ];
      keyFunctions.forEach((funcName) => {
        const found = functions.find((f) => f.name === funcName);
        console.log(`  ${funcName}: ${found ? "✅ Found" : "❌ Missing"}`);
      });

      console.log("");
      console.log("💾 Converting ABI format...");

      // Convert Tron ABI format to standard format
      const standardABI = contractInfo.abi.entrys.map((entry) => {
        const abiEntry = {
          type: entry.type.toLowerCase(),
          name: entry.name,
        };

        if (entry.inputs) {
          abiEntry.inputs = entry.inputs.map((input) => ({
            name: input.name,
            type: input.type,
          }));
        }

        if (entry.outputs) {
          abiEntry.outputs = entry.outputs.map((output) => ({
            name: output.name || "",
            type: output.type,
          }));
        }

        if (entry.stateMutability) {
          abiEntry.stateMutability = entry.stateMutability;
        } else if (entry.payable) {
          abiEntry.stateMutability = "payable";
        } else if (entry.constant) {
          abiEntry.stateMutability = "view";
        } else {
          abiEntry.stateMutability = "nonpayable";
        }

        return abiEntry;
      });

      // Save the ABI
      fs.writeFileSync(
        "tron-contract-abi.json",
        JSON.stringify(standardABI, null, 2)
      );
      console.log("✅ ABI saved to tron-contract-abi.json");

      // Update the abis.js file with correct ABI
      console.log("");
      console.log("🔧 Updating scripts/abis.js with correct Tron ABI...");

      const abisPath = "./scripts/abis.js";
      let abisContent = fs.readFileSync(abisPath, "utf8");

      // Replace the TronEscrowFactoryABI with the correct one
      const newTronABI = `const TronEscrowFactoryABI = ${JSON.stringify(
        standardABI,
        null,
        2
      )};`;

      // Find and replace the existing TronEscrowFactoryABI
      const startMarker = "const TronEscrowFactoryABI = [";
      const endMarker = "];";

      const startIndex = abisContent.indexOf(startMarker);
      if (startIndex !== -1) {
        const endIndex =
          abisContent.indexOf(endMarker, startIndex) + endMarker.length;
        abisContent =
          abisContent.substring(0, startIndex) +
          newTronABI +
          abisContent.substring(endIndex);

        fs.writeFileSync(abisPath, abisContent);
        console.log("✅ Updated scripts/abis.js with correct Tron ABI");
      } else {
        console.log("⚠️  Could not find TronEscrowFactoryABI in abis.js");
      }
    } else {
      console.log("❌ No ABI found in contract info");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

extractTronContractABI().catch(console.error);
