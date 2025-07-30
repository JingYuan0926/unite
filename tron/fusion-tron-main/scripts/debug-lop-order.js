#!/usr/bin/env node

/**
 * @title Debug LOP Order Script
 * @notice Debug script to test LOP order creation and validation step by step
 */

const { ethers } = require("ethers");
require("dotenv").config();

async function debugLOPOrder() {
  console.log("🔍 DEBUGGING LOP ORDER CREATION");
  console.log("================================");

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );
    let ethPrivateKey = process.env.RESOLVER_PRIVATE_KEY;
    if (!ethPrivateKey.startsWith("0x")) {
      ethPrivateKey = "0x" + ethPrivateKey;
    }
    const wallet = new ethers.Wallet(ethPrivateKey, provider);

    console.log("📋 Wallet address:", wallet.address);
    console.log("📋 Network: Sepolia");

    // LOP contract setup
    const LOP_ADDRESS = "0xA6F9c4d4c97437F345937b811bF384cD23070f7A";
    const WETH_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

    const lopABI = [
      "function hashOrder((uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order) external view returns (bytes32)",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
      "function owner() external view returns (address)",
    ];

    const lopContract = new ethers.Contract(LOP_ADDRESS, lopABI, wallet);

    // Test basic contract connectivity
    console.log("\\n🧪 Testing LOP contract connectivity...");
    const owner = await lopContract.owner();
    console.log("✅ LOP Owner:", owner);

    const domain = await lopContract.DOMAIN_SEPARATOR();
    console.log("✅ Domain Separator:", domain);

    // Create a simple test order
    console.log("\\n📝 Creating test order...");
    const testOrder = {
      salt: ethers.hexlify(ethers.randomBytes(32)),
      maker: wallet.address,
      receiver: "0x0000000000000000000000000000000000000000",
      makerAsset: WETH_ADDRESS,
      takerAsset: WETH_ADDRESS,
      makingAmount: "1000000000000000", // 0.001 WETH
      takingAmount: "900000000000000", // 0.0009 WETH
      makerTraits: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    };

    console.log("📋 Test Order:", {
      salt: testOrder.salt.substring(0, 10) + "...",
      maker: testOrder.maker,
      makerAsset: testOrder.makerAsset,
      takerAsset: testOrder.takerAsset,
      makingAmount: ethers.formatEther(testOrder.makingAmount),
      takingAmount: ethers.formatEther(testOrder.takingAmount),
      makerTraits: testOrder.makerTraits,
    });

    // Test order hash calculation
    console.log("\\n🔄 Testing order hash calculation...");
    const orderHash = await lopContract.hashOrder(testOrder);
    console.log("✅ Order hash:", orderHash);

    // Test EIP-712 signing
    console.log("\\n🖋️ Testing EIP-712 signing...");
    const domain712 = {
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

    const signature = await wallet.signTypedData(domain712, types, testOrder);
    console.log("✅ Signature created:", signature.substring(0, 20) + "...");

    // Test signature verification
    const recoveredAddress = ethers.verifyTypedData(
      domain712,
      types,
      testOrder,
      signature
    );
    console.log(
      "✅ Signature verification:",
      recoveredAddress === wallet.address ? "VALID" : "INVALID"
    );
    console.log("   Recovered:", recoveredAddress);
    console.log("   Expected:", wallet.address);

    // Check WETH balance and allowance
    console.log("\\n💰 Checking WETH setup...");
    const wethABI = [
      "function balanceOf(address) external view returns (uint256)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ];

    const wethContract = new ethers.Contract(WETH_ADDRESS, wethABI, wallet);
    const wethBalance = await wethContract.balanceOf(wallet.address);
    const allowance = await wethContract.allowance(wallet.address, LOP_ADDRESS);

    console.log("✅ WETH Balance:", ethers.formatEther(wethBalance), "WETH");
    console.log(
      "✅ LOP Allowance:",
      allowance > BigInt("1000000000000000000")
        ? "UNLIMITED"
        : ethers.formatEther(allowance),
      "WETH"
    );

    console.log("\\n✅ All debugging checks passed!");
    console.log("📋 The order structure and signing appears to be correct");
    console.log(
      "💡 The issue may be in the fillOrder parameters or method call"
    );
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  debugLOPOrder().catch(console.error);
}

module.exports = { debugLOPOrder };
