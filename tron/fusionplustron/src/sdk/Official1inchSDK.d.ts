import { PresetEnum } from "@1inch/fusion-sdk";
import { ConfigManager } from "../utils/ConfigManager";
import { ScopedLogger } from "../utils/Logger";
export interface QuoteParams {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    dstChainId?: number;
    enableEstimate?: boolean;
}
export interface CreateOrderParams extends QuoteParams {
    source?: string;
    preset?: PresetEnum;
}
import { Quote as FusionQuote, PreparedOrder as FusionPreparedOrder, OrderStatusResponse as FusionOrderStatusResponse } from "@1inch/fusion-sdk";
export interface Quote extends FusionQuote {
}
export interface PreparedOrder extends FusionPreparedOrder {
}
export interface OrderInfo {
    orderHash: string;
    signature: string;
}
/**
 * Official 1inch SDK wrapper for Fusion+ integration
 * Provides a clean interface to the official 1inch Fusion SDK
 */
export declare class Official1inchSDK {
    private sdk;
    private config;
    private logger;
    private provider;
    constructor(config: ConfigManager, logger: ScopedLogger);
    /**
     * Get quote for ETH -> TRX swap using official API
     * NOTE: Cross-chain quotes use atomic coordination, not direct API calls
     */
    getETHtoTRXQuote(ethAmount: bigint, fromAddress: string): Promise<Quote>;
    /**
     * Get realistic same-chain quote for ETH -> WETH (for demo purposes)
     */
    getETHtoWETHQuote(ethAmount: bigint, fromAddress: string): Promise<Quote>;
    /**
     * Get quote for TRX -> ETH swap using official API
     */
    getTRXtoETHQuote(trxAmount: bigint, fromAddress: string): Promise<Quote>;
    /**
     * Create cross-chain order using official SDK
     */
    createCrossChainOrder(params: CreateOrderParams): Promise<PreparedOrder>;
    /**
     * Submit order to 1inch network
     */
    submitOrder(order: any, quoteId: string): Promise<OrderInfo>;
    /**
     * Get order status from 1inch network
     */
    getOrderStatus(orderHash: string): Promise<FusionOrderStatusResponse>;
    /**
     * Cancel order on 1inch network
     * Note: Cancellation may not be available in all SDK versions
     */
    cancelOrder(orderHash: string): Promise<void>;
    /**
     * Wait for order to be filled or expired
     */
    waitForOrderCompletion(orderHash: string, timeoutMs?: number): Promise<FusionOrderStatusResponse>;
    /**
     * Get network information
     */
    getNetworkInfo(): {
        chainId: number;
        network: string;
        rpcUrl: string;
    };
    /**
     * Get supported tokens for current network
     */
    getSupportedTokens(): Promise<any[]>;
}
//# sourceMappingURL=Official1inchSDK.d.ts.map