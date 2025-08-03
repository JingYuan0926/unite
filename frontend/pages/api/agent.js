import { OneInchAgentKit } from '1inch-agent-kit';

let agent = null;

// Initialize the agent on first request
const initializeAgent = () => {
  if (!agent) {
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
  }
  return agent;
};

export default function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Handle GET requests (health check, status, etc.)
const handleGet = (req, res) => {
  const { path } = req.query;
  
  if (path === 'health' || !path) {
    const agentInstance = initializeAgent();
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      agentInitialized: !!agentInstance,
      availableFunctions: [
        'gasAPI', 'rpcAPI', 'chartsAPI', 'tokenDetailsAPI', 'historyAPI',
        'tracesAPI', 'spotPriceAPI', 'fusionPlusAPI', 'orderbookAPI',
        'nftAPI', 'domainAPI', 'portfolioAPI', 'balanceAPI',
        'transactionAPI', 'swapAPI'
      ]
    });
  }
  
  return res.status(404).json({ error: 'Endpoint not found' });
};

// Handle POST requests (chat, wallet, direct function calls)
const handlePost = async (req, res) => {
  const { action, message, wallet, functionCall, ...params } = req.body;
  
  try {
    const agentInstance = initializeAgent();
    if (!agentInstance) {
      return res.status(500).json({ 
        error: 'Agent not initialized. Please check your API keys.' 
      });
    }

    // Handle different actions
    switch (action) {
      case 'chat':
        return await handleChat(req, res, agentInstance, message, wallet);
      
      case 'wallet':
        return await handleWallet(req, res, agentInstance, wallet);
      
      case 'signTypedData':
        return await handleSignTypedData(req, res, agentInstance, wallet);
      
      case 'submitSignedOrder':
        return await handleSubmitSignedOrder(req, res, agentInstance, wallet);
      
      case 'function':
        return await handleDirectFunction(req, res, agentInstance, functionCall, params);
      
      case 'health':
        return res.status(200).json({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          agentInitialized: true 
        });
      
      default:
        // Default to chat if no action specified
        return await handleChat(req, res, agentInstance, message, wallet);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return handleError(res, error);
  }
};

// Handle chat messages
const handleChat = async (req, res, agentInstance, message, wallet) => {
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Message is required and must be a string' 
    });
  }

  console.log('🤖 Processing chat message:', message);
  
  // Set wallet if provided
  if (wallet && agentInstance.setWallet) {
    agentInstance.setWallet(wallet);
    console.log('💼 Using wallet:', wallet.address);
  }

  try {
    const response = await agentInstance.chat(message);

    console.log('✅ Chat response received:', {
      contentLength: response.content?.length || 0,
      functionCalls: response.functionCalls?.length || 0
    });

    return res.status(200).json({
      action: 'chat',
      content: response.content,
      functionCalls: response.functionCalls || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Chat processing error:', error);
    return handleError(res, error);
  }
};

// Handle wallet connection
const handleWallet = async (req, res, agentInstance, wallet) => {
  if (!wallet || !wallet.address || !wallet.chainId) {
    return res.status(400).json({ 
      error: 'Wallet data is required (address, chainId)' 
    });
  }

  try {
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
      console.log('💼 Wallet set in agent:', wallet.address, 'on chain', wallet.chainId);
    }

    return res.status(200).json({ 
      action: 'wallet',
      success: true,
      message: 'Wallet connected successfully',
      wallet: {
        address: wallet.address,
        chainId: wallet.chainId,
        walletType: wallet.walletType || 'metamask'
      }
    });
  } catch (error) {
    console.error('❌ Wallet API Error:', error);
    return handleError(res, error);
  }
};

// Handle direct function calls (for testing specific functions)
const handleDirectFunction = async (req, res, agentInstance, functionCall, params) => {
  if (!functionCall || !functionCall.name) {
    return res.status(400).json({ 
      error: 'Function call data is required (name, parameters)' 
    });
  }

  try {
    console.log('🔧 Direct function call:', functionCall.name, functionCall.parameters);
    
    // Get the function from the agent's registry
    const functionHandler = agentInstance.registry.getFunction(functionCall.name);
    if (!functionHandler) {
      return res.status(404).json({ 
        error: `Function '${functionCall.name}' not found` 
      });
    }

    // Execute the function
    const result = await functionHandler(functionCall.parameters || {});

    return res.status(200).json({
      action: 'function',
      functionName: functionCall.name,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Direct function call error:', error);
    return handleError(res, error);
  }
};

// Handle EIP-712 typed data signing for frontend wallets
const handleSignTypedData = async (req, res, agentInstance, wallet) => {
  const { typedData, signature } = req.body;
  
  if (!typedData) {
    return res.status(400).json({ 
      error: 'Typed data is required for signing' 
    });
  }

  if (!wallet || !wallet.address) {
    return res.status(400).json({ 
      error: 'Wallet is required for signing' 
    });
  }

  try {
    console.log('🔐 Processing EIP-712 signature request for wallet:', wallet.address);
    
    // Set wallet in agent
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
    }

    // If signature is provided, return it (frontend already signed)
    if (signature) {
      console.log('✅ Signature provided by frontend:', signature.substring(0, 10) + '...');
      return res.status(200).json({
        action: 'signTypedData',
        success: true,
        signature: signature,
        timestamp: new Date().toISOString()
      });
    }

    // If no signature provided, return the typed data for frontend signing
    console.log('📝 Returning typed data for frontend signing');
    return res.status(200).json({
      action: 'signTypedData',
      success: false,
      requiresFrontendSigning: true,
      typedData: typedData,
      message: 'Please sign this typed data with your wallet and resubmit with signature',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Sign typed data error:', error);
    return handleError(res, error);
  }
};

// Handle signed order submission
const handleSubmitSignedOrder = async (req, res, agentInstance, wallet) => {
  const { signedOrder } = req.body;
  
  if (!signedOrder || !signedOrder.typedData || !signedOrder.signature || !signedOrder.orderInput) {
    return res.status(400).json({ 
      error: 'Signed order data is required (typedData, signature, orderInput)' 
    });
  }

  if (!wallet || !wallet.address) {
    return res.status(400).json({ 
      error: 'Wallet is required for order submission' 
    });
  }

  try {
    console.log('📝 Processing signed order submission for wallet:', wallet.address);
    
    // Set wallet in agent
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
    }

    // Call the fusionPlusAPI directly with the signed order
    const submitOrderArgs = {
      endpoint: "submitOrder",
      order: signedOrder.orderInput, // Use orderInput as the order parameter
      srcChainId: signedOrder.srcChainId || 42161, // Use the source chain from signedOrder
      signature: signedOrder.signature,
      extension: signedOrder.extension || "0x", // Get extension from signedOrder
      quoteId: signedOrder.quoteId || "",
      secretHashes: signedOrder.secretHashes || [] // Include secretHashes
    };

    // Import the fusionPlusAPI function directly
    const { fusionPlusAPI } = await import('1inch-agent-kit');
    
    // Execute the function
    const result = await fusionPlusAPI(submitOrderArgs);

    console.log('✅ Signed order submitted successfully');

    return res.status(200).json({
      action: 'submitSignedOrder',
      success: true,
      content: 'Order submitted successfully! Your cross-chain swap is now being processed.',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Signed order submission error:', error);
    return handleError(res, error);
  }
};

// Handle errors consistently
const handleError = (res, error) => {
  console.error('❌ Error details:', error);

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
  return res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}; 