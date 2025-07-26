import { historyAPI } from '../src/functions/historyAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('📊 1inch History API Examples\n');

    // Test if History API is accessible
    console.log('🔍 Testing History API accessibility...');
    // Using a more active address (1inch router)
    const testAddress = '0x111111111117dC0aa78b770fA6A738034120C302';
    
    try {
      // Simple test with minimal parameters
      const testResult = await historyAPI({
        endpoint: 'get-events',
        address: testAddress,
        limit: 1
      });
      console.log('✅ History API is accessible!');
      console.log(`   Response structure:`, JSON.stringify(testResult, null, 2).substring(0, 300) + '...\n');
    } catch (error) {
      console.log('❌ History API test failed');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('   This suggests the History API might not be available in your current 1inch API plan.');
      console.log('   Please check your 1inch Developer Portal subscription level.\n');
      return;
    }

    // Example 1: Get basic transaction events (simplified)
    console.log('1. Getting basic transaction events...');
    try {
      const basicEvents = await historyAPI({
        endpoint: 'get-events',
        address: testAddress,
        limit: 5,
        chainId: 1
      });
      console.log(`✅ Found ${basicEvents.items?.length || 0} events`);
      if (basicEvents.items && basicEvents.items.length > 0) {
        const firstEvent = basicEvents.items[0];
        console.log(`   First event: ${firstEvent.details.type} at ${new Date(firstEvent.timeMs).toISOString()}\n`);
      }
    } catch (error) {
      console.log(`❌ Basic events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get filtered transaction events (POST) - simplified
    console.log('2. Getting filtered transaction events...');
    try {
      const filteredEvents = await historyAPI({
        endpoint: 'post-events',
        address: testAddress,
        filter: {
          chain_ids: ['1'],
          limit: 3
        }
      });
      console.log(`✅ Found ${filteredEvents.items?.length || 0} filtered events\n`);
    } catch (error) {
      console.log(`❌ Filtered events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Search transaction events with complex filters - simplified
    console.log('3. Searching transaction events with complex filters...');
    try {
      const searchEvents = await historyAPI({
        endpoint: 'search-events',
        address: testAddress,
        searchFilter: {
          and: {
            and: {
              chain_ids: ['1']
            },
            or: {
              chain_ids: ['1']
            }
          },
          limit: 2
        }
      });
      console.log(`✅ Found ${searchEvents.length || 0} search results\n`);
    } catch (error) {
      console.log(`❌ Search events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get swap events - simplified
    console.log('4. Getting swap events...');
    try {
      const swapEvents = await historyAPI({
        endpoint: 'swap-events',
        address: testAddress,
        swapFilter: {
          chain_ids: ['1'],
          token_address_from: {},
          token_address_to: {},
          limit: 3
        }
      });
      console.log(`✅ Found ${swapEvents.length || 0} swap events\n`);
    } catch (error) {
      console.log(`❌ Swap events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get events with time range - simplified
    console.log('5. Getting events with time range...');
    try {
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const timeRangeEvents = await historyAPI({
        endpoint: 'get-events',
        address: testAddress,
        limit: 3,
        chainId: 1,
        fromTimestampMs: oneWeekAgo.toString(),
        toTimestampMs: now.toString()
      });
      console.log(`✅ Found ${timeRangeEvents.items?.length || 0} events in time range\n`);
    } catch (error) {
      console.log(`❌ Time range events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Get events for specific token - simplified
    console.log('6. Getting events for specific token (WETH)...');
    try {
      const tokenEvents = await historyAPI({
        endpoint: 'get-events',
        address: testAddress,
        limit: 3,
        chainId: 1,
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
      });
      console.log(`✅ Found ${tokenEvents.items?.length || 0} WETH events\n`);
    } catch (error) {
      console.log(`❌ Token events error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('🎉 History API examples completed!');

  } catch (error) {
    console.error('❌ Error running history API examples:', error);
  }
}

main(); 