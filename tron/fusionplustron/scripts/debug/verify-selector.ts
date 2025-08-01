#!/usr/bin/env ts-node

import { ethers } from "ethers";

const abi = [
  "function deploySrc((bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, (uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits, bytes args) payable",
];

const iface = new ethers.Interface(abi);
const fragment = iface.getFunction("deploySrc");
console.log("Function signature:", fragment?.format("full"));
console.log("Function selector:", iface.getFunction("deploySrc")?.selector);
console.log("Expected selector: 0x8d5a5c5c");
console.log(
  "Selectors match:",
  iface.getFunction("deploySrc")?.selector === "0x8d5a5c5c"
);
