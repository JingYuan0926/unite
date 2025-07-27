import { OneInchAgentKit, Wallet } from '../src/index';

async function main() {
  try {
    console.log('🚀 Starting 1inch Agent Kit Wallet Integration Example...\n');

    // Create agent instance
    const agent = new OneInchAgentKit({
      openaiApiKey: process.env.OPENAI_API_KEY,
      oneinchApiKey: process.env.ONEINCH_API_KEY,
    });

    console.log('📋 Current wallet info:');
    const currentWallet = agent.getWallet();
    if (currentWallet) {
      console.log(`   Address: ${currentWallet.address}`);
      console.log(`   Chain: ${currentWallet.chainId}`);
      console.log(`   Source: ${currentWallet.isTestWallet ? 'Local JSON' : 'Frontend'}`);
    } else {
      console.log('   No wallet connected');
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 1: Using local wallet (from wallet.json)
    console.log('💰 Example 1: Using local wallet for gas prices...');
    const response1 = await agent.chat('Get me the current gas prices for Ethereum mainnet');
    console.log('AI Response:', response1.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Simulating frontend wallet connection
    console.log('🌐 Example 2: Simulating frontend wallet connection...');
    const frontendWallet: Wallet = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 137, // Polygon
      walletType: 'metamask',
      name: 'Frontend Wallet',
      balance: '500000000000000000' // 0.5 ETH
    };

    // Set frontend wallet
    agent.setWallet(frontendWallet);
    console.log(`Frontend wallet set: ${frontendWallet.address} on Polygon`);

    const response2 = await agent.chat('Get gas prices for the current chain');
    console.log('AI Response:', response2.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Using wallet in chat with inline wallet parameter
    console.log('🔄 Example 3: Using inline wallet parameter...');
    const inlineWallet: Wallet = {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      chainId: 42161, // Arbitrum
      walletType: 'walletconnect',
      name: 'Inline Wallet'
    };

    const response3 = await agent.chat(
      'Get whitelisted token prices for this chain', 
      inlineWallet
    );
    console.log('AI Response:', response3.content);
    console.log('\n' + '='.repeat(50) + '\n');

    // Example 4: Show wallet context changes
    console.log('📊 Example 4: Wallet context summary...');
    const finalWallet = agent.getWallet();
    if (finalWallet) {
      console.log(`   Final wallet: ${finalWallet.address}`);
      console.log(`   Chain: ${finalWallet.chainId}`);
      console.log(`   Type: ${finalWallet.walletType}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);