import { spotPriceAPI } from '../src/functions/spotPriceAPI';

async function testSpotPriceAPI() {
  console.log('🚀 Testing 1inch Spot Price API\n');

  try {
    // Test 1: Get whitelisted token prices for Ethereum
    console.log('1️⃣ Testing getWhitelistedPrices for Ethereum...');
    const whitelistedPrices = await spotPriceAPI({
      endpoint: 'getWhitelistedPrices',
      chain: 1
    });
    console.log('✅ Whitelisted prices (first 3 tokens):');
    const firstThree = Object.entries(whitelistedPrices).slice(0, 3);
    firstThree.forEach(([address, price]) => {
      console.log(`   ${address}: ${price}`);
    });
    console.log(`   ... and ${Object.keys(whitelistedPrices).length - 3} more tokens\n`);

    // Test 2: Get requested token prices
    console.log('2️⃣ Testing getRequestedPrices for specific tokens...');
    const requestedPrices = await spotPriceAPI({
      endpoint: 'getRequestedPrices',
      chain: 1,
      tokens: [
        '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH token
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'  // ETH
      ],
      currency: 'USD'
    });
    console.log('✅ Requested prices:');
    Object.entries(requestedPrices).forEach(([address, price]) => {
      console.log(`   ${address}: $${price}`);
    });
    console.log();

    // Test 3: Get supported currencies
    console.log('3️⃣ Testing getCurrencies for Ethereum...');
    const currencies = await spotPriceAPI({
      endpoint: 'getCurrencies',
      chain: 1
    });
    console.log('✅ Supported currencies:');
    console.log(`   ${currencies.codes.join(', ')}\n`);

    // Test 4: Get prices for multiple addresses via GET
    console.log('4️⃣ Testing getPricesForAddresses for multiple tokens...');
    const addressPrices = await spotPriceAPI({
      endpoint: 'getPricesForAddresses',
      chain: 1,
      addresses: [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        '0xdac17f958d2ee523a2206206994597c13d831ec7'  // USDT
      ],
      currency: 'USD'
    });
    console.log('✅ Address prices:');
    Object.entries(addressPrices).forEach(([address, price]) => {
      console.log(`   ${address}: $${price}`);
    });
    console.log();

    // Test 5: Default behavior (no parameters)
    console.log('5️⃣ Testing default behavior (no parameters)...');
    const defaultPrices = await spotPriceAPI({});
    console.log('✅ Default whitelisted prices (first 2 tokens):');
    const firstTwo = Object.entries(defaultPrices).slice(0, 2);
    firstTwo.forEach(([address, price]) => {
      console.log(`   ${address}: ${price}`);
    });
    console.log();

    console.log('🎉 All Spot Price API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Spot Price API:', error);
  }
}

// Run the test
testSpotPriceAPI(); 