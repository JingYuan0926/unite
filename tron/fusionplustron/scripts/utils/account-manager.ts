import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * 🔄 ACCOUNT MANAGER FOR CONTINUOUS TESTING
 *
 * Solves the invalidation issue by managing multiple fresh accounts
 * and rotating between them for testing.
 */

interface TestAccount {
  privateKey: string;
  address: string;
  used: boolean;
  lastUsed?: number;
}

interface AccountPool {
  accounts: TestAccount[];
  currentIndex: number;
}

export class AccountManager {
  private poolFile = path.join(__dirname, "../../test-accounts-pool.json");
  private pool: AccountPool;

  constructor() {
    this.pool = this.loadPool();
  }

  private loadPool(): AccountPool {
    try {
      if (fs.existsSync(this.poolFile)) {
        const data = fs.readFileSync(this.poolFile, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.log("Creating new account pool...");
    }

    return {
      accounts: [],
      currentIndex: 0,
    };
  }

  private savePool(): void {
    fs.writeFileSync(this.poolFile, JSON.stringify(this.pool, null, 2));
  }

  /**
   * Generate a fresh account pool
   */
  async generateAccountPool(count: number = 20): Promise<void> {
    console.log(`🔄 Generating ${count} fresh test accounts...`);

    this.pool.accounts = [];

    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      this.pool.accounts.push({
        privateKey: wallet.privateKey,
        address: wallet.address,
        used: false,
      });
    }

    this.pool.currentIndex = 0;
    this.savePool();

    console.log(`✅ Generated ${count} fresh accounts`);
    console.log(`📍 First account: ${this.pool.accounts[0].address}`);
  }

  /**
   * Get next fresh account for testing
   */
  getNextFreshAccount(): TestAccount {
    // Try to find an unused account
    for (let i = 0; i < this.pool.accounts.length; i++) {
      const account = this.pool.accounts[i];
      if (!account.used) {
        account.used = true;
        account.lastUsed = Date.now();
        this.savePool();
        return account;
      }
    }

    // If all accounts are used, reset the oldest one
    const oldestAccount = this.pool.accounts.reduce((oldest, current) => {
      return (current.lastUsed || 0) < (oldest.lastUsed || 0)
        ? current
        : oldest;
    });

    console.log(
      `⚠️ All accounts used, recycling oldest: ${oldestAccount.address}`
    );
    oldestAccount.used = true;
    oldestAccount.lastUsed = Date.now();
    this.savePool();

    return oldestAccount;
  }

  /**
   * Get current account info
   */
  getCurrentAccount(): TestAccount | null {
    if (this.pool.accounts.length === 0) return null;
    return this.pool.accounts[this.pool.currentIndex];
  }

  /**
   * Mark account as used (for invalidation tracking)
   */
  markAccountUsed(address: string): void {
    const account = this.pool.accounts.find((acc) => acc.address === address);
    if (account) {
      account.used = true;
      account.lastUsed = Date.now();
      this.savePool();
    }
  }

  /**
   * Reset all accounts to unused (if you want to test invalidation reset)
   */
  resetAllAccounts(): void {
    this.pool.accounts.forEach((account) => {
      account.used = false;
      delete account.lastUsed;
    });
    this.savePool();
    console.log("✅ Reset all accounts to unused status");
  }

  /**
   * Get account statistics
   */
  getStats(): { total: number; used: number; fresh: number } {
    const total = this.pool.accounts.length;
    const used = this.pool.accounts.filter((acc) => acc.used).length;
    const fresh = total - used;

    return { total, used, fresh };
  }

  /**
   * Fund an account with ETH (for testing)
   */
  async fundAccount(
    account: TestAccount,
    ethAmount: string = "1.0"
  ): Promise<void> {
    const provider = ethers.provider;
    const [funder] = await ethers.getSigners();

    const balance = await provider.getBalance(account.address);
    if (balance < ethers.parseEther("0.1")) {
      console.log(`💰 Funding ${account.address} with ${ethAmount} ETH...`);

      const tx = await funder.sendTransaction({
        to: account.address,
        value: ethers.parseEther(ethAmount),
      });

      await tx.wait();
      console.log(`✅ Funded ${account.address}`);
    }
  }

  /**
   * Auto-fund all accounts in pool
   */
  async fundAllAccounts(ethAmount: string = "1.0"): Promise<void> {
    console.log(`💰 Funding all ${this.pool.accounts.length} accounts...`);

    for (const account of this.pool.accounts) {
      await this.fundAccount(account, ethAmount);
    }

    console.log("✅ All accounts funded");
  }
}
