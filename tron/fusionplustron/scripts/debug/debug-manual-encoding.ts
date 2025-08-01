// scripts/debug/debug-manual-encoding.ts
// Debug manual parameter encoding for TRON contract

import { ethers } from "ethers";

async function debugManualEncoding() {
  console.log("🔍 DEBUGGING MANUAL PARAMETER ENCODING");
  console.log("======================================\n");

  try {
    // Create test immutables
    const immutables = {
      orderHash:
        "0x572cd57d35cddd88a0e112857926b97f77317e1663c1fa80665341b7b6792cf5",
      hashlock:
        "0x7394aa65e6d2f710ad55d5a5d2fec21d6ffd14ddbffa943ab6d35da36bf0ad88",
      maker: "291005064065216609379348440085847011502914802815",
      taker: "1224670341079427267233653058677592145777803316664",
      token: "0",
      amount: "100000000",
      safetyDeposit: "10000000",
      timelocks:
        "20714435728091397994358002433615339831790551575997785414042200",
    };

    const srcCancellationTimestamp = "1754070379";

    console.log("📋 PARAMETER ENCODING TESTS:");
    console.log("=============================");

    // Test 1: Manual encoding of struct + uint256
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    console.log("🧪 Test 1: Encoding complete parameters");
    try {
      const encodedParams = abiCoder.encode(
        [
          "tuple(bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256)",
          "uint256",
        ],
        [
          [
            immutables.orderHash,
            immutables.hashlock,
            immutables.maker,
            immutables.taker,
            immutables.token,
            immutables.amount,
            immutables.safetyDeposit,
            immutables.timelocks,
          ],
          srcCancellationTimestamp,
        ]
      );
      console.log(`✅ Encoded data length: ${encodedParams.length} chars`);
      console.log(`✅ Encoded data: ${encodedParams.slice(0, 100)}...`);
    } catch (encodeError: any) {
      console.log(`❌ Encoding error: ${encodeError.message}`);
    }

    // Test 2: Check function selector
    const functionSelector = ethers
      .id(
        "createDstEscrow((bytes32,bytes32,uint256,uint256,uint256,uint256,uint256,uint256),uint256)"
      )
      .slice(0, 10);
    console.log(`\n🧪 Test 2: Function selector`);
    console.log(`Calculated selector: ${functionSelector}`);
    console.log(`Expected in transaction: b817f444`);
    console.log(`Match: ${functionSelector === "0xb817f444"}`);

    // Test 3: Compare with actual transaction data
    console.log(`\n🧪 Test 3: Actual transaction data analysis`);
    const actualData =
      "b817f44400000000000000000000000000000000000000000000000000000000688cfd6b";
    console.log(`Actual data: ${actualData}`);
    console.log(`Function selector: ${actualData.slice(0, 8)}`);
    console.log(`Parameter data: ${actualData.slice(8)}`);
    console.log(
      `Parameter data length: ${actualData.slice(8).length / 2} bytes`
    );

    // Test 4: Try to decode the actual data
    console.log(`\n🧪 Test 4: Decoding actual data`);
    try {
      const paramData = "0x" + actualData.slice(8);
      console.log(`Trying to decode: ${paramData}`);

      // This looks like just a uint256
      const decoded = abiCoder.decode(["uint256"], paramData);
      console.log(`Decoded as uint256: ${decoded[0]}`);
      console.log(
        `Expected srcCancellationTimestamp: ${srcCancellationTimestamp}`
      );
      console.log(
        `Match: ${decoded[0].toString() === srcCancellationTimestamp}`
      );
    } catch (decodeError: any) {
      console.log(`❌ Decode error: ${decodeError.message}`);
    }

    console.log(`\n🔍 DIAGNOSIS:`);
    console.log(`=============`);
    console.log(
      `❌ The transaction data only contains 32 bytes of parameter data`
    );
    console.log(
      `❌ This suggests only the srcCancellationTimestamp is being passed`
    );
    console.log(`❌ The immutables struct (8 x 32 = 256 bytes) is missing`);
    console.log(`❌ TronWeb is not properly encoding the struct parameter`);

    console.log(`\n🔧 POTENTIAL SOLUTIONS:`);
    console.log(`=======================`);
    console.log(`1. Try calling the contract method differently`);
    console.log(`2. Use triggerSmartContract directly with manual encoding`);
    console.log(`3. Check TronWeb version compatibility`);
    console.log(`4. Verify the contract ABI matches our expectation`);
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
  }
}

debugManualEncoding().catch(console.error);
