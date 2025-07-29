# 🚀 Fusion+ Tron Bridge - Competition Implementation

**1inch Fusion+ Cross-Chain Swap: Ethereum Sepolia ↔ Tron Nile**

## 📋 Overview

This is a production-ready cross-chain swap implementation for the 1inch Fusion+ competition, enabling trustless swaps between Ethereum Sepolia and Tron Nile using HTLC (Hash Time-Lock Contract) architecture.

## 🛠 Prerequisites

### Required Software
- **Node.js**: ≥18.0.0 (tested with v22.16.0)
- **NPM**: ≥8.0.0 (tested with v10.9.2)
- **Git**: Latest version
- **TronBox**: v4.2.1+ (installed globally)

### Development Environment Setup

```bash
# 1. Clone this repository
git clone <your-repository-url>
cd fusion-tron-main

# 2. Install TronBox globally (if not already installed)
npm install -g tronbox

# 3. Install project dependencies
npm install

# 4. Copy environment configuration
cp .env.example .env
# Edit .env with your private keys and RPC URLs

# 5. Verify installation
npm run verify-setup
```

## 🔧 Cross-PC Setup Instructions

### For Development Team Members

This project references 1inch's official repositories but creates an independent implementation:

```bash
# Parent directory structure should be:
parent-folder/
├── fusion-tron-main/          # This project (your implementation)
├── cross-chain-swap/          # 1inch reference (read-only)
├── cross-chain-sdk/           # 1inch reference (read-only)  
├── cross-chain-resolver-example/  # 1inch reference (read-only)
└── plan.md                    # Competition plan
```

### Setting Up on New PC

1. **Clone the implementation repo:**
   ```bash
   git clone <your-fusion-tron-main-repo>
   cd fusion-tron-main
   ```

2. **Install global dependencies:**
   ```bash
   npm install -g tronbox
   node --version  # Should be ≥18
   tronbox version # Should show v4.2.1+
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your private keys and RPC configurations
   ```

4. **Verify network access:**
   ```bash
   npm run test-networks
   ```

## 🌐 Network Configuration

### Ethereum Sepolia
- **Chain ID**: 11155111
- **RPC URLs** (use one of these):
  - `https://sepolia.dev`
  - `https://ethereum-sepolia.blockpi.network/v1/rpc/public`
  - `https://rpc.sepolia.org`
- **Explorer**: https://sepolia.etherscan.io

### Tron Nile (Testnet)
- **Network ID**: 3
- **RPC URLs**:
  - `https://api.nileex.io`
  - `https://nile.trongrid.io`
- **Explorer**: https://nile.tronscan.org

## 📁 Project Structure

```
fusion-tron-main/
├── contracts/
│   ├── ethereum/          # Ethereum Sepolia contracts
│   └── tron/             # Tron Nile contracts
├── src/
│   ├── resolver/         # Advanced cross-chain resolver
│   └── utils/           # Shared utilities
├── frontend/            # Competition demo UI
├── tests/              # Comprehensive test suite
├── scripts/            # Deployment and utility scripts
├── docs/              # Technical documentation
└── .env.example       # Environment configuration template
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
npm run setup
```

### 2. Deploy Contracts
```bash
# Deploy to both networks
npm run deploy:all

# Or deploy individually
npm run deploy:ethereum
npm run deploy:tron
```

### 3. Start Resolver
```bash
npm run start:resolver
```

### 4. Launch Demo UI
```bash
npm run start:ui
```

## 🔑 Required Environment Variables

```bash
# Ethereum Sepolia
ETH_SEPOLIA_RPC_URL=https://sepolia.dev
ETH_SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
ETH_ESCROW_FACTORY=deployed_contract_address

# Tron Nile  
TRON_NILE_RPC_URL=https://api.nileex.io
TRON_NILE_PRIVATE_KEY=your_tron_private_key
TRON_ESCROW_FACTORY=deployed_tron_address

# Resolver
RESOLVER_PRIVATE_KEY=resolver_account_private_key
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests (requires deployed contracts)
npm run test:integration

# End-to-end tests
npm run test:e2e
```

## 📊 Competition Demo

### Live Demo URLs
- **Demo Interface**: http://localhost:3000
- **Resolver Monitor**: http://localhost:3000/monitor  
- **Judge Demo Mode**: http://localhost:3000/demo

### Demo Commands
```bash
# Start full demo environment
npm run demo:start

# Run automated demo sequence
npm run demo:eth-to-tron
npm run demo:tron-to-eth
```

## 🔧 Development Commands

```bash
npm run setup          # Initial environment setup
npm run build          # Build all components
npm run deploy:all     # Deploy contracts to both networks
npm run start:resolver # Start cross-chain resolver
npm run start:ui       # Start demo interface
npm run test          # Run test suite
npm run verify-setup  # Verify development environment
npm run test-networks # Test network connectivity
```

## 🏆 Competition Features

- ✅ **Bidirectional Swaps**: ETH ↔ TRX with full HTLC implementation
- ✅ **MEV Protection**: Commit-reveal secret management
- ✅ **Advanced Recovery**: Exponential backoff and failure handling
- ✅ **Real-time Monitoring**: Live transaction status and metrics
- ✅ **Professional UI**: Modern React interface for judge demonstrations
- ✅ **Production Ready**: Comprehensive error handling and monitoring

## 📞 Support

For competition support or technical questions:
- Check the troubleshooting section in `/docs/troubleshooting.md`
- Review network status: `npm run test-networks`
- Verify environment: `npm run verify-setup`

## 📄 License

This project is developed for the 1inch Fusion+ competition. 