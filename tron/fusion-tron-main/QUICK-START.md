# Quick Start: ETH → TRX Atomic Swap

## ⚡ 3-Minute Setup

### 1. Prerequisites Check

```bash
# Verify Node.js
node --version  # Should be v18+

# Verify balances (minimum required)
# ETH: 0.01 ETH on Sepolia
# TRX: 100 TRX on Nile
```

### 2. Environment Setup

```bash
cd fusion-tron-main
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

```env
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
TRON_RPC_URL=https://nile.trongrid.io

RESOLVER_PRIVATE_KEY=0xYOUR_ETH_PRIVATE_KEY
TRON_PRIVATE_KEY=YOUR_TRON_PRIVATE_KEY_WITHOUT_0x

ETH_ESCROW_FACTORY_ADDRESS=0x78aCb19366A0042dA3263747bda14BA43d68B0de
TRON_ESCROW_FACTORY_ADDRESS=TByM1nxjJsgZuh9SeEniex2Sa9iKNfu4hD
```

### 3. Execute Swap

```bash
# Run health check (optional)
node utils/diagnostics.js

# Execute atomic swap
node atomic-swap.js
```

## 🎯 What Happens

1. **Setup (15s)**: Validates balances and generates secrets
2. **Escrows (30s)**: Creates escrows on both chains
3. **MEV Protection (65s)**: Commits secrets and waits
4. **Execution (10s)**: Reveals secrets and completes swap

## ✅ Success Indicators

```
🎉 COMPLETE ATOMIC SWAP SUCCESS!
================================
✅ ETH to TRX swap completed successfully
✅ Real cross-chain fund movement completed
```

## 🔗 Verify Transactions

- **Ethereum**: https://sepolia.etherscan.io/
- **TRON**: https://nile.tronscan.org/

## ⚠️ Common Issues

**"Insufficient Balance"**: Get testnet tokens

- ETH: https://sepoliafaucet.com/
- TRX: https://nileex.io/join/getJoinPage

**"Address Format Error"**:

- ETH private key needs `0x` prefix
- TRON private key should NOT have `0x` prefix

**"Contract Not Found"**: Verify contract addresses match exactly

## 💰 Default Trade

- **Sends**: 0.0001 ETH + 0.001 ETH safety deposit
- **Receives**: 2 TRX (after 1.5 TRX safety deposit returned)
- **Duration**: ~2 minutes total
- **Networks**: Ethereum Sepolia ↔ TRON Nile

Ready to swap? Run `node atomic-swap.js` 🚀
