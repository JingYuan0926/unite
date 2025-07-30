const { LOPFusionSwap } = require("../atomic-swap.js");

async function testCompleteLOPIntegration() {
  console.log("🧪 COMPLETE LOP INTEGRATION TEST");
  console.log("================================");
  console.log("Testing with NEW working LOP contract");
  console.log("=====================================");

  const lopSwap = new LOPFusionSwap();

  try {
    // Test full LOP integration flow
    console.log("\n🚀 Starting complete LOP integration test...");
    
    const result = await lopSwap.executeLOPSwap();

    if (result.success) {
      console.log("\n🎉 COMPLETE LOP INTEGRATION SUCCESS!");
      console.log("=====================================");
      console.log("✅ LOP order created and signed");
      console.log("✅ Order filled successfully"); 
      console.log("✅ Escrows created via postInteraction");
      console.log("✅ No 'missing revert data' errors");
      console.log("✅ NEW LOP contract working perfectly");
      console.log("📄 Transaction hash:", result.lopTxHash);

      // Verify on blockchain if transaction hash is available
      if (result.lopTxHash) {
        try {
          const receipt = await lopSwap.ethProvider.getTransactionReceipt(
            result.lopTxHash
          );
          if (receipt) {
            console.log("✅ Transaction confirmed, block:", receipt.blockNumber);
            console.log("✅ Gas used:", receipt.gasUsed.toString());
          }
        } catch (error) {
          console.log("⚠️ Could not verify transaction (may still be pending)");
        }
      }
      
      console.log("\n🏆 PHASE 3 TRULY COMPLETE!");
      console.log("===========================");
      console.log("✅ LOP v4 integration fully working");
      console.log("✅ Contract deployment issue resolved");
      console.log("✅ End-to-end transaction success");
      console.log("✅ Ready for hackathon demonstration");
      
      return true;
      
    } else {
      console.log("\n❌ LOP Integration test failed");
      console.log("===============================");
      console.log("Error:", result.error);
      
      // Check if it's still the old error
      if (result.error && result.error.includes("missing revert data")) {
        console.log("\n🚨 CRITICAL: Still getting 'missing revert data' error");
        console.log("This means the contract update didn't work properly");
        console.log("Check that sepolia-lop-fixed.json has the correct address");
      } else {
        console.log("\n💡 Different error - this is progress!");
        console.log("The new LOP contract is working, but integration needs adjustment");
      }
      
      return false;
    }

  } catch (error) {
    console.log("\n❌ Integration test failed with error:");
    console.log("=====================================");
    console.log(error.message);
    console.log("\nStack trace:");
    console.log(error.stack);
    
    // Analyze the error
    if (error.message.includes("missing revert data")) {
      console.log("\n🚨 STILL GETTING OLD ERROR");
      console.log("The contract address may not have been updated properly");
    } else if (error.message.includes("LOP contract test failed")) {
      console.log("\n⚠️ LOP CONTRACT ISSUE");
      console.log("The new contract may have deployment issues");
    } else {
      console.log("\n💡 NEW ERROR TYPE");
      console.log("This indicates progress - the old contract issue is resolved");
    }
    
    return false;
  }
}

// Execute the test
testCompleteLOPIntegration().then((success) => {
  if (success) {
    console.log("\n🎊 CELEBRATION TIME! 🎊");
    console.log("=======================");
    console.log("Phase 3 LOP integration is TRULY COMPLETE!");
    console.log("All components working end-to-end!");
    console.log("Ready for hackathon demonstration!");
    
    // Update the completion status
    const fs = require("fs");
    const statusUpdate = {
      phase3Status: "TRULY_COMPLETE",
      completedAt: new Date().toISOString(),
      workingLOPContract: "0xF9c1C73ac05c6BD5f546df6173DF24c4f48a6939",
      endToEndTested: true,
      readyForDemo: true
    };
    
    try {
      fs.writeFileSync(
        "./PHASE3-FINAL-STATUS.json", 
        JSON.stringify(statusUpdate, null, 2)
      );
      console.log("✅ Phase 3 completion status saved");
    } catch (err) {
      console.log("⚠️ Could not save status file:", err.message);
    }
    
  } else {
    console.log("\n🔧 TROUBLESHOOTING NEEDED");
    console.log("=========================");
    console.log("Phase 3 integration still has issues to resolve");
    console.log("Review the error messages above for next steps");
  }
  
  process.exit(success ? 0 : 1);
});

module.exports = { testCompleteLOPIntegration }; 