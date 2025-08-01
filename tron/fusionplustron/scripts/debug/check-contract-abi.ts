// scripts/debug/check-contract-abi.ts
// Check the actual deployed contract ABI and function selectors

import { ethers } from "ethers";

async function checkContractABI() {
  console.log("🔍 CHECKING DEPLOYED CONTRACT ABI");
  console.log("==================================\n");

  try {
    const TronWeb = require("tronweb");
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";

    console.log("📋 CONTRACT INFO:");
    console.log("=================");
    console.log(`Factory Address: ${factoryAddress}`);

    // Get contract details
    const contractInfo = await tronWeb.trx.getContract(factoryAddress);
    console.log(`Contract Type: ${contractInfo.contract_type}`);
    console.log(`Owner: ${contractInfo.owner_address}`);

    // Check if contract has ABI
    if (contractInfo.abi) {
      console.log("\n📋 CONTRACT ABI:");
      console.log("================");
      console.log(JSON.stringify(contractInfo.abi, null, 2));

      // Extract function signatures
      console.log("\n📋 FUNCTION SIGNATURES:");
      console.log("=======================");
      if (contractInfo.abi.entrys) {
        contractInfo.abi.entrys.forEach((entry: any) => {
          if (entry.type === "Function") {
            const inputs =
              entry.inputs?.map((input: any) => input.type).join(",") || "";
            const signature = `${entry.name}(${inputs})`;
            const selector = ethers.id(signature).slice(0, 10);
            console.log(`${selector}: ${signature}`);

            if (selector === "0xb817f444") {
              console.log(`🎯 FOUND MATCH! 0xb817f444 = ${signature}`);
            }
          }
        });
      }
    } else {
      console.log("❌ No ABI found in contract info");
    }

    console.log("\n🧪 TESTING DIFFERENT FUNCTION SIGNATURES:");
    console.log("==========================================");

    // Test various possible signatures
    const possibleSignatures = [
      "createDstEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256),uint256)",
      "createDstEscrow(tuple,uint256)",
      "createDstEscrow(bytes32[8],uint256)",
      "createDstEscrow(uint256)",
      "createDstEscrow(uint256,uint256)",
      "setDeployedAt(uint256)",
      "cancel()",
      "withdraw()",
    ];

    possibleSignatures.forEach((sig) => {
      const selector = ethers.id(sig).slice(0, 10);
      console.log(`${selector}: ${sig}`);
      if (selector === "0xb817f444") {
        console.log(`🎯 MATCH FOUND! 0xb817f444 = ${sig}`);
      }
    });

    // Test the mystery selector
    console.log("\n🔍 MYSTERY SELECTOR ANALYSIS:");
    console.log("==============================");
    console.log(`Selector: 0xb817f444`);
    console.log(`Bytes: ${ethers.getBytes("0xb817f444")}`);

    // Check if it might be a different function
    const mysterySelector = "0xb817f444";
    console.log(
      `\nThis selector might correspond to a function that only takes uint256`
    );
    console.log(
      `Since the transaction data only contains 32 bytes (1 uint256 parameter)`
    );
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    console.log("Full error:", error);
  }
}

checkContractABI().catch(console.error);
