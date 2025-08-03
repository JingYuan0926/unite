import { ethers } from "hardhat";

/**
 * Debug the specific transaction error by simulating the call
 */
async function debugTransactionError() {
  require("dotenv").config();

  console.log("🔍 DEBUGGING TRANSACTION ERROR");
  console.log("=".repeat(40));

  const txHash =
    "0x8134d33576d1253803149fd7afaf98037c543be6d3e236beb6d1fb6d55cf5cae";
  console.log(`📝 Analyzing transaction: ${txHash}`);

  const provider = ethers.provider;
  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  console.log("📊 Transaction Details:");
  console.log(`  From: ${tx!.from}`);
  console.log(`  To: ${tx!.to}`);
  console.log(`  Value: ${ethers.formatEther(tx!.value)} ETH`);
  console.log(`  Gas Used: ${receipt!.gasUsed}`);
  console.log(`  Status: ${receipt!.status} (0 = failed)`);

  // Try to get more details about the error
  try {
    // Simulate the transaction to get the revert reason
    const result = await provider.call({
      to: tx!.to,
      from: tx!.from,
      value: tx!.value,
      data: tx!.data,
    });
    console.log("Call result:", result);
  } catch (error: any) {
    console.log("❌ Call simulation failed:");
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`Data: ${error.data}`);

    // Try to decode the error data if available
    if (error.data) {
      try {
        // Common error selectors
        const errorSelectors = {
          "0x08c379a0": "Error(string)", // Standard revert
          "0x4e487b71": "Panic(uint256)", // Panic
          "0xa4f62a96": "Custom LOP Error", // The specific error we're seeing
        };

        const selector = error.data.slice(0, 10);
        if (errorSelectors[selector]) {
          console.log(`🎯 Error Type: ${errorSelectors[selector]}`);

          if (selector === "0xa4f62a96") {
            console.log(
              "🔍 This is the LOP invalidation error we've been tracking!"
            );
          }
        }
      } catch (decodeError) {
        console.log("Could not decode error data");
      }
    }
  }

  // Also let's check the DemoResolver contract to see if there are any obvious issues
  console.log("\n🔧 Checking DemoResolver contract...");

  const demoResolverAddress = "0xf80c9EAAd4a37a3782ECE65df77BFA24614294fC";
  const DemoResolver = await ethers.getContractAt(
    "DemoResolver",
    demoResolverAddress
  );

  try {
    const lopAddress = await DemoResolver.LOP();
    const escrowFactoryAddress = await DemoResolver.ESCROW_FACTORY();

    console.log(`✅ DemoResolver LOP: ${lopAddress}`);
    console.log(`✅ DemoResolver EscrowFactory: ${escrowFactoryAddress}`);
  } catch (error) {
    console.log(`❌ Failed to read DemoResolver state: ${error}`);
  }
}

debugTransactionError().catch(console.error);
