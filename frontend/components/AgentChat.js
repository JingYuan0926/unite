import React, { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';

const AgentChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Use wagmi's useAccount hook to get wallet information
  const { address, isConnected: walletConnected, chainId } = useAccount();

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
    
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your 1inch DeFi assistant. I can help you with:\n\n• Getting token quotes and swaps\n• Checking gas prices and balances\n• Exploring DeFi protocols\n• Portfolio analysis\n• NFT and domain lookups\n• And much more!\n\n💡 Connect your wallet using the button in the header to access personalized features like balance checks and portfolio analysis.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/agent?path=health');
      const data = await response.json();
      setIsConnected(data.agentInitialized);
    } catch (error) {
      console.error('Failed to check connection:', error);
      setIsConnected(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare wallet data if connected
      const walletData = walletConnected && address ? {
        address: address,
        chainId: chainId || 1,
        walletType: 'rainbowkit'
      } : null;

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: inputMessage,
          wallet: walletData // Send wallet data with chat request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('API keys are invalid or missing. Please check your OpenAI and 1inch API keys in .env');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please check your API keys and try again.');
        } else {
          throw new Error(`Server error (${response.status}): ${data.error || 'Unknown error'}`);
        }
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.content || 'No response received',
        functionCalls: data.functionCalls || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `❌ Error: ${error.message}\n\n💡 Make sure you have:\n• Valid OpenAI API key in .env\n• Valid 1inch API key in .env\n• Restarted the development server after updating .env`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (type, content) => {
    const message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleExampleClick = (example) => {
    setInputMessage(example);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: 'Chat cleared! How can I help you with DeFi today?',
        timestamp: new Date()
      }
    ]);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderFunctionCalls = (functionCalls) => {
    if (!functionCalls || functionCalls.length === 0) return null;

    return (
      <div className="function-calls">
        <div className="function-calls-header">
          🔧 Function Calls ({functionCalls.length})
        </div>
        {functionCalls.map((call, index) => (
          <div key={index} className="function-call">
            <div className="function-name">{call.name}</div>
            <div className="function-params">
              <div className="params-label">Parameters:</div>
              <pre>{JSON.stringify(call.arguments, null, 2)}</pre>
            </div>
            {call.result && (
              <div className="function-result">
                <div className="result-label">Result:</div>
                <pre>{JSON.stringify(call.result, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const examples = [
    "Get a quote for swapping 1 ETH to USDC on Ethereum",
    "What's the current gas price on Ethereum?",
    "Show me my token balances on Ethereum",
    "Get the best swap route for 1000 USDC to ETH",
    "What are the top DeFi protocols on Polygon?",
    "Check the price of Bitcoin on different chains",
    "Show me my portfolio value across all chains",
    "Get liquidity sources for ETH/USDC pair"
  ];

  return (
    <div className="agent-chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="agent-info">
            <div className="agent-avatar">🤖</div>
            <div className="agent-details">
              <h1>AI Assistant</h1>
              <div className="connection-status">
                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              {walletConnected && address && (
                <div className="wallet-info">
                  <span className="wallet-address">
                    💼 {address.slice(0, 6)}...{address.slice(-4)} (Chain: {chainId})
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button onClick={clearChat} className="clear-button">
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div className="chat-body">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                {message.functionCalls && renderFunctionCalls(message.functionCalls)}
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="loading-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="examples-section">
          <h3>💡 Try these examples:</h3>
          <div className="examples-grid">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="example-button"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={walletConnected ? "Ask me about DeFi, your balances, or execute transactions..." : "Ask me about DeFi, swaps, gas prices, or anything else..."}
            disabled={isLoading || !isConnected}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim() || !isConnected}
            className="send-button"
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .agent-chat-container {
          max-width: 1200px;
          margin: 0 auto;
          height: calc(100vh - 80px); /* Account for header height */
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-top: 1rem;
          margin-bottom: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 12px 12px 0 0;
          padding: 1rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .agent-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .agent-avatar {
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .agent-details h1 {
          margin: 0;
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .wallet-info {
          margin-top: 0.25rem;
        }

        .wallet-address {
          color: #059669;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
        }

        .status-dot.connected {
          background: #10b981;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .clear-button {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .clear-button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .chat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-avatar {
          font-size: 1.5rem;
          background: #f1f5f9;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-content {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }

        .message.user .message-content {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .message-text {
          color: #1e293b;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message-timestamp {
          color: #64748b;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .function-calls {
          margin-top: 1rem;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }

        .function-calls-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f59e0b;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .function-call {
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .function-name {
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .function-params pre,
        .function-result pre {
          background: #1e293b;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          overflow-x: auto;
          color: #e2e8f0;
        }

        .params-label,
        .result-label {
          color: #059669;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
        }

        .typing-dots {
          display: flex;
          gap: 2px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #94a3b8;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .examples-section {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 12px 12px;
          padding: 1rem;
        }

        .examples-section h3 {
          color: #1e293b;
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.5rem;
        }

        .example-button {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          text-align: left;
        }

        .example-button:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .example-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-input-form {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 12px 12px;
          padding: 1rem;
        }

        .input-container {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #1e293b;
          font-size: 1rem;
        }

        .chat-input::placeholder {
          color: #94a3b8;
        }

        .chat-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          min-width: 50px;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .agent-chat-container {
            height: calc(100vh - 80px);
            margin: 0.5rem;
          }

          .message {
            max-width: 90%;
          }

          .examples-grid {
            grid-template-columns: 1fr;
          }

          .agent-details h1 {
            font-size: 1.2rem;
          }

          .header-actions {
            flex-direction: column;
            gap: 0.25rem;
          }

          .clear-button {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentChat; 