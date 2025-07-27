import { OneInchAgentKit } from '../src/index';

async function main() {
  try {
    console.log('💰 Starting 1inch Agent Kit Balance API Example...\n');

    // Create agent instance
    const agent = new OneInchAgentKit({
      openaiApiKey: process.env.OPENAI_API_KEY,
      oneinchApiKey: process.env.ONEINCH_API_KEY,
    });

    // Example 1: Get wallet balances using connected wallet
    console.log('📊 Example 1: Getting wallet balances for connected wallet...');
    const response1 = await agent.chat('Get all token balances for my wallet on Arbitrum');
    console.log('AI Response:', response1.content);
    console.log('Function calls made:', response1.functionCalls?.length || 0);
    if (response1.functionCalls) {
      response1.functionCalls.forEach(call => {
        console.log(`- Called ${call.name} with result keys:`, Object.keys(call.result || {}));
      });
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Get specific token balances
    console.log('💎 Example 2: Getting specific token balances...');
    const response2 = await agent.chat('Get USDC and USDT balances for my wallet on Ethereum');
    console.log('AI Response:', response2.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Get allowances for 1inch router
    console.log('🔐 Example 3: Getting token allowances for 1inch router...');
    const response3 = await agent.chat('Check my token allowances for the 1inch router on Ethereum');
    console.log('AI Response:', response3.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 4: Get balances and allowances together
    console.log('📈 Example 4: Getting balances and allowances together...');
    const response4 = await agent.chat('Show me my token balances and allowances for 1inch router on Ethereum');
    console.log('AI Response:', response4.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 5: Compare balances across multiple wallets
    console.log('🔍 Example 5: Comparing balances across multiple wallets...');
    const response5 = await agent.chat('Compare USDC balances between these wallets: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 and 0x1234567890123456789012345678901234567890 on Ethereum');
    console.log('AI Response:', response5.content);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);