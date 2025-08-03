const TronWeb = require("tronweb");

/**
 * Convert between TRON hex and base58 addresses
 */

async function main() {
  const address = process.argv[2];

  if (!address) {
    console.log("❌ Usage: node convert-tron-address.js <ADDRESS>");
    console.log(
      "Example: node convert-tron-address.js 41f5945b6538555a777c4ecf5c77ea5f1662fbf5b0"
    );
    process.exit(1);
  }

  console.log("🔄 TRON ADDRESS CONVERTER");
  console.log("=========================");
  console.log(`📍 Input: ${address}`);

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
    });

    if (address.startsWith("41") && address.length === 42) {
      // Hex to Base58
      const base58 = tronWeb.address.fromHex(address);
      console.log(`✅ Base58: ${base58}`);
      console.log(`🔗 Explorer: https://nile.tronscan.org/#/address/${base58}`);
    } else if (address.startsWith("T") && address.length === 34) {
      // Base58 to Hex
      const hex = tronWeb.address.toHex(address);
      console.log(`✅ Hex: ${hex}`);
    } else {
      console.log("❌ Invalid TRON address format");
      console.log(
        "💡 Expected: 42-char hex (starting with 41) or 34-char base58 (starting with T)"
      );
    }
  } catch (error) {
    console.error("❌ Conversion failed:", error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
