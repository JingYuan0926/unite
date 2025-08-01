#!/usr/bin/env ts-node

/**
 * Decode the transaction data to understand what parameters are being sent
 */

import { ethers } from "ethers";

async function decodeTransactionData() {
  const txData =
    "0x8d5a5c5c6d305dc733f9cee565fab78e421c356dd88dbba0af423a36c0f3df6dc7cfc8b01014c1824f53e351a9656d9012387a9ff9cdd29f71c87713be94f0130ea01bf000000000000000000000000032f91e4e2c60a9c16cae736d3b42152b331c147f00000000000000000000000032f91e4e2c60a9c16cae736d3b42152b331c147f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000002386f26fc100000000000000000ce4000003840000012c00001c2000000e10000007080000025800000000000000000000000000000000000000000000000000000001986636027700000000000000000000000032f91e4e2c60a9c16cae736d3b42152b331c147f00000000000000000000000032f91e4e2c60a9c16cae736d3b42152b331c147f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000000000000000091bd58e0d7fbe45d8ae556cb266d72cbe67e26fbbd3583dcd6641b76413759420a89125a93df87fb738d81476bb72aad3cbff132a1138f9bf59b24cc9d3108c4000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000000";

  // Extract function selector
  const functionSelector = txData.slice(0, 10);
  console.log("Function Selector:", functionSelector);

  // The expected function selector for deploySrc
  const expectedSelector = ethers
    .id(
      "deploySrc(tuple(bytes32,bytes32,address,address,address,uint256,uint256,uint256),tuple(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)"
    )
    .slice(0, 10);
  console.log("Expected Selector:", expectedSelector);
  console.log("Selectors match:", functionSelector === expectedSelector);

  // Try to decode with our ABI
  const abi = [
    "function deploySrc(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, tuple(uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits, bytes args) payable",
  ];

  const iface = new ethers.Interface(abi);

  try {
    const decoded = iface.parseTransaction({ data: txData });
    console.log("\n✅ Successfully decoded transaction:");
    console.log("Function:", decoded?.name);
    console.log("Args:", decoded?.args);

    if (decoded && decoded.args) {
      console.log("\n📊 Detailed Parameters:");
      console.log("Immutables:", {
        orderHash: decoded.args[0].orderHash,
        hashlock: decoded.args[0].hashlock,
        maker: decoded.args[0].maker,
        taker: decoded.args[0].taker,
        token: decoded.args[0].token,
        amount: decoded.args[0].amount.toString(),
        safetyDeposit: decoded.args[0].safetyDeposit.toString(),
        timelocks: decoded.args[0].timelocks.toString(),
      });

      console.log("Order:", {
        salt: decoded.args[1].salt.toString(),
        maker: decoded.args[1].maker,
        receiver: decoded.args[1].receiver,
        makerAsset: decoded.args[1].makerAsset,
        takerAsset: decoded.args[1].takerAsset,
        makingAmount: decoded.args[1].makingAmount.toString(),
        takingAmount: decoded.args[1].takingAmount.toString(),
        makerTraits: decoded.args[1].makerTraits.toString(),
      });

      console.log("Signature:", {
        r: decoded.args[2],
        vs: decoded.args[3],
      });

      console.log("Other params:", {
        amount: decoded.args[4].toString(),
        takerTraits: decoded.args[5].toString(),
        args: decoded.args[6],
      });
    }
  } catch (error) {
    console.error("❌ Failed to decode transaction:", error);
  }
}

decodeTransactionData().catch(console.error);
