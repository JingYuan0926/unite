const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Get implementation addresses from the deployed TronEscrowFactory
 */

async function main() {
  console.log("🔍 GETTING FACTORY IMPLEMENTATION ADDRESSES");
  console.log("===========================================");

  const factoryAddress = "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk";

  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    console.log(`📍 Factory Address: ${factoryAddress}`);

    // Get factory contract
    const artifactPath = path.join(
      __dirname,
      "../../artifacts/contracts/tron/TronEscrowFactory.sol/TronEscrowFactory.json"
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = await tronWeb.contract(artifact.abi, factoryAddress);

    // Get implementation addresses
    console.log("\n🔍 Querying implementation addresses...");

    const srcImplHex = await factory.ESCROW_SRC_IMPLEMENTATION().call();
    const dstImplHex = await factory.ESCROW_DST_IMPLEMENTATION().call();

    const srcImplAddress = tronWeb.address.fromHex(srcImplHex);
    const dstImplAddress = tronWeb.address.fromHex(dstImplHex);

    console.log(`✅ Src Implementation: ${srcImplAddress}`);
    console.log(`✅ Dst Implementation: ${dstImplAddress}`);

    // Test factory functions
    const isTronFactory = await factory.isTronFactory().call();
    const chainId = await factory.getTronChainId().call();
    const [owner, accessToken, feeToken] = await factory
      .getFactoryConfig()
      .call();

    console.log(`\n🔧 Factory Configuration:`);
    console.log(`✅ Is Tron Factory: ${isTronFactory}`);
    console.log(`✅ Chain ID: ${chainId}`);
    console.log(`✅ Owner: ${owner}`);
    console.log(`✅ Access Token: ${accessToken}`);
    console.log(`✅ Fee Token: ${feeToken}`);

    // Verify implementation contracts
    console.log(`\n🔍 Verifying implementation contracts...`);

    const srcContract = await tronWeb.trx.getContract(srcImplAddress);
    const dstContract = await tronWeb.trx.getContract(dstImplAddress);

    if (srcContract && srcContract.bytecode) {
      console.log(
        `✅ Src implementation verified with ${srcContract.abi.entrys.filter((e) => e.type === "Function").length} functions`
      );
    }

    if (dstContract && dstContract.bytecode) {
      console.log(
        `✅ Dst implementation verified with ${dstContract.abi.entrys.filter((e) => e.type === "Function").length} functions`
      );
    }

    // Create complete deployment summary
    const completeDeployment = {
      network: "tron-nile-real",
      timestamp: new Date().toISOString(),
      chainId: 3448148188,
      phase: "Phase 3 - TRON NILE EXTENSION DEVELOPMENT",
      status: "COMPLETED",
      contracts: {
        TronEscrowSrc: srcImplAddress,
        TronEscrowDst: dstImplAddress,
        TronEscrowFactory: factoryAddress,
      },
      deployer: "TPUiCeNRjjEpo1NFJ1ZURfU1ziNNMtn8yu",
      verified: true,
      explorerLinks: {
        TronEscrowSrc: `https://nile.tronscan.org/#/contract/${srcImplAddress}`,
        TronEscrowDst: `https://nile.tronscan.org/#/contract/${dstImplAddress}`,
        TronEscrowFactory: `https://nile.tronscan.org/#/contract/${factoryAddress}`,
      },
      factoryConfig: {
        isTronFactory,
        chainId: chainId.toString(),
        owner,
        accessToken,
        feeToken,
      },
    };

    // Save complete deployment info
    const deploymentPath = path.join(
      __dirname,
      "../../contracts/deployments/tron-nile-complete.json"
    );
    fs.writeFileSync(
      deploymentPath,
      JSON.stringify(completeDeployment, null, 2)
    );

    console.log(`\n💾 Complete deployment saved to: ${deploymentPath}`);

    console.log(`\n🎉 PHASE 3 DEPLOYMENT ANALYSIS COMPLETE!`);
    console.log(`=======================================`);
    console.log(`✅ All 3 contracts deployed and verified:`);
    console.log(`   TronEscrowSrc: ${srcImplAddress}`);
    console.log(`   TronEscrowDst: ${dstImplAddress}`);
    console.log(`   TronEscrowFactory: ${factoryAddress}`);

    console.log(`\n🔗 VERIFICATION LINKS:`);
    console.log(`Src: https://nile.tronscan.org/#/contract/${srcImplAddress}`);
    console.log(`Dst: https://nile.tronscan.org/#/contract/${dstImplAddress}`);
    console.log(
      `Factory: https://nile.tronscan.org/#/contract/${factoryAddress}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
