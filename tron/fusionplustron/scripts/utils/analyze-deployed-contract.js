const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Analyze what was actually deployed to determine the contract type
 */

async function main() {
  console.log("🔍 ANALYZING DEPLOYED CONTRACT");
  console.log("==============================");

  const contractAddress = "TYMiH5nxemXdmRTLKVbZyBBdHuYrvB1yrj";

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
    });

    console.log(`📍 Contract Address: ${contractAddress}`);

    // Get contract info
    const contractInfo = await tronWeb.trx.getContract(contractAddress);

    if (contractInfo && contractInfo.abi && contractInfo.abi.entrys) {
      console.log(`\n📋 CONTRACT ANALYSIS:`);
      console.log(`Total Functions: ${contractInfo.abi.entrys.length}`);

      // Categorize functions
      const functions = contractInfo.abi.entrys.filter(
        (entry) => entry.type === "Function"
      );
      const events = contractInfo.abi.entrys.filter(
        (entry) => entry.type === "Event"
      );

      console.log(`Functions: ${functions.length}`);
      console.log(`Events: ${events.length}`);

      console.log(`\n🔍 FUNCTION LIST:`);
      functions.forEach((func, i) => {
        const inputs = func.inputs
          ? func.inputs.map((input) => `${input.type} ${input.name}`).join(", ")
          : "";
        const outputs = func.outputs
          ? func.outputs.map((output) => output.type).join(", ")
          : "void";
        console.log(`   ${i + 1}. ${func.name}(${inputs}) -> ${outputs}`);
      });

      // Check for specific function signatures to identify contract type
      const functionNames = functions.map((f) => f.name);

      console.log(`\n🔍 CONTRACT TYPE ANALYSIS:`);

      // Factory functions
      const factoryFunctions = [
        "ESCROW_SRC_IMPLEMENTATION",
        "ESCROW_DST_IMPLEMENTATION",
        "createDstEscrow",
        "addressOfEscrowSrc",
        "addressOfEscrowDst",
      ];

      // Escrow functions
      const escrowFunctions = [
        "withdraw",
        "cancel",
        "rescueFunds",
        "RESCUE_DELAY",
        "FACTORY",
      ];

      const hasFactoryFunctions = factoryFunctions.some((f) =>
        functionNames.includes(f)
      );
      const hasEscrowFunctions = escrowFunctions.some((f) =>
        functionNames.includes(f)
      );

      console.log(`Factory Functions Present: ${hasFactoryFunctions}`);
      console.log(`Escrow Functions Present: ${hasEscrowFunctions}`);

      if (hasFactoryFunctions && !hasEscrowFunctions) {
        console.log(`✅ This appears to be a FACTORY contract`);
      } else if (hasEscrowFunctions && !hasFactoryFunctions) {
        console.log(`✅ This appears to be an ESCROW contract`);
      } else if (hasFactoryFunctions && hasEscrowFunctions) {
        console.log(`⚠️  This appears to be a HYBRID contract (unusual)`);
      } else {
        console.log(`❓ Contract type unclear`);
      }

      // Check for Tron-specific functions
      const tronFunctions = [
        "isTronNetwork",
        "getTronAddress",
        "getTronChainId",
      ];
      const hasTronFunctions = tronFunctions.filter((f) =>
        functionNames.includes(f)
      );

      if (hasTronFunctions.length > 0) {
        console.log(
          `✅ Tron-specific functions found: ${hasTronFunctions.join(", ")}`
        );
      }

      // Check events
      if (events.length > 0) {
        console.log(`\n📢 EVENTS:`);
        events.forEach((event, i) => {
          console.log(`   ${i + 1}. ${event.name}`);
        });
      }
    } else {
      console.log("❌ Could not retrieve contract ABI");
    }

    // Compare with our compiled contracts
    console.log(`\n🔍 COMPARING WITH COMPILED CONTRACTS:`);

    const contractTypes = [
      "TronEscrowFactory",
      "TronEscrowSrc",
      "TronEscrowDst",
    ];

    for (const contractType of contractTypes) {
      const artifactPath = path.join(
        __dirname,
        `../../artifacts/contracts/tron/${contractType}.sol/${contractType}.json`
      );

      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const compiledFunctions = artifact.abi
          .filter((entry) => entry.type === "function")
          .map((f) => f.name);

        console.log(`\n${contractType}:`);
        console.log(`   Compiled functions: ${compiledFunctions.length}`);

        if (contractInfo && contractInfo.abi) {
          const deployedFunctions = contractInfo.abi.entrys
            .filter((entry) => entry.type === "Function")
            .map((f) => f.name);

          const matches = compiledFunctions.filter((f) =>
            deployedFunctions.includes(f)
          );
          const matchPercentage =
            (matches.length /
              Math.max(compiledFunctions.length, deployedFunctions.length)) *
            100;

          console.log(
            `   Matching functions: ${matches.length}/${compiledFunctions.length} (${matchPercentage.toFixed(1)}%)`
          );

          if (matchPercentage > 80) {
            console.log(`   ✅ HIGH MATCH - Likely this contract type`);
          } else if (matchPercentage > 50) {
            console.log(`   ⚠️  PARTIAL MATCH - Possible but uncertain`);
          } else {
            console.log(`   ❌ LOW MATCH - Unlikely this contract type`);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
