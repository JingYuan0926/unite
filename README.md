# 1inch Agent Kit

![1inch Agent Kit Cover](https://raw.githubusercontent.com/JingYuan0926/unite/main/frontend/public/landingpage.png)

[![NPM Downloads](https://img.shields.io/npm/dm/1inch-agent-kit)](https://www.npmjs.com/package/1inch-agent-kit)
[![GitHub forks](https://img.shields.io/github/forks/your-org/1inch-agent-kit)](https://github.com/your-org/1inch-agent-kit/network)
[![GitHub License](https://img.shields.io/github/license/your-org/1inch-agent-kit)](https://github.com/your-org/1inch-agent-kit/blob/main/LICENSE)

An open-source toolkit for connecting AI agents to 1inch protocols and DeFi operations. Connect any LLM to 1inch DeFi protocols using natural language, powered by OpenAI's GPT models. Get quotes, execute swaps, check gas prices, perform RPC calls, and monitor protocol health through simple chat interactions.

## 🚀 Quick Start

### Core Installation
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
- **Node.js** (v16 or higher)
- **MetaMask** (for wallet features in frontend)

## 🎯 Core Features

### Supported Operations
- **Get Quotes**: Get the best swap routes and estimated output amounts
- **Execute Swaps**: Create swap transactions for execution
- **Gas Price Data**: Get real-time gas prices across multiple chains
- **RPC Calls**: Perform JSON-RPC calls against blockchain nodes
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

## 🌐 Project Structure

This project consists of three main directories, each serving a specific purpose:

### 📁 `/agentkit` - Core Agent Kit Package

The main 1inch Agent Kit package containing the core functionality and APIs for DeFi operations.

**Architecture:**
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
│   ├── rpcAPI/     # RPC functionality
│   ├── healthCheck/# Health check functionality
|   └── (and many other APIs)
└── utils/          # Utilities
    ├── fetcher.ts  # HTTP client
    └── logger.ts   # Logging
```

**Key Features:**
- 1inch API integrations
- OpenAI LLM integration
- Natural language processing for DeFi commands
- Direct function usage without LLM
- Multi-chain support
- TypeScript support

**Key Files:**
- `package.json` - Node.js package configuration with dependencies
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Template for environment variables
- `README.md` - Comprehensive documentation
- `LICENSE` - MIT License

### 📁 `/frontend` - Next.js Web Application

A modern, AI-powered DeFi assistant chatbot built with Next.js and the 1inch Agent Kit.

**Project Structure:**
```
frontend/
├── components/
│   ├── AgentChat.js          # Main chatbot component
│   ├── ChatBox.js            # Enhanced chat interface
│   ├── DashboardHeader.js    # Navigation header
│   └── HowItWorks.js         # Documentation component
├── pages/
│   ├── chat.js               # Chat page
│   ├── dashboard.js          # Dashboard page
│   ├── index.js              # Home page
│   └── api/
│       └── agent.js          # Unified API endpoint
├── styles/                   # CSS and styling files
├── public/                   # Static assets
└── .env                      # Environment variables
```

**Key Features:**
- 🤖 **AI-Powered Responses** - Powered by OpenAI GPT models
- 💰 **DeFi Integration** - Full integration with 1inch protocols
- 🔗 **Wallet Connection** - RainbowKit integration for wallet operations
- 📊 **Real-time Data** - Live DeFi data from multiple chains
- 🎨 **Modern UI** - Beautiful, responsive chat interface
- 📱 **Mobile Friendly** - Works perfectly on all devices

**Supported Operations:**
- Token Swaps - Get quotes and execute swaps across multiple chains
- Gas Prices - Check current gas prices on different networks
- Portfolio Analysis - View token balances and portfolio value
- Protocol Information - Explore DeFi protocols and liquidity sources
- Price Data - Get real-time token prices across chains
- Transaction History - View transaction history and traces

### 📁 `/AgentTesting` - Testing Environment

A dedicated testing environment for the agent kit functionality with a simple web interface.

**Key Files:**
- `index.html` - Main HTML file for the testing web interface
- `script.js` - Frontend JavaScript logic for testing the agent kit
- `api.js` - API integration and communication layer
- `package.json` - Dependencies for the testing environment

**Key Features:**
- Interactive testing interface
- API endpoint testing
- Real-time agent responses
- Development debugging tools

## 💡 Usage Examples

### Natural Language Queries

```typescript
// Get a quote
const response = await agent.chat('Get me a quote for swapping 1 ETH to USDC on Ethereum with 1% slippage');

// Execute a swap
const response = await agent.chat('Create a swap transaction for 0.1 ETH to USDC on Ethereum. My wallet is 0x1234...');

// Get gas prices
const response = await agent.chat('Get me the current gas prices for Ethereum mainnet');

// Complex queries
const response = await agent.chat(`
  Get me a quote for swapping 1000 USDC to ETH on Polygon with 0.5% slippage.
  Use complexity level 4 and split into 5 parts for better rates.
  Also show me the current gas prices and latest block number for both chains.
`);
```

### Direct Function Usage

```typescript
import { getQuote, swap, healthCheck, gasAPI, rpcAPI } from '1inch-agent-kit';

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

// Perform RPC call
const blockNumber = await rpcAPI({
  chainId: 1,
  method: 'eth_blockNumber'
});

// Check health
const health = await healthCheck({ chainId: 1 });
```

## 🛠️ Environment Variables

Create a `.env` file in your project root:

```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key
ONEINCH_API_KEY=your_1inch_api_key

# Optional: Advanced Configuration
OPENAI_MODEL=gpt-4o-mini
DEBUG=true

# Frontend specific (for /frontend directory)
ETHEREUM_RPC_URL=https://your-eth-rpc.com
POLYGON_RPC_URL=https://your-polygon-rpc.com
```

## 🚀 Getting Started

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/1inch-agent-kit.git
   cd 1inch-agent-kit
   ```

2. **Set up the Agent Kit:**
   ```bash
   cd agentkit
   npm install
   cp .env.example .env
   # Add your API keys to .env
   ```

3. **Set up the Frontend:**
   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # Add your API keys to .env.local
   npm run dev
   ```

4. **Set up Testing Environment:**
   ```bash
   cd ../AgentTesting
   npm install
   npm start
   ```

### Running the Applications

- **Agent Kit Development:** `cd agentkit && npm run dev`
- **Frontend Application:** `cd frontend && npm run dev` (Navigate to http://localhost:3000/chat)
- **Testing Interface:** `cd AgentTesting && npm start`

## 🧪 Testing

Run the examples to test the functionality:

```bash
# In /agentkit directory
npm run example:quote
npm run example:swap
npm run example:gas
npm run example:rpc
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

## 🔗 Dependencies

The toolkit relies on several key libraries:

- **Core Agent Kit:**
  - OpenAI GPT models for natural language processing
  - 1inch API for DeFi operations
  - TypeScript for type safety

- **Frontend Application:**
  - Next.js - React framework
  - RainbowKit - Wallet connections
  - Tailwind CSS - Styling
  - Styled-jsx - Component styling

- **Testing Environment:**
  - Vanilla JavaScript for simple testing interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

This toolkit handles transaction generation, signing, and sending using provided wallets. Always ensure you're using it in a secure environment and never share your private keys.

## 📚 Documentation

For detailed documentation, visit: [1inch Agent Kit Docs](https://1inch-agent-kit.gitbook.io/1inch-agent-kit-docs/)

## 💬 Support

- **GitHub Issues:** Submit bug reports and feature requests
- **Documentation:** Check our comprehensive docs for common questions
- **Discord Community:** Join our Discord for support and discussions

## 🙏 Acknowledgments

- Inspired by [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit)
- Built with [1inch API](https://docs.1inch.io/)
- Powered by [OpenAI GPT](https://openai.com/)
- 1inch team for their excellent APIs and protocols
- The broader DeFi community for inspiration and feedback

---

**Built with ❤️ by the 1inch Agent Kit team**
