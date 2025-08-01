import { orderbookAPI } from '../src/functions/orderbookAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Orderbook API\n');

    // Example 1: Get all orders
    console.log('1️⃣ Testing getAllOrders for Ethereum...');
    try {
      const allOrders = await orderbookAPI({
        endpoint: 'getAllOrders',
        chain: 1, // Ethereum
        page: 1,
        limit: 5
      });
      console.log(`✅ All orders retrieved: ${allOrders.length} orders found`);
      if (allOrders.length > 0) {
        console.log(`   First order hash: ${allOrders[0].orderHash}`);
        console.log(`   First order maker: ${allOrders[0].data.maker}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get orders count
    console.log('2️⃣ Testing getOrdersCount for Ethereum...');
    try {
      const ordersCount = await orderbookAPI({
        endpoint: 'getOrdersCount',
        chain: 1, // Ethereum
        statuses: '1,2,3'
      });
      console.log(`✅ Total orders count: ${ordersCount.count}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Get unique active pairs
    console.log('3️⃣ Testing getUniqueActivePairs for Ethereum...');
    try {
      const uniquePairs = await orderbookAPI({
        endpoint: 'getUniqueActivePairs',
        chain: 1, // Ethereum
        page: 1,
        limit: 5
      });
      console.log(`✅ Unique active pairs found: ${uniquePairs.meta.totalItems}`);
      console.log(`   Items per page: ${uniquePairs.meta.itemsPerPage}`);
      console.log(`   Total pages: ${uniquePairs.meta.totalPages}`);
      if (uniquePairs.items.length > 0) {
        console.log(`   First pair - Maker: ${uniquePairs.items[0].makerAsset}`);
        console.log(`   First pair - Taker: ${uniquePairs.items[0].takerAsset}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get fee info for USDC/USDT pair
    console.log('4️⃣ Testing getFeeInfo for USDC/USDT pair...');
    try {
      const feeInfo = await orderbookAPI({
        endpoint: 'getFeeInfo',
        chain: 1, // Ethereum
        makerAsset: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        takerAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        makerAmount: '1000000', // 1 USDC
        takerAmount: '1000000'  // 1 USDT
      });
      console.log(`✅ Fee info retrieved successfully`);
      console.log(`   Fee in bps: ${feeInfo.feeBps}`);
      console.log(`   Whitelist discount percent: ${feeInfo.whitelistDiscountPercent}`);
      console.log(`   Protocol fee receiver: ${JSON.stringify(feeInfo.protocolFeeReceiver)}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get all events
    console.log('5️⃣ Testing getAllEvents for Ethereum...');
    try {
      const allEvents = await orderbookAPI({
        endpoint: 'getAllEvents',
        chain: 1, // Ethereum
        limit: 5
      });
      console.log(`✅ All events retrieved: ${allEvents.length} events found`);
      if (allEvents.length > 0) {
        console.log(`   First event action: ${allEvents[0].action}`);
        console.log(`   First event order hash: ${allEvents[0].orderHash}`);
        console.log(`   First event block number: ${allEvents[0].blockNumber}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Get orders by address (using a known address)
    console.log('6️⃣ Testing getOrdersByAddress for a known address...');
    try {
      const ordersByAddress = await orderbookAPI({
        endpoint: 'getOrdersByAddress',
        chain: 1, // Ethereum
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example address
        page: 1,
        limit: 5
      });
      console.log(`✅ Orders by address retrieved: ${ordersByAddress.length} orders found`);
      if (ordersByAddress.length > 0) {
        console.log(`   First order remaining amount: ${ordersByAddress[0].remainingMakerAmount}`);
        console.log(`   First order maker balance: ${ordersByAddress[0].makerBalance}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 7: Check if wallet has active orders with permit
    console.log('7️⃣ Testing hasActiveOrdersWithPermit...');
    try {
      const hasActiveOrders = await orderbookAPI({
        endpoint: 'hasActiveOrdersWithPermit',
        chain: 1, // Ethereum
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example address
        token: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
      });
      console.log(`✅ Has active orders with permit: ${hasActiveOrders.result}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 8: Get all orders with filtering
    console.log('8️⃣ Testing getAllOrders with filtering...');
    try {
      const filteredOrders = await orderbookAPI({
        endpoint: 'getAllOrders',
        chain: 1, // Ethereum
        page: 1,
        limit: 3,
        statuses: '1', // Only valid orders
        makerAsset: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
      });
      console.log(`✅ Filtered orders retrieved: ${filteredOrders.length} orders found`);
      if (filteredOrders.length > 0) {
        console.log(`   First filtered order maker asset: ${filteredOrders[0].data.makerAsset}`);
        console.log(`   First filtered order taker asset: ${filteredOrders[0].data.takerAsset}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 9: Get fee info for ETH/USDC pair
    console.log('9️⃣ Testing getFeeInfo for ETH/USDC pair...');
    try {
      const ethUsdcFeeInfo = await orderbookAPI({
        endpoint: 'getFeeInfo',
        chain: 1, // Ethereum
        makerAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        takerAsset: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        makerAmount: '1000000000000000000', // 1 ETH
        takerAmount: '2000000000' // 2000 USDC
      });
      console.log(`✅ ETH/USDC fee info retrieved successfully`);
      console.log(`   Fee in bps: ${ethUsdcFeeInfo.feeBps}`);
      console.log(`   Whitelist discount percent: ${ethUsdcFeeInfo.whitelistDiscountPercent}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 10: Get orders count with filtering
    console.log('🔟 Testing getOrdersCount with filtering...');
    try {
      const filteredCount = await orderbookAPI({
        endpoint: 'getOrdersCount',
        chain: 1, // Ethereum
        statuses: '1', // Only valid orders
        makerAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
      });
      console.log(`✅ Filtered orders count: ${filteredCount.count}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('\n🎉 All Orderbook API tests completed!');
    console.log('\nNote: submitOrder, getOrderByHash, and getOrderEvents endpoints require specific order hashes and signatures, so they are not included in this example.');

  } catch (error) {
    console.error('❌ Error running Orderbook API examples:', error);
  }
}

main(); 