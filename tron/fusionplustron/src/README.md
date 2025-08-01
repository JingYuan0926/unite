# Fusion+ Tron Extension SDK

Official 1inch Fusion+ integration with Tron network support for cross-chain atomic swaps.

## Overview

This SDK enables atomic cross-chain swaps between Ethereum and Tron networks using the official 1inch Fusion+ architecture. It maintains full compatibility with official 1inch contracts while extending functionality to support Tron network operations.

## Architecture

### Core Components

- **CrossChainOrchestrator**: Main coordinator for cross-chain atomic swaps
- **Official1inchSDK**: Wrapper around official 1inch Fusion SDK
- **TronExtension**: Tron-specific functionality and contract interactions
- **ConfigManager**: Centralized configuration management
- **Logger**: Structured logging with scoped contexts

### Official 1inch Integration

- Uses official **LimitOrderProtocol** for order execution
- Uses official **EscrowFactory** for escrow creation
- Uses official **Resolver** for atomic execution
- Uses **TronFusionExtension** for cross-chain coordination
- Maintains full atomicity and security guarantees

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file with required configuration:

```env
# Ethereum Sepolia Configuration
ETH_NETWORK=sepolia
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETH_PRIVATE_KEY=your_private_key

# Tron Nile Configuration
TRON_NETWORK=nile
TRON_RPC_URL=https://nile.trongrid.io
TRON_PRIVATE_KEY=your_tron_private_key

# Contract Addresses
OFFICIAL_LOP_ADDRESS=0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0
OFFICIAL_ESCROW_FACTORY_ADDRESS=0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA
OFFICIAL_RESOLVER_ADDRESS=0xEdC45bD18674BdD4A22D4904e6252A8DA9e29946
FUSION_EXTENSION_ADDRESS=0x6997AC00dB9159A9331863d73a5CdA9fc3b47df1

# User Configuration
USER_A_ETH_PRIVATE_KEY=your_eth_private_key
USER_A_TRX_RECEIVE_ADDRESS=your_tron_address
USER_B_TRON_PRIVATE_KEY=your_tron_private_key
USER_B_ETH_RECEIVE_ADDRESS=your_eth_address
```

### Basic Usage

```typescript
import { CrossChainOrchestrator, ConfigManager, Logger } from "./src";

// Initialize components
const config = new ConfigManager();
const logger = Logger.getInstance();
const orchestrator = new CrossChainOrchestrator(config, logger.scope("App"));

// Execute ETH -> TRX swap
const swapParams = {
  ethAmount: ethers.parseEther("0.001"),
  ethPrivateKey: "your_private_key",
  tronPrivateKey: "your_tron_private_key",
  tronRecipient: "your_tron_address",
  timelock: 7200, // 2 hours
};

const result = await orchestrator.executeETHtoTRXSwap(swapParams);
console.log("Swap initiated:", result.orderHash);
```

## Scripts

### Development

```bash
# Compile contracts
npm run compile

# Run integration tests
npm run test:integration

# Run SDK tests
npm run test:sdk

# Build SDK
npm run build:sdk
```

### Demo

```bash
# Run interactive demo
npm run demo

# Show demo help
npm run demo:help
```

### Deployment

```bash
# Deploy Ethereum contracts
npm run deploy:eth

# Deploy Tron contracts
npm run deploy:tron
```

## API Reference

### CrossChainOrchestrator

Main class for orchestrating cross-chain atomic swaps.

```typescript
class CrossChainOrchestrator {
  // Execute ETH -> TRX atomic swap
  async executeETHtoTRXSwap(params: SwapParams): Promise<SwapResult>;

  // Execute TRX -> ETH atomic swap
  async executeTRXtoETHSwap(params: SwapParams): Promise<SwapResult>;

  // Withdraw from completed swap
  async withdrawFromSwap(
    result: SwapResult,
    privateKey: string,
    network: "ethereum" | "tron"
  ): Promise<string>;

  // Cancel expired swap
  async cancelSwap(
    result: SwapResult,
    privateKey: string,
    network: "ethereum" | "tron"
  ): Promise<string>;

  // Monitor swap progress
  async monitorSwap(
    result: SwapResult,
    onProgress?: (status: SwapStatus) => void
  ): Promise<SwapStatus>;
}
```

### Official1inchSDK

Wrapper around official 1inch Fusion SDK.

```typescript
class Official1inchSDK {
  // Get quote for ETH -> TRX swap
  async getETHtoTRXQuote(
    ethAmount: bigint,
    fromAddress: string
  ): Promise<Quote>;

  // Create cross-chain order
  async createCrossChainOrder(
    params: CreateOrderParams
  ): Promise<PreparedOrder>;

  // Submit order to 1inch network
  async submitOrder(order: any, quoteId: string): Promise<OrderInfo>;

  // Get order status
  async getOrderStatus(orderHash: string): Promise<OrderStatusResponse>;
}
```

### TronExtension

Tron-specific functionality.

```typescript
class TronExtension {
  // Deploy Tron escrow destination
  async deployTronEscrowDst(
    params: TronEscrowParams,
    privateKey: string
  ): Promise<TronTransactionResult>;

  // Withdraw from Tron escrow
  async withdrawFromTronEscrow(
    escrowAddress: string,
    secret: string,
    immutables: TronEscrowParams,
    privateKey: string
  ): Promise<TronTransactionResult>;

  // Generate secret hash for atomic swap
  generateSecretHash(): { secret: string; secretHash: string };

  // Get Tron network information
  async getTronNetworkInfo(): Promise<TronNetworkInfo>;
}
```

## Testing

### Integration Tests

Comprehensive integration tests validate:

- Environment configuration
- Network connectivity
- Contract deployments
- SDK component functionality
- End-to-end swap flows
- Error handling
- Security validations

```bash
npm run test:integration
```

### Manual Testing

Use the interactive demo to test live swaps:

```bash
npm run demo
```

## Security Considerations

### Atomic Guarantees

- **Order Fill + Escrow Creation**: Atomic via official Resolver contract
- **Cross-Chain Coordination**: Secured by hashlock/timelock mechanisms
- **Fund Safety**: Non-custodial architecture, users retain control
- **Timelock Protection**: Configurable timeouts with safe defaults

### Private Key Management

- Never commit private keys to version control
- Use environment variables for configuration
- Consider hardware wallets for production use
- Implement proper key rotation policies

### Network Security

- Uses official 1inch contracts (audited and battle-tested)
- Validates all contract addresses and deployments
- Implements comprehensive error handling
- Provides fallback mechanisms for edge cases

## Troubleshooting

### Common Issues

1. **Insufficient Balances**: Ensure adequate ETH and TRX for transactions and fees
2. **Network Connectivity**: Verify RPC URLs and network access
3. **Contract Addresses**: Confirm all contract addresses are correct for target networks
4. **Timelock Validation**: Ensure timelock values are within acceptable ranges (1-24 hours)

### Debug Mode

Enable debug logging:

```typescript
import { Logger, LogLevel } from "./src/utils/Logger";

const logger = Logger.getInstance(LogLevel.DEBUG);
```

### Support

For issues and questions:

- Check the integration tests for examples
- Review the demo script for usage patterns
- Consult the official 1inch documentation
- Examine contract deployment logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- 1inch Network for the official Fusion+ architecture
- Tron Foundation for network support
- OpenZeppelin for security libraries
- Hardhat for development framework
