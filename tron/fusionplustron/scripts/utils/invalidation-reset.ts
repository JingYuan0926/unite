import { ethers } from "hardhat";

/**
 * 🔄 INVALIDATION RESET UTILITY
 *
 * This utility provides methods to reset LOP invalidation state without
 * needing to create fresh accounts every time.
 *
 * SOLUTION: Use LOP.increaseEpoch(1) to reset account invalidation state
 */

export class InvalidationReset {
  private provider: any;
  private lopAddress: string;

  constructor(
    provider: any,
    lopAddress: string = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0"
  ) {
    this.provider = provider;
    this.lopAddress = lopAddress;
  }

  /**
   * Reset invalidation state for an account using increaseEpoch
   */
  async resetInvalidationState(
    privateKey: string,
    series: number = 0
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log("🔄 Resetting invalidation state using increaseEpoch...");

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const LOP = await ethers.getContractAt(
        "LimitOrderProtocol",
        this.lopAddress
      );

      // Check current epoch
      let currentEpoch: bigint;
      try {
        currentEpoch = await LOP.epoch(wallet.address, series);
        console.log(
          `  📊 Current epoch for ${wallet.address}: ${currentEpoch.toString()}`
        );
      } catch (error) {
        console.log(
          "  ⚠️ Could not read current epoch, proceeding with reset..."
        );
        currentEpoch = 0n;
      }

      // Estimate gas first
      const gasEstimate =
        await LOP.connect(wallet).increaseEpoch.estimateGas(series);
      console.log(`  💰 Gas estimate: ${gasEstimate.toString()}`);

      // Execute epoch increase
      console.log(`  🚀 Calling increaseEpoch(${series})...`);
      const tx = await LOP.connect(wallet).increaseEpoch(series);
      console.log(`  📝 Transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(
        `  ✅ Transaction confirmed in block ${receipt!.blockNumber}`
      );

      // Verify epoch increased
      try {
        const newEpoch = await LOP.epoch(wallet.address, series);
        console.log(`  📊 New epoch: ${newEpoch.toString()}`);

        if (newEpoch > currentEpoch) {
          console.log("  🎉 Invalidation state successfully reset!");
        }
      } catch (error) {
        console.log(
          "  ⚠️ Could not verify new epoch, but transaction succeeded"
        );
      }

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error("❌ Failed to reset invalidation state:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if an account needs invalidation reset
   */
  async checkInvalidationState(
    address: string,
    series: number = 0
  ): Promise<{
    needsReset: boolean;
    currentEpoch?: bigint;
    error?: string;
  }> {
    try {
      const LOP = await ethers.getContractAt(
        "LimitOrderProtocol",
        this.lopAddress
      );

      // Try to read current epoch
      const currentEpoch = await LOP.epoch(address, series);
      console.log(
        `📊 Account ${address} epoch ${series}: ${currentEpoch.toString()}`
      );

      // For now, we can't easily determine if reset is needed without trying an order
      // This is more of an informational check
      return {
        needsReset: false, // We'd need more context to determine this
        currentEpoch,
      };
    } catch (error: any) {
      return {
        needsReset: true, // If we can't read state, assume reset might help
        error: error.message,
      };
    }
  }

  /**
   * Reset invalidation for the current user from .env
   */
  async resetCurrentUser(): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    require("dotenv").config();

    const privateKey = process.env.USER_A_ETH_PRIVATE_KEY;
    if (!privateKey) {
      return {
        success: false,
        error: "USER_A_ETH_PRIVATE_KEY not found in .env",
      };
    }

    return this.resetInvalidationState(privateKey);
  }

  /**
   * Prepare account for testing by ensuring clean invalidation state
   */
  async prepareAccountForTesting(privateKey: string): Promise<{
    success: boolean;
    address: string;
    needsApproval?: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      console.log(`🛠️ Preparing account ${wallet.address} for testing...`);

      // Reset invalidation state
      const resetResult = await this.resetInvalidationState(privateKey);

      if (!resetResult.success) {
        return {
          success: false,
          address: wallet.address,
          error: `Invalidation reset failed: ${resetResult.error}`,
        };
      }

      // Check if MockTRX approval is needed
      const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";
      let needsApproval = false;

      try {
        const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);
        const allowance = await MockTRX.allowance(
          wallet.address,
          this.lopAddress
        );
        needsApproval = allowance === 0n;

        if (needsApproval) {
          console.log("  ⚠️ Account needs MockTRX approval for LOP");
        } else {
          console.log("  ✅ Account has MockTRX approval for LOP");
        }
      } catch (error) {
        console.log("  ⚠️ Could not check MockTRX approval status");
        needsApproval = true; // Assume needs approval if we can't check
      }

      console.log("  🎉 Account prepared successfully for testing!");

      return {
        success: true,
        address: wallet.address,
        needsApproval,
        txHash: resetResult.txHash,
      };
    } catch (error: any) {
      return {
        success: false,
        address: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Approve MockTRX for LOP if needed
   */
  async approveMockTRXIfNeeded(privateKey: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
    wasNeeded: boolean;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

      const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

      // Check current allowance
      const currentAllowance = await MockTRX.allowance(
        wallet.address,
        this.lopAddress
      );

      if (currentAllowance > 0n) {
        console.log(
          `✅ MockTRX already approved for LOP (allowance: ${ethers.formatEther(currentAllowance)})`
        );
        return {
          success: true,
          wasNeeded: false,
        };
      }

      console.log("💰 Approving MockTRX for LOP...");

      // Approve max amount
      const maxApproval = ethers.MaxUint256;
      const tx = await MockTRX.connect(wallet).approve(
        this.lopAddress,
        maxApproval
      );
      console.log(`📝 Approval transaction: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(
        `✅ MockTRX approved for LOP in block ${receipt!.blockNumber}`
      );

      return {
        success: true,
        txHash: tx.hash,
        wasNeeded: true,
      };
    } catch (error: any) {
      console.error("❌ Failed to approve MockTRX:", error.message);
      return {
        success: false,
        error: error.message,
        wasNeeded: true,
      };
    }
  }
}

/**
 * Standalone function for quick invalidation reset
 */
export async function quickInvalidationReset(
  privateKey?: string
): Promise<void> {
  require("dotenv").config();

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const invalidationReset = new InvalidationReset(provider);

  const keyToUse = privateKey || process.env.USER_A_ETH_PRIVATE_KEY;
  if (!keyToUse) {
    throw new Error(
      "No private key provided and USER_A_ETH_PRIVATE_KEY not found in .env"
    );
  }

  console.log("🚀 QUICK INVALIDATION RESET");
  console.log("=".repeat(40));

  const result = await invalidationReset.resetInvalidationState(keyToUse);

  if (result.success) {
    console.log("🎉 Invalidation reset completed successfully!");
    console.log(`📝 Transaction: ${result.txHash}`);
  } else {
    console.error("❌ Invalidation reset failed:", result.error);
    throw new Error(result.error);
  }
}

/**
 * Complete account preparation including invalidation reset and approvals
 */
export async function prepareAccountForTesting(
  privateKey?: string
): Promise<void> {
  require("dotenv").config();

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const invalidationReset = new InvalidationReset(provider);

  const keyToUse = privateKey || process.env.USER_A_ETH_PRIVATE_KEY;
  if (!keyToUse) {
    throw new Error(
      "No private key provided and USER_A_ETH_PRIVATE_KEY not found in .env"
    );
  }

  console.log("🛠️ COMPLETE ACCOUNT PREPARATION");
  console.log("=".repeat(40));

  // Step 1: Reset invalidation state
  const prepResult = await invalidationReset.prepareAccountForTesting(keyToUse);

  if (!prepResult.success) {
    console.error("❌ Account preparation failed:", prepResult.error);
    throw new Error(prepResult.error);
  }

  // Step 2: Handle MockTRX approval if needed
  if (prepResult.needsApproval) {
    console.log("\n💰 Handling MockTRX approval...");
    const approvalResult =
      await invalidationReset.approveMockTRXIfNeeded(keyToUse);

    if (!approvalResult.success) {
      console.error("❌ MockTRX approval failed:", approvalResult.error);
      throw new Error(approvalResult.error);
    }
  }

  console.log("\n🎉 ACCOUNT FULLY PREPARED FOR TESTING!");
  console.log(`📍 Address: ${prepResult.address}`);
  console.log("✅ Invalidation state reset");
  console.log("✅ MockTRX approval confirmed");
  console.log("\nYour account is now ready for atomic swap testing!");
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "reset") {
    quickInvalidationReset().catch(console.error);
  } else if (command === "prepare") {
    prepareAccountForTesting().catch(console.error);
  } else {
    console.log("🔄 INVALIDATION RESET UTILITY");
    console.log("Usage:");
    console.log(
      "  npx ts-node scripts/utils/invalidation-reset.ts reset   - Reset invalidation only"
    );
    console.log(
      "  npx ts-node scripts/utils/invalidation-reset.ts prepare - Full account preparation"
    );
  }
}
