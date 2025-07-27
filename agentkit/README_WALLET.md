# Wallet Integration Guide

This guide explains how to use the wallet integration feature in the 1inch Agent Kit.

## Overview

The 1inch Agent Kit now supports automatic wallet integration that works differently based on your usage context:

- **Script Mode**: Automatically uses `wallet.json` from the project root
- **Frontend Mode**: Accepts wallet data from your frontend application

## Setup

### 1. Local Wallet for Scripts (wallet.json)

Create a `wallet.json` file in your project root:

```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "chainId": 1,
  "privateKey": "0x0000000000000000000000000000000000000000000000000000000000000001",
  "isTestWallet": true,
  "name": "Test Wallet",
  "balance": "1000000000000000000",
  "ensName": null,
  "walletType": "test"
}
```

### 2. Frontend Integration

When using with a frontend, pass wallet data to the agent:

```typescript
import { OneInchAgentKit, Wallet } from '1inch-agent-kit';

const agent = new OneInchAgentKit({
  openaiApiKey: process.env.OPENAI_API_KEY,
  oneinchApiKey: process.env.ONEINCH_API_KEY,
});

// Set wallet from frontend
const frontendWallet: Wallet = {
  address: '0x1234567890123456789012345678901234567890',
  chainId: 1,
  walletType: 'metamask',
  name: 'User Wallet',
  balance: '500000000000000000'
};

agent.setWallet(frontendWallet);

// Or pass wallet directly in chat
const response = await agent.chat('Get gas prices', frontendWallet);
```

## Usage Examples

### Script Usage (Automatic Local Wallet)

```bash
# Run with local wallet.json
npm run example:wallet
npm run example:gas
npm run example:rpc
```

### Frontend Usage

```typescript
// Method 1: Set wallet once
agent.setWallet(userWallet);
const response = await agent.chat('Get gas prices for Ethereum');

// Method 2: Pass wallet per request
const response = await agent.chat('Get gas prices for Ethereum', userWallet);

// Method 3: Check current wallet
const currentWallet = agent.getWallet();
console.log('Current wallet:', currentWallet?.address);
```

## Function Integration

All functions now accept an optional `wallet` parameter:

```typescript
import { gasAPI, rpcAPI, chartsAPI } from '1inch-agent-kit';

// Functions automatically use the connected wallet
const gasData = await gasAPI({ chain: 1 }); // Uses current wallet context
const rpcData = await rpcAPI({ chainId: 1, method: 'eth_blockNumber' });
```

## Wallet Interface

```typescript
interface Wallet {
  address: string;           // Ethereum address
  chainId: number;          // Blockchain network ID
  privateKey?: string;      // Only for test wallets
  isTestWallet?: boolean;   // Indicates if it's a test wallet
  name?: string;            // Wallet name/label
  balance?: string;         // Wallet balance in Wei
  ensName?: string | null;  // ENS name if available
  walletType?: string;      // Wallet type (metamask, walletconnect, etc.)
}
```

## Supported Chains

- 1: Ethereum Mainnet
- 10: Optimism
- 56: BNB Chain
- 100: Gnosis
- 137: Polygon
- 324: zkSync Era
- 42161: Arbitrum One
- 43114: Avalanche C-Chain
- 8453: Base
- 7565164: Solana

## Utility Functions

```typescript
import { WalletUtils } from '1inch-agent-kit';

// Format address for display
const formatted = WalletUtils.formatAddress('0x1234...5678');

// Get chain name
const chainName = WalletUtils.getChainName(1); // "Ethereum Mainnet"

// Convert Wei to Ether
const ether = WalletUtils.weiToEther('1000000000000000000'); // "1.000000"

// Convert Ether to Wei
const wei = WalletUtils.etherToWei('1.5'); // "1500000000000000000"

// Validate address
const isValid = WalletUtils.isValidAddress('0x1234567890123456789012345678901234567890');
```

## Error Handling

The wallet system includes comprehensive error handling:

```typescript
try {
  const response = await agent.chat('Get gas prices');
} catch (error) {
  if (error.message.includes('Wallet connection required')) {
    // Handle missing wallet
    console.log('Please connect a wallet first');
  }
}
```

## Best Practices

1. **Always validate wallet data** before using in production
2. **Never commit real private keys** to version control
3. **Use test wallets** for development and testing
4. **Handle wallet disconnection** gracefully in your frontend
5. **Validate chain compatibility** before making API calls

## Testing

Run the wallet integration example:

```bash
npm run example:wallet
```

This will demonstrate:
- Local wallet loading from `wallet.json`
- Frontend wallet simulation
- Wallet context switching
- Function calls with wallet integration