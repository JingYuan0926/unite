# rpcAPI Function

Perform JSON-RPC calls against blockchain nodes using 1inch Web3 RPC API. This function provides reliable, real-time data access and interaction capabilities for executing transactions, monitoring block events, and querying network data efficiently.

## Usage

```typescript
import { rpcAPI } from '1inch-agent-kit';

// Get the latest block number on Ethereum
const blockNumber = await rpcAPI({
  chainId: 1,
  method: 'eth_blockNumber'
});

// Get account balance
const balance = await rpcAPI({
  chainId: 1,
  method: 'eth_getBalance',
  params: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'latest']
});
```

## Parameters

- `chainId` (required): The blockchain network ID
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

- `nodeType` (optional): The node type for the call
  - `full`: Full node (default)
  - `archive`: Archive node
  - `validator`: Validator node

- `method` (required): The JSON-RPC method to call
- `params` (optional): Parameters for the method call
- `id` (optional): Request ID for the JSON-RPC call

## Response

The function returns an `RpcResponse` object containing:

```typescript
{
  jsonrpc: "2.0",
  result?: any,        // Success response data
  error?: {            // Error information (if any)
    code: number,
    message: string,
    data?: any
  },
  id: number | string | null
}
```

## Common JSON-RPC Methods

### Block Information
- `eth_blockNumber`: Get the latest block number
- `eth_getBlockByNumber`: Get block information by number
- `eth_getBlockByHash`: Get block information by hash

### Account Information
- `eth_getBalance`: Get account balance
- `eth_getTransactionCount`: Get transaction count (nonce)
- `eth_getCode`: Get contract bytecode

### Transaction Information
- `eth_getTransactionByHash`: Get transaction by hash
- `eth_getTransactionReceipt`: Get transaction receipt
- `eth_getTransactionByBlockHashAndIndex`: Get transaction by block hash and index

### Smart Contract Interaction
- `eth_call`: Execute a call without creating a transaction
- `eth_estimateGas`: Estimate gas for a transaction
- `eth_getLogs`: Get event logs

### Network Information
- `eth_gasPrice`: Get current gas price
- `eth_chainId`: Get chain ID
- `net_version`: Get network version

## Examples

### Get Latest Block Number
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_blockNumber'
});

console.log('Latest block:', parseInt(response.result, 16));
```

### Get Account Balance
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_getBalance',
  params: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'latest']
});

const balanceInWei = parseInt(response.result, 16);
const balanceInEth = balanceInWei / 1e18;
console.log('Balance:', balanceInEth, 'ETH');
```

### Get Block Information
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_getBlockByNumber',
  params: ['0x1b4', false] // Block number in hex, include full transaction objects
});

console.log('Block hash:', response.result.hash);
console.log('Block timestamp:', parseInt(response.result.timestamp, 16));
console.log('Transaction count:', response.result.transactions.length);
```

### Call Smart Contract
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_call',
  params: [{
    to: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8', // USDC contract
    data: '0x313ce567' // decimals() function selector
  }, 'latest']
});

const decimals = parseInt(response.result.slice(-64), 16);
console.log('Token decimals:', decimals);
```

### Get Event Logs
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_getLogs',
  params: [{
    fromBlock: '0x1b4',
    toBlock: '0x1b5',
    address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8',
    topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'] // Transfer event
  }]
});

console.log('Transfer events:', response.result);
```

### Estimate Gas
```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_estimateGas',
  params: [{
    from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: '0x0'
  }]
});

const gasEstimate = parseInt(response.result, 16);
console.log('Estimated gas:', gasEstimate);
```

### Multi-Chain Examples

#### Get Balance on Polygon
```typescript
const response = await rpcAPI({
  chainId: 137,
  method: 'eth_getBalance',
  params: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'latest']
});
```

#### Get Block on Arbitrum
```typescript
const response = await rpcAPI({
  chainId: 42161,
  method: 'eth_getBlockByNumber',
  params: ['latest', false]
});
```

## Error Handling

The function will return an error response if:
- Invalid chain ID is provided
- Invalid JSON-RPC method is called
- Network request fails
- Blockchain node returns an error

```typescript
const response = await rpcAPI({
  chainId: 1,
  method: 'eth_getBalance',
  params: ['invalid-address', 'latest']
});

if (response.error) {
  console.error('RPC Error:', response.error.message);
  console.error('Error Code:', response.error.code);
}
```

## Performance Benefits

- **Maximal uptime**: Advanced internal systems for node health check/load balancing
- **High load resistance**: Significant expertise supporting high network load
- **Multiple chains**: Support for different EVM networks through a single provider
- **Seamless integration**: Easy integration with existing web3 projects

## Use Cases

- **dApps**: Stable and secure connection to the blockchain
- **DEXes**: High uptime and reliable data feeds for trading operations
- **Trading bots**: Fast and reliable access to blockchain data
- **Wallets**: Real-time balance updates and transaction statuses
- **Analytics platforms**: Collect and analyze blockchain data

## Notes

- All parameters in `params` array should be strings (hex values for numbers)
- Block numbers can be specified as hex strings or special values like 'latest', 'earliest', 'pending'
- Gas prices and balances are returned in wei (hex format)
- Contract addresses should be checksummed when possible
- The API supports standard JSON-RPC 2.0 specification 