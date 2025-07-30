// SPDX-License-Identifier: MIT

/**
 * @title LOP Integration Index
 * @notice Entry point for Fusion-Tron LOP integration
 */

export { FusionOrderBuilder } from "./OrderBuilder.js";
export { FusionAPI } from "./FusionAPI.js";
export * from "./types.js";

// Helper function to load deployed contract addresses
export function loadDeployedAddresses() {
  const fs = require("fs");
  const path = require("path");

  try {
    // Load LOP deployment
    const lopPath = path.join(process.cwd(), "deployments", "sepolia-lop.json");
    const lopDeployment = JSON.parse(fs.readFileSync(lopPath, "utf8"));

    // Load FusionExtension deployment
    const fusionPath = path.join(
      process.cwd(),
      "deployments",
      "sepolia-fusion-extension.json"
    );
    const fusionDeployment = JSON.parse(fs.readFileSync(fusionPath, "utf8"));

    // Load EscrowFactory deployment
    const escrowPath = path.join(
      process.cwd(),
      "deployments",
      "sepolia-escrow-factory-updated.json"
    );
    const escrowDeployment = JSON.parse(fs.readFileSync(escrowPath, "utf8"));

    return {
      limitOrderProtocol: lopDeployment.limitOrderProtocol,
      fusionExtension: fusionDeployment.fusionExtension,
      escrowFactory: escrowDeployment.escrowFactory,
      weth: lopDeployment.weth,
    };
  } catch (error) {
    throw new Error(`Failed to load deployed addresses: ${error.message}`);
  }
}
