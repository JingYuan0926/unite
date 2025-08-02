# 1inch DeFi Assistant Chatbot

A modern, AI-powered DeFi assistant chatbot built with Next.js and the 1inch Agent Kit. This chatbot can help users with various DeFi operations including token swaps, gas prices, portfolio analysis, and more.

## Features

- 🤖 **AI-Powered Responses** - Powered by OpenAI GPT models
- 💰 **DeFi Integration** - Full integration with 1inch protocols
- 🔗 **Wallet Connection** - MetaMask integration for wallet operations
- 📊 **Real-time Data** - Live DeFi data from multiple chains
- 🎨 **Modern UI** - Beautiful, responsive chat interface
- 📱 **Mobile Friendly** - Works perfectly on all devices

## Supported Operations

- **Token Swaps** - Get quotes and execute swaps across multiple chains
- **Gas Prices** - Check current gas prices on different networks
- **Portfolio Analysis** - View token balances and portfolio value
- **Protocol Information** - Explore DeFi protocols and liquidity sources
- **NFT & Domain Lookups** - Search for NFTs and ENS domains
- **Price Data** - Get real-time token prices across chains
- **Transaction History** - View transaction history and traces

## Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key
- 1inch API key
- MetaMask (for wallet features)

## Setup

1. **Clone and Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Install 1inch Agent Kit**
   ```bash
   npm install 1inch-agent-kit
   ```

3. **Configure Environment Variables**
   
   Copy `.env.local.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ONEINCH_API_KEY=your_1inch_api_key_here
   ```

4. **Get API Keys**
   
   - **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **1inch API Key**: Get from [1inch Portal](https://portal.1inch.dev/)

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open Your Browser**
   
   Navigate to [http://localhost:3000/agent](http://localhost:3000/agent)

## Usage

### Basic Chat
1. Open the chatbot at `/agent`
2. Type your DeFi-related question
3. The AI will respond with helpful information and execute relevant functions

### Wallet Connection
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Your wallet address will be displayed
4. The chatbot can now access your wallet data for personalized responses

### Example Queries

- "Get a quote for swapping 1 ETH to USDC on Ethereum"
- "What's the current gas price on Polygon?"
- "Show me my token balances on Ethereum"
- "What are the top DeFi protocols on Arbitrum?"
- "Check the price of Bitcoin on different chains"
- "Get liquidity sources for ETH/USDC pair"

## API Endpoints

The chatbot uses a single unified API endpoint that handles all operations:

- `GET /api/agent` - Health check and agent status
- `POST /api/agent` - All operations (chat, wallet, direct function calls)

### API Usage Examples

**Health Check:**
```bash
GET /api/agent?path=health
```

**Chat Message:**
```bash
POST /api/agent
{
  "action": "chat",
  "message": "Get a quote for swapping 1 ETH to USDC",
  "wallet": { "address": "0x...", "chainId": 1 }
}
```

**Wallet Connection:**
```bash
POST /api/agent
{
  "action": "wallet",
  "wallet": { "address": "0x...", "chainId": 1, "walletType": "metamask" }
}
```

**Direct Function Call:**
```bash
POST /api/agent
{
  "action": "function",
  "functionCall": {
    "name": "gasAPI",
    "parameters": { "chain": 1 }
  }
}
```

## Project Structure

```
frontend/
├── components/
│   └── AgentChat.js          # Main chatbot component
├── pages/
│   ├── agent.js              # Chatbot page
│   └── api/
│       └── agent.js          # Unified API endpoint
├── .env.local                # Environment variables
└── README.md                 # This file
```

## Customization

### Adding New Features
1. Extend the 1inch Agent Kit with new functions
2. Update the chatbot UI to support new features
3. Add new API endpoints if needed

### Styling
The chatbot uses styled-jsx for styling. You can customize the appearance by modifying the styles in `components/AgentChat.js`.

### Environment Variables
You can add custom RPC URLs for different networks:
```env
ETHEREUM_RPC_URL=https://your-eth-rpc.com
POLYGON_RPC_URL=https://your-polygon-rpc.com
```

## Troubleshooting

### Common Issues

1. **"Agent not initialized"**
   - Check your API keys in `.env.local`
   - Ensure both OpenAI and 1inch API keys are valid

2. **"MetaMask not found"**
   - Install MetaMask browser extension
   - Make sure MetaMask is unlocked

3. **"Rate limit exceeded"**
   - Wait a few minutes before trying again
   - Check your API usage limits

4. **"Invalid API key"**
   - Verify your API keys are correct
   - Check if your API keys have sufficient credits

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [1inch Agent Kit documentation](https://github.com/your-repo/1inch-agent-kit)
- Open an issue on GitHub
- Join our Discord community

---

**Happy DeFi Trading! 🚀**
