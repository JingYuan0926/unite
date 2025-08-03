const TronWeb = require("tronweb");
require("dotenv").config();

/**
 * Get implementation addresses from deployed TronEscrowFactory
 */

async function main() {
  console.log("🔍 GETTING TRON IMPLEMENTATION ADDRESSES");
  console.log("=========================================");

  const factoryAddress = "TYMiH5nxemXdmRTLKVbZyBBdHuYrvB1yrj";

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
    });

    console.log(`📍 Factory Address: ${factoryAddress}`);
    console.log(
      `🔗 Explorer: https://nile.tronscan.org/#/contract/${factoryAddress}`
    );

    // Try to call the factory functions directly using TronWeb's built-in method
    console.log("\n🔍 Querying implementation addresses...");

    try {
      // Method 1: Try direct contract call
      const factoryContract = await tronWeb.trx.getContract(factoryAddress);

      if (
        factoryContract &&
        factoryContract.abi &&
        factoryContract.abi.entrys
      ) {
        console.log(
          `✅ Factory contract found with ${factoryContract.abi.entrys.length} functions`
        );

        // Look for our expected functions
        const functions = factoryContract.abi.entrys.filter(
          (entry) => entry.type === "Function"
        );
        const srcImplFunc = functions.find(
          (f) => f.name === "ESCROW_SRC_IMPLEMENTATION"
        );
        const dstImplFunc = functions.find(
          (f) => f.name === "ESCROW_DST_IMPLEMENTATION"
        );

        console.log(`📋 Functions found:`);
        functions.forEach((f) => console.log(`   - ${f.name}`));

        if (srcImplFunc && dstImplFunc) {
          console.log("✅ Implementation getter functions found");
        } else {
          console.log("❌ Implementation getter functions not found");
        }
      }

      // Method 2: Try triggerConstantContract
      console.log("\n🔧 Attempting to call ESCROW_SRC_IMPLEMENTATION...");

      const srcResult = await tronWeb.trx.triggerConstantContract(
        factoryAddress,
        "ESCROW_SRC_IMPLEMENTATION()",
        {},
        []
      );

      if (srcResult && srcResult.result && srcResult.result.result) {
        const srcImplHex = "41" + srcResult.constant_result[0].slice(24); // Remove padding and add 41 prefix
        const srcImplAddress = tronWeb.address.fromHex(srcImplHex);
        console.log(`✅ Src Implementation (hex): ${srcImplHex}`);
        console.log(`✅ Src Implementation (base58): ${srcImplAddress}`);
        console.log(
          `🔗 Src Explorer: https://nile.tronscan.org/#/contract/${srcImplAddress}`
        );
      } else {
        console.log("❌ Failed to get Src implementation address");
      }

      console.log("\n🔧 Attempting to call ESCROW_DST_IMPLEMENTATION...");

      const dstResult = await tronWeb.trx.triggerConstantContract(
        factoryAddress,
        "ESCROW_DST_IMPLEMENTATION()",
        {},
        []
      );

      if (dstResult && dstResult.result && dstResult.result.result) {
        const dstImplHex = "41" + dstResult.constant_result[0].slice(24); // Remove padding and add 41 prefix
        const dstImplAddress = tronWeb.address.fromHex(dstImplHex);
        console.log(`✅ Dst Implementation (hex): ${dstImplHex}`);
        console.log(`✅ Dst Implementation (base58): ${dstImplAddress}`);
        console.log(
          `🔗 Dst Explorer: https://nile.tronscan.org/#/contract/${dstImplAddress}`
        );
      } else {
        console.log("❌ Failed to get Dst implementation address");
      }
    } catch (error) {
      console.log(`❌ Error querying implementations: ${error.message}`);

      // Method 3: Check transaction history to find deployment
      console.log(
        "\n🔍 Checking factory deployment transaction for implementation addresses..."
      );

      try {
        const account = await tronWeb.trx.getAccount(factoryAddress);
        if (account && account.create_time) {
          console.log(
            `📅 Factory created: ${new Date(account.create_time).toLocaleString()}`
          );
        }

        // Get transactions from/to this address
        const transactions = await tronWeb.trx.getTransactionsFromAddress(
          factoryAddress,
          10
        );
        console.log(`📊 Found ${transactions.length} transactions`);

        if (transactions.length > 0) {
          console.log("🔍 Recent transactions:");
          transactions.slice(0, 3).forEach((tx, i) => {
            console.log(
              `   ${i + 1}. ${tx.txID} - ${new Date(tx.block_timestamp).toLocaleString()}`
            );
          });
        }
      } catch (txError) {
        console.log(`❌ Error checking transactions: ${txError.message}`);
      }
    }

    console.log("\n📋 SUMMARY:");
    console.log("============");
    console.log(`✅ TronEscrowFactory: ${factoryAddress}`);
    console.log(`❓ TronEscrowSrc Implementation: Need to query from factory`);
    console.log(`❓ TronEscrowDst Implementation: Need to query from factory`);
    console.log(
      "\n💡 The factory contract should contain the implementation addresses."
    );
    console.log(
      "   If the above queries failed, the implementations might be embedded"
    );
    console.log(
      "   in the factory's constructor and deployed as part of the same transaction."
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
