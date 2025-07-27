// Chat functionality
let isLoading = false;

// Wallet state
let walletConnected = false;
let walletAddress = null;
let walletChainId = null;
let walletBalance = null;

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Wallet DOM elements
const walletStatus = document.getElementById('walletStatus');
const walletStatusText = document.getElementById('walletStatusText');
const walletButton = document.getElementById('walletButton');
const walletInfo = document.getElementById('walletInfo');
const walletAddressSpan = document.getElementById('walletAddress');
const walletNetworkSpan = document.getElementById('walletNetwork');
const walletBalanceSpan = document.getElementById('walletBalance');

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
    // Prepare request body with wallet info if connected
    const requestBody = { message };
    if (walletConnected && walletAddress) {
      requestBody.wallet = {
        address: walletAddress,
        chainId: walletChainId,
        balance: walletBalance,
        walletType: 'metamask'
      };
    }

    // Send message to API
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
        <li>Real-time spot prices</li>
        <li><strong>Token balances (connect wallet above!)</strong></li>
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

// Wallet functionality
async function toggleWallet() {
  if (walletConnected) {
    disconnectWallet();
  } else {
    await connectWallet();
  }
}

async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed! Please install MetaMask to connect your wallet.');
      return;
    }

    walletButton.disabled = true;
    walletButton.textContent = 'Connecting...';

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Get wallet info
    walletAddress = accounts[0];
    walletChainId = parseInt(await window.ethereum.request({
      method: 'eth_chainId'
    }), 16);

    // Get balance
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletAddress, 'latest']
    });
    walletBalance = (parseInt(balanceWei, 16) / 1e18).toFixed(4);

    // Update UI
    updateWalletUI();
    
    // Send wallet info to backend
    await sendWalletToBackend();

    console.log('✅ Wallet connected:', {
      address: walletAddress,
      chainId: walletChainId,
      balance: walletBalance
    });

  } catch (error) {
    console.error('❌ Failed to connect wallet:', error);
    alert(`Failed to connect wallet: ${error.message}`);
    
    walletButton.disabled = false;
    walletButton.textContent = 'Connect MetaMask';
  }
}

function disconnectWallet() {
  walletConnected = false;
  walletAddress = null;
  walletChainId = null;
  walletBalance = null;
  
  updateWalletUI();
  console.log('🔌 Wallet disconnected');
}

function updateWalletUI() {
  if (walletAddress) {
    walletConnected = true;
    
    // Update status
    walletStatus.classList.add('connected');
    walletStatusText.textContent = 'Connected';
    
    // Update button
    walletButton.textContent = 'Disconnect';
    walletButton.disabled = false;
    
    // Show wallet info
    walletInfo.style.display = 'block';
    walletAddressSpan.textContent = formatAddress(walletAddress);
    walletNetworkSpan.textContent = getNetworkName(walletChainId);
    walletBalanceSpan.textContent = `${walletBalance} ETH`;
    
    // Enable balance examples
    document.getElementById('balanceExample').disabled = false;
    document.getElementById('specificBalanceExample').disabled = false;
    
  } else {
    walletConnected = false;
    
    // Update status
    walletStatus.classList.remove('connected');
    walletStatusText.textContent = 'Not Connected';
    
    // Update button
    walletButton.textContent = 'Connect MetaMask';
    walletButton.disabled = false;
    
    // Hide wallet info
    walletInfo.style.display = 'none';
    
    // Disable balance examples
    document.getElementById('balanceExample').disabled = true;
    document.getElementById('specificBalanceExample').disabled = true;
  }
}

async function sendWalletToBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: walletAddress,
        chainId: walletChainId,
        balance: walletBalance,
        walletType: 'metamask'
      }),
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to send wallet info to backend');
    } else {
      console.log('✅ Wallet info sent to backend successfully');
    }
  } catch (error) {
    console.warn('⚠️ Could not send wallet info to backend:', error);
  }
}

function formatAddress(address) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getNetworkName(chainId) {
  const networks = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    42161: 'Arbitrum One',
    10: 'Optimism',
    56: 'BNB Chain',
    43114: 'Avalanche',
    8453: 'Base',
    324: 'zkSync Era'
  };
  return networks[chainId] || `Chain ${chainId}`;
}

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== walletAddress) {
      // Account changed, reconnect
      connectWallet();
    }
  });

  window.ethereum.on('chainChanged', (chainId) => {
    // Chain changed, update wallet info
    if (walletConnected) {
      connectWallet();
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  updateWalletUI(); // Initialize wallet UI
});