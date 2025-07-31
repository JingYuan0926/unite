import { fusionPlusAPI } from '../src/functions/fusionPlusAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Fusion+ API\n');

    // Example 1: Get active cross-chain orders
    console.log('1️⃣ Testing getActiveOrders for Ethereum to Polygon...');
    try {
      const activeOrders = await fusionPlusAPI({
        endpoint: 'getActiveOrders',
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        page: 1,
        limit: 10
      });
      console.log(`✅ Active orders found: ${activeOrders.meta.totalItems}`);
      console.log(`   Items per page: ${activeOrders.meta.itemsPerPage}`);
      console.log(`   Total pages: ${activeOrders.meta.totalPages}`);
      if (activeOrders.items.length > 0) {
        const firstOrder = activeOrders.items[0];
        console.log(`   First order hash: ${firstOrder.orderHash}`);
        console.log(`   Source chain: ${firstOrder.srcChainId}`);
        console.log(`   Destination chain: ${firstOrder.dstChainId}`);
        console.log(`   Remaining maker amount: ${firstOrder.remainingMakerAmount}\n`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get escrow factory contract address
    console.log('2️⃣ Testing getEscrowFactory for Ethereum...');
    try {
      const escrowFactory = await fusionPlusAPI({
        endpoint: 'getEscrowFactory',
        chainId: 1 // Ethereum
      });
      console.log(`✅ Escrow factory address: ${escrowFactory.address}\n`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Get quote for cross-chain swap
    console.log('3️⃣ Testing getQuote for ETH to USDC cross-chain swap...');
    try {
      const quote = await fusionPlusAPI({
        endpoint: 'getQuote',
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        amount: 1000000000000000000, // 1 WETH in wei
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        enableEstimate: false
      });
      console.log(`✅ Quote received successfully`);
      console.log(`   Source token amount: ${quote.srcTokenAmount}`);
      console.log(`   Destination token amount: ${quote.dstTokenAmount}`);
      console.log(`   Recommended preset: ${quote.recommendedPreset}`);
      console.log(`   Fast preset auction duration: ${quote.presets.fast.auctionDuration}`);
      console.log(`   Medium preset auction duration: ${quote.presets.medium.auctionDuration}`);
      console.log(`   Slow preset auction duration: ${quote.presets.slow.auctionDuration}`);
      console.log(`   Source escrow factory: ${quote.srcEscrowFactory}`);
      console.log(`   Destination escrow factory: ${quote.dstEscrowFactory}`);
      console.log(`   Whitelist resolvers: ${quote.whitelist.length} addresses`);
      console.log(`   Time locks - Source withdrawal: ${quote.timeLocks.srcWithdrawal} blocks`);
      console.log(`   Time locks - Destination withdrawal: ${quote.timeLocks.dstWithdrawal} blocks`);
      console.log(`   USD price - Source token: $${quote.prices.usd.srcToken}`);
      console.log(`   USD price - Destination token: $${quote.prices.usd.dstToken}`);
      console.log(`   USD volume - Source token: $${quote.volume.usd.srcToken}`);
      console.log(`   USD volume - Destination token: $${quote.volume.usd.dstToken}\n`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get quote with fee
    console.log('4️⃣ Testing getQuote with fee for ETH to USDC cross-chain swap...');
    try {
      const quoteWithFee = await fusionPlusAPI({
        endpoint: 'getQuote',
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        amount: 1000000000000000000, // 1 WETH in wei
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        enableEstimate: false,
        fee: 50 // 0.5% fee in bps
      });
      console.log(`✅ Quote with fee received successfully`);
      console.log(`   Source token amount: ${quoteWithFee.srcTokenAmount}`);
      console.log(`   Destination token amount: ${quoteWithFee.dstTokenAmount}`);
      console.log(`   Recommended preset: ${quoteWithFee.recommendedPreset}\n`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get quote with estimation enabled
    console.log('5️⃣ Testing getQuote with estimation enabled...');
    try {
      const quoteWithEstimate = await fusionPlusAPI({
        endpoint: 'getQuote',
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        amount: 1000000000000000000, // 1 WETH in wei
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        enableEstimate: true
      });
      console.log(`✅ Quote with estimation received successfully`);
      console.log(`   Quote ID: ${JSON.stringify(quoteWithEstimate.quoteId)}`);
      console.log(`   Source token amount: ${quoteWithEstimate.srcTokenAmount}`);
      console.log(`   Destination token amount: ${quoteWithEstimate.dstTokenAmount}\n`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('🎉 All Fusion+ API tests completed!');

  } catch (error) {
    console.error('❌ Error running Fusion+ API examples:', error);
  }
}

main(); 