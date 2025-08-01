import { domainAPI, ProviderReverseResponse } from '../src/functions/domainAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Domains API\n');

    // Example 1: Lookup domain (vitalik.eth)
    console.log('1️⃣ Testing lookupDomain for vitalik.eth...');
    try {
      const domainLookup = await domainAPI({
        endpoint: 'lookupDomain',
        name: 'vitalik.eth'
      });
      console.log(`✅ Domain lookup successful`);
      console.log(`   Protocol: ${domainLookup.result.protocol}`);
      console.log(`   Address: ${domainLookup.result.address}`);
      console.log(`   Check URL: ${domainLookup.result.checkUrl}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Reverse lookup for Vitalik's address
    console.log('2️⃣ Testing reverseLookup for Vitalik\'s address...');
    try {
      const reverseLookup = await domainAPI({
        endpoint: 'reverseLookup',
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      });
      console.log(`✅ Reverse lookup successful`);
      console.log(`   Protocol: ${reverseLookup.result.protocol}`);
      console.log(`   Domain: ${reverseLookup.result.domain}`);
      console.log(`   Check URL: ${reverseLookup.result.checkUrl}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Batch reverse lookup for multiple addresses
    console.log('3️⃣ Testing reverseLookupBatch for multiple addresses...');
    try {
      const batchLookup = await domainAPI({
        endpoint: 'reverseLookupBatch',
        addresses: [
          '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'  // Another address
        ]
      });
      console.log(`✅ Batch reverse lookup successful`);
      console.log(`   Number of addresses processed: ${Object.keys(batchLookup).length}`);
      
      Object.entries(batchLookup).forEach(([address, domains]) => {
        console.log(`   Address: ${address}`);
        (domains as ProviderReverseResponse[]).forEach((domain: ProviderReverseResponse, index: number) => {
          console.log(`     Domain ${index + 1}: ${domain.domain} (Protocol: ${domain.protocol})`);
        });
      });
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get provider data with avatar for domain
    console.log('4️⃣ Testing getProvidersDataWithAvatar for vitalik.eth...');
    try {
      const providerData = await domainAPI({
        endpoint: 'getProvidersDataWithAvatar',
        addressOrDomain: 'vitalik.eth'
      });
      console.log(`✅ Provider data with avatar retrieved successfully`);
      console.log(`   Protocol: ${providerData.result.protocol}`);
      console.log(`   Domain: ${providerData.result.domain}`);
      console.log(`   Address: ${providerData.result.address}`);
      console.log(`   Avatar: ${JSON.stringify(providerData.result.avatar)}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get provider data with avatar for address
    console.log('5️⃣ Testing getProvidersDataWithAvatar for address...');
    try {
      const providerDataAddress = await domainAPI({
        endpoint: 'getProvidersDataWithAvatar',
        addressOrDomain: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      });
      console.log(`✅ Provider data with avatar for address retrieved successfully`);
      console.log(`   Protocol: ${providerDataAddress.result.protocol}`);
      console.log(`   Domain: ${providerDataAddress.result.domain}`);
      console.log(`   Address: ${providerDataAddress.result.address}`);
      console.log(`   Avatar: ${JSON.stringify(providerDataAddress.result.avatar)}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Lookup another domain
    console.log('6️⃣ Testing lookupDomain for another domain...');
    try {
      const anotherDomain = await domainAPI({
        endpoint: 'lookupDomain',
        name: '1inch.eth'
      });
      console.log(`✅ Another domain lookup successful`);
      console.log(`   Protocol: ${anotherDomain.result.protocol}`);
      console.log(`   Address: ${anotherDomain.result.address}`);
      console.log(`   Check URL: ${anotherDomain.result.checkUrl}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 7: Batch reverse lookup for more addresses
    console.log('7️⃣ Testing reverseLookupBatch for more addresses...');
    try {
      const moreBatchLookup = await domainAPI({
        endpoint: 'reverseLookupBatch',
        addresses: [
          '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',  // Another address
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'   // UNI token contract
        ]
      });
      console.log(`✅ Extended batch reverse lookup successful`);
      console.log(`   Number of addresses processed: ${Object.keys(moreBatchLookup).length}`);
      
      Object.entries(moreBatchLookup).forEach(([address, domains]) => {
        console.log(`   Address: ${address}`);
        const domainsArray = domains as ProviderReverseResponse[];
        if (domainsArray.length > 0) {
          domainsArray.forEach((domain: ProviderReverseResponse, index: number) => {
            console.log(`     Domain ${index + 1}: ${domain.domain} (Protocol: ${domain.protocol})`);
          });
        } else {
          console.log(`     No domains found for this address`);
        }
      });
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('\n🎉 All Domains API tests completed!');
    console.log('\nNote: The Domains API provides seamless interaction with blockchain-based domain services like ENS, LENS, and UD.');

  } catch (error) {
    console.error('❌ Error running Domains API examples:', error);
  }
}

main(); 