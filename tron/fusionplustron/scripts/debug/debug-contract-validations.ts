// scripts/debug/debug-contract-validations.ts
// Debug specific contract validation requirements

import { ethers } from "ethers";
import { TronExtension, TronEscrowParams } from "../../src/sdk/TronExtension";
import { ConfigManager } from "../../src/utils/ConfigManager";
import { Logger } from "../../src/utils/Logger";

async function debugContractValidations() {
  console.log("🔍 DEBUGGING CONTRACT VALIDATION REQUIREMENTS");
  console.log("==============================================\n");

  // Initialize services
  const config = new ConfigManager();
  const logger = Logger.getInstance().scope("ValidationDebug");
  const tronExtension = new TronExtension(config, logger);

  try {
    // Create test parameters
    const secret = ethers.randomBytes(32);
    const secretHash = ethers.keccak256(secret);

    const tronParams: TronEscrowParams = {
      secretHash: secretHash,
      srcChain: 11155111, // Sepolia chainId
      dstChain: 3448148188, // TRON Nile chainId
      srcAsset: "0x0000000000000000000000000000000000000000", // ETH address
      dstAsset: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR", // TRX address (should be 0x0 for native)
      srcAmount: "1000000000000000", // 0.001 ETH in wei
      dstAmount: "100000000", // 100 TRX in SUN
      nonce: ethers.hexlify(ethers.randomBytes(16)),
      srcBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      srcCancellationBeneficiary: "0x32F91E4E2c60A9C16cAE736D3b42152B331c147F",
      dstCancellationBeneficiary: "TGFSxj53mAhVTVQpfhrc3Kh4f9YUcxB6Lk",
      safetyDeposit: "10000000", // 10 TRX in SUN
      timelock: 3600,
    };

    console.log("📋 VALIDATION CHECKS:");
    console.log("=====================");

    // Check 1: Amount validation
    console.log(
      `✅ Check 1 - Amount > 0: ${tronParams.dstAmount} > 0 = ${parseInt(tronParams.dstAmount) > 0}`
    );

    // Check 2: Hashlock validation
    console.log(
      `✅ Check 2 - Hashlock != 0: ${secretHash} != 0x0 = ${secretHash !== "0x0000000000000000000000000000000000000000000000000000000000000000"}`
    );

    // Check 3: Native value validation
    const safetyDeposit = parseInt(tronParams.safetyDeposit);
    const amount = parseInt(tronParams.dstAmount);
    const totalRequired = safetyDeposit + amount; // For native TRX
    const msgValue = safetyDeposit; // What we're actually sending

    console.log(
      `❌ Check 3 - Native value: msg.value (${msgValue}) >= required (${totalRequired}) = ${msgValue >= totalRequired}`
    );
    console.log(
      `   - Safety Deposit: ${safetyDeposit} SUN (${safetyDeposit / 1000000} TRX)`
    );
    console.log(`   - Amount: ${amount} SUN (${amount / 1000000} TRX)`);
    console.log(
      `   - Total Required for Native: ${totalRequired} SUN (${totalRequired / 1000000} TRX)`
    );
    console.log(
      `   - Actually Sending: ${msgValue} SUN (${msgValue / 1000000} TRX)`
    );

    // Check 4: Timing constraints
    const packedTimelocks = tronExtension.createPackedTimelocks(
      tronParams.timelock
    );
    const currentTime = Math.floor(Date.now() / 1000);
    const srcCancellationTimestamp = currentTime + tronParams.timelock;

    // Simulate: immutables.timelocks.get(TimelocksLib.Stage.DstCancellation)
    // From TimelocksLib, DstCancellation = stage 6
    // From createPackedTimelocks, dstCancellation = timelock - 300
    const dstCancellation = currentTime + tronParams.timelock - 300;

    console.log(
      `✅ Check 4 - Timing: dstCancellation (${dstCancellation}) <= srcCancellation (${srcCancellationTimestamp}) = ${dstCancellation <= srcCancellationTimestamp}`
    );

    console.log("\n🔍 ISSUE IDENTIFIED:");
    console.log("====================");
    console.log("❌ The problem is Check 3: Native value validation");
    console.log(
      `For native TRX, the contract expects: msg.value >= (amount + safetyDeposit)`
    );
    console.log(`But we're only sending: safetyDeposit`);
    console.log(
      `We need to send: ${totalRequired} SUN (${totalRequired / 1000000} TRX)`
    );

    console.log("\n🔧 FIXING THE ISSUE:");
    console.log("====================");
    console.log("Need to update TronExtension.deployTronEscrowDst to send:");
    console.log(
      `callValue: ${totalRequired} // amount + safetyDeposit for native TRX`
    );
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }
}

debugContractValidations().catch(console.error);
