# gasAPI Function

Get real-time gas price data from 1inch Gas Price API. This function provides accurate gas price information across various blockchains, including base fee, priority fees, and max fees for different transaction speeds.

## Usage

```typescript
import { gasAPI } from '1inch-agent-kit';

// Get gas prices for Ethereum Mainnet
const gasPrices = await gasAPI({
  chain: 1 // Ethereum Mainnet
});

console.log('Base Fee:', gasPrices.baseFee);
console.log('Low Priority Fee:', gasPrices.low.maxPriorityFeePerGas);
console.log('High Priority Fee:', gasPrices.high.maxPriorityFeePerGas);
```

## Parameters

- `chain` (required): The blockchain network ID
  - `1`: Ethereum Mainnet
  - `137`: Polygon
  - `42161`: Arbitrum One
  - `56`: BNB Chain
  - `10`: Optimism
  - `43114`: Avalanche C-Chain
  - `8453`: Base
  - `324`: zkSync Era
  - `100`: Gnosis
  - `7565164`: Solana

## Response

The function returns an `Eip1559GasPriceResponse` object containing:

### Base Fee
- `baseFee`: The base fee introduced by EIP-1559 (burned, not given to miners)

### Gas Price Tiers
Each tier (low, medium, high, instant) contains:
- `maxPriorityFeePerGas`: The tip that goes directly to miners
- `maxFeePerGas`: The total maximum amount willing to pay per gas unit

### Gas Price Tiers Explained

1. **Low**: Slowest transactions, lowest fees
2. **Medium**: Standard transactions, balanced fees
3. **High**: Faster transactions, higher fees
4. **Instant**: Fastest transactions, highest fees

## Examples

### Get Ethereum Gas Prices
```typescript
const ethGas = await gasAPI({ chain: 1 });
console.log('Ethereum Gas Prices:');
console.log('- Base Fee:', ethGas.baseFee, 'wei');
console.log('- Low Priority:', ethGas.low.maxPriorityFeePerGas, 'wei');
console.log('- Medium Priority:', ethGas.medium.maxPriorityFeePerGas, 'wei');
console.log('- High Priority:', ethGas.high.maxPriorityFeePerGas, 'wei');
console.log('- Instant Priority:', ethGas.instant.maxPriorityFeePerGas, 'wei');
```

### Get Polygon Gas Prices
```typescript
const polygonGas = await gasAPI({ chain: 137 });
console.log('Polygon Gas Prices:', polygonGas);
```

### Get Multiple Chain Gas Prices
```typescript
const chains = [1, 137, 42161]; // Ethereum, Polygon, Arbitrum
const gasPrices = await Promise.all(
  chains.map(chain => gasAPI({ chain }))
);

gasPrices.forEach((prices, index) => {
  console.log(`Chain ${chains[index]} Base Fee:`, prices.baseFee);
});
```

## Understanding Gas Prices

### EIP-1559 Gas Model

The 1inch Gas Price API returns data in the EIP-1559 format, which includes:

1. **Base Fee**: Algorithmically adjusted fee that gets burned
2. **Priority Fee (Tip)**: Direct payment to miners for transaction prioritization
3. **Max Fee**: Total maximum amount willing to pay

### When to Use Each Tier

- **Low**: When you're not in a hurry and want to save on gas
- **Medium**: For most regular transactions
- **High**: When you need faster confirmation
- **Instant**: For urgent transactions requiring immediate processing

## Error Handling

The function will throw an error if:
- Required parameters are missing
- Invalid chain ID is provided
- API key is not configured
- Network request fails

## Performance

- **Response Time**: < 200ms
- **Up-to-date**: Real-time gas price data
- **Enterprise-grade**: Dedicated endpoint for optimal performance

## Use Cases

- **Wallets**: Display current gas prices to users
- **DEXs**: Calculate optimal gas for swaps
- **Portfolio Trackers**: Monitor transaction costs
- **Trading Bots**: Optimize gas costs for arbitrage
- **UI Applications**: Show gas price information

## Notes

- Gas prices are in wei (smallest unit)
- Base fee is burned and not given to miners
- Priority fees go directly to miners
- Prices update in real-time based on network conditions
- Different chains may have different gas models 