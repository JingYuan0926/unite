const TronWeb = require("tronweb");
require("dotenv").config();

/**
 * Check TRON account resources (Energy, Bandwidth)
 */

async function main() {
  console.log("🔋 CHECKING TRON ACCOUNT RESOURCES");
  console.log("===================================");

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const address = tronWeb.defaultAddress.base58;
    console.log(`📍 Account: ${address}`);

    // Get account resources
    const accountResources = await tronWeb.trx.getAccountResources(address);
    const account = await tronWeb.trx.getAccount(address);

    // TRX Balance
    const balance = await tronWeb.trx.getBalance(address);
    const trxBalance = tronWeb.fromSun(balance);
    console.log(`💰 TRX Balance: ${trxBalance} TRX`);

    // Energy
    const totalEnergyLimit = accountResources.TotalEnergyLimit || 0;
    const totalEnergyUsed = accountResources.TotalEnergyUsed || 0;
    const availableEnergy = totalEnergyLimit - totalEnergyUsed;

    console.log(`⚡ Energy:`);
    console.log(`   Total: ${totalEnergyLimit}`);
    console.log(`   Used: ${totalEnergyUsed}`);
    console.log(`   Available: ${availableEnergy}`);

    // Bandwidth
    const totalNetLimit = accountResources.TotalNetLimit || 0;
    const totalNetUsed = accountResources.TotalNetUsed || 0;
    const availableBandwidth = totalNetLimit - totalNetUsed;

    console.log(`📡 Bandwidth:`);
    console.log(`   Total: ${totalNetLimit}`);
    console.log(`   Used: ${totalNetUsed}`);
    console.log(`   Available: ${availableBandwidth}`);

    // Frozen TRX for resources
    const frozenForEnergy = account.frozen_supply || [];
    const frozenForBandwidth = account.frozen || [];

    console.log(`🧊 Frozen TRX:`);
    console.log(
      `   For Energy: ${frozenForEnergy.length > 0 ? tronWeb.fromSun(frozenForEnergy[0].frozen_balance) : 0} TRX`
    );
    console.log(
      `   For Bandwidth: ${frozenForBandwidth.length > 0 ? tronWeb.fromSun(frozenForBandwidth[0].frozen_balance) : 0} TRX`
    );

    // Recommendations
    console.log(`\n💡 DEPLOYMENT RECOMMENDATIONS:`);

    if (availableEnergy < 50000) {
      console.log(`❌ Insufficient Energy for contract deployment`);
      console.log(`🔧 Solutions:`);
      console.log(
        `   1. Get free energy from: https://nileex.io/join/getJoinPage`
      );
      console.log(`   2. Or freeze 100+ TRX for Energy (stake TRX)`);
      console.log(`   3. Or increase fee limit to use TRX instead of Energy`);
    } else {
      console.log(`✅ Sufficient Energy for deployment!`);
    }

    if (availableBandwidth < 1000) {
      console.log(`❌ Low Bandwidth`);
      console.log(`🔧 Solution: Freeze 10+ TRX for Bandwidth`);
    } else {
      console.log(`✅ Sufficient Bandwidth!`);
    }

    // Energy cost estimation
    console.log(`\n📊 DEPLOYMENT COST ESTIMATE:`);
    console.log(`   Contract deployment: ~50,000-100,000 Energy`);
    console.log(`   Or equivalent in TRX: ~20-40 TRX`);
  } catch (error) {
    console.error("❌ Error checking resources:", error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
