import { config } from "dotenv";
import { ethers } from "ethers";

config();

/**
 * Configuration manager for Fusion+ Tron Extension
 * Centralizes all environment variables and contract addresses
 */
export class ConfigManager {
  // Network Configuration
  public readonly ETH_NETWORK = process.env.ETH_NETWORK || "sepolia";
  public readonly ETH_RPC_URL = process.env.ETH_RPC_URL!;
  public readonly ETH_WS_URL = process.env.ETH_WS_URL!;
  public readonly TRON_NETWORK = process.env.TRON_NETWORK || "nile";
  public readonly TRON_RPC_URL = process.env.TRON_RPC_URL!;

  // API Configuration
  public readonly ONE_INCH_API_KEY = process.env.ONE_INCH_API_KEY || "";
  public readonly ONE_INCH_API_URL =
    process.env.ONE_INCH_API_URL || "https://api.1inch.dev";
  public readonly TRON_API_KEY = process.env.TRON_API_KEY || "";

  // Official Contract Addresses (Ethereum Sepolia)
  public readonly OFFICIAL_LOP_ADDRESS = process.env.OFFICIAL_LOP_ADDRESS!;
  public readonly OFFICIAL_ESCROW_FACTORY_ADDRESS =
    process.env.OFFICIAL_ESCROW_FACTORY_ADDRESS!;
  public readonly OFFICIAL_RESOLVER_ADDRESS =
    process.env.OFFICIAL_RESOLVER_ADDRESS!;
  public readonly OFFICIAL_WETH_ADDRESS = process.env.OFFICIAL_WETH_ADDRESS!;
  public readonly FUSION_EXTENSION_ADDRESS =
    process.env.FUSION_EXTENSION_ADDRESS!;
  public readonly DEMO_RESOLVER_ADDRESS =
    process.env.DEMO_RESOLVER_ADDRESS ||
    "0xA7fa9C3a4BDBa7A2d29F8A2bC62Cf75c69C4bf3F";

  // Tron Contract Addresses
  public readonly TRON_ESCROW_FACTORY_ADDRESS =
    process.env.TRON_ESCROW_FACTORY_ADDRESS!;
  public readonly TRON_ESCROW_SRC_IMPLEMENTATION =
    process.env.TRON_ESCROW_SRC_IMPLEMENTATION!;
  public readonly TRON_ESCROW_DST_IMPLEMENTATION =
    process.env.TRON_ESCROW_DST_IMPLEMENTATION!;

  // User Configuration
  public readonly USER_A_ETH_PRIVATE_KEY = process.env.USER_A_ETH_PRIVATE_KEY!;
  public readonly USER_A_TRX_RECEIVE_ADDRESS =
    process.env.USER_A_TRX_RECEIVE_ADDRESS!;
  public readonly USER_B_TRON_PRIVATE_KEY =
    process.env.USER_B_TRON_PRIVATE_KEY!;
  public readonly USER_B_ETH_RECEIVE_ADDRESS =
    process.env.USER_B_ETH_RECEIVE_ADDRESS!;

  // Constants
  public readonly TRX_REPRESENTATION_ADDRESS =
    "0x0000000000000000000000000000000000000000"; // Native TRX uses zero address
  public readonly ETH_CHAIN_ID = 11155111; // Sepolia
  public readonly TRON_CHAIN_ID = 3448148188; // Nile testnet
  public readonly MIN_TIMELOCK = 3600; // 1 hour
  public readonly MAX_TIMELOCK = 86400; // 24 hours

  constructor() {
    this.validateConfig();
  }

  /**
   * Validate that all required configuration is present
   */
  private validateConfig(): void {
    const required = [
      "ETH_RPC_URL",
      "TRON_RPC_URL",
      "OFFICIAL_LOP_ADDRESS",
      "OFFICIAL_ESCROW_FACTORY_ADDRESS",
      "OFFICIAL_RESOLVER_ADDRESS",
      "FUSION_EXTENSION_ADDRESS",
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  /**
   * Get Ethereum provider
   */
  getEthProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(this.ETH_RPC_URL);
  }

  /**
   * Get Ethereum WebSocket provider
   */
  getEthWsProvider(): ethers.WebSocketProvider {
    return new ethers.WebSocketProvider(this.ETH_WS_URL);
  }

  /**
   * Get Ethereum signer for given private key
   */
  getEthSigner(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.getEthProvider());
  }

  /**
   * Get TRX representation address for cross-chain orders
   */
  getTrxRepresentationAddress(): string {
    return this.TRX_REPRESENTATION_ADDRESS;
  }

  /**
   * Get Tron chain ID
   */
  getTronChainId(): number {
    return this.TRON_CHAIN_ID;
  }

  /**
   * Get Ethereum chain ID
   */
  getEthChainId(): number {
    return this.ETH_CHAIN_ID;
  }

  /**
   * Get default timelock duration (4 hours)
   */
  getDefaultTimelock(): number {
    return 14400; // 4 hours
  }

  /**
   * Validate timelock duration
   */
  validateTimelock(timelock: number): boolean {
    return timelock >= this.MIN_TIMELOCK && timelock <= this.MAX_TIMELOCK;
  }

  /**
   * Get network configuration for 1inch SDK
   */
  get1inchNetworkConfig() {
    return {
      chainId: this.ETH_CHAIN_ID,
      rpcUrl: this.ETH_RPC_URL,
      apiUrl: this.ONE_INCH_API_URL,
      apiKey: this.ONE_INCH_API_KEY,
    };
  }

  /**
   * Get WETH contract address
   */
  getWethAddress(): string {
    return this.OFFICIAL_WETH_ADDRESS;
  }

  /**
   * Get contract addresses as object
   */
  getContractAddresses() {
    return {
      ethereum: {
        lop: this.OFFICIAL_LOP_ADDRESS,
        escrowFactory: this.OFFICIAL_ESCROW_FACTORY_ADDRESS,
        resolver: this.OFFICIAL_RESOLVER_ADDRESS,
        demoResolver: this.DEMO_RESOLVER_ADDRESS,
        weth: this.OFFICIAL_WETH_ADDRESS,
        fusionExtension: this.FUSION_EXTENSION_ADDRESS,
      },
      tron: {
        escrowFactory: this.TRON_ESCROW_FACTORY_ADDRESS,
        escrowSrcImplementation: this.TRON_ESCROW_SRC_IMPLEMENTATION,
        escrowDstImplementation: this.TRON_ESCROW_DST_IMPLEMENTATION,
      },
    };
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  }

  /**
   * Get log level based on environment
   */
  getLogLevel(): string {
    return process.env.LOG_LEVEL || (this.isDevelopment() ? "debug" : "info");
  }
}
