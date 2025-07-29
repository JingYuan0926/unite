# 1inch Fusion API

The Fusion API provides access to 1inch's intent-based swap system, allowing users to execute gasless swaps through a Dutch auction mechanism filled by resolvers.

## Overview

1inch Fusion mode offers users a way to execute swaps without spending gas or risking being front-run. Technically, it's a limit order with a variable exchange rate filled by third parties called resolvers. The order's exchange rate decreases from the desired rate to the minimal return amount (Dutch auction) until it becomes profitable for resolvers to fill the order.

## Key Features

- **Gasless Swaps**: Users don't pay gas fees for swaps
- **MEV Protection**: Protection against front-running through the auction mechanism
- **Dutch Auction**: Rate gradually decreases until profitable for resolvers
- **Partial Fills**: Large orders can be filled in parts for better rates
- **Multiple Resolvers**: Competition ensures orders are filled before reaching minimum rate

## API Categories

### 1. Orders API
Manage and query Fusion orders:
- Get active orders
- Get settlement contract address
- Get order status by hash
- Get orders by maker address
- Batch order status lookup

### 2. Quoter API
Get quotes and pricing for Fusion swaps:
- Get standard quotes with presets (fast, medium, slow)
- Get quotes with custom auction parameters
- Estimate gas and fees

### 3. Relayer API
Submit orders to the Fusion system:
- Submit single orders
- Submit multiple orders in batch

## Usage Examples

### Basic Usage with AI Agent

```typescript
import { OneInchAgentKit } from '1inch-agent-kit';

const agent = new OneInchAgentKit({
  openaiApiKey: process.env.OPENAI_API_KEY,
  oneinchApiKey: process.env.ONEINCH_API_KEY,
});

// Natural language queries
const response = await agent.chat(
  "Get active Fusion orders on Ethereum, limit to 5 orders"
);

const quote = await agent.chat(
  "Get a Fusion quote for swapping 1 ETH to USDC on Ethereum"
);
```

### Direct Function Calls

```typescript
import { fusionAPI } from '1inch-agent-kit';

// Get active orders
const activeOrders = await fusionAPI({
  action: "getActiveOrders",
  chain: 1, // Ethereum
  page: 1,
  limit: 10
});

// Get quote for swap
const quote = await fusionAPI({
  action: "getQuote",
  chain: 1,
  fromTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
  toTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  amount: "1000000000000000000", // 1 ETH
  walletAddress: "0x742d35Cc6634C0532925a3b8D4d9C4C1b5c3e4e5"
});

// Get settlement contract address
const settlement = await fusionAPI({
  action: "getSettlementAddress",
  chain: 1
});
```

## Supported Actions

### Orders
- `getActiveOrders` - Get list of active Fusion orders
- `getSettlementAddress` - Get settlement contract address
- `getOrderByHash` - Get order status by hash
- `getOrdersByHashes` - Batch lookup of order statuses
- `getOrdersByMaker` - Get orders by maker address

### Quoter
- `getQuote` - Get quote with standard presets
- `getQuoteWithCustomPreset` - Get quote with custom auction parameters

### Relayer
- `submitOrder` - Submit a single order
- `submitMultipleOrders` - Submit multiple orders

## Supported Networks

The Fusion API supports multiple EVM-compatible networks:
- Ethereum (chain: 1)
- Binance Smart Chain (chain: 56)
- Polygon (chain: 137)
- Arbitrum (chain: 42161)
- Optimism (chain: 10)
- And more...

## Order Lifecycle

1. **Quote**: Get a quote with auction parameters
2. **Create Order**: Create and sign the order
3. **Submit**: Submit order to relayers
4. **Auction**: Dutch auction begins, rate decreases over time
5. **Fill**: Resolvers compete to fill the order
6. **Settlement**: Order is settled on-chain

## Auction Presets

### Fast
- Quick execution
- Higher initial rate
- Shorter auction duration

### Medium
- Balanced execution speed and rate
- Standard auction parameters

### Slow
- Better rates
- Longer auction duration
- More time for optimal fills

### Custom
- User-defined auction parameters
- Full control over auction curve

## Error Handling

The API includes comprehensive error handling for:
- Invalid parameters
- Network errors
- Rate limiting
- Order validation errors
- Settlement failures

## Rate Limits

Please refer to the 1inch API documentation for current rate limits. The API includes automatic retry logic for transient failures.

## Security Considerations

- Always validate order parameters before signing
- Use secure wallet connections
- Verify settlement contract addresses
- Monitor order status after submission
- Be aware of slippage and minimum return amounts

## Examples

Run the example script to see the Fusion API in action:

```bash
npm run example:fusion
```

This will demonstrate:
- Getting active orders
- Fetching quotes
- Using AI agent for natural language queries
- Direct function calls
- Error handling

## Links

- [1inch Fusion Documentation](https://docs.1inch.io/docs/fusion-swap/introduction)
- [1inch API Portal](https://portal.1inch.dev/)
- [Fusion SDK](https://docs.1inch.io/docs/fusion-swap/fusion-sdk/sdk-overview)