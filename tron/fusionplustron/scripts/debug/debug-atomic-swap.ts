import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging DemoResolver executeAtomicSwap function...");

  // Read the deployment addresses
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const demoResolverAddress = deployment.contracts.DemoResolver;

  console.log("📋 DemoResolver Address:", demoResolverAddress);

  // Get contract instance
  const DemoResolver = await ethers.getContractFactory("DemoResolver");
  const demoResolver = DemoResolver.attach(demoResolverAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📋 Signer Address:", signer.address);
  console.log(
    "💰 Signer Balance:",
    ethers.formatEther(await signer.provider.getBalance(signer.address))
  );

  // Test basic contract interaction first
  try {
    console.log("\n🔍 Step 1: Testing basic contract calls...");

    const lopAddress = await demoResolver.LOP();
    const escrowFactoryAddress = await demoResolver.ESCROW_FACTORY();

    console.log("✅ LOP Address:", lopAddress);
    console.log("✅ EscrowFactory Address:", escrowFactoryAddress);
  } catch (error) {
    console.error("❌ Basic contract calls failed:", error);
    return;
  }

  // Test with minimal valid parameters
  try {
    console.log(
      "\n🔍 Step 2: Testing executeAtomicSwap with minimal parameters..."
    );

    // Helper function to encode timelocks properly
    function encodeTimelocks(timelocks: {
      deployedAt: number;
      srcWithdrawal: number;
      srcCancellation: number;
      dstWithdrawal: number;
      dstCancellation: number;
    }): bigint {
      const srcWithdrawal = BigInt(timelocks.srcWithdrawal);
      const srcPublicWithdrawal = BigInt(timelocks.srcWithdrawal + 1800); // +30 min
      const srcCancellation = BigInt(timelocks.srcCancellation);
      const srcPublicCancellation = BigInt(timelocks.srcCancellation + 3600); // +1 hour
      const dstWithdrawal = BigInt(timelocks.dstWithdrawal);
      const dstPublicWithdrawal = BigInt(timelocks.dstWithdrawal + 600); // +10 min
      const dstCancellation = BigInt(timelocks.dstCancellation);

      const packed =
        (srcWithdrawal << (BigInt(0) * BigInt(32))) |
        (srcPublicWithdrawal << (BigInt(1) * BigInt(32))) |
        (srcCancellation << (BigInt(2) * BigInt(32))) |
        (srcPublicCancellation << (BigInt(3) * BigInt(32))) |
        (dstWithdrawal << (BigInt(4) * BigInt(32))) |
        (dstPublicWithdrawal << (BigInt(5) * BigInt(32))) |
        (dstCancellation << (BigInt(6) * BigInt(32)));

      return packed;
    }

    // Create proper timelocks
    const now = Math.floor(Date.now() / 1000);
    const properTimelocks = encodeTimelocks({
      deployedAt: now,
      srcWithdrawal: now + 600, // 10 minutes
      srcCancellation: now + 3600, // 1 hour
      dstWithdrawal: now + 15, // 15 seconds
      dstCancellation: now + 3300, // 55 minutes
    });

    // Helper function to properly encode addresses
    function encodeAddress(addr: string): bigint {
      return BigInt(addr); // Convert hex address to BigInt
    }

    // Create minimal immutables as ARRAY (tuple format) - this is the correct format!
    const immutables = [
      ethers.ZeroHash, // orderHash
      ethers.keccak256(ethers.toUtf8Bytes("test-secret")), // hashlock
      encodeAddress(signer.address), // maker (Address type)
      encodeAddress(demoResolverAddress), // taker (Address type)
      encodeAddress(ethers.ZeroAddress), // token (ETH as Address type)
      ethers.parseEther("0.001"), // amount
      ethers.parseEther("0.001"), // safetyDeposit
      properTimelocks, // properly encoded timelocks
    ];

    // Create standard 8-field order for LOP v4 (simplified, no expiry/predicate)
    const orderForSigning = {
      salt: BigInt(Date.now()), // Use unique salt to avoid conflicts
      maker: signer.address,
      receiver: signer.address,
      makerAsset: ethers.ZeroAddress, // ETH (what maker is giving)
      takerAsset: "0x74Fc932f869f088D2a9516AfAd239047bEb209BF", // MockTRX token
      makingAmount: ethers.parseEther("0.001"), // Amount maker is giving (ETH)
      takingAmount: ethers.parseEther("1"), // Amount taker should give (MockTRX)
      makerTraits: 0, // No special traits - standard order
    };

    // Step 2: Create the 8-field array for DemoResolver contract call
    const orderForContractCall = [
      orderForSigning.salt,
      orderForSigning.maker,
      orderForSigning.receiver,
      orderForSigning.makerAsset,
      orderForSigning.takerAsset,
      orderForSigning.makingAmount,
      orderForSigning.takingAmount,
      orderForSigning.makerTraits,
    ];

    const totalValue = immutables[5] + immutables[6]; // amount + safetyDeposit

    console.log("📋 Test Parameters:");
    console.log("   Immutables Array:", immutables);
    console.log("   Order for Contract Call:", orderForContractCall);
    console.log("   Amount:", ethers.formatEther(immutables[5]), "ETH");
    console.log("   Safety Deposit:", ethers.formatEther(immutables[6]), "ETH");
    console.log("   Total Value:", ethers.formatEther(totalValue), "ETH");

    // Generate proper signature first
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0",
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

    const signature = await signer.signTypedData(
      domain,
      types,
      orderForSigning
    );
    const sig = ethers.Signature.from(signature);

    console.log("✅ Generated proper signature for testing");

    // Try the call with estimation first
    try {
      const gasEstimate = await demoResolver.executeAtomicSwap.estimateGas(
        immutables,
        orderForContractCall,
        sig.r, // proper r
        sig.yParityAndS, // proper vs
        immutables[5], // amount
        0, // takerTraits
        "0x", // args
        { value: totalValue }
      );

      console.log("✅ Gas Estimate:", gasEstimate.toString());
    } catch (estimateError: any) {
      console.log("❌ Gas Estimation Failed:");
      console.log("   Error:", estimateError.message);

      if (estimateError.data) {
        console.log("   Error Data:", estimateError.data);
      }

      // Try to decode the revert reason
      try {
        const decodedError = demoResolver.interface.parseError(
          estimateError.data
        );
        console.log("   Decoded Error:", decodedError);
      } catch (decodeErr) {
        console.log("   Could not decode error");
      }
    }
  } catch (error: any) {
    console.error("❌ executeAtomicSwap test failed:", error.message);
  }

  // Test simple swap function as fallback
  try {
    console.log("\n🔍 Step 3: Testing executeSimpleSwap (fallback method)...");

    const simpleAmount = ethers.parseEther("0.001");
    const simpleSafetyDeposit = ethers.parseEther("0.001");
    const totalSimpleValue = simpleAmount + simpleSafetyDeposit;

    const gasEstimate = await demoResolver.executeSimpleSwap.estimateGas(
      ethers.ZeroHash, // orderHash
      simpleAmount,
      simpleSafetyDeposit,
      signer.address, // maker
      { value: totalSimpleValue }
    );

    console.log("✅ Simple Swap Gas Estimate:", gasEstimate.toString());
    console.log(
      "✅ executeSimpleSwap function works - issue is with executeAtomicSwap"
    );
  } catch (error: any) {
    console.error("❌ executeSimpleSwap also failed:", error.message);
  }
}

main().catch(console.error);
