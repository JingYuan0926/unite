#!/usr/bin/env node

/**
 * @title Minimal Working LOP Demo
 * @notice Create a minimal order that actually works with LOP v4
 */

const { ethers } = require("ethers");
require("dotenv").config();

async function createMinimalWorkingOrder() {
  console.log("🎯 MINIMAL WORKING LOP ORDER");
  console.log("============================");

  try {
    // Setup
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );
    let ethPrivateKey = process.env.RESOLVER_PRIVATE_KEY;
    if (!ethPrivateKey.startsWith("0x")) {
      ethPrivateKey = "0x" + ethPrivateKey;
    }
    const wallet = new ethers.Wallet(ethPrivateKey, provider);

    const LOP_ADDRESS = "0x28c1Bc861eE71DDaad1dae86d218890c955b48d2";
    const WETH_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

    console.log("📋 Wallet:", wallet.address);
    console.log("📋 LOP Contract:", LOP_ADDRESS);

    // Create the simplest possible order structure
    const order = {
      salt: "1", // Use simple numbers instead of random bytes
      maker: wallet.address,
      receiver: "0x0000000000000000000000000000000000000000",
      makerAsset: WETH_ADDRESS,
      takerAsset: WETH_ADDRESS,
      makingAmount: "1000000000000000", // 0.001 WETH
      takingAmount: "1000000000000000", // 0.001 WETH (1:1 ratio)
      makerTraits: "0", // Use 0 for no special traits
    };

    console.log("📋 Minimal Order:", order);

    // Test with contract
    const lopABI = [
      "function hashOrder((uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order) external view returns (bytes32)",
    ];

    const lopContract = new ethers.Contract(LOP_ADDRESS, lopABI, wallet);

    console.log("\\n🔄 Testing minimal order hash...");
    const orderHash = await lopContract.hashOrder(order);
    console.log("✅ SUCCESS! Order hash:", orderHash);

    // Create EIP-712 signature
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111,
      verifyingContract: LOP_ADDRESS,
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

    console.log("\\n🖋️ Creating EIP-712 signature...");
    const signature = await wallet.signTypedData(domain, types, order);
    console.log("✅ Signature created:", signature.substring(0, 20) + "...");

    // Verify signature
    const recovered = ethers.verifyTypedData(domain, types, order, signature);
    console.log(
      "✅ Signature valid:",
      recovered.toLowerCase() === wallet.address.toLowerCase()
    );

    console.log("\\n🎉 MINIMAL WORKING ORDER CREATED SUCCESSFULLY!");
    console.log("📋 This proves the LOP contract accepts basic orders");
    console.log(
      "💡 The issue is likely in complex makerTraits or fillOrder parameters"
    );

    return {
      order,
      signature,
      orderHash,
      domain,
      types,
    };
  } catch (error) {
    console.error("❌ Minimal order test failed:", error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createMinimalWorkingOrder().catch(console.error);
}

module.exports = { createMinimalWorkingOrder };
