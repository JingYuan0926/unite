const { ethers } = require("ethers");

// Transaction data from the failed call (UPDATED with deployedAt fix)
const txData =
  "0xdea024e45d14d4b86341d7b46a7e82db3d5555b48d73d8e77504313299b1381db96e1dcbe2bd8efed64c3198d2bdaeeece02405fa2122d4b6524450d21809e6ce006fd370000000000000000000000007daf99e5d4b52a9b37a31ec1fed22b5114337d27000000000000000000000000ae7c6fdb1d03e8bc73a32d2c8b7bafa057d304370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000002386f26fc10000688f4568688f524c688f47cf688f4577688f6188688f5378688f4ec8688f47c0000000000000000000000000000000000000000000000000000000688f5954";

// DemoResolver createDstEscrow function ABI
const createDstEscrowABI = [
  {
    inputs: [
      {
        components: [
          { name: "orderHash", type: "bytes32" },
          { name: "hashlock", type: "bytes32" },
          { name: "maker", type: "uint256" },
          { name: "taker", type: "uint256" },
          { name: "token", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "safetyDeposit", type: "uint256" },
          { name: "timelocks", type: "uint256" },
        ],
        name: "dstImmutables",
        type: "tuple",
      },
      { name: "srcCancellationTimestamp", type: "uint256" },
    ],
    name: "createDstEscrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

async function decodeTransactionData() {
  console.log("🔍 Decoding transaction data for createDstEscrow call");

  try {
    const iface = new ethers.Interface(createDstEscrowABI);
    const decoded = iface.parseTransaction({ data: txData });

    console.log("✅ Successfully decoded transaction:");
    console.log("Function:", decoded.name);
    console.log("Arguments:");

    const dstImmutables = decoded.args[0];
    const srcCancellationTimestamp = decoded.args[1];

    console.log("\n📋 dstImmutables:");
    console.log("  orderHash:", dstImmutables[0]);
    console.log("  hashlock:", dstImmutables[1]);
    console.log("  maker:", dstImmutables[2].toString());
    console.log("  taker:", dstImmutables[3].toString());
    console.log("  token:", dstImmutables[4].toString());
    console.log("  amount:", dstImmutables[5].toString());
    console.log("  safetyDeposit:", dstImmutables[6].toString());
    console.log("  timelocks:", dstImmutables[7].toString());

    console.log(
      "\n📋 srcCancellationTimestamp:",
      srcCancellationTimestamp.toString()
    );

    // Decode the timelocks value
    console.log("\n🔍 Decoding timelocks value:");
    const timelocksValue = BigInt(dstImmutables[7].toString());
    console.log("  Raw timelocks value:", timelocksValue.toString());
    console.log("  As hex:", "0x" + timelocksValue.toString(16));

    // Try to extract the deployed timestamp (top 32 bits)
    const deployedAt = Number(timelocksValue >> 224n);
    console.log("  Extracted deployedAt:", deployedAt);
    console.log(
      "  DeployedAt as date:",
      new Date(deployedAt * 1000).toISOString()
    );

    // Compare with srcCancellationTimestamp
    console.log("\n⚖️ Comparison:");
    console.log(
      "  srcCancellationTimestamp:",
      srcCancellationTimestamp.toString()
    );
    console.log("  deployedAt from timelocks:", deployedAt);
    console.log(
      "  Difference:",
      Number(srcCancellationTimestamp) - deployedAt,
      "seconds"
    );
  } catch (error) {
    console.log("❌ Failed to decode transaction data:", error.message);
  }
}

decodeTransactionData().catch(console.error);
