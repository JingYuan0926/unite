import { Wallet } from "../../utils/wallet";
import { exec } from "child_process";
import path from "path";

export interface XrpSwapParams {
  ethAmount: string;
  xrpAmount?: string;
  action?: "swap" | "quote";
  wallet?: Wallet;
}

export interface XrpSwapResponse {
  success: boolean;
  message: string;
  ethAmount: string;
  xrpAmount?: string;
  action: string;
  transactionDetails?: {
    ethTxHash?: string;
    xrpTxHash?: string;
    status: string;
  };
  output?: string;
  error?: string;
  command?: string;
  workingDirectory?: string;
}

/**
 * Execute cross-chain atomic swaps between Ethereum and XRP networks
 * This function handles ETH to XRP swaps using custom cross-chain protocol
 */
export async function xrp(params: XrpSwapParams): Promise<XrpSwapResponse> {
  const { ethAmount, xrpAmount, action = "swap" } = params;
  
  console.log(`🚀 Initiating ${action} for ${ethAmount} ETH to XRP swap...`);
  
  return new Promise((resolve) => {
    // Get the path to the unite project root directory
    const projectRoot = path.join(process.cwd(), "..");
    const workingDir = projectRoot; // Run from unite root directory
    
    console.log(`📂 Working directory: ${workingDir}`);
    console.log(`🔧 Executing XRP swap commands...`);
    
    // First command: Start the escrow server
    const command1 = "node chain3/deployment/serve-escrow.js";
    console.log(`🔧 Step 1: ${command1}`);
    
    // Execute first command (escrow server)
    const escrowProcess = exec(command1, { 
      cwd: workingDir,
      timeout: 10000, // 10 seconds for server to start
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    let escrowOutput = "";
    
    escrowProcess.stdout?.on('data', (data) => {
      escrowOutput += data.toString();
      console.log("📤 Escrow Server:", data.toString());
    });
    
    escrowProcess.stderr?.on('data', (data) => {
      escrowOutput += data.toString();
      console.log("📤 Escrow Error:", data.toString());
    });
    
    // Wait a bit for server to start, then run the swap command
    setTimeout(() => {
      const command2 = "node chain3/examples/eth-to-xrp-complete.js --execute";
      console.log(`🔧 Step 2: ${command2}`);
      
      // Execute second command (ETH to XRP swap)
      exec(command2, { 
        cwd: workingDir,
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        
        // Kill the escrow server process
        escrowProcess.kill('SIGTERM');
        
        const swapOutput = stdout + stderr;
        const totalOutput = `=== Escrow Server Output ===\n${escrowOutput}\n\n=== ETH to XRP Swap Output ===\n${swapOutput}`;
        
        console.log("📤 Swap output:", swapOutput);
        
        if (error) {
          console.error("❌ Swap execution error:", error);
          resolve({
            success: false,
            message: `❌ Failed to execute ${action} for ${ethAmount} ETH to XRP swap`,
            ethAmount,
            xrpAmount,
            action,
            error: error.message,
            output: totalOutput,
            command: `${command1} && ${command2}`,
            workingDirectory: workingDir
          });
        } else {
          resolve({
            success: true,
            message: `✅ Successfully executed ${action} for ${ethAmount} ETH to XRP swap!`,
            ethAmount,
            xrpAmount: xrpAmount || "calculated",
            action,
            transactionDetails: {
              status: "completed"
            },
            output: totalOutput,
            command: `${command1} && ${command2}`,
            workingDirectory: workingDir
          });
        }
      });
    }, 3000); // Wait 3 seconds for escrow server to start
  });
} 