/**
 * Wallet connection utility for 1inch Agent Kit
 * Handles both local JSON wallet (for scripts) and frontend wallet connections
 */

import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
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
 * Transaction parameters for signing and sending
 */
export interface TransactionParams {
  to: string;
  data: string;
  value: string | bigint;
  gasPrice?: string | bigint;
  gas?: string | bigint;
  nonce?: number;
  chainId?: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
  nonce: number;
  chainId: number;
}

/**
 * Wallet manager class
 */
export class WalletManager {
  private currentWallet: Wallet | null = null;
  private walletSource: 'local' | 'frontend' | 'none' = 'none';
  private localWalletPath: string;
  private ethersWallet: ethers.Wallet | null = null;
  private provider: ethers.Provider | null = null;

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

      // Initialize ethers wallet if we have a private key
      if (this.currentWallet?.privateKey) {
        await this.initializeEthersWallet();
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
   * Initialize ethers wallet for transaction signing
   */
  private async initializeEthersWallet(): Promise<void> {
    if (!this.currentWallet?.privateKey) {
      logger.warn('No private key available for ethers wallet initialization');
      return;
    }

    try {
      // Create provider based on chain ID
      const rpcUrl = this.getRpcUrl(this.currentWallet.chainId);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Create ethers wallet
      this.ethersWallet = new ethers.Wallet(this.currentWallet.privateKey, this.provider);
      
      logger.info(`Initialized ethers wallet: ${this.ethersWallet.address}`);
    } catch (error) {
      logger.error('Error initializing ethers wallet:', error);
      throw error;
    }
  }

  /**
   * Get RPC URL for a given chain ID
   */
  private getRpcUrl(chainId: number): string {
    const rpcUrls: Record<number, string> = {
      1: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
      10: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      56: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
      100: process.env.GNOSIS_RPC_URL || 'https://rpc.gnosischain.com',
      137: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      324: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
      42161: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      43114: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
      8453: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      7565164: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    };
    
    return rpcUrls[chainId] || process.env.DEFAULT_RPC_URL || 'https://eth.llamarpc.com';
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
    this.ethersWallet = null;
    this.provider = null;
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

  /**
   * Sign and send a transaction
   * For local wallets: uses ethers.js to sign and send
   * For frontend wallets: returns transaction data for external signing
   */
  async signAndSendTransaction(params: TransactionParams): Promise<TransactionResult> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    try {
      if (this.walletSource === 'local' && this.ethersWallet) {
        // Local wallet with private key - sign and send directly
        return await this.signAndSendLocalTransaction(params);
      } else if (this.walletSource === 'frontend') {
        // Frontend wallet (MetaMask, etc.) - return transaction data for external signing
        return await this.prepareTransactionForFrontend(params);
      } else {
        throw new Error('No signing method available for current wallet type');
      }
    } catch (error) {
      logger.error('Error signing and sending transaction:', error);
      throw error;
    }
  }

  /**
   * Sign and send transaction using local ethers wallet
   */
  private async signAndSendLocalTransaction(params: TransactionParams): Promise<TransactionResult> {
    if (!this.ethersWallet || !this.provider) {
      throw new Error('Ethers wallet not initialized');
    }

    try {
      // Prepare transaction parameters
      const txParams: ethers.TransactionRequest = {
        to: params.to,
        data: params.data,
        value: typeof params.value === 'string' ? BigInt(params.value) : params.value,
        gasPrice: params.gasPrice ? (typeof params.gasPrice === 'string' ? BigInt(params.gasPrice) : params.gasPrice) : undefined,
        gasLimit: params.gas ? (typeof params.gas === 'string' ? BigInt(params.gas) : params.gas) : undefined,
        nonce: params.nonce,
        chainId: params.chainId || this.currentWallet?.chainId
      };

      // Estimate gas if not provided
      if (!txParams.gasLimit) {
        txParams.gasLimit = await this.provider.estimateGas(txParams);
        logger.info(`Estimated gas: ${txParams.gasLimit.toString()}`);
      }

      // Get gas price if not provided
      if (!txParams.gasPrice) {
        txParams.gasPrice = await this.provider.getFeeData().then((fee: any) => fee.gasPrice);
        logger.info(`Gas price: ${txParams.gasPrice?.toString()}`);
      }

      // Get nonce if not provided
      if (txParams.nonce === undefined) {
        txParams.nonce = await this.provider.getTransactionCount(this.ethersWallet.address, 'pending');
        logger.info(`Nonce: ${txParams.nonce}`);
      }

      // Sign and send transaction
      const tx = await this.ethersWallet.sendTransaction(txParams);
      logger.info(`Transaction sent: ${tx.hash}`);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      logger.info(`Transaction confirmed in block ${receipt?.blockNumber}`);

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        data: tx.data,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        gas: tx.gasLimit.toString(),
        nonce: tx.nonce,
        chainId: Number(tx.chainId) || 0
      };
    } catch (error) {
      logger.error('Error in local transaction signing:', error);
      throw error;
    }
  }

  /**
   * Prepare transaction data for frontend wallet signing
   */
  private async prepareTransactionForFrontend(params: TransactionParams): Promise<TransactionResult> {
    if (!this.provider) {
      // Initialize provider for the current chain
      const rpcUrl = this.getRpcUrl(this.currentWallet!.chainId);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    try {
      // Prepare transaction parameters
      const txParams: ethers.TransactionRequest = {
        to: params.to,
        data: params.data,
        value: typeof params.value === 'string' ? BigInt(params.value) : params.value,
        gasPrice: params.gasPrice ? (typeof params.gasPrice === 'string' ? BigInt(params.gasPrice) : params.gasPrice) : undefined,
        gasLimit: params.gas ? (typeof params.gas === 'string' ? BigInt(params.gas) : params.gas) : undefined,
        nonce: params.nonce,
        chainId: params.chainId || this.currentWallet?.chainId
      };

      // Estimate gas if not provided
      if (!txParams.gasLimit) {
        txParams.gasLimit = await this.provider.estimateGas(txParams);
        logger.info(`Estimated gas: ${txParams.gasLimit.toString()}`);
      }

      // Get gas price if not provided
      if (!txParams.gasPrice) {
        txParams.gasPrice = await this.provider.getFeeData().then((fee: any) => fee.gasPrice);
        logger.info(`Gas price: ${txParams.gasPrice?.toString()}`);
      }

      // Get nonce if not provided
      if (txParams.nonce === undefined) {
        txParams.nonce = await this.provider.getTransactionCount(this.currentWallet!.address, 'pending');
        logger.info(`Nonce: ${txParams.nonce}`);
      }

      // Return transaction data for frontend signing
      return {
        hash: '', // Will be set after frontend signing
        from: this.currentWallet!.address,
        to: params.to,
        data: params.data,
        value: params.value.toString(),
        gasPrice: txParams.gasPrice?.toString() || '0',
        gas: txParams.gasLimit?.toString() || '0',
        nonce: txParams.nonce || 0,
        chainId: Number(txParams.chainId) || 0
      };
    } catch (error) {
      logger.error('Error preparing transaction for frontend:', error);
      throw error;
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (this.walletSource === 'local' && this.ethersWallet) {
      // Local wallet signing
      return await this.ethersWallet.signMessage(message);
    } else if (this.walletSource === 'frontend') {
      // Frontend wallet signing - return message for external signing
      logger.info('Message signing requires frontend wallet interaction');
      throw new Error('Message signing not supported for frontend wallets in this context');
    } else {
      throw new Error('No signing method available for current wallet type');
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (!this.provider) {
      const rpcUrl = this.getRpcUrl(this.currentWallet.chainId);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    const balance = await this.provider.getBalance(this.currentWallet.address);
    return balance.toString();
  }

  /**
   * Get transaction count (nonce)
   */
  async getTransactionCount(): Promise<number> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (!this.provider) {
      const rpcUrl = this.getRpcUrl(this.currentWallet.chainId);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    return await this.provider.getTransactionCount(this.currentWallet.address, 'pending');
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

  /**
   * Create a new wallet with private key
   */
  static createWallet(privateKey: string, chainId: number = 1): Wallet {
    const ethersWallet = new ethers.Wallet(privateKey);
    return {
      address: ethersWallet.address,
      chainId: chainId,
      privateKey: privateKey,
      isTestWallet: true,
      name: 'Generated Wallet',
      walletType: 'generated'
    };
  }

  /**
   * Generate a new random wallet
   */
  static generateWallet(chainId: number = 1): Wallet {
    const ethersWallet = ethers.Wallet.createRandom();
    return {
      address: ethersWallet.address,
      chainId: chainId,
      privateKey: ethersWallet.privateKey,
      isTestWallet: true,
      name: 'Generated Wallet',
      walletType: 'generated'
    };
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