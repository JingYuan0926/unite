# 🚀 Quick Setup Guide

## Step 1: Get Your API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 1inch API Key
1. Go to [1inch Portal](https://portal.1inch.dev/)
2. Sign in or create an account
3. Create a new project
4. Copy your API key

## Step 2: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual API keys:

```env
# Replace with your actual OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Replace with your actual 1inch API key
ONEINCH_API_KEY=your-actual-1inch-api-key-here
```

## Step 3: Restart the Development Server

After updating `.env.local`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 4: Test the Chatbot

1. Open [http://localhost:3000/agent](http://localhost:3000/agent)
2. Try asking: "What's the current gas price on Ethereum?"
3. The chatbot should respond with real data!

## Troubleshooting

### "API keys are invalid or missing"
- ✅ Check that your API keys are correct
- ✅ Make sure you restarted the server after updating `.env.local`
- ✅ Verify the keys are not expired

### "Rate limit exceeded"
- ⏳ Wait a few minutes and try again
- 💳 Check your OpenAI account credits

### "Agent not initialized"
- 🔑 Verify both API keys are set
- 🔄 Restart the development server

## Example API Keys Format

```env
# OpenAI API Key (starts with sk-)
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# 1inch API Key (alphanumeric)
ONEINCH_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

**Need help?** Check the main README.md for more detailed instructions. 