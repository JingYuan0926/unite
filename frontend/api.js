const express = require('express');
const cors = require('cors');
const path = require('path');
const { OneInchAgentKit } = require('1inch-agent-kit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Initialize the 1inch Agent Kit
let agent;

try {
  agent = new OneInchAgentKit({
    openaiApiKey: process.env.OPENAI_API_KEY,
    oneinchApiKey: process.env.ONEINCH_API_KEY,
    openaiModel: 'gpt-4o-mini',
  });
  console.log('✅ 1inch Agent Kit initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize 1inch Agent Kit:', error.message);
}

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    agentInitialized: !!agent 
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Check if agent is initialized
    if (!agent) {
      return res.status(500).json({ 
        error: 'Agent not initialized. Please check your API keys.' 
      });
    }

    console.log('🤖 Processing message:', message);

    // Send message to the agent
    const response = await agent.chat(message);

    console.log('✅ Response received:', {
      contentLength: response.content?.length || 0,
      functionCalls: response.functionCalls?.length || 0
    });

    // Return the response
    res.json({
      content: response.content,
      functionCalls: response.functionCalls || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);

    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI or 1inch API keys.' 
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Please try again later.' 
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
}); 