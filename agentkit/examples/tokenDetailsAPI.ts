import { tokenDetailsAPI } from '../src/functions/tokenDetailsAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('📊 1inch Token Details API Examples\n');

    // Example 1: Get native token details (ETH on Ethereum)
    console.log('1. Getting native token details for Ethereum...');
    const nativeDetails = await tokenDetailsAPI({
      endpoint: 'native-details',
      chainId: 1
    });
    console.log(`✅ Native token details received`);
    console.log(`   Response structure:`, JSON.stringify(nativeDetails, null, 2).substring(0, 200) + '...\n');

    // Example 2: Get specific token details (WETH)
    console.log('2. Getting WETH token details...');
    const tokenDetails = await tokenDetailsAPI({
      endpoint: 'token-details',
      chainId: 1,
      contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    });
    console.log(`✅ Token details received`);
    console.log(`   Response structure:`, JSON.stringify(tokenDetails, null, 2).substring(0, 200) + '...\n');

    // Example 3: Get native token prices by interval (24h)
    console.log('3. Getting native token prices by interval (24h)...');
    const nativePricesInterval = await tokenDetailsAPI({
      endpoint: 'native-prices-interval',
      chainId: 1,
      interval: '24h'
    });
    console.log(`✅ Data points: ${nativePricesInterval.d?.length || 0}`);
    if (nativePricesInterval.d && nativePricesInterval.d.length > 0) {
      const latest = nativePricesInterval.d[nativePricesInterval.d.length - 1];
      console.log(`   Latest price: $${latest.v} at ${new Date(latest.t * 1000).toISOString()}\n`);
    }

    // Example 4: Get token prices by interval (WETH, 7d)
    console.log('4. Getting WETH token prices by interval (7d)...');
    const tokenPricesInterval = await tokenDetailsAPI({
      endpoint: 'token-prices-interval',
      chainId: 1,
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      interval: '7d'
    });
    console.log(`✅ Data points: ${tokenPricesInterval.d?.length || 0}\n`);

    // Example 5: Get native token price change (24h)
    console.log('5. Getting native token price change (24h)...');
    const nativePriceChange = await tokenDetailsAPI({
      endpoint: 'native-price-change',
      chainId: 1,
      interval: '24h'
    });
    console.log(`✅ Price change: $${nativePriceChange.inUSD} (${nativePriceChange.inPercent}%)\n`);

    // Example 6: Get token price change (WETH, 7d)
    console.log('6. Getting WETH token price change (7d)...');
    const tokenPriceChange = await tokenDetailsAPI({
      endpoint: 'token-price-change',
      chainId: 1,
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      interval: '7d'
    });
    console.log(`✅ Price change: $${tokenPriceChange.inUSD} (${tokenPriceChange.inPercent}%)\n`);

    // Example 7: Get token list price change
    console.log('7. Getting price changes for multiple tokens...');
    const tokenListPriceChange = await tokenDetailsAPI({
      endpoint: 'token-list-price-change',
      chainId: 1,
      tokenAddresses: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
      ],
      interval: '24h'
    });
    console.log(`✅ Price changes for ${tokenListPriceChange.length} tokens:`);
    tokenListPriceChange.forEach((token: { tokenAddress: string; inUSD: number; inPercent: number }) => {
      console.log(`   ${token.tokenAddress}: $${token.inUSD} (${token.inPercent}%)`);
    });
    console.log();

    // Example 8: Get native token prices by range
    console.log('8. Getting native token prices by time range...');
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);
    const nativePricesRange = await tokenDetailsAPI({
      endpoint: 'native-prices-range',
      chainId: 1,
      from: oneDayAgo,
      to: now
    });
    console.log(`✅ Data points: ${nativePricesRange.d?.length || 0}\n`);

    // Example 9: Get token prices by range (WETH)
    console.log('9. Getting WETH token prices by time range...');
    const tokenPricesRange = await tokenDetailsAPI({
      endpoint: 'token-prices-range',
      chainId: 1,
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      from: oneDayAgo,
      to: now
    });
    console.log(`✅ Data points: ${tokenPricesRange.d?.length || 0}\n`);

    console.log('🎉 Token Details API examples completed!');

  } catch (error) {
    console.error('❌ Error running token details API examples:', error);
  }
}

main(); 