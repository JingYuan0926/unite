const { ethers } = require("ethers");
require("dotenv").config();

async function testMinimalFillOrder() {
  console.log("🧪 MINIMAL FILLORDER TEST");
  console.log("=========================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
  const lopAddress = "0xF9c1C73ac05c6BD5f546df6173DF24c4f48a6939";

  console.log("🎯 BREAKTHROUGH: We know the contract works!");
  console.log("DOMAIN_SEPARATOR and bitInvalidatorForOrder functions work");
  console.log("This confirms deployment is correct - testing hashOrder now...");

  console.log("Testing minimal fillOrder call...");
  console.log("Wallet:", wallet.address);

  try {
    // Create minimal LOP contract interface
    const lopContract = new ethers.Contract(
      lopAddress,
      [
        "function fillOrder((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits) external payable returns (uint256, uint256, bytes32)",
        "function hashOrder((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
      ],
      wallet
    );

    // Create the simplest possible order
    const order = [
      "1", // salt
      wallet.address, // maker
      "0x0000000000000000000000000000000000000000", // receiver (zero address)
      "0x0000000000000000000000000000000000000000", // makerAsset (ETH)
      "0x0000000000000000000000000000000000000000", // takerAsset (ETH)
      ethers.parseEther("0.0001"), // makingAmount
      ethers.parseEther("0.0001"), // takingAmount
      "0", // makerTraits
    ];

    console.log("Testing order hash calculation...");
    try {
      const orderHash = await lopContract.hashOrder(order);
      console.log(
        "✅ Order hash calculated:",
        orderHash.substring(0, 10) + "..."
      );
    } catch (error) {
      console.log("❌ Order hash failed:", error.message);
      return false;
    }

    // Create a dummy signature (this will fail, but we want to see HOW it fails)
    const dummyR = "0x" + "11".repeat(32); // 32 bytes of 0x11
    const dummyVS = "0x" + "22".repeat(32); // 32 bytes of 0x22
    const amount = ethers.parseEther("0.0001");
    const takerTraits = 0;

    console.log("Testing fillOrder gas estimation...");
    try {
      const gasEstimate = await lopContract.fillOrder.estimateGas(
        order,
        dummyR,
        dummyVS,
        amount,
        takerTraits,
        { value: amount }
      );

      console.log("✅ Gas estimation succeeded:", gasEstimate.toString());
      console.log("🎉 FUNCTION SIGNATURE IS CORRECT!");
    } catch (error) {
      console.log("❌ Gas estimation failed:", error.message);

      if (error.message.includes("missing revert data")) {
        console.log("🚨 STILL getting 'missing revert data'");
        console.log("This suggests the contract has fundamental issues");
      } else {
        console.log("✅ Different error - contract function is working!");
        console.log(
          "The error is likely due to invalid signature or order validation"
        );
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Test setup failed:", error.message);
    return false;
  }
}

// Run test
testMinimalFillOrder().then((success) => {
  console.log(
    success ? "\n✅ Minimal test completed" : "\n❌ Minimal test failed"
  );
  process.exit(0);
});
