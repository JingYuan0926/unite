require("dotenv").config();
const crypto = require("crypto");
const { ethers } = require("ethers");
const xrpl = require("xrpl");
const { XRPLEscrowClient, XRPLEscrowUtils } = require("../xrpl-tee/client.js");

/**
 * Enhanced EVM to XRPL Cross-Chain Swap Example with Real EVM Integration
 *
 * This example demonstrates a complete cross-chain atomic swap with:
 * - Real EVM contract interactions (requires deployed EscrowFactory)
 * - Real XRPL testnet transactions via TEE server
 * - Full event monitoring and coordination
 */

// EscrowFactory ABI (from the compiled contract)
const ESCROW_FACTORY_ABI = [
  "function createDstEscrow(tuple(bytes32 orderHash, bytes32 hashlock, uint256 maker, uint256 taker, uint256 token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) dstImmutables, uint256 srcCancellationTimestamp) external payable",
  "event DstEscrowCreated(address escrow, bytes32 hashlock, uint256 taker)",
  "event SrcEscrowCreated(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables, tuple(address token, uint256 amount, address resolver, uint128 fee, uint256 timelocks) immutablesComplement)",
  "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
  "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
];

// Escrow contract ABI (simplified)
const ESCROW_ABI = [
  "function withdraw(bytes32 secret, tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function cancel(tuple(bytes32 orderHash, bytes32 hashlock, address maker, address taker, address token, uint256 amount, uint256 safetyDeposit, uint256 timelocks) immutables) external",
  "function getStatus() external view returns (uint8)",
  "event EscrowWithdrawal(bytes32 secret)",
  "event EscrowCancelled()",
];

class EnhancedCrossChainSwap {
  constructor(config) {
    this.config = config;

    // EVM setup
    this.evmProvider = new ethers.JsonRpcProvider(config.evm.rpcUrl);
    this.evmWallet = new ethers.Wallet(config.evm.privateKey, this.evmProvider);
    this.escrowFactory = new ethers.Contract(
      config.evm.factoryAddress,
      ESCROW_FACTORY_ABI,
      this.evmWallet
    );

    // XRPL setup
    this.xrplClient = null;
    this.teeClient = new XRPLEscrowClient({
      baseUrl: config.xrpl.teeServerUrl,
    });

    // Swap state
    this.activeSwaps = new Map();
  }

  async initialize() {
    // Connect to XRPL
    this.xrplClient = new xrpl.Client(this.config.xrpl.network);
    await this.xrplClient.connect();
    console.log(`✅ Connected to XRPL testnet: ${this.config.xrpl.network}`);

    // Verify EVM connection
    const network = await this.evmProvider.getNetwork();
    console.log(
      `✅ Connected to EVM network: ${network.name} (Chain ID: ${network.chainId})`
    );

    // Check factory contract
    try {
      const factoryCode = await this.evmProvider.getCode(
        this.config.evm.factoryAddress
      );
      if (factoryCode === "0x") {
        throw new Error(
          "EscrowFactory contract not found at specified address"
        );
      }
      console.log(
        `✅ EscrowFactory contract verified at: ${this.config.evm.factoryAddress}`
      );

      // Test contract functionality by calling a view function
      try {
        const srcImpl = await this.escrowFactory.ESCROW_SRC_IMPLEMENTATION();
        const dstImpl = await this.escrowFactory.ESCROW_DST_IMPLEMENTATION();
        console.log(`📋 Src Implementation: ${srcImpl}`);
        console.log(`📋 Dst Implementation: ${dstImpl}`);
      } catch (viewError) {
        console.error(
          `❌ Contract view functions failed: ${viewError.message}`
        );
        throw viewError;
      }
    } catch (error) {
      console.error(`❌ EscrowFactory verification failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = {
  EnhancedCrossChainSwap,
};
