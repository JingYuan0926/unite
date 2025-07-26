// Chat functionality
let isLoading = false;

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// API configuration
const API_BASE_URL = 'http://localhost:3001';

// Event listeners
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
});

// Handle form submission
async function handleSubmit() {
  const message = messageInput.value.trim();
  if (!message || isLoading) return;

  // Add user message to chat
  addMessage(message, 'user');
  messageInput.value = '';
  
  // Show loading state
  setLoading(true);
  
  try {
    // Send message to API
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (response.ok) {
      // Add AI response to chat
      addMessage(data.content, 'ai', data.functionCalls);
    } else {
      // Add error message
      addMessage(`Error: ${data.error || 'Something went wrong'}`, 'error');
    }
  } catch (error) {
    console.error('Network error:', error);
    addMessage(`Network Error: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

// Add message to chat
function addMessage(text, sender, functionCalls = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = text;
  
  messageDiv.appendChild(contentDiv);
  
  // Add function calls if available
  if (functionCalls && functionCalls.length > 0) {
    const functionCallsDiv = document.createElement('div');
    functionCallsDiv.className = 'function-calls';
    
    const title = document.createElement('h4');
    title.textContent = `Functions Called (${functionCalls.length})`;
    functionCallsDiv.appendChild(title);
    
    functionCalls.forEach((call, index) => {
      const callDiv = document.createElement('div');
      callDiv.className = 'function-call';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'function-name';
      nameSpan.textContent = call.name;
      callDiv.appendChild(nameSpan);
      
      if (call.result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'function-result';
        resultDiv.textContent = typeof call.result === 'object' 
          ? JSON.stringify(call.result, null, 2)
          : String(call.result);
        callDiv.appendChild(resultDiv);
      }
      
      functionCallsDiv.appendChild(callDiv);
    });
    
    messageDiv.appendChild(functionCallsDiv);
  }
  
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Set loading state
function setLoading(loading) {
  isLoading = loading;
  sendButton.disabled = loading;
  
  if (loading) {
    sendButton.innerHTML = '<div class="loading"></div>Processing...';
  } else {
    sendButton.textContent = 'Send';
  }
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear chat
function clearChat() {
  chatMessages.innerHTML = `
    <div class="message ai-message">
      Hello! I'm your 1inch AI assistant. I can help you with:
      <ul>
        <li>Getting quotes and swaps</li>
        <li>Checking gas prices</li>
        <li>Making RPC calls</li>
        <li>Getting chart data</li>
        <li>Token details and prices</li>
        <li>Transaction traces</li>
      </ul>
      Try asking me something or use the example buttons below!
    </div>
  `;
}

// Send example message
function sendExample(message) {
  messageInput.value = message;
  handleSubmit();
}

// Check API health on page load
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.agentInitialized) {
      console.log('✅ API is healthy and agent is initialized');
    } else {
      console.warn('⚠️ API is running but agent is not initialized');
    }
  } catch (error) {
    console.error('❌ API health check failed:', error);
    addMessage('Warning: API server is not running. Please start the server first.', 'error');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
}); 