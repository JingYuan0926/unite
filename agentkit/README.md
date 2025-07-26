# 1inch Agent Kit

> Connect any LLM to 1inch DeFi protocols

[![npm version](https://badge.fury.io/js/1inch-agent-kit.svg)](https://badge.fury.io/js/1inch-agent-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The 1inch Agent Kit allows you to interact with 1inch's DeFi protocols using natural language, powered by OpenAI's GPT models. Get quotes, execute swaps, check gas prices, and monitor protocol health through simple chat interactions.

## 🚀 Quick Start

### Installation

```bash
npm install 1inch-agent-kit
```

### Basic Usage

```typescript
import { OneInchAgentKit } from '1inch-agent-kit';

// Create agent instance
const agent = new OneInchAgentKit({
  openaiApiKey: process.env.OPENAI_API_KEY,
  oneinchApiKey: process.env.ONEINCH_API_KEY,
});

// Get a quote
const response = await agent.chat('Get me a quote for swapping 1 ETH to USDC on Ethereum');
console.log(response.content);
```

## 📋 Prerequisites

- **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **1inch API Key**: Get one from [1inch Developer Portal](https://portal.1inch.dev/)

## 🔧 Configuration

Set your API keys as environment variables:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export ONEINCH_API_KEY="your-1inch-api-key"
```

Or pass them directly to the agent:

```typescript
const agent = new OneInchAgentKit({
  openaiApiKey: 'your-openai-api-key',
  oneinchApiKey: 'your-1inch-api-key',
  openaiModel: 'gpt-4o-mini', // Optional: default model
});
```

## 🎯 Features

### Supported Operations

- **Get Quotes**: Get the best swap routes and estimated output amounts
- **Execute Swaps**: Create swap transactions for execution
- **Gas Price Data**: Get real-time gas prices across multiple chains
- **Health Checks**: Monitor API and chain health status
- **Multi-Chain Support**: Ethereum, Polygon, BNB Chain, Arbitrum, and more

### Supported Chains

- Ethereum Mainnet (1)
- Polygon (137)
- BNB Chain (56)
- Arbitrum One (42161)
- Optimism (10)
- Avalanche C-Chain (43114)
- Base (8453)
- Polygon zkEVM (1101)
- zkSync Era (324)
- Gnosis (100)
- Solana (7565164)
- And more...

## 📖 Examples

### Get a Quote

```typescript
const response = await agent.chat('Get me a quote for swapping 1 ETH to USDC on Ethereum with 1% slippage');
console.log(response.content);
```

### Execute a Swap

```typescript
const response = await agent.chat('Create a swap transaction for 0.1 ETH to USDC on Ethereum. My wallet is 0x1234...');
console.log(response.content);
```

### Get Gas Prices

```typescript
const response = await agent.chat('Get me the current gas prices for Ethereum mainnet');
console.log(response.content);
```

### Check Health

```typescript
const response = await agent.chat('Check the health status of the 1inch API');
console.log(response.content);
```

### Complex Queries

```typescript
const response = await agent.chat(`
  Get me a quote for swapping 1000 USDC to ETH on Polygon with 0.5% slippage.
  Use complexity level 4 and split into 5 parts for better rates.
  Also show me the current gas prices for both chains.
`);
console.log(response.content);
```

## 🔌 Direct Function Usage

You can also use the functions directly without the LLM agent:

```typescript
import { getQuote, swap, healthCheck, gasAPI } from '1inch-agent-kit';

// Get quote directly
const quote = await getQuote({
  chainId: 1,
  src: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEe", // ETH
  dst: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8", // USDC
  amount: "1000000000000000000", // 1 ETH
  slippage: 1.0
});

// Execute swap
const swapTx = await swap({
  chainId: 1,
  src: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEe",
  dst: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C8",
  amount: "1000000000000000000",
  from: "0x1234567890123456789012345678901234567890",
  slippage: 1.0
});

// Get gas prices
const gasPrices = await gasAPI({ chain: 1 });

// Check health
const health = await healthCheck({ chainId: 1 });
```

## 🏗️ Architecture

The 1inch Agent Kit follows a modular architecture:

```
src/
├── core/           # Core agent functionality
│   ├── llmAgent.ts # OpenAI integration
│   ├── registry.ts # Function registry
│   └── types.ts    # TypeScript types
├── functions/      # 1inch API functions
│   ├── getQuote/   # Quote functionality
│   ├── swap/       # Swap functionality
│   ├── gasAPI/     # Gas price functionality
│   └── healthCheck/# Health check functionality
└── utils/          # Utilities
    ├── fetcher.ts  # HTTP client
    └── logger.ts   # Logging
```

## 🧪 Testing

Run the examples to test the functionality:

```bash
# Run quote example
npm run example:quote

# Run swap example
npm run example:swap

# Run gas price example
npm run example:gas

# Run health check example
npm run example:health
```

## 📚 API Reference

### OneInchAgentKit

The main class for interacting with 1inch protocols.

#### Constructor

```typescript
new OneInchAgentKit(config?: AgentKitConfig)
```

#### Methods

- `chat(prompt: string): Promise<AgentResponse>` - Send a natural language prompt
- `getAvailableFunctions(): Promise<string[]>` - Get list of available functions
- `hasFunction(name: string): Promise<boolean>` - Check if function is available
- `getFunctionDefinitions(): Promise<FunctionDefinition[]>` - Get function definitions

### AgentResponse

```typescript
interface AgentResponse {
  content: string;
  functionCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
  }>;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit)
- Built with [1inch API](https://docs.1inch.io/)
- Powered by [OpenAI GPT](https://openai.com/)

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/1inch-agent-kit/issues)

---

Made with ❤️ by the 1inch Agent Kit team 