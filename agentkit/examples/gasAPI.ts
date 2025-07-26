import { OneInchAgentKit } from '../src/index';

async function main() {
  try {
    console.log('🚀 Starting 1inch Agent Kit Gas API Example...\n');

    // Create agent instance
    const agent = new OneInchAgentKit({
      openaiApiKey: process.env.OPENAI_API_KEY,
      oneinchApiKey: process.env.ONEINCH_API_KEY,
    });

    // Example 1: Get gas prices for Ethereum
    console.log('⛽ Getting Ethereum gas prices...');
    const response1 = await agent.chat('Get me the current gas prices for Ethereum mainnet');
    console.log('AI Response:', response1.content);
    console.log('Function calls made:', response1.functionCalls?.length || 0);
    if (response1.functionCalls) {
      response1.functionCalls.forEach(call => {
        console.log(`- Called ${call.name} with result:`, call.result);
      });
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Compare gas prices across chains
    console.log('⛽ Comparing gas prices across chains...');
    const response2 = await agent.chat('Compare gas prices between Ethereum and Polygon');
    console.log('AI Response:', response2.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Get specific gas price tier
    console.log('⛽ Getting high priority gas prices...');
    const response3 = await agent.chat('What are the high priority gas prices for Ethereum?');
    console.log('AI Response:', response3.content);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error); 