import { nftAPI, NftV2Model } from '../src/functions/nftAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch NFT API\n');

    // Example 1: Get supported chains
    console.log('1️⃣ Testing getSupportedChains...');
    try {
      const supportedChains = await nftAPI({
        endpoint: 'getSupportedChains'
      });
      console.log(`✅ Supported chains: ${supportedChains.join(', ')}`);
      console.log(`   Total supported chains: ${supportedChains.length}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get NFTs by address (Vitalik's address)
    console.log('2️⃣ Testing getNftsByAddress for Vitalik\'s address...');
    try {
      const nftsByAddress = await nftAPI({
        endpoint: 'getNftsByAddress',
        chainIds: [1], // Ethereum only
        address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Vitalik's address
        limit: 5,
        offset: 0
      });
      console.log(`✅ NFTs retrieved: ${nftsByAddress.assets.length} NFTs found`);
      console.log(`   OpenSea next token: ${nftsByAddress.openseaNextToken || 'None'}`);
      if (nftsByAddress.assets.length > 0) {
        console.log(`   First NFT name: ${nftsByAddress.assets[0].name}`);
        console.log(`   First NFT token ID: ${nftsByAddress.assets[0].token_id}`);
        console.log(`   First NFT provider: ${nftsByAddress.assets[0].provider}`);
        console.log(`   First NFT chain ID: ${nftsByAddress.assets[0].chainId}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Get NFTs by address with multiple chains
    console.log('3️⃣ Testing getNftsByAddress for multiple chains...');
    try {
      const nftsMultiChain = await nftAPI({
        endpoint: 'getNftsByAddress',
        chainIds: [1, 137], // Ethereum and Polygon
        address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        limit: 3,
        offset: 0
      });
      console.log(`✅ Multi-chain NFTs retrieved: ${nftsMultiChain.assets.length} NFTs found`);
      if (nftsMultiChain.assets.length > 0) {
        nftsMultiChain.assets.forEach((nft: NftV2Model, index: number) => {
          console.log(`   NFT ${index + 1}: ${nft.name} (Chain: ${nft.chainId}, Provider: ${nft.provider})`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Get NFTs by address with pagination
    console.log('4️⃣ Testing getNftsByAddress with pagination...');
    try {
      const nftsPagination = await nftAPI({
        endpoint: 'getNftsByAddress',
        chainIds: [1],
        address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        limit: 2,
        offset: 2
      });
      console.log(`✅ Paginated NFTs retrieved: ${nftsPagination.assets.length} NFTs found`);
      console.log(`   Offset: 2, Limit: 2`);
      if (nftsPagination.assets.length > 0) {
        nftsPagination.assets.forEach((nft: NftV2Model, index: number) => {
          console.log(`   NFT ${index + 1}: ${nft.name} (Token ID: ${nft.token_id})`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get specific NFT by ID (Bored Ape #1)
    console.log('5️⃣ Testing getNftById for Bored Ape #1...');
    try {
      const specificNft = await nftAPI({
        endpoint: 'getNftById',
        chainId: 1, // Ethereum
        contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // Bored Ape Yacht Club
        id: '1', // Token ID 1
        provider: 'opensea'
      });
      console.log(`✅ Specific NFT retrieved successfully`);
      console.log(`   NFT name: ${specificNft.name}`);
      console.log(`   NFT token ID: ${specificNft.token_id}`);
      console.log(`   NFT description: ${specificNft.description?.substring(0, 100)}...`);
      console.log(`   Collection name: ${specificNft.collection.name}`);
      console.log(`   Collection description: ${specificNft.collection.description?.substring(0, 100)}...`);
      console.log(`   Creator address: ${specificNft.collection.creator.address}`);
      console.log(`   Number of traits: ${specificNft.traits.length}`);
      if (specificNft.traits.length > 0) {
        console.log(`   First trait: ${specificNft.traits[0].value}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Get NFTs by address for a different wallet
    console.log('6️⃣ Testing getNftsByAddress for a different wallet...');
    try {
      const differentWallet = await nftAPI({
        endpoint: 'getNftsByAddress',
        chainIds: [1],
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Different address
        limit: 3,
        offset: 0
      });
      console.log(`✅ Different wallet NFTs retrieved: ${differentWallet.assets.length} NFTs found`);
      if (differentWallet.assets.length > 0) {
        differentWallet.assets.forEach((nft: NftV2Model, index: number) => {
          console.log(`   NFT ${index + 1}: ${nft.name} (Provider: ${nft.provider}, Priority: ${nft.priority})`);
        });
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 7: Get NFTs with OpenSea next token (if available)
    console.log('7️⃣ Testing getNftsByAddress with OpenSea next token...');
    try {
      // First, get initial results
      const initialResults = await nftAPI({
        endpoint: 'getNftsByAddress',
        chainIds: [1],
        address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        limit: 1,
        offset: 0
      });
      
      if (initialResults.openseaNextToken) {
        console.log(`   Initial results: ${initialResults.assets.length} NFTs`);
        console.log(`   OpenSea next token: ${initialResults.openseaNextToken}`);
        
        // Use the next token for pagination
        const nextPageResults = await nftAPI({
          endpoint: 'getNftsByAddress',
          chainIds: [1],
          address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
          limit: 1,
          openseaNextToken: initialResults.openseaNextToken
        });
        
        console.log(`✅ Next page results: ${nextPageResults.assets.length} NFTs found`);
        if (nextPageResults.assets.length > 0) {
          console.log(`   Next page NFT: ${nextPageResults.assets[0].name}`);
        }
      } else {
        console.log(`   No OpenSea next token available for pagination`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('\n🎉 All NFT API tests completed!');
    console.log('\nNote: The NFT API provides comprehensive data about NFTs including metadata, collections, traits, and ownership information.');

  } catch (error) {
    console.error('❌ Error running NFT API examples:', error);
  }
}

main(); 