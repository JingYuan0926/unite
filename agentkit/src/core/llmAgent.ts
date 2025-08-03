import OpenAI from "openai";
import registry from "./registry";
import { FunctionDefinition, AgentKitConfig, AgentResponse } from "./types";
import { logger } from "../utils/logger";
import { walletManager, Wallet } from "../utils/wallet";

/**
 * Conversation state for tracking multi-step actions
 */
interface ConversationState {
  currentAction: string;
  step: number;
  data: any;
  quote?: any;
  order?: any;
}

/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 */
export class OneInchAgentKit {
  private openai: OpenAI;
  private config: AgentKitConfig;
  private conversationState: ConversationState | null = null;

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

3. **CONTINUE MULTI-STEP ACTIONS** - If you have already started a multi-step process (like Fusion+ swap), continue with the next step automatically.

4. **EXACT PARAMETER NAMES** - Use these EXACT parameter names, no variations:
   - fusionPlusAPI: endpoint, srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
   - swapAPI: endpoint, chain, src, dst, amount
   - gasAPI: chain
   - tokenDetailsAPI: endpoint, chain, tokenAddress

5. **Token Addresses by Chain** (FUSION+ USES WETH, NOT NATIVE ETH): 
   **CRITICAL: For fusionPlusAPI, ALWAYS use WETH addresses, NEVER use native ETH addresses (0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)**
   
   - ETHEREUM (Chain 1):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" (for swapAPI only)
     - WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" (for fusionPlusAPI)
     - USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
     - DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
   
   - ARBITRUM (Chain 42161):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" (for swapAPI only)
     - WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" (for fusionPlusAPI)
     - USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
     - DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
   
   - POLYGON (Chain 137):
     - ETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
     - WETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
     - USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
     - DAI = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
   
   - OPTIMISM (Chain 10):
     - ETH = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" (for swapAPI only)
     - WETH = "0x4200000000000000000000000000000000000006" (for fusionPlusAPI)
     - USDC = "0x0b2c639c533813f4aa9d7837caf62653d097ff85"
     - DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"

6. **Chain IDs**:
   - Ethereum = 1
   - Polygon = 137
   - Arbitrum = 42161
   - Optimism = 10
   - BSC = 56

7. **Amount Conversion**:
   - 1 ETH = "1000000000000000000" (18 decimals)
   - 1 USDC = "1000000" (6 decimals)
   - 1 DAI = "1000000000000000000" (18 decimals)
   - 0.001 ETH = "1000000000000000" (0.001 * 10^18)
   - 10 USDC = "10000000" (10 * 10^6)
   - 1000 USDC = "1000000" (1000 * 10^6)

8. **Function Selection**:
   - Gas prices → gasAPI
   - Single-chain swaps (same chain) → swapAPI with endpoint="getQuote"
   - Cross-chain swaps (different chains) → fusionPlusAPI with endpoint="getQuote"
   - ETH to TRON swaps → tron (ALWAYS use this for any ETH to TRON swap request)
   - Token information → tokenDetailsAPI
   - Price data → spotPriceAPI
   - Portfolio data → portfolioAPI
   - Wallet balances → balanceAPI

9. **Fusion+ Swap Execution Flow** (EXECUTE IMMEDIATELY):
   When user wants a cross-chain swap, EXECUTE this function:
   
   - CALL fusionPlusAPI with endpoint="executeCrossChainSwap" to complete the entire swap
   - This function handles: getQuote + buildOrder + submitOrder automatically
   - Use preset="fast" for quick execution
   
   EXAMPLE:
   "Cross-chain swap 0.001 ETH from Arbitrum to Ethereum" → fusionPlusAPI with:
   {
     "endpoint": "executeCrossChainSwap",
     "srcChain": 42161,
     "dstChain": 1,
     "srcTokenAddress": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
     "dstTokenAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH on Ethereum
     "amount": "1000000000000000",
     "walletAddress": "${walletAddress}",
     "preset": "fast"
   }

10. **EXACT EXAMPLES**:
    - "Cross-chain swap ETH from Arbitrum to Ethereum" → fusionPlusAPI with:
      {
        "endpoint": "getQuote",
        "srcChain": 42161,
        "dstChain": 1,
        "srcTokenAddress": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
        "dstTokenAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH on Ethereum
        "amount": "1000000000000000",
        "walletAddress": "${walletAddress}",
        "enableEstimate": true
      }
    
    - "Swap ETH to USDC on Ethereum" → swapAPI with:
      {
        "endpoint": "getQuote",
        "chain": 1,
        "src": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH for swapAPI
        "dst": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "amount": "1000000000000000000"
      }

11. **Required Parameters**:
    - For swapAPI getQuote: endpoint, chain, src, dst, amount
    - For fusionPlusAPI getQuote: endpoint, srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
    - For gasAPI: chain
    - For tokenDetailsAPI: endpoint, chain, tokenAddress

12. **Wallet Address**: Use "${walletAddress}" (connected wallet address)

13. **Enable Estimate**: Set to true for quotes

14. **API Selection Logic**:
    - Use swapAPI for single-chain swaps (same source and destination chain)
    - Use fusionPlusAPI for cross-chain swaps (different source and destination chains)
    - Use fusionPlusAPI when user explicitly mentions "Fusion" or "cross-chain"
    - Use swapAPI for basic single-chain swaps

15. **CRITICAL PARAMETER NAMING**:
    - ALL functions use "endpoint" parameter (NOT "action") VERY IMPORTANT!! (PLEASE DO NOT IGNORE THIS)
    - fusionPlusAPI uses: endpoint, srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate
    - swapAPI uses: endpoint, chain, src, dst, amount
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

16. **Swap Execution Instructions**:
    - When user says "execute the swap" or "use my connected wallet to execute the swap", EXECUTE the complete Fusion+ flow
    - Always use the connected wallet's address for walletAddress parameter
    - For buildOrder, use the quote from getQuote and generate a secretsHashList
    - For submitOrder, use the order from buildOrder and the wallet's signature
    - EXECUTE ALL STEPS IMMEDIATELY - do not just describe them

17. **Wallet Usage**:
    - ALWAYS use the connected wallet address: ${walletAddress}
    - If no wallet is connected, inform the user to connect their wallet first
    - For frontend usage, the wallet address comes from the connected MetaMask or other wallet

18. **EXECUTION PRIORITY**:
    - EXECUTE functions immediately when user requests an action
    - Do NOT describe what you will do - DO IT
    - Call multiple functions in sequence if needed
    - Provide results after execution, not before

19. **CONTINUATION INSTRUCTIONS**:
    - If you have a quote from a previous step, continue with buildOrder
    - If you have an order from buildOrder, continue with submitOrder
    - If user says "continue" or "execute", proceed with the next step automatically
    - Do not ask for parameters again if you already have them from previous steps

20. **NEVER USE THESE WRONG PARAMETER NAMES**:
    - ❌ fromTokenAddress (use srcTokenAddress)
    - ❌ toTokenAddress (use dstTokenAddress)
    - ❌ action (use endpoint)
    - ❌ fromChain (use srcChain)
    - ❌ toChain (use dstChain)

21. **FUSION+ TOKEN RULES**:
    - Fusion+ API requires WETH addresses, NOT native ETH addresses
    - For ETH swaps in Fusion+, use WETH addresses:
      - Arbitrum WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
      - Ethereum WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      - Optimism WETH: "0x4200000000000000000000000000000000000006"
    - Only swapAPI can use native ETH addresses (0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)

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
    
    // Check if we should continue a previous action
    if (this.shouldContinueAction(userPrompt)) {
      return this.continueAction(userPrompt);
    }
    
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
        
        // Update conversation state based on function results
        this.updateConversationState(name, args, result);
        
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
   * Check if we should continue a previous action
   */
  private shouldContinueAction(userPrompt: string): boolean {
    if (!this.conversationState) return false;
    
    const continueKeywords = ['continue', 'execute', 'proceed', 'next', 'build', 'submit', 'complete'];
    const lowerPrompt = userPrompt.toLowerCase();
    
    return continueKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Continue with the next step of a multi-step action
   */
  private async continueAction(userPrompt: string): Promise<AgentResponse> {
    if (!this.conversationState) {
      return { content: "No previous action to continue." };
    }

    logger.info(`Continuing action: ${this.conversationState.currentAction} at step ${this.conversationState.step}`);

    // For Fusion+ swap, continue with the next step
    if (this.conversationState.currentAction === 'fusionPlusSwap') {
      if (this.conversationState.step === 1 && this.conversationState.quote) {
        // Step 2: Build Order
        return this.executeBuildOrder();
      } else if (this.conversationState.step === 2 && this.conversationState.order) {
        // Step 3: Submit Order
        return this.executeSubmitOrder();
      }
    }

    return { content: "Action completed or no next step available." };
  }

  /**
   * Execute buildOrder step
   */
  private async executeBuildOrder(): Promise<AgentResponse> {
    const quote = this.conversationState!.quote;
    const walletAddress = walletManager.getWalletContext().wallet?.address;
    
    if (!walletAddress) {
      return { content: "No wallet connected. Please connect your wallet first." };
    }

    // Use the correct WETH addresses directly for Fusion+ API
    const buildOrderArgs = {
      endpoint: "buildOrder",
      srcChain: 42161, // Arbitrum
      dstChain: 1, // Ethereum
      srcTokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // Arbitrum WETH
      dstTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // Ethereum WETH
      amount: quote.srcTokenAmount || "1000000000000000",
      walletAddress: walletAddress,
      quote: quote,
      secretsHashList: ["0x315b47a8c3780434b153667588db4ca628526e20000000000000000000000000"]
    };

    try {
      const result = await registry.callFunction('fusionPlusAPI', buildOrderArgs);
      this.conversationState!.step = 2;
      this.conversationState!.order = result;
      
      return {
        content: `Order built successfully! Now proceeding to submit the order.`,
        functionCalls: [{
          name: 'fusionPlusAPI',
          arguments: buildOrderArgs,
          result: result
        }]
      };
    } catch (error) {
      return {
        content: `Failed to build order: ${error}`,
        functionCalls: [{
          name: 'fusionPlusAPI',
          arguments: buildOrderArgs,
          result: { error: error instanceof Error ? error.message : String(error) }
        }]
      };
    }
  }

  /**
   * Execute submitOrder step
   */
  private async executeSubmitOrder(): Promise<AgentResponse> {
    const order = this.conversationState!.order;
    const quote = this.conversationState!.quote; // Get the original quote
    const walletAddress = walletManager.getWalletContext().wallet?.address;
    
    if (!walletAddress) {
      return { content: "No wallet connected. Please connect your wallet first." };
    }

    // Debug: Log the order structure to understand the data
    logger.info('Order structure:', JSON.stringify(order, null, 2));

    // Extract the order data from the SDK response
    const orderInput = {
      salt: order.typedData.salt,
      makerAsset: order.typedData.makerAsset,
      takerAsset: order.typedData.takerAsset,
      maker: order.typedData.maker,
      receiver: order.typedData.receiver,
      makingAmount: order.typedData.makingAmount,
      takingAmount: order.typedData.takingAmount,
      makerTraits: order.typedData.makerTraits
    };

    logger.info('Extracted orderInput:', JSON.stringify(orderInput, null, 2));

    const submitOrderArgs = {
      endpoint: "submitOrder",
      order: orderInput,
      srcChainId: 42161, // Use the source chain from the original quote
      signature: "0x", // SDK handles signing internally
      extension: order.extension || "0x", // Use the extension from the built order
      quoteId: order.quoteId || "", // Use the quoteId from the built order
      secretHashes: order.secretHashes || [] // Use the secretHashes from the built order
    };

    try {
      const result = await registry.callFunction('fusionPlusAPI', submitOrderArgs);
      
      // Check if frontend signing is required
      if (result.requiresFrontendSigning) {
        return {
          content: `🔐 **Signature Required**\n\nYour wallet needs to sign this transaction to complete the Fusion+ swap. Please check your MetaMask for a signature request.`,
          functionCalls: [{
            name: 'fusionPlusAPI',
            arguments: submitOrderArgs,
            result: {
              error: 'FRONTEND_SIGNING_REQUIRED: Order needs to be signed by frontend wallet',
              order: orderInput,
              srcChainId: 42161,
              quoteId: order.quoteId || "",
              secretHashes: order.secretHashes || [],
              extension: order.extension || "0x"
            }
          }]
        };
      }
      
      this.conversationState = null; // Reset after completion
      
      return {
        content: `Order submitted successfully! Your cross-chain swap is now being processed.`,
        functionCalls: [{
          name: 'fusionPlusAPI',
          arguments: submitOrderArgs,
          result: result
        }]
      };
    } catch (error) {
      return {
        content: `Failed to submit order: ${error}`,
        functionCalls: [{
          name: 'fusionPlusAPI',
          arguments: submitOrderArgs,
          result: { error: error instanceof Error ? error.message : String(error) }
        }]
      };
    }
  }

  /**
   * Update conversation state based on function results
   */
  private updateConversationState(functionName: string, args: any, result: any): void {
    if (functionName === 'fusionPlusAPI' && args.endpoint === 'getQuote' && !result.error) {
      // Started a Fusion+ swap
      this.conversationState = {
        currentAction: 'fusionPlusSwap',
        step: 1,
        data: args,
        quote: result
      };
      logger.info('Started Fusion+ swap flow');
    } else if (functionName === 'fusionPlusAPI' && args.endpoint === 'buildOrder' && !result.error) {
      // Built order successfully
      if (this.conversationState?.currentAction === 'fusionPlusSwap') {
        this.conversationState.step = 2;
        this.conversationState.order = result;
        logger.info('Built order successfully');
      }
    } else if (functionName === 'fusionPlusAPI' && args.endpoint === 'submitOrder' && !result.error) {
      // Submitted order successfully
      this.conversationState = null; // Reset after completion
      logger.info('Submitted order successfully');
    }
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