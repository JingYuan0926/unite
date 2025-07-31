import "dotenv/config";
import { ethers } from "ethers";
import { JsonRpcProvider, Wallet } from "ethers";

// Simple configuration
const config = {
  // Use local Anvil or Sepolia testnet
  rpcUrl: process.env.ETH_RPC || "http://localhost:8545",
  privateKey: process.env.PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  
  // Test token addresses (you can change these)
  srcToken: "0x0000000000000000000000000000000000000000", // ETH
  dstToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
  
  // Swap amounts
  srcAmount: "0.001", // 0.001 ETH
  dstAmount: "1", // 1 USDC
};

// Simple ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Simple Escrow ABI (basic functions)
const ESCROW_ABI = [
  "function createEscrow(bytes32 hashlock, uint256 amount, uint256 timelock) external payable",
  "function withdraw(bytes32 secret) external",
  "function cancel() external",
  "function getStatus() external view returns (uint8)",
  "event EscrowCreated(address indexed escrow, bytes32 indexed hashlock, uint256 amount)",
  "event EscrowWithdrawn(bytes32 indexed secret)",
  "event EscrowCancelled()",
];

class SimpleCrossChainSwap {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private activeSwaps: Map<string, any> = new Map();

  constructor() {
    this.provider = new JsonRpcProvider(config.rpcUrl);
    this.wallet = new Wallet(config.privateKey, this.provider);
  }

  async initialize(): Promise<void> {
    console.log("🚀 Initializing Simple Cross-Chain Swap...");
    
    // Check connection
    const network = await this.provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check wallet balance
    const balance = await this.wallet.getBalance();
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.01")) {
      console.log("⚠️  Low balance! Please fund your wallet with at least 0.01 ETH");
    }
  }

  async createSwap(): Promise<string> {
    console.log("\n🔄 Creating a simple cross-chain swap...");
    
    // Generate swap identifiers
    const secret = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(secret);
    const swapId = ethers.randomBytes(16).toString('hex');
    
    console.log(`📋 Swap ID: ${swapId}`);
    console.log(`🔐 Hashlock: ${hashlock}`);
    console.log(`🔑 Secret: ${secret.toString('hex')}`);
    
    // Create a simple escrow contract (simulated)
    const escrowAddress = await this.createEscrowContract(hashlock);
    
    // Store swap info
    const swap = {
      id: swapId,
      hashlock,
      secret: secret.toString('hex'),
      escrowAddress,
      status: 'created',
      amount: config.srcAmount,
      createdAt: Date.now()
    };
    
    this.activeSwaps.set(swapId, swap);
    console.log(`✅ Swap created successfully!`);
    console.log(`📍 Escrow address: ${escrowAddress}`);
    
    return swapId;
  }

  private async createEscrowContract(hashlock: string): Promise<string> {
    // For this simple example, we'll simulate an escrow creation
    // In a real implementation, you would deploy or interact with an actual escrow contract
    
    console.log("🏗️  Creating escrow contract...");
    
    // Simulate contract deployment (in real implementation, this would be an actual contract)
    const escrowAddress = ethers.getCreateAddress({
      from: this.wallet.address,
      nonce: await this.wallet.getNonce()
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
  }

  async fundSwap(swapId: string): Promise<void> {
    const swap = this.activeSwaps.get(swapId);
    if (!swap) {
      throw new Error(`Swap ${swapId} not found`);
    }
    
    console.log(`\n💰 Funding swap ${swapId}...`);
    
    // In a real implementation, you would send funds to the escrow contract
    // For this demo, we'll just simulate the funding
    console.log(`💸 Funding escrow with ${swap.amount} ETH...`);
    
    // Simulate funding transaction
    const tx = await this.wallet.sendTransaction({
      to: swap.escrowAddress,
      value: ethers.parseEther(swap.amount),
    });
    
    console.log(`⏳ Funding transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Swap funded successfully!`);
    
    swap.status = 'funded';
    swap.fundingTx = tx.hash;
  }

  async executeSwap(swapId: string): Promise<void> {
    const swap = this.activeSwaps.get(swapId);
    if (!swap || swap.status !== 'funded') {
      throw new Error(`Swap ${swapId} not ready for execution`);
    }
    
    console.log(`\n🎯 Executing swap ${swapId}...`);
    
    // Simulate waiting for the other party to fund their side
    console.log("⏳ Waiting for counterparty funding...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    // Withdraw from escrow using the secret
    console.log("🔓 Withdrawing from escrow using secret...");
    
    // In a real implementation, you would call the escrow's withdraw function
    // For this demo, we'll simulate the withdrawal
    const withdrawalTx = await this.wallet.sendTransaction({
      to: swap.escrowAddress,
      data: "0x", // In real implementation, this would be the withdraw function call
    });
    
    console.log(`⏳ Withdrawal transaction: ${withdrawalTx.hash}`);
    await withdrawalTx.wait();
    console.log(`✅ Swap executed successfully!`);
    
    swap.status = 'completed';
    swap.withdrawalTx = withdrawalTx.hash;
    swap.completedAt = Date.now();
  }

  async getSwapStatus(swapId: string): Promise<any> {
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
        withdrawal: swap.withdrawalTx
      }
    };
  }

  async listActiveSwaps(): Promise<string[]> {
    return Array.from(this.activeSwaps.keys());
  }
}

// Main execution function
async function main() {
  console.log("🚀 Starting Simple Cross-Chain Swap Demo");
  console.log("=" .repeat(50));
  
  const swapManager = new SimpleCrossChainSwap();
  
  try {
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
    console.log("=" .repeat(50));
    console.log("Final Status:", JSON.stringify(status, null, 2));
    
  } catch (error) {
    console.error("❌ Swap failed:", error.message);
    process.exit(1);
  }
}

// Export for use in other files
export { SimpleCrossChainSwap, main };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
} 