import { balanceAPI } from '../src/functions/balanceAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('💰 1inch Balance API Direct Examples\n');

    // Example 1: Get all balances for a wallet
    console.log('1. Getting all token balances for wallet...');
    const balances = await balanceAPI({
      endpoint: 'getBalances',
      chain: 1,
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    });
    console.log(`✅ Found ${Object.keys(balances).length} tokens with balances`);
    
    // Show first few non-zero balances
    const nonZeroBalances = Object.entries(balances)
      .filter(([_, balance]) => balance !== '0')
      .slice(0, 5);
    
    console.log('   Top balances:');
    nonZeroBalances.forEach(([token, balance]) => {
      console.log(`   ${token}: ${balance}`);
    });
    console.log();

    // Example 2: Get specific token balances
    console.log('2. Getting specific token balances (USDC, USDT, WETH)...');
    const specificBalances = await balanceAPI({
      endpoint: 'getCustomTokenBalances',
      chain: 1,
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokens: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // WETH
      ]
    });
    console.log('✅ Specific token balances:');
    Object.entries(specificBalances).forEach(([token, balance]) => {
      const tokenName = token === '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' ? 'USDC' :
                       token === '0xdAC17F958D2ee523a2206206994597C13D831ec7' ? 'USDT' :
                       token === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ? 'WETH' : 'Unknown';
      console.log(`   ${tokenName} (${token}): ${balance}`);
    });
    console.log();

    // Example 3: Get allowances for 1inch router
    console.log('3. Getting token allowances for 1inch router...');
    const oneInchRouter = '0x111111125421cA6dc452d289314280a0f8842A65'; // 1inch v5 router
    const allowances = await balanceAPI({
      endpoint: 'getAllowances',
      chain: 1,
      spender: oneInchRouter,
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    });
    console.log(`✅ Found allowances for ${Object.keys(allowances).length} tokens`);
    
    // Show non-zero allowances
    const nonZeroAllowances = Object.entries(allowances)
      .filter(([_, allowance]) => allowance !== '0')
      .slice(0, 5);
    
    if (nonZeroAllowances.length > 0) {
      console.log('   Non-zero allowances:');
      nonZeroAllowances.forEach(([token, allowance]) => {
        console.log(`   ${token}: ${allowance}`);
      });
    } else {
      console.log('   No non-zero allowances found');
    }
    console.log();

    // Example 4: Get balances and allowances together
    console.log('4. Getting balances and allowances together...');
    const balancesAndAllowances = await balanceAPI({
      endpoint: 'getBalancesAndAllowances',
      chain: 1,
      spender: oneInchRouter,
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    });
    console.log(`✅ Found ${Object.keys(balancesAndAllowances).length} tokens with balance/allowance data`);
    
    // Show tokens with both balance and allowance
    const tokensWithBoth = Object.entries(balancesAndAllowances)
      .filter(([_, data]: [string, any]) => data.balance !== '0' && data.allowance !== '0')
      .slice(0, 3);
    
    if (tokensWithBoth.length > 0) {
      console.log('   Tokens with both balance and allowance:');
      tokensWithBoth.forEach(([token, data]: [string, any]) => {
        console.log(`   ${token}:`);
        console.log(`     Balance: ${data.balance}`);
        console.log(`     Allowance: ${data.allowance}`);
      });
    } else {
      console.log('   No tokens found with both balance and allowance');
    }
    console.log();

    // Example 5: Get balances for multiple wallets
    console.log('5. Getting USDC balances for multiple wallets...');
    const multiWalletBalances = await balanceAPI({
      endpoint: 'getMultipleWalletsTokenBalances',
      chain: 1,
      tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'], // USDC
      wallets: [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      ]
    });
    console.log('✅ Multi-wallet USDC balances:');
    Object.entries(multiWalletBalances).forEach(([wallet, balances]: [string, any]) => {
      const usdcBalance = balances['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'] || '0';
      console.log(`   ${wallet}: ${usdcBalance} USDC`);
    });

    console.log('\n🎉 Balance API examples completed!');

  } catch (error) {
    console.error('❌ Error running balance API examples:', error);
  }
}

main();