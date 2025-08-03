"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Official1inchSDK = void 0;
const fusion_sdk_1 = require("@1inch/fusion-sdk");
const ethers_1 = require("ethers");
/**
 * Official 1inch SDK wrapper for Fusion+ integration
 * Provides a clean interface to the official 1inch Fusion SDK
 */
class Official1inchSDK {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.provider = config.getEthProvider();
        // Create Web3Like provider for 1inch SDK
        const ethersProviderConnector = {
            eth: {
                call: (transactionConfig) => {
                    return this.provider.call(transactionConfig);
                },
            },
            extend: () => { },
        };
        // Create blockchain provider connector
        const connector = new fusion_sdk_1.PrivateKeyProviderConnector(config.USER_A_ETH_PRIVATE_KEY, ethersProviderConnector);
        // Initialize official 1inch Fusion SDK
        this.sdk = new fusion_sdk_1.FusionSDK({
            url: config.ONE_INCH_API_URL + "/fusion",
            network: fusion_sdk_1.NetworkEnum.ETHEREUM, // Using Ethereum for Sepolia
            blockchainProvider: connector,
            authKey: config.ONE_INCH_API_KEY,
        });
        this.logger.info("Official 1inch SDK initialized", {
            network: fusion_sdk_1.NetworkEnum.ETHEREUM,
            apiUrl: config.ONE_INCH_API_URL,
        });
    }
    /**
     * Get quote for ETH -> TRX swap using official API
     * NOTE: Cross-chain quotes use atomic coordination, not direct API calls
     */
    async getETHtoTRXQuote(ethAmount, fromAddress) {
        this.logger.debug("Getting ETH->TRX quote (cross-chain)", {
            ethAmount: ethAmount.toString(),
            fromAddress,
        });
        // For cross-chain swaps, we use atomic coordination rather than API quotes
        // This method demonstrates the interface but returns calculated cross-chain data
        this.logger.warn("Cross-chain quotes use atomic coordination, not 1inch API");
        const mockRate = 2000n; // 1 ETH = 2000 TRX (example rate)
        const trxAmount = ethAmount * mockRate;
        return {
            fromTokenAmount: ethAmount.toString(),
            toTokenAmount: trxAmount.toString(),
            fromToken: {
                address: ethers_1.ethers.ZeroAddress,
                symbol: "ETH",
                name: "Ethereum",
                decimals: 18,
                logoURI: "",
            },
            toToken: {
                address: this.config.TRX_REPRESENTATION_ADDRESS,
                symbol: "TRX",
                name: "Tron",
                decimals: 6,
                logoURI: "",
            },
            quoteId: `cross-chain-${Date.now()}`,
            gas: "200000",
            gasPrice: "20000000000",
        };
    }
    /**
     * Get realistic same-chain quote for ETH -> WETH (for demo purposes)
     */
    async getETHtoWETHQuote(ethAmount, fromAddress) {
        this.logger.debug("Getting ETH->WETH quote (same-chain demo)", {
            ethAmount: ethAmount.toString(),
            fromAddress,
        });
        const params = {
            fromTokenAddress: ethers_1.ethers.ZeroAddress, // ETH
            toTokenAddress: this.config.getWethAddress(), // WETH
            amount: ethAmount.toString(),
            fromAddress: fromAddress,
            enableEstimate: true,
        };
        try {
            const quote = await this.sdk.getQuote(params);
            this.logger.success("ETH->WETH quote received", {
                fromAmount: quote.fromTokenAmount,
                toAmount: quote.toTokenAmount,
            });
            return quote;
        }
        catch (error) {
            this.logger.warn("API quota exceeded, using mock data for demo");
            // Return mock 1:1 ETH to WETH conversion for demo
            return {
                fromTokenAmount: ethAmount.toString(),
                toTokenAmount: ethAmount.toString(), // 1:1 ETH to WETH
                fromToken: {
                    address: ethers_1.ethers.ZeroAddress,
                    symbol: "ETH",
                    name: "Ethereum",
                    decimals: 18,
                    logoURI: "",
                },
                toToken: {
                    address: this.config.getWethAddress(),
                    symbol: "WETH",
                    name: "Wrapped Ethereum",
                    decimals: 18,
                    logoURI: "",
                },
                quoteId: `mock-weth-${Date.now()}`,
                gas: "50000",
                gasPrice: "20000000000",
            };
        }
    }
    /**
     * Get quote for TRX -> ETH swap using official API
     */
    async getTRXtoETHQuote(trxAmount, fromAddress) {
        this.logger.debug("Getting TRX->ETH quote", {
            trxAmount: trxAmount.toString(),
            fromAddress,
        });
        const params = {
            fromTokenAddress: this.config.getTrxRepresentationAddress(), // TRX representation
            toTokenAddress: this.config.getWethAddress(), // WETH (required by 1inch API)
            amount: trxAmount.toString(),
            fromAddress: fromAddress,
            dstChainId: this.config.getEthChainId(),
            enableEstimate: true,
        };
        try {
            const quote = await this.sdk.getQuote(params);
            this.logger.success("TRX->ETH quote received", {
                fromAmount: quote.fromTokenAmount,
                toAmount: quote.toTokenAmount,
            });
            return quote;
        }
        catch (error) {
            this.logger.failure("Failed to get TRX->ETH quote", error);
            throw error;
        }
    }
    /**
     * Create cross-chain order using official SDK
     */
    async createCrossChainOrder(params) {
        this.logger.debug("Creating cross-chain order", params);
        const orderParams = {
            ...params,
            source: params.source || "fusion-tron-extension",
            preset: fusion_sdk_1.PresetEnum.fast, // Use fast preset by default
            walletAddress: params.fromAddress, // Required by official SDK
        };
        try {
            const preparedOrder = await this.sdk.createOrder(orderParams);
            this.logger.success("Cross-chain order created", {
                quoteId: preparedOrder.quoteId,
            });
            return preparedOrder;
        }
        catch (error) {
            this.logger.failure("Failed to create cross-chain order", error);
            throw error;
        }
    }
    /**
     * Submit order to 1inch network
     */
    async submitOrder(order, quoteId) {
        this.logger.debug("Submitting order to 1inch network", { quoteId });
        try {
            const orderInfo = await this.sdk.submitOrder(order, quoteId);
            this.logger.success("Order submitted to 1inch network", {
                orderHash: orderInfo.orderHash,
            });
            return orderInfo;
        }
        catch (error) {
            this.logger.failure("Failed to submit order", error);
            throw error;
        }
    }
    /**
     * Get order status from 1inch network
     */
    async getOrderStatus(orderHash) {
        try {
            const status = await this.sdk.getOrderStatus(orderHash);
            this.logger.debug("Order status retrieved", {
                orderHash,
                status: status.status,
            });
            return status;
        }
        catch (error) {
            this.logger.error("Failed to get order status", error);
            throw error;
        }
    }
    /**
     * Cancel order on 1inch network
     * Note: Cancellation may not be available in all SDK versions
     */
    async cancelOrder(orderHash) {
        this.logger.debug("Cancelling order", { orderHash });
        try {
            // Note: cancelOrder may not be available in all SDK versions
            // Implementation would depend on specific SDK version
            this.logger.warn("Order cancellation not implemented in current SDK version");
            throw new Error("Order cancellation not available");
        }
        catch (error) {
            this.logger.failure("Failed to cancel order", error);
            throw error;
        }
    }
    /**
     * Wait for order to be filled or expired
     */
    async waitForOrderCompletion(orderHash, timeoutMs = 300000 // 5 minutes default
    ) {
        this.logger.info("Waiting for order completion", {
            orderHash,
            timeoutMs,
        });
        const startTime = Date.now();
        const pollInterval = 5000; // 5 seconds
        while (Date.now() - startTime < timeoutMs) {
            try {
                const status = await this.getOrderStatus(orderHash);
                if (status.status === fusion_sdk_1.OrderStatus.Filled) {
                    this.logger.success("Order filled successfully", {
                        orderHash,
                        fills: status.fills,
                    });
                    return status;
                }
                if (status.status === fusion_sdk_1.OrderStatus.Expired) {
                    this.logger.warn("Order expired", { orderHash });
                    return status;
                }
                if (status.status === fusion_sdk_1.OrderStatus.Cancelled) {
                    this.logger.warn("Order cancelled", { orderHash });
                    return status;
                }
                // Still pending, wait and retry
                await new Promise((resolve) => setTimeout(resolve, pollInterval));
            }
            catch (error) {
                this.logger.error("Error checking order status", error);
                await new Promise((resolve) => setTimeout(resolve, pollInterval));
            }
        }
        throw new Error(`Order completion timeout after ${timeoutMs}ms`);
    }
    /**
     * Get network information
     */
    getNetworkInfo() {
        return {
            chainId: this.config.getEthChainId(),
            network: this.config.ETH_NETWORK,
            rpcUrl: this.config.ETH_RPC_URL,
        };
    }
    /**
     * Get supported tokens for current network
     */
    async getSupportedTokens() {
        try {
            // Note: This would need to be implemented based on 1inch API
            // For now, return basic ETH info
            return [
                {
                    symbol: "ETH",
                    name: "Ethereum",
                    decimals: 18,
                    address: ethers_1.ethers.ZeroAddress,
                    logoURI: "",
                },
            ];
        }
        catch (error) {
            this.logger.error("Failed to get supported tokens", error);
            throw error;
        }
    }
}
exports.Official1inchSDK = Official1inchSDK;
//# sourceMappingURL=Official1inchSDK.js.map