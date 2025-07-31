const { ethers } = require("ethers");
require("dotenv/config");

// Simple configuration
const config = {
  // Use a public RPC endpoint
  rpcUrl: process.env.ETH_RPC,
  privateKey: process.env.ETH_PK,

  // Swap amounts
  srcAmount: "0.001", // 0.001 ETH
};

class SimpleCrossChainSwap {
  constructor() {
    try {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      this.activeSwaps = new Map();
      console.log("✅ Provider and wallet initialized");
    } catch (error) {
      console.error("❌ Failed to initialize provider/wallet:", error.message);
      throw error;
    }
  }

  async initialize() {
    console.log("🚀 Initializing Simple Cross-Chain Swap...");

    try {
      // Check connection
      const network = await this.provider.getNetwork();
      console.log(
        `✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
      );

      // Check wallet balance (FIXED)
      const balance = await this.provider.getBalance(this.wallet.address);
      console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);

      if (balance < ethers.parseEther("0.01")) {
        console.log(
          "⚠️  Low balance! Please fund your wallet with at least 0.01 ETH"
        );
      }
    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
      throw error;
    }
  }

  async createSwap() {
    console.log("\n🔄 Creating a simple cross-chain swap...");

    try {
      // Generate swap identifiers
      const secret = ethers.randomBytes(32);
      const hashlock = ethers.keccak256(secret);
      const swapId = ethers.randomBytes(16).toString("hex");

      console.log(`📋 Swap ID: ${swapId}`);
      console.log(`🔐 Hashlock: ${hashlock}`);
      console.log(`🔑 Secret: ${secret.toString("hex")}`);

      // Create a simple escrow contract (simulated)
      const escrowAddress = await this.createEscrowContract(hashlock);

      // Store swap info
      const swap = {
        id: swapId,
        hashlock,
        secret: secret.toString("hex"),
        escrowAddress,
        status: "created",
        amount: config.srcAmount,
        createdAt: Date.now(),
      };

      this.activeSwaps.set(swapId, swap);
      console.log(`✅ Swap created successfully!`);
      console.log(`📍 Escrow address: ${escrowAddress}`);

      return swapId;
    } catch (error) {
      console.error("❌ Failed to create swap:", error.message);
      throw error;
    }
  }

  async createEscrowContract(hashlock) {
    console.log("🏗️  Creating escrow contract...");

    try {
      // Simulate contract deployment
      const escrowAddress = ethers.getCreateAddress({
        from: this.wallet.address,
        nonce: await this.wallet.getNonce(),
      });

      // Simulate the escrow creation transaction
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address, // Self-send for demo
        value: ethers.parseEther(config.srcAmount),
        data: "0x", // Empty data for demo
      });

      console.log(`⏳ Escrow creation transaction: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ Escrow creation confirmed!`);

      return escrowAddress;
    } catch (error) {
      console.error("❌ Failed to create escrow contract:", error.message);
      throw error;
    }
  }

  async fundSwap(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    console.log(`\n💰 Funding swap ${swapId}...`);
    console.log(`💸 Funding escrow with ${swap.amount} ETH...`);

    try {
      // Simulate funding transaction
      const tx = await this.wallet.sendTransaction({
        to: swap.escrowAddress,
        value: ethers.parseEther(swap.amount),
      });

      console.log(`⏳ Funding transaction: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ Swap funded successfully!`);

      swap.status = "funded";
      swap.fundingTx = tx.hash;
    } catch (error) {
      console.error("❌ Failed to fund swap:", error.message);
      throw error;
    }
  }

  async executeSwap(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap || swap.status !== "funded") {
      throw new Error(`Swap ${swapId} not ready for execution`);
    }

    console.log(`\n🎯 Executing swap ${swapId}...`);

    try {
      // Simulate waiting for the other party to fund their side
      console.log("⏳ Waiting for counterparty funding...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      // Withdraw from escrow using the secret
      console.log("🔓 Withdrawing from escrow using secret...");

      // Simulate the withdrawal
      const withdrawalTx = await this.wallet.sendTransaction({
        to: swap.escrowAddress,
        data: "0x", // In real implementation, this would be the withdraw function call
      });

      console.log(`⏳ Withdrawal transaction: ${withdrawalTx.hash}`);
      await withdrawalTx.wait();
      console.log(`✅ Swap executed successfully!`);

      swap.status = "completed";
      swap.withdrawalTx = withdrawalTx.hash;
      swap.completedAt = Date.now();
    } catch (error) {
      console.error("❌ Failed to execute swap:", error.message);
      throw error;
    }
  }

  async getSwapStatus(swapId) {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }

    return {
      id: swap.id,
      status: swap.status,
      amount: swap.amount,
      escrowAddress: swap.escrowAddress,
      createdAt: swap.createdAt,
      completedAt: swap.completedAt,
      transactions: {
        funding: swap.fundingTx,
        withdrawal: swap.withdrawalTx,
      },
    };
  }
}

// Main execution function
async function main() {
  console.log("🚀 Starting Simple Cross-Chain Swap Demo");
  console.log("=".repeat(50));

  try {
    const swapManager = new SimpleCrossChainSwap();

    // Initialize
    await swapManager.initialize();

    // Create a swap
    const swapId = await swapManager.createSwap();

    // Fund the swap
    await swapManager.fundSwap(swapId);

    // Execute the swap
    await swapManager.executeSwap(swapId);

    // Get final status
    const status = await swapManager.getSwapStatus(swapId);

    console.log("\n🎉 SWAP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("Final Status:", JSON.stringify(status, null, 2));
  } catch (error) {
    console.error("❌ Swap failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
