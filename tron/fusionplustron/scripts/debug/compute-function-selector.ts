#!/usr/bin/env ts-node

/**
 * Compute the correct function selector for deploySrc
 */

import { ethers } from "ethers";

function computeFunctionSelectors() {
  console.log("🔍 Computing function selectors for different signatures:");

  // What we currently have
  const currentSig =
    "deploySrc(tuple(bytes32,bytes32,address,address,address,uint256,uint256,uint256),tuple(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)";
  console.log("Current signature:", currentSig);
  console.log("Current selector:", ethers.id(currentSig).slice(0, 10));

  // Let's try different variations
  const variations = [
    // Maybe the tuple names matter?
    "deploySrc((bytes32,bytes32,address,address,address,uint256,uint256,uint256),(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)",

    // Maybe there are different parameter types?
    "deploySrc(tuple(bytes32,bytes32,address,address,address,uint256,uint256,uint256),tuple(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)",

    // Check if it's actually using different types
    "deploySrc(tuple(bytes32,bytes32,address,address,address,uint256,uint256,uint256),tuple(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)",
  ];

  variations.forEach((sig, index) => {
    const selector = ethers.id(sig).slice(0, 10);
    console.log(`Variation ${index + 1}: ${selector} - ${sig}`);
  });

  // Let's reverse engineer: what function signature gives us 0x8d5a5c5c?
  console.log("\n🔍 Looking for signature that produces 0x8d5a5c5c...");

  // Let's try the exact parameter names from the contract
  const contractSig =
    "deploySrc((bytes32,bytes32,address,address,address,uint256,uint256,uint256),(uint256,address,address,address,address,uint256,uint256,uint256),bytes32,bytes32,uint256,uint256,bytes)";
  console.log("Contract-style signature:", contractSig);
  console.log("Contract-style selector:", ethers.id(contractSig).slice(0, 10));
}

computeFunctionSelectors();
