import { transactionAPI } from '../src/functions/transactionAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Transaction Gateway API\n');

    // Example raw transaction data (this is a sample - in real usage, you would sign your own transaction)
    const sampleRawTransaction = "0xf86c8085174876e800830186a094d8da6bf26964af9d7eed9e03e53415d37aa96045880de0b6b3a7640000801ca0f39fd6e51aad88f6f4ce6ab8827279cfffb92266a0a0c1c3a10a47d0c2b0f6b4a0c0";

    // Example 1: Broadcast public transaction on Ethereum
    console.log('1️⃣ Testing broadcastPublicTransaction on Ethereum...');
    try {
      const publicResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 1, // Ethereum mainnet
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Public transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${publicResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 2: Broadcast private transaction on Ethereum (Flashbots)
    console.log('2️⃣ Testing broadcastPrivateTransaction on Ethereum (Flashbots)...');
    try {
      const privateResult = await transactionAPI({
        endpoint: 'broadcastPrivateTransaction',
        chain: 1, // Ethereum mainnet
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Private transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${privateResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 3: Broadcast public transaction on Polygon
    console.log('3️⃣ Testing broadcastPublicTransaction on Polygon...');
    try {
      const polygonResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 137, // Polygon
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Polygon transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${polygonResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 4: Broadcast public transaction on Arbitrum
    console.log('4️⃣ Testing broadcastPublicTransaction on Arbitrum...');
    try {
      const arbitrumResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 42161, // Arbitrum
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Arbitrum transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${arbitrumResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 5: Broadcast public transaction on BNB Chain
    console.log('5️⃣ Testing broadcastPublicTransaction on BNB Chain...');
    try {
      const bnbResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 56, // BNB Chain
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ BNB Chain transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${bnbResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 6: Broadcast public transaction on Optimism
    console.log('6️⃣ Testing broadcastPublicTransaction on Optimism...');
    try {
      const optimismResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 10, // Optimism
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Optimism transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${optimismResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 7: Broadcast public transaction on Base
    console.log('7️⃣ Testing broadcastPublicTransaction on Base...');
    try {
      const baseResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 8453, // Base
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ Base transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${baseResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    // Example 8: Broadcast public transaction on zkSync Era
    console.log('8️⃣ Testing broadcastPublicTransaction on zkSync Era...');
    try {
      const zkSyncResult = await transactionAPI({
        endpoint: 'broadcastPublicTransaction',
        chain: 324, // zkSync Era
        rawTransaction: sampleRawTransaction
      });
      console.log(`✅ zkSync Era transaction broadcasted successfully`);
      console.log(`   Transaction Hash: ${zkSyncResult.transactionHash}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   Note: This is expected if the raw transaction is invalid or already broadcasted\n`);
    }

    console.log('\n🎉 All Transaction Gateway API tests completed!');
    console.log('\nNote: The Transaction Gateway API provides reliable on-chain transaction broadcasting with both public and private modes.');
    console.log('Private broadcasting via Flashbots offers protection against front-running and increased transaction privacy.');
    console.log('Supported networks: Ethereum, Arbitrum, Avalanche, BNB Chain, Gnosis, Solana, Sonic, Optimism, Polygon, zkSync Era, Base, Unichain');

  } catch (error) {
    console.error('❌ Error running Transaction Gateway API examples:', error);
  }
}

main(); 