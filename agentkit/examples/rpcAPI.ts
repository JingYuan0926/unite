import { OneInchAgentKit } from '../src/index';

async function main() {
  try {
    console.log('🚀 Starting 1inch Agent Kit RPC API Example...\n');

    // Create agent instance
    const agent = new OneInchAgentKit({
      openaiApiKey: process.env.OPENAI_API_KEY,
      oneinchApiKey: process.env.ONEINCH_API_KEY,
    });

    // Example 1: Get latest block number
    console.log('📦 Getting latest block number...');
    const response1 = await agent.chat('Get me the latest block number on Ethereum mainnet');
    console.log('AI Response:', response1.content);
    console.log('Function calls made:', response1.functionCalls?.length || 0);
    if (response1.functionCalls) {
      response1.functionCalls.forEach(call => {
        console.log(`- Called ${call.name} with result:`, call.result);
      });
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Get account balance
    console.log('💰 Getting account balance...');
    const response2 = await agent.chat('Get the balance of address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 on Ethereum');
    console.log('AI Response:', response2.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Get block information
    console.log('📋 Getting block information...');
    const response3 = await agent.chat('Get information about the latest block on Ethereum');
    console.log('AI Response:', response3.content);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error); 