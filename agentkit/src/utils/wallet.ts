/**
 * Wallet connection utility for 1inch Agent Kit
 * Handles both local JSON wallet (for scripts) and frontend wallet connections
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Wallet interface for both local and frontend wallets
 */
export interface Wallet {
  address: string;
  chainId: number;
  privateKey?: string; 
  isTestWallet?: boolean;
  name?: string;
  balance?: string;
  ensName?: string | null;
  walletType?: string;
}

/**
 * Wallet context for function calls
 */
export interface WalletContext {
  wallet: Wallet | null;
  isConnected: boolean;
  source: 'local' | 'frontend' | 'none';
}

/**
 * Wallet manager class
 */
export class WalletManager {
  private currentWallet: Wallet | null = null;
  private walletSource: 'local' | 'frontend' | 'none' = 'none';
  private localWalletPath: string;

  constructor() {
    // Look for wallet.json in the project root
    this.localWalletPath = path.resolve(process.cwd(), 'wallet.json');
  }

  /**
   * Initialize wallet - automatically detects if running in script mode or frontend mode
   */
  async initialize(frontendWallet?: Wallet): Promise<WalletContext> {
    try {
      if (frontendWallet) {
        // Frontend wallet provided
        logger.info('Using frontend wallet:', frontendWallet.address);
        this.currentWallet = frontendWallet;
        this.walletSource = 'frontend';
      } else {
        // Try to load local wallet for scripts
        await this.loadLocalWallet();
      }

      return this.getWalletContext();
    } catch (error) {
      logger.error('Failed to initialize wallet:', error);
      return {
        wallet: null,
        isConnected: false,
        source: 'none'
      };
    }
  }

  /**
   * Load local wallet from JSON file
   */
  private async loadLocalWallet(): Promise<void> {
    try {
      if (fs.existsSync(this.localWalletPath)) {
        const walletData = JSON.parse(fs.readFileSync(this.localWalletPath, 'utf8'));
        
        // Validate wallet data
        if (!walletData.address || !walletData.chainId) {
          throw new Error('Invalid wallet.json format - missing address or chainId');
        }

        this.currentWallet = {
          ...walletData,
          isTestWallet: true
        };
        this.walletSource = 'local';
        
        logger.info(`Loaded local wallet: ${walletData.address} on chain ${walletData.chainId}`);
      } else {
        logger.warn('No wallet.json found and no frontend wallet provided');
        this.currentWallet = null;
        this.walletSource = 'none';
      }
    } catch (error) {
      logger.error('Error loading local wallet:', error);
      throw error;
    }
  }

  /**
   * Set frontend wallet
   */
  setFrontendWallet(wallet: Wallet): WalletContext {
    logger.info('Setting frontend wallet:', wallet.address);
    this.currentWallet = wallet;
    this.walletSource = 'frontend';
    return this.getWalletContext();
  }

  /**
   * Get current wallet context
   */
  getWalletContext(): WalletContext {
    return {
      wallet: this.currentWallet,
      isConnected: this.currentWallet !== null,
      source: this.walletSource
    };
  }

  /**
   * Get wallet for specific chain (with validation)
   */
  getWalletForChain(chainId: number): Wallet | null {
    if (!this.currentWallet) {
      logger.error('No wallet connected');
      return null;
    }

    if (this.currentWallet.chainId !== chainId) {
      logger.warn(`Wallet chain mismatch. Required: ${chainId}, Current: ${this.currentWallet.chainId}`);
      // For test wallets, we can be more flexible
      if (this.currentWallet.isTestWallet) {
        logger.info('Using test wallet for different chain');
        return {
          ...this.currentWallet,
          chainId: chainId
        };
      }
      return null;
    }

    return this.currentWallet;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.currentWallet !== null;
  }

  /**
   * Get wallet address
   */
  getAddress(): string | null {
    return this.currentWallet?.address || null;
  }

  /**
   * Get wallet chain ID
   */
  getChainId(): number | null {
    return this.currentWallet?.chainId || null;
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    logger.info('Disconnecting wallet');
    this.currentWallet = null;
    this.walletSource = 'none';
  }

  /**
   * Create wallet parameters for function calls
   */
  createWalletParams(overrides: Partial<Wallet> = {}): Wallet | null {
    if (!this.currentWallet) {
      return null;
    }

    return {
      ...this.currentWallet,
      ...overrides
    };
  }
}

/**
 * Global wallet manager instance
 */
export const walletManager = new WalletManager();

/**
 * Utility functions for wallet operations
 */
export class WalletUtils {
  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display
   */
  static formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
    if (!address || address.length < startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  /**
   * Get chain name from chain ID
   */
  static getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      10: 'Optimism',
      56: 'BNB Chain',
      100: 'Gnosis',
      137: 'Polygon',
      324: 'zkSync Era',
      42161: 'Arbitrum One',
      43114: 'Avalanche C-Chain',
      8453: 'Base',
      7565164: 'Solana'
    };
    
    return chainNames[chainId] || `Chain ${chainId}`;
  }

  /**
   * Convert Wei to Ether
   */
  static weiToEther(wei: string): string {
    try {
      const weiNum = BigInt(wei);
      const etherNum = Number(weiNum) / 1e18;
      return etherNum.toFixed(6);
    } catch (error) {
      return '0';
    }
  }

  /**
   * Convert Ether to Wei
   */
  static etherToWei(ether: string): string {
    try {
      const etherNum = parseFloat(ether);
      const weiNum = BigInt(Math.floor(etherNum * 1e18));
      return weiNum.toString();
    } catch (error) {
      return '0';
    }
  }
}

/**
 * Decorator function to inject wallet into function parameters
 */
export function withWallet<T extends (...args: any[]) => any>(
  fn: T,
  requireWallet: boolean = true
): T {
  return ((...args: any[]) => {
    const wallet = walletManager.getWalletContext().wallet;
    
    if (requireWallet && !wallet) {
      throw new Error('Wallet connection required for this operation');
    }

    // Add wallet to the first parameter if it's an object
    if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
      args[0] = {
        ...args[0],
        wallet: wallet
      };
    } else if (wallet) {
      // If first arg is not an object, prepend wallet
      args.unshift({ wallet });
    }

    return fn(...args);
  }) as T;
}

export default walletManager;