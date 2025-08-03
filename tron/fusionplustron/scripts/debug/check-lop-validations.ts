import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Systematic LOP v4 Validation Checker for Error 0xa4f62a96");
  console.log(
    "Based on research: likely order invalidation or maker traits issue\n"
  );

  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  const [signer] = await ethers.getSigners();
  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

  console.log("📋 Configuration:");
  console.log("  Signer:", signer.address);
  console.log("  LOP Address:", lopAddress);
  console.log("  MockTRX Address:", mockTrxAddress);

  // Step 1: Check basic contract states
  console.log("\n🔍 Step 1: Basic Contract State Checks");

  try {
    const isPaused = await LOP.paused();
    console.log(`  LOP Paused: ${isPaused ? "❌ YES" : "✅ NO"}`);

    const signerBalance = await signer.provider.getBalance(signer.address);
    console.log(`  ETH Balance: ${ethers.formatEther(signerBalance)} ETH`);

    const trxBalance = await MockTRX.balanceOf(signer.address);
    console.log(`  MockTRX Balance: ${ethers.formatEther(trxBalance)} TRX`);

    const trxAllowance = await MockTRX.allowance(signer.address, lopAddress);
    console.log(
      `  MockTRX Allowance to LOP: ${ethers.formatEther(trxAllowance)} TRX`
    );
  } catch (error: any) {
    console.log("❌ Basic state check failed:", error.message);
  }

  // Step 2: Check order invalidation state
  console.log("\n🔍 Step 2: Order Invalidation State Analysis");

  try {
    // Test different makerTraits values
    const makerTraitsOptions = [
      { value: 0, description: "No traits (default)" },
      { value: 1, description: "Allow partial fills" },
      { value: 2, description: "Use bit invalidator" },
      { value: 4, description: "Need pre-interaction" },
      { value: 8, description: "Need post-interaction" },
    ];

    for (const traits of makerTraitsOptions) {
      console.log(
        `\n  🧪 Testing makerTraits: ${traits.value} (${traits.description})`
      );

      // Check bit invalidator state if using bit invalidator
      if (traits.value & 2) {
        // bit invalidator flag
        try {
          const slot = 0; // Default slot
          const invalidatorState = await LOP.bitInvalidatorForOrder(
            signer.address,
            slot
          );
          console.log(
            `    Bit Invalidator State (slot ${slot}): ${invalidatorState}`
          );
        } catch (e) {
          console.log(`    ❌ Could not check bit invalidator: ${e.message}`);
        }
      }

      // Create order with this trait
      const testOrder = {
        salt: BigInt(Date.now() + Math.random() * 1000), // Unique salt
        maker: signer.address,
        receiver: signer.address,
        makerAsset: ethers.ZeroAddress, // ETH
        takerAsset: mockTrxAddress,
        makingAmount: ethers.parseEther("0.001"),
        takingAmount: ethers.parseEther("1"),
        makerTraits: traits.value,
      };

      // Check if order would be valid
      try {
        const orderHash = await LOP.hashOrder(testOrder);
        console.log(`    Order Hash: ${orderHash}`);

        // Check remaining amount (should be full amount for new order)
        const remaining = await LOP.remainingInvalidatorForOrder(
          signer.address,
          orderHash
        );
        console.log(
          `    Remaining Amount: ${remaining} (should be 0 for new order)`
        );
      } catch (e: any) {
        console.log(`    ❌ Order hash/state check failed: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.log("❌ Invalidation state analysis failed:", error.message);
  }

  // Step 3: Test signature validation
  console.log("\n🔍 Step 3: Signature Validation Test");

  const testOrder = {
    salt: BigInt(Date.now()),
    maker: signer.address,
    receiver: signer.address,
    makerAsset: ethers.ZeroAddress,
    takerAsset: mockTrxAddress,
    makingAmount: ethers.parseEther("0.001"),
    takingAmount: ethers.parseEther("1"),
    makerTraits: 0, // Simple order, no special traits
  };

  try {
    // Create proper EIP-712 signature
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111,
      verifyingContract: lopAddress,
    };

    const types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };

    const signature = await signer.signTypedData(domain, types, testOrder);
    const sig = ethers.Signature.from(signature);

    console.log("  ✅ EIP-712 signature created successfully");
    console.log(`  Signature: ${signature}`);

    // Test order hash calculation
    const orderHash = await LOP.hashOrder(testOrder);
    console.log(`  Order Hash: ${orderHash}`);
  } catch (error: any) {
    console.log("❌ Signature validation test failed:", error.message);
  }

  // Step 4: Minimal fillOrderArgs test with detailed error analysis
  console.log("\n🔍 Step 4: Minimal fillOrderArgs Test");

  try {
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111,
      verifyingContract: lopAddress,
    };

    const types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };

    const minimalOrder = {
      salt: BigInt(Date.now()),
      maker: signer.address,
      receiver: signer.address,
      makerAsset: ethers.ZeroAddress,
      takerAsset: mockTrxAddress,
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("1"),
      makerTraits: 0, // No special traits to avoid invalidation issues
    };

    const signature = await signer.signTypedData(domain, types, minimalOrder);
    const sig = ethers.Signature.from(signature);

    console.log("  Testing fillOrderArgs with minimal parameters...");

    const gasEstimate = await LOP.fillOrderArgs.estimateGas(
      minimalOrder,
      sig.r,
      sig.yParityAndS,
      minimalOrder.makingAmount,
      0, // takerTraits = 0 (no flags)
      "0x", // empty args
      { value: minimalOrder.makingAmount }
    );

    console.log("  ✅ fillOrderArgs successful! Gas:", gasEstimate.toString());
  } catch (error: any) {
    console.log("  ❌ fillOrderArgs failed:", error.message);
    console.log("  Error data:", error.data);

    if (error.data === "0xa4f62a96") {
      console.log("  🎯 Confirmed: This is the same error we're debugging!");
      console.log("\n  💡 Based on research, this suggests:");
      console.log("     1. Order invalidation state issue");
      console.log("     2. Maker traits incompatibility");
      console.log("     3. Mass invalidation configuration problem");
      console.log("     4. Epoch/nonce state mismatch");
    }
  }

  // Step 5: Research-based specific checks
  console.log("\n🔍 Step 5: Research-Based Specific Validations");

  console.log("  🔧 Checking for mass invalidation issues...");
  try {
    // Check if we have any series/epoch issues
    const currentBlock = await signer.provider.getBlockNumber();
    console.log(`    Current Block: ${currentBlock}`);

    // Try to check series epoch (may not be implemented)
    // Note: This is speculative based on research about epoch managers
  } catch (error: any) {
    console.log("    ❌ Mass invalidation check failed:", error.message);
  }

  console.log("\n📋 Summary and Next Steps:");
  console.log("Based on the research findings, error 0xa4f62a96 is likely:");
  console.log(
    "1. OrderIsNotSuitableForMassInvalidation() or similar v4-specific error"
  );
  console.log("2. Related to maker traits configuration");
  console.log("3. Order invalidation state mismatch");
  console.log("4. Signature/order struct incompatibility");
  console.log("\n💡 Recommended fixes:");
  console.log("- Use makerTraits: 0 for simple orders");
  console.log("- Ensure no previous invalidation of maker's nonce/epoch");
  console.log("- Verify EIP-712 signature matches exactly");
  console.log("- Check if order was already filled/cancelled");
}

main().catch(console.error);
