import OpenAI from "openai";
import registry from "./registry";
import { FunctionDefinition, AgentKitConfig, AgentResponse } from "./types";
import { logger } from "../utils/logger";
import { walletManager, Wallet } from "../utils/wallet";

/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 */
export class OneInchAgentKit {
  private openai: OpenAI;
  private config: AgentKitConfig;

  constructor(config: AgentKitConfig = {}) {
    this.config = {
      openaiModel: "gpt-4o-mini",
      ...config,
    };

    const apiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: this.config.baseUrl,
    });

    // Initialize wallet manager
    this.initializeWallet();
  }

  /**
   * Initialize wallet (local for scripts, or wait for frontend wallet)
   */
  private async initializeWallet(): Promise<void> {
    try {
      await walletManager.initialize();
      const context = walletManager.getWalletContext();
      if (context.isConnected) {
        logger.info(`Wallet initialized: ${context.wallet?.address} (${context.source})`);
      }
    } catch (error) {
      logger.warn('Wallet initialization failed:', error);
    }
  }

  /**
   * Set wallet for frontend usage
   */
  setWallet(wallet: Wallet): void {
    walletManager.setFrontendWallet(wallet);
    logger.info(`Frontend wallet set: ${wallet.address} on chain ${wallet.chainId}`);
  }

  /**
   * Get current wallet info
   */
  getWallet(): Wallet | null {
    return walletManager.getWalletContext().wallet;
  }

  /**
   * Get comprehensive system prompt for better parameter extraction
   */
  private getSystemPrompt(): string {
    return `You are a 1inch DeFi Assistant that helps users interact with DeFi protocols through natural language.

CRITICAL INSTRUCTIONS FOR PARAMETER EXTRACTION:

1. **ALWAYS extract parameters from user queries** - Never call functions with empty arguments {}

2. **Token Addresses**: 
   - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
   - USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
   - WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
   - DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
   - USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

3. **Chain IDs**:
   - Ethereum = 1
   - Polygon = 137
   - Arbitrum = 42161
   - Optimism = 10
   - BSC = 56
   - Avalanche = 43114
   - Base = 8453
   - zkSync Era = 324
   - Gnosis = 100
   - Solana = 7565164

4. **Amount Conversion**:
   - 1 ETH = "1000000000000000000" (18 decimals)
   - 1 USDC = "1000000" (6 decimals)
   - 1 DAI = "1000000000000000000" (18 decimals)
   - 0.1 ETH = "100000000000000000" (0.1 * 10^18)
   - 1000 USDC = "1000000" (1000 * 10^6)

5. **FUNCTION SELECTION GUIDE**:

   **Gas & Network Data:**
   - Gas prices → gasAPI with chain
   - RPC calls → rpcAPI with chainId, method, params
   - Charts data → chartsAPI with type, token0, token1, chainId

   **Token Information:**
   - Token details → tokenDetailsAPI with endpoint, chainId
   - Spot prices → spotPriceAPI with endpoint, chain
   - Price charts → chartsAPI with type, token0, token1, chainId

   **Swaps & Trading:**
   - Single-chain swaps → swapAPI with endpoint="getQuote", chain, src, dst, amount
   - Cross-chain swaps → fusionPlusAPI with endpoint="getQuote", srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
   - Orderbook orders → orderbookAPI with endpoint, chain

   **Wallet & Portfolio:**
   - Wallet balances → balanceAPI with endpoint, chain, walletAddress
   - Portfolio data → portfolioAPI with endpoint, addresses
   - NFT data → nftAPI with endpoint, chainIds/chainId, address/contract, id

   **Domain & History:**
   - Domain lookup → domainAPI with endpoint, name/address/addresses
   - Transaction history → historyAPI with endpoint, address, chainId
   - Transaction traces → tracesAPI with endpoint, chain

6. **COMMON QUERY PATTERNS**:

   **Gas & Network:**
   - "Get gas price on Ethereum" → gasAPI with chain=1
   - "Get latest block number on Polygon" → rpcAPI with chainId=137, method="eth_blockNumber"
   - "Get ETH/USDC chart data" → chartsAPI with type="line", token0="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", token1="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chainId=1

   **Token Information:**
   - "Get USDC token details on Ethereum" → tokenDetailsAPI with endpoint="token-details", chainId=1, contractAddress="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
   - "Get current ETH price" → spotPriceAPI with endpoint="getRequestedPrices", chain=1, tokens=["0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"]
   - "Show me ETH price chart" → chartsAPI with type="line", token0="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", token1="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chainId=1, period="1M"

   **Swaps:**
   - "Get quote for 0.1 ETH to USDC on Ethereum" → swapAPI with endpoint="getQuote", chain=1, src="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", dst="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", amount="100000000000000000"
   - "Cross-chain swap ETH from Arbitrum to Ethereum" → fusionPlusAPI with endpoint="getQuote", srcChain=42161, dstChain=1, srcTokenAddress="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", dstTokenAddress="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", amount=100000000000000000, walletAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", enableEstimate=true

   **Wallet & Portfolio:**
   - "Get my token balances on Ethereum" → balanceAPI with endpoint="getBalances", chain=1, walletAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
   - "Show my portfolio value" → portfolioAPI with endpoint="getCurrentPortfolioValue", addresses=["0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"]
   - "Get my NFTs" → nftAPI with endpoint="getNftsByAddress", chainIds=[1, 137], address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

   **Domain & History:**
   - "Look up vitalik.eth" → domainAPI with endpoint="lookupDomain", name="vitalik.eth"
   - "Get transaction history for 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6" → historyAPI with endpoint="get-events", address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", chainId=1

7. **REQUIRED PARAMETERS BY FUNCTION**:

   **gasAPI**: chain
   **rpcAPI**: chainId, method
   **chartsAPI**: type, token0, token1, chainId
   **tokenDetailsAPI**: endpoint, chainId
   **spotPriceAPI**: endpoint, chain
   **balanceAPI**: endpoint, chain
   **portfolioAPI**: endpoint
   **nftAPI**: endpoint
   **domainAPI**: endpoint
   **orderbookAPI**: endpoint, chain
   **historyAPI**: endpoint, address, chainId
   **tracesAPI**: endpoint, chain
   **swapAPI**: endpoint, chain (for getQuote: also src, dst, amount)
   **fusionPlusAPI**: endpoint (for getQuote: also srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate)
   **transactionAPI**: endpoint, chain, rawTransaction

8. **DEFAULT VALUES**:
   - Wallet Address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
   - Enable Estimate: true (for quotes)
   - Chain: 1 (Ethereum) if not specified
   - Limit: 10 (for pagination)
   - Page: 1 (for pagination)

9. **SPECIAL CASES**:
   - For cross-chain operations, use fusionPlusAPI
   - For single-chain swaps, use swapAPI
   - For gas prices, use gasAPI
   - For RPC calls, use rpcAPI with specific method
   - For charts, specify type ("line" or "candle") and time period

IMPORTANT: If you cannot extract required parameters from the user's query, ask them to provide more specific information rather than calling functions with empty arguments. Always provide the minimum required parameters for each function.`;
  }

  /**
   * Send a user prompt → let the model call your functions → return final answer.
   */
  async chat(userPrompt: string, wallet?: Wallet): Promise<AgentResponse> {
    // Set wallet if provided
    if (wallet) {
      this.setWallet(wallet);
    }
    // Initialize registry if not already done
    await registry.init();
    
    logger.info("Starting chat with prompt:", userPrompt);
    
    // 1) ask the model, giving it all your function definitions
    const fnDefs: FunctionDefinition[] = registry.getFunctionDefinitions();
    logger.info(`Available functions: ${fnDefs.map(f => f.name).join(', ')}`);
    
    // Debug: Log the tracesAPI function definition
    const tracesAPIDef = fnDefs.find(f => f.name === 'tracesAPI');
    if (tracesAPIDef) {
        logger.info('tracesAPI function definition:', JSON.stringify(tracesAPIDef, null, 2));
    } else {
        logger.error('tracesAPI function not found in registry!');
    }

    const first = await this.openai.chat.completions.create({
      model: this.config.openaiModel!,
      messages: [
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: userPrompt }
      ],
      tools: fnDefs.map(def => ({
        type: "function" as const,
        function: def
      })),
      tool_choice: "auto",
    });

    const msg = first.choices[0].message!;
    logger.info("First response received:", msg);
    
    // 2) If it didn't call a function, just return the text
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      logger.info("No function calls made, returning direct response");
      return {
        content: msg.content ?? "",
      };
    }

    // 3) Otherwise, parse arguments & invoke your handler
    const functionCalls: AgentResponse['functionCalls'] = [];
    
    for (const toolCall of msg.tool_calls) {
      const { name, arguments: argStr } = toolCall.function;
      logger.info(`Raw function call - name: ${name}, arguments: ${argStr}`);
      const args = JSON.parse(argStr || "{}");
      
      logger.info(`Calling function: ${name} with args:`, args);
      
      try {
        const result = await registry.callFunction(name, args);
        functionCalls.push({
          name,
          arguments: args,
          result,
        });
        logger.info(`Function ${name} completed successfully`);
      } catch (error) {
        logger.error(`Function ${name} failed:`, error);
        functionCalls.push({
          name,
          arguments: args,
          result: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    // 4) Send the function's results back into the chat for a final response
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: this.getSystemPrompt() },
      { role: "user", content: userPrompt },
      msg,
    ];

    // Add function results - match by index to avoid duplicates
    for (let i = 0; i < functionCalls.length; i++) {
      const call = functionCalls[i];
      const toolCall = msg.tool_calls![i]; // Use index instead of find()
      if (toolCall && toolCall.function.name === call.name) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(call.result),
        });
      }
    }

    const second = await this.openai.chat.completions.create({
      model: this.config.openaiModel!,
      messages,
    });

    const finalMessage = second.choices[0].message;
    logger.debug("Final response received:", finalMessage);

    return {
      content: finalMessage?.content ?? "",
      functionCalls,
    };
  }

  /**
   * Get available functions
   */
  async getAvailableFunctions(): Promise<string[]> {
    await registry.init();
    return registry.getAvailableFunctions();
  }

  /**
   * Check if a specific function is available
   */
  async hasFunction(name: string): Promise<boolean> {
    await registry.init();
    return registry.hasFunction(name);
  }

  /**
   * Get function definitions for external use
   */
  async getFunctionDefinitions(): Promise<FunctionDefinition[]> {
    await registry.init();
    return registry.getFunctionDefinitions();
  }
}

/**
 * Convenience function for quick usage
 */
export async function createAgent(config?: AgentKitConfig): Promise<OneInchAgentKit> {
  return new OneInchAgentKit(config);
}

/**
 * Legacy function for backward compatibility
 */
export async function llmAgent(userPrompt: string, config?: AgentKitConfig): Promise<string> {
  const agent = new OneInchAgentKit(config);
  const response = await agent.chat(userPrompt);
  return response.content;
} 