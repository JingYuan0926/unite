import { ethers } from "ethers";
/**
 * Configuration manager for Fusion+ Tron Extension
 * Centralizes all environment variables and contract addresses
 */
export declare class ConfigManager {
    readonly ETH_NETWORK: string;
    readonly ETH_RPC_URL: string;
    readonly ETH_WS_URL: string;
    readonly TRON_NETWORK: string;
    readonly TRON_RPC_URL: string;
    readonly ONE_INCH_API_KEY: string;
    readonly ONE_INCH_API_URL: string;
    readonly TRON_API_KEY: string;
    readonly OFFICIAL_LOP_ADDRESS: string;
    readonly OFFICIAL_ESCROW_FACTORY_ADDRESS: string;
    readonly OFFICIAL_RESOLVER_ADDRESS: string;
    readonly OFFICIAL_WETH_ADDRESS: string;
    readonly FUSION_EXTENSION_ADDRESS: string;
    readonly DEMO_RESOLVER_ADDRESS: string;
    readonly TRON_ESCROW_FACTORY_ADDRESS: string;
    readonly TRON_ESCROW_SRC_IMPLEMENTATION: string;
    readonly TRON_ESCROW_DST_IMPLEMENTATION: string;
    readonly USER_A_ETH_PRIVATE_KEY: string;
    readonly USER_A_TRX_RECEIVE_ADDRESS: string;
    readonly USER_B_TRON_PRIVATE_KEY: string;
    readonly USER_B_ETH_RECEIVE_ADDRESS: string;
    readonly USER_B_ETH_PRIVATE_KEY: string;
    readonly TRX_REPRESENTATION_ADDRESS = "0x0000000000000000000000000000000000000000";
    readonly ETH_CHAIN_ID = 11155111;
    readonly TRON_CHAIN_ID = 3448148188;
    readonly MIN_TIMELOCK = 3600;
    readonly MAX_TIMELOCK = 86400;
    constructor();
    /**
     * Validate that all required configuration is present
     */
    private validateConfig;
    /**
     * Get Ethereum provider
     */
    getEthProvider(): ethers.JsonRpcProvider;
    /**
     * Get Ethereum WebSocket provider
     */
    getEthWsProvider(): ethers.WebSocketProvider;
    /**
     * Get Ethereum signer for given private key
     */
    getEthSigner(privateKey: string): ethers.Wallet;
    /**
     * Get TRX representation address for cross-chain orders
     */
    getTrxRepresentationAddress(): string;
    /**
     * Get Tron chain ID
     */
    getTronChainId(): number;
    /**
     * Get Ethereum chain ID
     */
    getEthChainId(): number;
    /**
     * Get default timelock duration (4 hours)
     */
    getDefaultTimelock(): number;
    /**
     * Validate timelock duration
     */
    validateTimelock(timelock: number): boolean;
    /**
     * Get network configuration for 1inch SDK
     */
    get1inchNetworkConfig(): {
        chainId: number;
        rpcUrl: string;
        apiUrl: string;
        apiKey: string;
    };
    /**
     * Get WETH contract address
     */
    getWethAddress(): string;
    /**
     * Get contract addresses as object
     */
    getContractAddresses(): {
        ethereum: {
            lop: string;
            escrowFactory: string;
            resolver: string;
            demoResolver: string;
            weth: string;
            fusionExtension: string;
        };
        tron: {
            escrowFactory: string;
            escrowSrcImplementation: string;
            escrowDstImplementation: string;
        };
    };
    /**
     * Check if running in development mode
     */
    isDevelopment(): boolean;
    /**
     * Get log level based on environment
     */
    getLogLevel(): string;
}
//# sourceMappingURL=ConfigManager.d.ts.map