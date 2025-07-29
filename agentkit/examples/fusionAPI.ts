import { OneInchAgentKit } from '../src/index';
import { fusionAPI } from '../src/functions/fusionAPI';

async function main() {
  // Initialize the agent
  const agent = new OneInchAgentKit({
    openaiApiKey: process.env.OPENAI_API_KEY,
    oneinchApiKey: process.env.ONEINCH_API_KEY,
  });

  console.log("🔥 1inch Fusion API Examples");
  console.log("============================\n");

  try {
    // Example 1: Get active orders
    console.log("1. Getting active Fusion orders...");
    const activeOrders = await fusionAPI({
      action: "getActiveOrders",
      chain: 1, // Ethereum
      page: 1,
      limit: 5
    });
    console.log(`Found ${activeOrders.meta.totalItems} active orders`);
    console.log(`Showing ${activeOrders.items.length} orders on page ${activeOrders.meta.currentPage}\n`);

    // Example 2: Get settlement contract address
    console.log("2. Getting settlement contract address...");
    const settlement = await fusionAPI({
      action: "getSettlementAddress",
      chain: 1
    });
    console.log(`Settlement contract: ${settlement.address}\n`);

    // Example 3: Get quote for a swap
    console.log("3. Getting Fusion quote for ETH -> USDC...");
    try {
      const quote = await fusionAPI({
        action: "getQuote",
        chain: 1,
        fromTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
        toTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        amount: "1000000000000000000", // 1 WETH
        walletAddress: "0x742d35Cc6634C0532925a3b8D4d9C4C1b5c3e4e5", // Valid address
        enableEstimate: false
      });
      console.log(`Quote ID: ${quote.quoteId}`);
      console.log(`From amount: ${quote.fromTokenAmount}`);
      console.log(`To amount: ${quote.toTokenAmount}`);
      console.log(`Recommended preset: ${quote.recommended_preset}`);
      console.log(`Settlement address: ${quote.settlementAddress}\n`);
    } catch (error) {
      console.log("Quote request failed - this is normal for demo purposes");
      console.log("Error:", (error as Error).message);
      console.log();
    }

    // Example 4: Using AI agent for natural language queries
    console.log("4. Using AI agent for Fusion queries...");
    
    const response1 = await agent.chat(
      "Get the current active Fusion orders on Ethereum, limit to 3 orders"
    );
    console.log("AI Response for active orders:");
    console.log(response1.content);
    console.log();

    const response2 = await agent.chat(
      "Get a Fusion quote for swapping 0.1 ETH to USDC on Ethereum mainnet using wallet address 0x742d35Cc6634C0532925a3b8D4d9C4C1b5c3e4e5"
    );
    console.log("AI Response for quote:");
    console.log(response2.content);
    console.log();

    const response3 = await agent.chat(
      "What is the settlement contract address for Fusion orders on Ethereum?"
    );
    console.log("AI Response for settlement address:");
    console.log(response3.content);
    console.log();

    // Example 5: Get orders by maker (if any exist)
    console.log("5. Getting orders by maker address...");
    try {
      const makerOrders = await fusionAPI({
        action: "getOrdersByMaker",
        chain: 1,
        address: "0x742d35Cc6634C0532925a3b8D4d9C4C1b5c3e4e5", // Example maker address
        limit: 5
      });
      console.log(`Found ${makerOrders.length} orders for this maker\n`);
    } catch (error) {
      console.log("No orders found for this maker address\n");
    }

    // Example 6: Advanced AI queries
    console.log("6. Advanced AI queries...");
    
    const response4 = await agent.chat(
      "Compare the fast, medium, and slow presets for a Fusion swap of 1 ETH to USDC. What are the differences in auction duration and rates?"
    );
    console.log("AI Response for preset comparison:");
    console.log(response4.content);
    console.log();

    const response5 = await agent.chat(
      "Explain how Fusion mode works and what are the benefits for users compared to regular swaps"
    );
    console.log("AI Response about Fusion mode:");
    console.log(response5.content);

  } catch (error) {
    console.error("Error:", error);
  }
}

// Direct function call examples (without AI agent)
async function directFunctionExamples() {
  console.log("\n🔧 Direct Function Call Examples");
  console.log("=================================\n");

  try {
    // Example 1: Get active orders directly
    console.log("Direct call - Get active orders:");
    const orders = await fusionAPI({
      action: "getActiveOrders",
      chain: 1,
      limit: 2
    });
    console.log(`Total items: ${orders.meta.totalItems}`);
    console.log(`Items per page: ${orders.meta.itemsPerPage}`);
    
    if (orders.items.length > 0) {
      const firstOrder = orders.items[0];
      console.log(`First order hash: ${firstOrder.orderHash}`);
      console.log(`Maker: ${firstOrder.order.maker}`);
      console.log(`Making amount: ${firstOrder.order.makingAmount}`);
      console.log(`Taking amount: ${firstOrder.order.takingAmount}`);
    }
    console.log();

    // Example 2: Get quote directly
    console.log("Direct call - Get quote:");
    try {
      const quote = await fusionAPI({
        action: "getQuote",
        chain: 1,
        fromTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
        toTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
        amount: "500000000000000000", // 0.5 WETH
        walletAddress: "0x742d35Cc6634C0532925a3b8D4d9C4C1b5c3e4e5"
      });
      
      console.log(`From token amount: ${quote.fromTokenAmount}`);
      console.log(`To token amount: ${quote.toTokenAmount}`);
      console.log(`Recommended preset: ${quote.recommended_preset}`);
      
      // Show preset details
      const recommendedPreset = quote.presets[quote.recommended_preset as keyof typeof quote.presets];
      if (recommendedPreset) {
        console.log(`Auction duration: ${recommendedPreset.auctionDuration} seconds`);
        console.log(`Start auction in: ${recommendedPreset.startAuctionIn} seconds`);
        console.log(`Initial rate bump: ${recommendedPreset.initialRateBump}%`);
      }
      console.log();
    } catch (error) {
      console.log("Quote request failed - this may be due to API limitations or network issues");
      console.log("Error:", (error as Error).message);
      console.log();
    }

    // Example 3: Get settlement address directly
    console.log("Direct call - Get settlement address:");
    const settlement = await fusionAPI({
      action: "getSettlementAddress",
      chain: 1
    });
    console.log(`Settlement contract address: ${settlement.address}`);

  } catch (error) {
    console.error("Direct function error:", error);
  }
}

// Run examples
if (require.main === module) {
  main()
    .then(() => directFunctionExamples())
    .catch(console.error);
}