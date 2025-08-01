import {
  FusionSDK,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
  Web3Like,
  PresetEnum,
} from "@1inch/fusion-sdk";
import { ethers } from "ethers";
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

// Use the official SDK types
import {
  Quote as FusionQuote,
  PreparedOrder as FusionPreparedOrder,
  OrderStatusResponse as FusionOrderStatusResponse,
} from "@1inch/fusion-sdk";

export interface Quote extends FusionQuote {
  // Extend if needed
}

export interface PreparedOrder extends FusionPreparedOrder {
  // Extend if needed
}

export interface OrderInfo {
  orderHash: string;
  signature: string;
}

/**
 * Official 1inch SDK wrapper for Fusion+ integration
 * Provides a clean interface to the official 1inch Fusion SDK
 */
export class Official1inchSDK {
  private sdk: FusionSDK;
  private config: ConfigManager;
  private logger: ScopedLogger;
  private provider: ethers.JsonRpcProvider;

  constructor(config: ConfigManager, logger: ScopedLogger) {
    this.config = config;
    this.logger = logger;
    this.provider = config.getEthProvider();

    // Create Web3Like provider for 1inch SDK
    const ethersProviderConnector: Web3Like = {
      eth: {
        call: (transactionConfig: any): Promise<string> => {
          return this.provider.call(transactionConfig);
        },
      },
      extend: (): void => {},
    };

    // Create blockchain provider connector
    const connector = new PrivateKeyProviderConnector(
      config.USER_A_ETH_PRIVATE_KEY,
      ethersProviderConnector
    );

    // Initialize official 1inch Fusion SDK
    this.sdk = new FusionSDK({
      url: config.ONE_INCH_API_URL + "/fusion",
      network: NetworkEnum.ETHEREUM, // Using Ethereum for Sepolia
      blockchainProvider: connector,
      authKey: config.ONE_INCH_API_KEY,
    });

    this.logger.info("Official 1inch SDK initialized", {
      network: NetworkEnum.ETHEREUM,
      apiUrl: config.ONE_INCH_API_URL,
    });
  }

  /**
   * Get quote for ETH -> TRX swap using official API
   */
  async getETHtoTRXQuote(
    ethAmount: bigint,
    fromAddress: string
  ): Promise<Quote> {
    this.logger.debug("Getting ETH->TRX quote", {
      ethAmount: ethAmount.toString(),
      fromAddress,
    });

    const params: QuoteParams = {
      fromTokenAddress: this.config.getWethAddress(), // WETH (required by 1inch API)
      toTokenAddress: this.config.getTrxRepresentationAddress(), // TRX representation
      amount: ethAmount.toString(),
      fromAddress: fromAddress,
      dstChainId: this.config.getTronChainId(),
      enableEstimate: true, // Required for order creation
    };

    try {
      const quote = await this.sdk.getQuote(params);
      this.logger.success("ETH->TRX quote received", {
        fromAmount: quote.fromTokenAmount,
        toAmount: quote.toTokenAmount,
      });
      return quote as Quote;
    } catch (error) {
      this.logger.failure("Failed to get ETH->TRX quote", error);
      throw error;
    }
  }

  /**
   * Get quote for TRX -> ETH swap using official API
   */
  async getTRXtoETHQuote(
    trxAmount: bigint,
    fromAddress: string
  ): Promise<Quote> {
    this.logger.debug("Getting TRX->ETH quote", {
      trxAmount: trxAmount.toString(),
      fromAddress,
    });

    const params: QuoteParams = {
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
      return quote as Quote;
    } catch (error) {
      this.logger.failure("Failed to get TRX->ETH quote", error);
      throw error;
    }
  }

  /**
   * Create cross-chain order using official SDK
   */
  async createCrossChainOrder(
    params: CreateOrderParams
  ): Promise<PreparedOrder> {
    this.logger.debug("Creating cross-chain order", params);

    const orderParams = {
      ...params,
      source: params.source || "fusion-tron-extension",
      preset: PresetEnum.fast, // Use fast preset by default
      walletAddress: params.fromAddress, // Required by official SDK
    };

    try {
      const preparedOrder = await this.sdk.createOrder(orderParams);
      this.logger.success("Cross-chain order created", {
        quoteId: preparedOrder.quoteId,
      });
      return preparedOrder as PreparedOrder;
    } catch (error) {
      this.logger.failure("Failed to create cross-chain order", error);
      throw error;
    }
  }

  /**
   * Submit order to 1inch network
   */
  async submitOrder(order: any, quoteId: string): Promise<OrderInfo> {
    this.logger.debug("Submitting order to 1inch network", { quoteId });

    try {
      const orderInfo = await this.sdk.submitOrder(order, quoteId);
      this.logger.success("Order submitted to 1inch network", {
        orderHash: orderInfo.orderHash,
      });
      return orderInfo;
    } catch (error) {
      this.logger.failure("Failed to submit order", error);
      throw error;
    }
  }

  /**
   * Get order status from 1inch network
   */
  async getOrderStatus(orderHash: string): Promise<FusionOrderStatusResponse> {
    try {
      const status = await this.sdk.getOrderStatus(orderHash);
      this.logger.debug("Order status retrieved", {
        orderHash,
        status: status.status,
      });
      return status;
    } catch (error) {
      this.logger.error("Failed to get order status", error);
      throw error;
    }
  }

  /**
   * Cancel order on 1inch network
   * Note: Cancellation may not be available in all SDK versions
   */
  async cancelOrder(orderHash: string): Promise<void> {
    this.logger.debug("Cancelling order", { orderHash });

    try {
      // Note: cancelOrder may not be available in all SDK versions
      // Implementation would depend on specific SDK version
      this.logger.warn(
        "Order cancellation not implemented in current SDK version"
      );
      throw new Error("Order cancellation not available");
    } catch (error) {
      this.logger.failure("Failed to cancel order", error);
      throw error;
    }
  }

  /**
   * Wait for order to be filled or expired
   */
  async waitForOrderCompletion(
    orderHash: string,
    timeoutMs: number = 300000 // 5 minutes default
  ): Promise<FusionOrderStatusResponse> {
    this.logger.info("Waiting for order completion", {
      orderHash,
      timeoutMs,
    });

    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getOrderStatus(orderHash);

        if (status.status === OrderStatus.Filled) {
          this.logger.success("Order filled successfully", {
            orderHash,
            fills: status.fills,
          });
          return status;
        }

        if (status.status === OrderStatus.Expired) {
          this.logger.warn("Order expired", { orderHash });
          return status;
        }

        if (status.status === OrderStatus.Cancelled) {
          this.logger.warn("Order cancelled", { orderHash });
          return status;
        }

        // Still pending, wait and retry
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
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
  async getSupportedTokens(): Promise<any[]> {
    try {
      // Note: This would need to be implemented based on 1inch API
      // For now, return basic ETH info
      return [
        {
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
          address: ethers.ZeroAddress,
          logoURI: "",
        },
      ];
    } catch (error) {
      this.logger.error("Failed to get supported tokens", error);
      throw error;
    }
  }
}
