import { chartsAPI, LineData, CandleData } from '../src/functions/chartsAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('📊 1inch Charts API Examples\n');

    // Example 1: Get line chart data for ETH/USDC on Ethereum (24H)
    console.log('1. Getting ETH/USDC line chart data (24H)...');
    const ethUsdcLine = await chartsAPI({
      type: 'line',
      token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      token1: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (correct address)
      period: '24H',
      chainId: 1
    });
    console.log(`✅ Line chart data points: ${ethUsdcLine.data.length}`);
    
    // Type guard to check if it's line data
    if (ethUsdcLine.data.length > 0 && 'value' in ethUsdcLine.data[0]) {
      const latest = ethUsdcLine.data[ethUsdcLine.data.length - 1] as LineData;
      console.log(`   Latest price: $${latest.value || 'N/A'}\n`);
    }

    // Example 2: Get candle chart data for ETH/USDC on Ethereum (1 hour intervals)
    console.log('2. Getting ETH/USDC candle chart data (1 hour intervals)...');
    const ethUsdcCandle = await chartsAPI({
      type: 'candle',
      token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      token1: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (correct address)
      seconds: 3600, // 1 hour
      chainId: 1
    });
    console.log(`✅ Candle chart data points: ${ethUsdcCandle.data.length}`);
    if (ethUsdcCandle.data.length > 0 && 'open' in ethUsdcCandle.data[0]) {
      const latest = ethUsdcCandle.data[ethUsdcCandle.data.length - 1] as CandleData;
      console.log(`   Latest candle: O:$${latest.open} H:$${latest.high} L:$${latest.low} C:$${latest.close}\n`);
    }

    // Example 3: Get line chart data for different time periods
    console.log('3. Getting ETH/USDC line chart data for different periods...');
    const periods: Array<'24H' | '1W' | '1M' | '1Y'> = ['24H', '1W', '1M', '1Y'];
    
    for (const period of periods) {
      try {
        const data = await chartsAPI({
          type: 'line',
          token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          token1: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (correct address)
          period,
          chainId: 1
        });
        console.log(`   ${period}: ${data.data.length} data points`);
      } catch (error) {
        console.log(`   ${period}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Example 4: Get candle chart data for different intervals
    console.log('\n4. Getting ETH/USDC candle chart data for different intervals...');
    const intervals = [
      { seconds: 300 as const, name: '5 minutes' },
      { seconds: 900 as const, name: '15 minutes' },
      { seconds: 3600 as const, name: '1 hour' },
      { seconds: 14400 as const, name: '4 hours' },
      { seconds: 86400 as const, name: '1 day' },
      { seconds: 604800 as const, name: '1 week' }
    ];
    
    for (const interval of intervals) {
      try {
        const data = await chartsAPI({
          type: 'candle',
          token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          token1: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (correct address)
          seconds: interval.seconds,
          chainId: 1
        });
        console.log(`   ${interval.name}: ${data.data.length} candles`);
      } catch (error) {
        console.log(`   ${interval.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n🎉 Charts API examples completed!');

  } catch (error) {
    console.error('❌ Error running charts API examples:', error);
  }
}

main(); 