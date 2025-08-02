import { AccountManager } from "./account-manager";
import { ethers } from "hardhat";

/**
 * 🚀 SETUP ACCOUNT POOL FOR CONTINUOUS TESTING
 *
 * This script sets up a pool of fresh accounts to solve the invalidation issue.
 * Run this once, then use the accounts for continuous testing.
 */

async function main() {
  console.log("🚀 SETTING UP ACCOUNT POOL FOR CONTINUOUS TESTING");
  console.log("This solves the 1inch LOP invalidation issue (0xa4f62a96)");
  console.log("=".repeat(60));

  const accountManager = new AccountManager();

  // Check current pool status
  const stats = accountManager.getStats();
  console.log(`📊 Current Pool Status:`);
  console.log(`  Total accounts: ${stats.total}`);
  console.log(`  Used accounts: ${stats.used}`);
  console.log(`  Fresh accounts: ${stats.fresh}`);

  if (stats.total === 0) {
    // Generate fresh account pool
    console.log("\n🔄 Generating fresh account pool...");
    await accountManager.generateAccountPool(20); // 20 accounts should be plenty
  }

  // Fund all accounts
  console.log("\n💰 Funding all accounts with test ETH...");
  await accountManager.fundAllAccounts("1.0"); // 1 ETH each

  // Show first few accounts for reference
  console.log("\n📋 Account Pool Sample (first 5 accounts):");
  const sampleAccounts = accountManager["pool"].accounts.slice(0, 5);
  sampleAccounts.forEach((account, index) => {
    console.log(`  ${index + 1}. ${account.address} (used: ${account.used})`);
  });

  console.log("\n✅ ACCOUNT POOL SETUP COMPLETE!");
  console.log("=".repeat(40));
  console.log("🎯 USAGE INSTRUCTIONS:");
  console.log("");
  console.log("1. Import AccountManager in your test scripts:");
  console.log("   import { AccountManager } from './utils/account-manager';");
  console.log("");
  console.log("2. Get fresh accounts for testing:");
  console.log("   const accountManager = new AccountManager();");
  console.log("   const freshAccount = accountManager.getNextFreshAccount();");
  console.log(
    "   const userA = new ethers.Wallet(freshAccount.privateKey, provider);"
  );
  console.log("");
  console.log("3. This bypasses the invalidation issue completely!");
  console.log("");
  console.log("🔄 AUTOMATED TESTING:");
  console.log("- Each test gets a fresh account");
  console.log("- No more manual .env updates needed");
  console.log("- 20 accounts = 20 test runs before recycling");
  console.log("- Accounts auto-recycle when pool is exhausted");

  // Test the fresh account system
  console.log("\n🧪 TESTING FRESH ACCOUNT SYSTEM:");
  const testAccount = accountManager.getNextFreshAccount();
  console.log(`  Got fresh account: ${testAccount.address}`);
  console.log(
    `  Private key available: ${testAccount.privateKey.length > 0 ? "✅" : "❌"}`
  );

  const provider = ethers.provider;
  const balance = await provider.getBalance(testAccount.address);
  console.log(`  Account balance: ${ethers.formatEther(balance)} ETH`);

  console.log("\n🎉 READY FOR CONTINUOUS TESTING!");
  console.log("No more invalidation issues - test as much as you want!");
}

main().catch(console.error);
