# 🌉 TRON Nile Deployment Guide

This guide shows how to deploy our Tron contracts to the **real TRON Nile testnet** for on-chain verification.

## 📋 Prerequisites

### 1. Set up TRON Nile Testnet Account

1. **Install TronLink Wallet**:
   - Chrome Extension: https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec
   - Or use any TRON wallet that supports Nile testnet

2. **Switch to Nile Testnet**:
   - Open TronLink
   - Click Settings → Node Setting
   - Select "Nile Testnet"

3. **Get Test TRX**:
   - Visit: https://nileex.io/join/getJoinPage
   - Enter your TRON address
   - Request 10,000 test TRX (free)

### 2. Environment Setup

1. **Update `.env` file**:

```bash
# TRON Nile Testnet Configuration
TRON_PRIVATE_KEY=your_private_key_here
TRON_API_KEY=your_tron_api_key_here  # Optional but recommended
```

2. **Install TronWeb**:

```bash
npm install tronweb
```

## 🚀 Deployment Steps

### Step 1: Compile Contracts

```bash
# Compile all contracts including Tron contracts
npm run compile
```

### Step 2: Deploy to Real TRON Nile

```bash
# Deploy to actual TRON Nile testnet
node scripts/deploy/06-deploy-real-tron.js
```

### Step 3: Verify on Explorer

After deployment, you'll get links to verify your contracts:

- **TRON Nile Explorer**: https://nile.tronscan.org/
- Search for your contract addresses
- Verify bytecode and transactions

## 🔍 Verification Process

### Check Contract on TRON Explorer

1. **Visit TRON Nile Explorer**: https://nile.tronscan.org/
2. **Search your contract address**
3. **Verify**:
   - ✅ Contract bytecode exists
   - ✅ Transaction history shows deployment
   - ✅ Contract verified status

### Interact with Deployed Contracts

```javascript
const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
  fullHost: "https://api.nileex.io",
});

// Get contract instance
const contract = await tronWeb.contract().at("YOUR_CONTRACT_ADDRESS");

// Test contract functions
const result = await contract.isTronNetwork().call();
console.log("Is Tron Network:", result);
```

## 📊 Expected Results

After successful deployment, you should see:

### 1. Contract Addresses (Real TRON addresses)

```
TronEscrowSrc: TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax
TronEscrowDst: TLsV2VvvvvvvvvvvvvvvvvvvvvvvvvvvvXh
TronEscrowFactory: TMNEfhgjkgjkgjkgjkgjkgjkgjkgjkgjCF
```

### 2. Explorer Verification

- Contracts visible on https://nile.tronscan.org/
- Transaction history showing deployment
- Bytecode verification

### 3. Function Testing

```bash
# Test deployed contracts
node scripts/utils/test-real-tron-contracts.js
```

## 🐛 Troubleshooting

### Common Issues

1. **"Insufficient TRX balance"**
   - Solution: Get more test TRX from https://nileex.io/join/getJoinPage

2. **"Transaction failed"**
   - Solution: Increase fee limit in deployment script
   - Check gas estimation

3. **"Contract not found"**
   - Solution: Wait for network confirmation (3-6 blocks)
   - Verify transaction ID on explorer

4. **"Invalid private key"**
   - Solution: Check `.env` file format
   - Ensure private key is without '0x' prefix

### Getting Help

1. **TRON Developer Documentation**: https://developers.tron.network/
2. **TronWeb Documentation**: https://github.com/tronprotocol/tron-web
3. **TRON Discord**: https://discord.gg/GsRgsTD

## 🎯 Success Criteria

✅ **Phase 3 Complete** when:

- [ ] Contracts deployed to real TRON Nile testnet
- [ ] Addresses visible on TRON explorer
- [ ] Functions callable on-chain
- [ ] Cross-chain compatibility verified

## 🚀 Next Steps

Once contracts are verified on TRON Nile:

1. **Phase 4**: Deploy Fusion Extension on Ethereum Sepolia
2. **Phase 5**: Implement SDK integration
3. **Phase 6**: Create demo application
4. **Phase 7**: Execute live cross-chain swaps

---

**Note**: Real testnet deployment may take 3-15 minutes depending on network congestion. Be patient and check explorer for confirmation.
