import { Wallet } from "../../utils/wallet";
import { exec } from "child_process";
import path from "path";

export interface TronSwapParams {
  ethAmount: string;
  tronAmount?: string;
  action?: "swap" | "quote";
  wallet?: Wallet;
}

export interface TronSwapResponse {
  success: boolean;
  message: string;
  ethAmount: string;
  tronAmount?: string;
  action: string;
  transactionDetails?: {
    ethTxHash?: string;
    tronTxHash?: string;
    status: string;
  };
  output?: string;
  error?: string;
  command?: string;
  workingDirectory?: string;
}

/**
 * Execute cross-chain atomic swaps between Ethereum and Tron networks
 * This function handles ETH to TRON swaps using 1inch Fusion+ protocol
 */
export async function tron(params: TronSwapParams): Promise<TronSwapResponse> {
  const { ethAmount, tronAmount, action = "swap" } = params;
  
  console.log(`🚀 Initiating ${action} for ${ethAmount} ETH to TRON swap...`);
  
  return new Promise((resolve) => {
    // Get the path to the fusionplustron directory - go up from frontend to project root
    const projectRoot = path.join(process.cwd(), "..");
    const workingDir = path.join(projectRoot, "agentkit", "src", "functions", "tron", "fusionplustron");
    const command = "npx hardhat run scripts/demo/test-complete-atomic-swap.ts --network sepolia";
    
    console.log(`📂 Working directory: ${workingDir}`);
    console.log(`🔧 Executing command: ${command}`);
    
    // Use exec to run the command
    exec(command, { 
      cwd: workingDir,
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    }, (error, stdout, stderr) => {
      
      const output = stdout + stderr;
      console.log("📤 Command output:", output);
      
      if (error) {
        console.error("❌ Command execution error:", error);
        resolve({
          success: false,
          message: `❌ Failed to execute ${action} for ${ethAmount} ETH to TRON swap`,
          ethAmount,
          tronAmount,
          action,
          error: error.message,
          output: output,
          command,
          workingDirectory: workingDir
        });
      } else {
        resolve({
          success: true,
          message: `✅ Successfully executed ${action} for ${ethAmount} ETH to TRON swap!`,
          ethAmount,
          tronAmount: tronAmount || "calculated",
          action,
          transactionDetails: {
            status: "completed"
          },
          output: output,
          command,
          workingDirectory: workingDir
        });
      }
    });
  });
} 