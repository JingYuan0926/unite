import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing LOP fillOrderArgs directly...");

  // Read deployment addresses
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const lopAddress = deployment.contracts.LimitOrderProtocol;

  console.log("📋 LOP Address:", lopAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📋 Signer Address:", signer.address);

  try {
    // Use actual LOP contract ABI
    const lopABI = [
      "function fillOrderArgs(tuple(uint256,address,address,address,address,uint256,uint256,uint256), bytes32, bytes32, uint256, uint256, bytes) external",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
    ];

    const lopContract = new ethers.Contract(lopAddress, lopABI, signer);

    // Create a simple order that should be valid (as object for signing)
    const orderObject = {
      salt: BigInt(Date.now()),
      maker: signer.address,
      receiver: signer.address,
      makerAsset: ethers.ZeroAddress, // ETH (what maker gives)
      takerAsset: lopAddress, // Use LOP address as dummy token to avoid same-asset issue
      makingAmount: ethers.parseEther("0.001"), // 0.001 ETH
      takingAmount: 1, // Minimal amount to avoid division issues
      makerTraits: 0, // No traits to avoid predicate issues
    };

    // Convert to array format for contract call (tuple format)
    const order = [
      orderObject.salt,
      orderObject.maker,
      orderObject.receiver,
      orderObject.makerAsset,
      orderObject.takerAsset,
      orderObject.makingAmount,
      orderObject.takingAmount,
      orderObject.makerTraits,
    ];

    // Generate proper signature
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

    const signature = await signer.signTypedData(domain, types, orderObject);
    const sig = ethers.Signature.from(signature);

    console.log("✅ Generated signature for direct LOP test");
    console.log("📋 Order:", order);

    // Test 1: Try with minimal parameters (no args)
    try {
      console.log("\n🔍 Test 1: LOP fillOrderArgs with minimal parameters...");

      const gasEstimate = await lopContract.fillOrderArgs.estimateGas(
        order,
        sig.r,
        sig.yParityAndS,
        orderObject.makingAmount,
        0, // takerTraits
        "0x", // args
        { value: orderObject.makingAmount }
      );

      console.log("✅ Direct LOP call Gas Estimate:", gasEstimate.toString());
    } catch (error: any) {
      console.log("❌ Direct LOP call failed:");
      console.log("   Error:", error.message);
      if (error.data) {
        console.log("   Error Data:", error.data);

        // Check if this is our mysterious error
        if (error.data === "0xa4f62a96") {
          console.log("🎯 Found the same error in direct LOP call!");
          console.log(
            "   This confirms the issue is in LOP contract validation"
          );
        }
      }
    }

    // Test 2: Try with different takerTraits (the flag that triggers postInteraction)
    try {
      console.log(
        "\n🔍 Test 2: LOP fillOrderArgs with postInteraction flag..."
      );

      const takerTraitsWithFlag = BigInt(1) << BigInt(251); // _ARGS_HAS_TARGET flag

      const gasEstimate2 = await lopContract.fillOrderArgs.estimateGas(
        order,
        sig.r,
        sig.yParityAndS,
        orderObject.makingAmount,
        takerTraitsWithFlag,
        ethers.solidityPacked(["address"], [lopAddress]), // dummy args with address
        { value: orderObject.makingAmount }
      );

      console.log(
        "✅ LOP with postInteraction flag Gas Estimate:",
        gasEstimate2.toString()
      );
    } catch (error: any) {
      console.log("❌ LOP with postInteraction flag failed:");
      console.log("   Error:", error.message);
      if (error.data) {
        console.log("   Error Data:", error.data);
      }
    }
  } catch (error: any) {
    console.error("❌ LOP direct test failed:", error.message);
  }
}

main().catch(console.error);
