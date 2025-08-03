import { swapAPI } from '../src/functions/swapAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Classic Swap API (Pathfinder v6.1)\n');

    // Example 1: Get quote for ETH to USDC swap
    console.log('1️⃣ Testing getQuote for ETH to USDC...');
    try {
      const quote = await swapAPI({
        endpoint: 'getQuote',
        chain: 1, // Ethereum mainnet
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
        dst: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '1000000000000000000', // 1 ETH
        includeTokensInfo: true,
        includeProtocols: true,
        includeGas: true
      });
      console.log(`✅ Quote retrieved successfully`);
      console.log(`   From: ${quote.srcToken.symbol} (${quote.srcToken.name})`);
      console.log(`   To: ${quote.dstToken.symbol} (${quote.dstToken.name})`);
      console.log(`   Amount: ${quote.dstAmount} ${quote.dstToken.symbol}`);
      console.log(`   Gas: ${quote.gas || 'Not estimated'}`);
      console.log(`   Protocols used: ${quote.protocols.length}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get swap transaction data
    console.log('2️⃣ Testing getSwap for ETH to USDC...');
    try {
      const swap = await swapAPI({
        endpoint: 'getSwap',
        chain: 1, // Ethereum mainnet
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
        dst: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '1000000000000000000', // 1 ETH
        from: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5', // Example address
        origin: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5', // Example address
        slippage: 1, // 1% slippage
        includeTokensInfo: true,
        includeProtocols: true,
        includeGas: true
      });
      console.log(`✅ Swap transaction data retrieved successfully`);
      console.log(`   From: ${swap.srcToken.symbol} (${swap.srcToken.name})`);
      console.log(`   To: ${swap.dstToken.symbol} (${swap.dstToken.name})`);
      console.log(`   Amount: ${swap.dstAmount} ${swap.dstToken.symbol}`);
      console.log(`   Transaction to: ${swap.tx.to}`);
      console.log(`   Gas: ${swap.tx.gas}`);
      console.log(`   Gas Price: ${swap.tx.gasPrice} wei`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Get spender address
    console.log('3️⃣ Testing getSpender...');
    try {
      const spender = await swapAPI({
        endpoint: 'getSpender',
        chain: 1 // Ethereum mainnet
      });
      console.log(`✅ Spender address retrieved successfully`);
      console.log(`   Spender: ${spender.address}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get approve transaction data
    console.log('4️⃣ Testing getApproveTransaction...');
    try {
      const approve = await swapAPI({
        endpoint: 'getApproveTransaction',
        chain: 1, // Ethereum mainnet
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '1000000000' // 1000 USDC (6 decimals)
      });
      console.log(`✅ Approve transaction data retrieved successfully`);
      console.log(`   To: ${approve.to}`);
      console.log(`   Gas Price: ${approve.gasPrice} wei`);
      console.log(`   Value: ${approve.value} wei`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Check allowance
    console.log('5️⃣ Testing getAllowance...');
    try {
      const allowance = await swapAPI({
        endpoint: 'getAllowance',
        chain: 1, // Ethereum mainnet
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        walletAddress: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5' // Example address
      });
      console.log(`✅ Allowance retrieved successfully`);
      console.log(`   Allowance: ${allowance.allowance} wei`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Get liquidity sources
    console.log('6️⃣ Testing getLiquiditySources...');
    try {
      const protocols = await swapAPI({
        endpoint: 'getLiquiditySources',
        chain: 1 // Ethereum mainnet
      });
      console.log(`✅ Liquidity sources retrieved successfully`);
      console.log(`   Number of protocols: ${protocols.protocols.length}`);
      protocols.protocols.slice(0, 5).forEach((protocol: { title: string; id: string }, index: number) => {
        console.log(`   Protocol ${index + 1}: ${protocol.title} (${protocol.id})`);
      });
      if (protocols.protocols.length > 5) {
        console.log(`   ... and ${protocols.protocols.length - 5} more protocols`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 7: Get available tokens
    console.log('7️⃣ Testing getTokens...');
    try {
      const tokens = await swapAPI({
        endpoint: 'getTokens',
        chain: 1 // Ethereum mainnet
      });
      console.log(`✅ Available tokens retrieved successfully`);
      console.log(`   Number of tokens: ${Object.keys(tokens.tokens).length}`);
      
      // Show some popular tokens
      const popularTokens = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x6b175474e89094c44da98b954eedeac495271d0f'];
      popularTokens.forEach(address => {
        const token = tokens.tokens[address];
        if (token) {
          console.log(`   ${token.symbol}: ${token.name} (${address})`);
        }
      });
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 8: Get quote on Polygon
    console.log('8️⃣ Testing getQuote on Polygon...');
    try {
      const polygonQuote = await swapAPI({
        endpoint: 'getQuote',
        chain: 137, // Polygon
        src: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
        dst: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        amount: '1000000000000000000', // 1 WMATIC
        includeTokensInfo: true
      });
      console.log(`✅ Polygon quote retrieved successfully`);
      console.log(`   From: ${polygonQuote.srcToken.symbol} (${polygonQuote.srcToken.name})`);
      console.log(`   To: ${polygonQuote.dstToken.symbol} (${polygonQuote.dstToken.name})`);
      console.log(`   Amount: ${polygonQuote.dstAmount} ${polygonQuote.dstToken.symbol}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 9: Get quote on Arbitrum
    console.log('9️⃣ Testing getQuote on Arbitrum...');
    try {
      const arbitrumQuote = await swapAPI({
        endpoint: 'getQuote',
        chain: 42161, // Arbitrum
        src: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
        dst: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
        amount: '1000000000000000000', // 1 WETH
        includeTokensInfo: true
      });
      console.log(`✅ Arbitrum quote retrieved successfully`);
      console.log(`   From: ${arbitrumQuote.srcToken.symbol} (${arbitrumQuote.srcToken.name})`);
      console.log(`   To: ${arbitrumQuote.dstToken.symbol} (${arbitrumQuote.dstToken.name})`);
      console.log(`   Amount: ${arbitrumQuote.dstAmount} ${arbitrumQuote.dstToken.symbol}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 10: Get quote with specific protocols
    console.log('🔟 Testing getQuote with specific protocols...');
    try {
      const specificQuote = await swapAPI({
        endpoint: 'getQuote',
        chain: 1, // Ethereum mainnet
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
        dst: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '1000000000000000000', // 1 ETH
        protocols: 'UNISWAP_V3,CURVE,BALANCER',
        includeProtocols: true
      });
      console.log(`✅ Quote with specific protocols retrieved successfully`);
      console.log(`   From: ${specificQuote.srcToken?.symbol || 'Unknown'} (${specificQuote.srcToken?.name || 'Unknown'})`);
      console.log(`   To: ${specificQuote.dstToken?.symbol || 'Unknown'} (${specificQuote.dstToken?.name || 'Unknown'})`);
      console.log(`   Amount: ${specificQuote.dstAmount} ${specificQuote.dstToken?.symbol || 'Unknown'}`);
      console.log(`   Protocols used: ${specificQuote.protocols?.length || 0}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('\n🎉 All Swap API tests completed!');
    console.log('\nNote: The Classic Swap API provides cutting-edge discovery and routing algorithm for asset exchanges.');
    console.log('Supported networks: Ethereum, Arbitrum, Avalanche, Base, BNB Chain, Gnosis, Sonic, Optimism, Polygon, zkSync Era, Linea, Unichain');
    console.log('For wallet integration, use executeSwap and executeApprove endpoints with privateKey parameter.');

  } catch (error) {
    console.error('❌ Error running Swap API examples:', error);
  }
}

main(); 