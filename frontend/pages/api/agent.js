import { OneInchAgentKit } from '1inch-agent-kit';

let agent = null;

const initializeAgent = () => {
  if (!agent) {
    try {
      agent = new OneInchAgentKit({
        openaiApiKey: process.env.OPENAI_API_KEY,
        oneinchApiKey: process.env.ONEINCH_API_KEY,
        openaiModel: 'gpt-4o-mini',
      });
    } catch (error) {
      console.error('Agent initialization failed:', error.message);
    }
  }
  return agent;
};

const AVAILABLE_FUNCTIONS = [
  'gasAPI', 'rpcAPI', 'chartsAPI', 'tokenDetailsAPI', 'historyAPI',
  'tracesAPI', 'spotPriceAPI', 'fusionPlusAPI', 'orderbookAPI',
  'nftAPI', 'domainAPI', 'portfolioAPI', 'balanceAPI',
  'transactionAPI', 'swapAPI', 'tron', 'xrp'
];

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

const handleGet = (req, res) => {
  const { path } = req.query;
  
  if (path === 'health' || !path) {
    const agentInstance = initializeAgent();
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      agentInitialized: !!agentInstance,
      availableFunctions: AVAILABLE_FUNCTIONS
    });
  }
  
  return res.status(404).json({ error: 'Endpoint not found' });
};

const handlePost = async (req, res) => {
  const { action, message, wallet, functionCall, ...params } = req.body;
  
  try {
    const agentInstance = initializeAgent();
    if (!agentInstance) {
      return res.status(500).json({ 
        error: 'Agent not initialized' 
      });
    }

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
        return await handleChat(req, res, agentInstance, message, wallet);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return handleError(res, error);
  }
};

const handleChat = async (req, res, agentInstance, message, wallet) => {
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Message is required and must be a string' 
    });
  }
  
  if (wallet && agentInstance.setWallet) {
    agentInstance.setWallet(wallet);
  }

  try {
    const response = await agentInstance.chat(message);

    return res.status(200).json({
      action: 'chat',
      content: response.content,
      functionCalls: response.functionCalls || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    return handleError(res, error);
  }
};

const handleWallet = async (req, res, agentInstance, wallet) => {
  if (!wallet || !wallet.address || !wallet.chainId) {
    return res.status(400).json({ 
      error: 'Wallet data is required (address, chainId)' 
    });
  }

  try {
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
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
    console.error('Wallet API Error:', error);
    return handleError(res, error);
  }
};

const handleDirectFunction = async (req, res, agentInstance, functionCall, params) => {
  if (!functionCall || !functionCall.name) {
    return res.status(400).json({ 
      error: 'Function call data is required (name, parameters)' 
    });
  }

  try {
    const functionName = functionCall.name;
    
    if (!AVAILABLE_FUNCTIONS.includes(functionName)) {
      return res.status(404).json({ 
        error: `Function '${functionName}' not found. Available functions: ${AVAILABLE_FUNCTIONS.join(', ')}` 
      });
    }

    let result;
    
    try {
      const functionModule = await import('1inch-agent-kit');
      const targetFunction = functionModule[functionName];
      
      if (typeof targetFunction !== 'function') {
        throw new Error(`${functionName} is not a valid function`);
      }
      
      result = await targetFunction(functionCall.parameters || {});
    } catch (importError) {
      console.error(`Error with ${functionName}:`, importError);
      throw new Error(`${functionName} error: ${importError.message}`);
    }

    return res.status(200).json({
      action: 'function',
      functionName: functionCall.name,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Direct function call error:', error);
    return handleError(res, error);
  }
};

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
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
    }

    if (signature) {
      return res.status(200).json({
        action: 'signTypedData',
        success: true,
        signature: signature,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      action: 'signTypedData',
      success: false,
      requiresFrontendSigning: true,
      typedData: typedData,
      message: 'Please sign this typed data with your wallet and resubmit with signature',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sign typed data error:', error);
    return handleError(res, error);
  }
};

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
    if (agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
    }

    const submitOrderArgs = {
      endpoint: "submitOrder",
      order: signedOrder.orderInput,
      srcChainId: signedOrder.srcChainId || 42161,
      signature: signedOrder.signature,
      extension: signedOrder.extension || "0x",
      quoteId: signedOrder.quoteId || "",
      secretHashes: signedOrder.secretHashes || []
    };

    const { fusionPlusAPI } = await import('1inch-agent-kit');
    const result = await fusionPlusAPI(submitOrderArgs);

    return res.status(200).json({
      action: 'submitSignedOrder',
      success: true,
      content: 'Order submitted successfully! Your cross-chain swap is now being processed.',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Signed order submission error:', error);
    return handleError(res, error);
  }
};

const handleError = (res, error) => {
  console.error('Error details:', error);

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

  return res.status(500).json({ 
    error: 'An unexpected error occurred. Please try again.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}; 