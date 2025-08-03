"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const dotenv_1 = require("dotenv");
const ethers_1 = require("ethers");
(0, dotenv_1.config)();
/**
 * Configuration manager for Fusion+ Tron Extension
 * Centralizes all environment variables and contract addresses
 */
class ConfigManager {
    constructor() {
        // Network Configuration
        this.ETH_NETWORK = process.env.ETH_NETWORK || "sepolia";
        this.ETH_RPC_URL = process.env.ETH_RPC_URL;
        this.ETH_WS_URL = process.env.ETH_WS_URL;
        this.TRON_NETWORK = process.env.TRON_NETWORK || "nile";
        this.TRON_RPC_URL = process.env.TRON_RPC_URL;
        // API Configuration
        this.ONE_INCH_API_KEY = process.env.ONE_INCH_API_KEY || "";
        this.ONE_INCH_API_URL = process.env.ONE_INCH_API_URL || "https://api.1inch.dev";
        this.TRON_API_KEY = process.env.TRON_API_KEY || "";
        // Official Contract Addresses (Ethereum Sepolia)
        this.OFFICIAL_LOP_ADDRESS = process.env.OFFICIAL_LOP_ADDRESS;
        this.OFFICIAL_ESCROW_FACTORY_ADDRESS = process.env.OFFICIAL_ESCROW_FACTORY_ADDRESS;
        this.OFFICIAL_RESOLVER_ADDRESS = process.env.OFFICIAL_RESOLVER_ADDRESS;
        this.OFFICIAL_WETH_ADDRESS = process.env.OFFICIAL_WETH_ADDRESS;
        this.FUSION_EXTENSION_ADDRESS = process.env.FUSION_EXTENSION_ADDRESS;
        this.DEMO_RESOLVER_ADDRESS = process.env.DEMO_RESOLVER_ADDRESS ||
            "0xA7fa9C3a4BDBa7A2d29F8A2bC62Cf75c69C4bf3F";
        // Tron Contract Addresses
        this.TRON_ESCROW_FACTORY_ADDRESS = process.env.TRON_ESCROW_FACTORY_ADDRESS;
        this.TRON_ESCROW_SRC_IMPLEMENTATION = process.env.TRON_ESCROW_SRC_IMPLEMENTATION;
        this.TRON_ESCROW_DST_IMPLEMENTATION = process.env.TRON_ESCROW_DST_IMPLEMENTATION;
        // User Configuration
        this.USER_A_ETH_PRIVATE_KEY = process.env.USER_A_ETH_PRIVATE_KEY;
        this.USER_A_TRX_RECEIVE_ADDRESS = process.env.USER_A_TRX_RECEIVE_ADDRESS;
        this.USER_B_TRON_PRIVATE_KEY = process.env.USER_B_TRON_PRIVATE_KEY;
        this.USER_B_ETH_RECEIVE_ADDRESS = process.env.USER_B_ETH_RECEIVE_ADDRESS;
        this.USER_B_ETH_PRIVATE_KEY = process.env.USER_B_ETH_PRIVATE_KEY;
        // Constants
        this.TRX_REPRESENTATION_ADDRESS = "0x0000000000000000000000000000000000000000"; // Native TRX uses zero address
        this.ETH_CHAIN_ID = 11155111; // Sepolia
        this.TRON_CHAIN_ID = 3448148188; // Nile testnet
        this.MIN_TIMELOCK = 3600; // 1 hour
        this.MAX_TIMELOCK = 86400; // 24 hours
        this.validateConfig();
    }
    /**
     * Validate that all required configuration is present
     */
    validateConfig() {
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
    getEthProvider() {
        return new ethers_1.ethers.JsonRpcProvider(this.ETH_RPC_URL);
    }
    /**
     * Get Ethereum WebSocket provider
     */
    getEthWsProvider() {
        return new ethers_1.ethers.WebSocketProvider(this.ETH_WS_URL);
    }
    /**
     * Get Ethereum signer for given private key
     */
    getEthSigner(privateKey) {
        return new ethers_1.ethers.Wallet(privateKey, this.getEthProvider());
    }
    /**
     * Get TRX representation address for cross-chain orders
     */
    getTrxRepresentationAddress() {
        return this.TRX_REPRESENTATION_ADDRESS;
    }
    /**
     * Get Tron chain ID
     */
    getTronChainId() {
        return this.TRON_CHAIN_ID;
    }
    /**
     * Get Ethereum chain ID
     */
    getEthChainId() {
        return this.ETH_CHAIN_ID;
    }
    /**
     * Get default timelock duration (4 hours)
     */
    getDefaultTimelock() {
        return 14400; // 4 hours
    }
    /**
     * Validate timelock duration
     */
    validateTimelock(timelock) {
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
    getWethAddress() {
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
    isDevelopment() {
        return process.env.NODE_ENV !== "production";
    }
    /**
     * Get log level based on environment
     */
    getLogLevel() {
        return process.env.LOG_LEVEL || (this.isDevelopment() ? "debug" : "info");
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map