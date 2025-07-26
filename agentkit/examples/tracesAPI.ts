import { tracesAPI } from "../src/functions/tracesAPI";

async function testTracesAPI() {
  console.log("🧪 Testing 1inch Traces API\n");

  try {
    // Test 1: Get synced interval for Ethereum
    console.log("1️⃣ Testing getSyncedInterval for Ethereum (chain 1)...");
    const syncedInterval = await tracesAPI({
      endpoint: "getSyncedInterval",
      chain: 1
    });
    console.log("✅ Synced Interval Response:");
    console.log(JSON.stringify(syncedInterval, null, 2).substring(0, 200) + '...\n');

    // Test 2: Get block trace by number
    console.log("2️⃣ Testing getBlockTraceByNumber for Ethereum block 15000000...");
    const blockTrace = await tracesAPI({
      endpoint: "getBlockTraceByNumber",
      chain: 1,
      blockNumber: "15000000"
    });
    console.log("✅ Block Trace Response:");
    console.log(JSON.stringify(blockTrace, null, 2).substring(0, 200) + '...\n');

    // Test 3: Get transaction trace by hash
    console.log("3️⃣ Testing getTransactionTraceByHash...");
    const txTraceByHash = await tracesAPI({
      endpoint: "getTransactionTraceByHash",
      chain: 1,
      blockNumber: "17378177",
      txHash: "0x16897e492b2e023d8f07be9e925f2c15a91000ef11a01fc71e70f75050f1e03c"
    });
    console.log("✅ Transaction Trace by Hash Response:");
    console.log(JSON.stringify(txTraceByHash, null, 2).substring(0, 200) + '...\n');

    // Test 4: Get transaction trace by offset
    console.log("4️⃣ Testing getTransactionTraceByOffset...");
    const txTraceByOffset = await tracesAPI({
      endpoint: "getTransactionTraceByOffset",
      chain: 1,
      blockNumber: "17378177",
      offset: 1
    });
    console.log("✅ Transaction Trace by Offset Response:");
    console.log(JSON.stringify(txTraceByOffset, null, 2).substring(0, 200) + '...\n');

    console.log("🎉 All Traces API tests completed successfully!");

  } catch (error) {
    console.error("❌ Error testing Traces API:", error);
  }
}

// Run the test
testTracesAPI(); 