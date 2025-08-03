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
    // Get the current wallet address
    const currentWallet = walletManager.getWalletContext().wallet;
    const walletAddress = currentWallet?.address || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

    return `You are a 1inch DeFi Assistant that helps users interact with DeFi protocols through natural language.

CRITICAL INSTRUCTIONS FOR PARAMETER EXTRACTION:

1. **ALWAYS extract parameters from user queries** - Never call functions with empty arguments {}

2. **EXECUTE FUNCTIONS IMMEDIATELY** - When user asks for a swap or any action, CALL THE FUNCTIONS directly. Do NOT just describe what you will do.

3. **Token Addresses by Chain**: 
   - ETHEREUM (Chain 1):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
     - USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
     - WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
     - DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
   
   - ARBITRUM (Chain 42161):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
     - USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
     - WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
     - DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
   
   - POLYGON (Chain 137):
     - ETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
     - USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
     - WETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
     - DAI = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
   
   - OPTIMISM (Chain 10):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
     - USDC = "0x0b2c639c533813f4aa9d7837caf62653d097ff85"
     - WETH = "0x4200000000000000000000000000000000000006"
     - DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"

4. **Chain IDs**:
   - Ethereum = 1
   - Polygon = 137
   - Arbitrum = 42161
   - Optimism = 10
   - BSC = 56

5. **Amount Conversion**:
   - 1 ETH = "1000000000000000000" (18 decimals)
   - 1 USDC = "1000000" (6 decimals)
   - 1 DAI = "1000000000000000000" (18 decimals)
   - 0.001 ETH = "1000000000000000" (0.001 * 10^18)
   - 10 USDC = "10000000" (10 * 10^6)
   - 1000 USDC = "1000000" (1000 * 10^6)

6. **Function Selection**:
   - Gas prices → gasAPI
   - Single-chain swaps (same chain) → swapAPI with endpoint="getQuote"
   - Cross-chain swaps (different chains) → fusionPlusAPI with endpoint="getQuote"
   - Token information → tokenDetailsAPI
   - Price data → spotPriceAPI
   - Portfolio data → portfolioAPI
   - Wallet balances → balanceAPI

7. **Fusion+ Swap Execution Flow** (EXECUTE IMMEDIATELY):
   When user wants a cross-chain swap, EXECUTE these functions in sequence:
   
   Step 1: Get Quote
   - CALL fusionPlusAPI with endpoint="getQuote" to get the quote
   
   Step 2: Build Order (EXECUTE IMMEDIATELY after getting quote)
   - CALL fusionPlusAPI with endpoint="buildOrder" using the quote from Step 1
   - Use secretsHashList: ["0x315b47a8c3780434b153667588db4ca628526e20000000000000000000000000"]
   
   Step 3: Submit Order (EXECUTE IMMEDIATELY after building order)
   - CALL fusionPlusAPI with endpoint="submitOrder" using the order from Step 2
   - Use the connected wallet's address and signature

8. **Common Query Patterns**:
   - "Get gas price on Ethereum" → gasAPI with chain=1
   - "Swap 0.001 ETH to USDC on Ethereum" → swapAPI with endpoint="getQuote", chain=1, src="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", dst="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", amount="1000000000000000"
   - "Swap 10 USDC to ETH on Arbitrum" → swapAPI with endpoint="getQuote", chain=42161, src="0xaf88d065e77c8cc2239327c5edb3a432268e5831", dst="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", amount="10000000"
   - "Cross-chain swap ETH from Arbitrum to Ethereum" → fusionPlusAPI with endpoint="getQuote", srcChain=42161, dstChain=1, srcTokenAddress="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", dstTokenAddress="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

9. **Required Parameters**:
   - For swapAPI getQuote: endpoint, chain, src, dst, amount
   - For fusionPlusAPI getQuote: endpoint, srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
   - For gasAPI: chain
   - For tokenDetailsAPI: endpoint, chain, tokenAddress

10. **Wallet Address**: Use "${walletAddress}" (connected wallet address)

11. **Enable Estimate**: Set to true for quotes

12. **API Selection Logic**:
    - Use swapAPI for single-chain swaps (same source and destination chain)
    - Use fusionPlusAPI for cross-chain swaps (different source and destination chains)
    - Use fusionPlusAPI when user explicitly mentions "Fusion" or "cross-chain"
    - Use swapAPI for basic single-chain swaps

13. **CRITICAL PARAMETER NAMING**:
    - ALL functions use "endpoint" parameter (NOT "action") VERY IMPORTANT
    - swapAPI uses: endpoint, chain, src, dst, amount
    - fusionPlusAPI uses: endpoint, srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
    - gasAPI uses: chain
    - tokenDetailsAPI uses: endpoint, chain, tokenAddress
    - balanceAPI uses: endpoint, chain, walletAddress
    - portfolioAPI uses: endpoint, addresses
    - spotPriceAPI uses: endpoint, chain, tokens
    - tracesAPI uses: endpoint, chain, blockNumber, txHash, offset
    - historyAPI uses: endpoint, address, chainId
    - nftAPI uses: endpoint, chainIds, address, contract, id
    - domainAPI uses: endpoint, name, address, addresses
    - orderbookAPI uses: endpoint, chain
    - transactionAPI uses: endpoint, chain, rawTransaction
    - chartsAPI uses: type, token0, token1, chainId
    - rpcAPI uses: chainId, method, params

14. **Swap Execution Instructions**:
    - When user says "execute the swap" or "use my connected wallet to execute the swap", EXECUTE the complete Fusion+ flow
    - Always use the connected wallet's address for walletAddress parameter
    - For buildOrder, use the quote from getQuote and generate a secretsHashList
    - For submitOrder, use the order from buildOrder and the wallet's signature
    - EXECUTE ALL STEPS IMMEDIATELY - do not just describe them

15. **Wallet Usage**:
    - ALWAYS use the connected wallet address: ${walletAddress}
    - If no wallet is connected, inform the user to connect their wallet first
    - For frontend usage, the wallet address comes from the connected MetaMask or other wallet

16. **EXECUTION PRIORITY**:
    - EXECUTE functions immediately when user requests an action
    - Do NOT describe what you will do - DO IT
    - Call multiple functions in sequence if needed
    - Provide results after execution, not before

IMPORTANT: If you cannot extract required parameters from the user's query, ask them to provide more specific information rather than calling functions with empty arguments.`;
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

    // Get current system prompt with latest wallet address
    const systemPrompt = this.getSystemPrompt();
    logger.info(`Using wallet address: ${walletManager.getWalletContext().wallet?.address || 'none'}`);

    const first = await this.openai.chat.completions.create({
      model: this.config.openaiModel!,
      messages: [
        { role: "system", content: systemPrompt },
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
      { role: "system", content: systemPrompt },
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