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
      console.log('✅ 1inch Agent Kit initialized successfully for complex queries');
    } catch (error) {
      console.error('❌ Failed to initialize 1inch Agent Kit for complex queries:', error.message);
    }
  }
  return agent;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, wallet } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Initialize agent
    const agentInstance = initializeAgent();
    if (!agentInstance) {
      return res.status(500).json({ 
        error: 'Agent not initialized. Please check your API keys.' 
      });
    }

    // Set wallet if provided
    if (wallet && agentInstance.setWallet) {
      agentInstance.setWallet(wallet);
      console.log('💼 Using wallet for complex query:', wallet.address);
    }

    // Split the complex query into parts
    const queryParts = splitComplexQuery(query);
    
    // Process each part and chain the results
    const results = await processQueryParts(queryParts, wallet, agentInstance);

    return res.status(200).json({
      success: true,
      results,
      originalQuery: query,
      queryParts
    });

  } catch (error) {
    console.error('Complex query error:', error);
    return res.status(500).json({ 
      error: 'Failed to process complex query',
      details: error.message 
    });
  }
}

// Function to split complex queries into parts
function splitComplexQuery(query) {
  // Split by common delimiters and patterns
  const delimiters = [
    /\.\s+/g,           // Period followed by space
    /,\s+/g,            // Comma followed by space
    /;\s+/g,            // Semicolon followed by space
    /\s+and\s+/gi,      // "and" with spaces
    /\s+then\s+/gi,     // "then" with spaces
    /\s+also\s+/gi,     // "also" with spaces
  ];

  let parts = [query];
  
  // Apply each delimiter to split the query
  delimiters.forEach(delimiter => {
    parts = parts.flatMap(part => 
      part.split(delimiter).filter(p => p.trim().length > 0)
    );
  });

  // Clean up and filter parts
  parts = parts
    .map(part => part.trim())
    .filter(part => part.length > 10) // Filter out very short parts
    .map((part, index) => ({
      id: `p${index + 1}`,
      query: part,
      dependencies: [],
      results: null
    }));

  return parts;
}

// Function to determine which agent function to call for each part
async function determineAgentFunction(queryPart) {
  const query = queryPart.toLowerCase();
  
  // Define function mappings based on keywords
  const functionMappings = [
    {
      keywords: ['wallet', 'overview', 'balance', 'assets'],
      function: 'getWalletOverview',
      description: 'Get wallet overview and balances'
    },
    {
      keywords: ['top', 'assets', 'tokens', 'value', 'worth'],
      function: 'getTopAssets',
      description: 'Get top assets by value'
    },
    {
      keywords: ['price', 'chart', 'historical', 'price chart'],
      function: 'getPriceChart',
      description: 'Get historical price data'
    },
    {
      keywords: ['transaction', 'tx', 'history', 'last'],
      function: 'getTransactionHistory',
      description: 'Get transaction history'
    },
    {
      keywords: ['gas', 'fee', 'estimate', 'gas fee'],
      function: 'getGasEstimate',
      description: 'Get gas fee estimates'
    },
    {
      keywords: ['quote', 'swap', 'exchange'],
      function: 'getQuote',
      description: 'Get swap quotes'
    },
    {
      keywords: ['protocol', 'defi', 'yield'],
      function: 'getProtocolInfo',
      description: 'Get DeFi protocol information'
    }
  ];

  // Find the best matching function
  let bestMatch = null;
  let maxScore = 0;

  functionMappings.forEach(mapping => {
    const score = mapping.keywords.reduce((total, keyword) => {
      return total + (query.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = mapping;
    }
  });

  return bestMatch || {
    function: 'chat',
    description: 'General chat response'
  };
}

// Function to extract parameters from query parts
function extractParameters(queryPart, previousResults, wallet) {
  const query = queryPart.toLowerCase();
  const params = {};

  // Extract chain information
  const chainPatterns = [
    { pattern: /arbitrum/i, chainId: 42161 },
    { pattern: /ethereum/i, chainId: 1 },
    { pattern: /polygon/i, chainId: 137 },
    { pattern: /bsc/i, chainId: 56 },
    { pattern: /optimism/i, chainId: 10 },
    { pattern: /avalanche/i, chainId: 43114 }
  ];

  // First check if chain is specified in the query
  chainPatterns.forEach(({ pattern, chainId }) => {
    if (pattern.test(query)) {
      params.chainId = chainId;
    }
  });

  // If no chain specified in query, use wallet's chain ID
  if (!params.chainId && wallet?.chainId) {
    params.chainId = wallet.chainId;
  }

  // Extract numeric values
  const numberMatch = query.match(/(\d+)/);
  if (numberMatch) {
    params.limit = parseInt(numberMatch[1]);
  }

  // Extract token addresses from previous results
  if (previousResults) {
    const tokenResults = previousResults.filter(r => 
      r.function === 'getTopAssets' && r.results?.tokens
    );
    
    if (tokenResults.length > 0) {
      const tokens = tokenResults[0].results.tokens;
      params.tokenAddresses = tokens.map(t => t.address);
    }
  }

  return params;
}

// Function to process query parts sequentially
async function processQueryParts(queryParts, wallet, agentInstance) {
  const results = [];
  const context = {};

  for (let i = 0; i < queryParts.length; i++) {
    const part = queryParts[i];
    
    try {
      // Determine which function to call
      const functionInfo = await determineAgentFunction(part.query);
      
      // Extract parameters
      const params = extractParameters(part.query, results, wallet);
      
      // Set chain ID for the agent if specified
      if (params.chainId && agentInstance.setChainId) {
        agentInstance.setChainId(params.chainId);
      }

      // Call the appropriate agent function
      let result;
      switch (functionInfo.function) {
        case 'getWalletOverview':
          result = await getWalletOverview(wallet, params, agentInstance);
          break;
        case 'getTopAssets':
          result = await getTopAssets(wallet, params, agentInstance);
          break;
        case 'getPriceChart':
          result = await getPriceChart(params, agentInstance);
          break;
        case 'getTransactionHistory':
          result = await getTransactionHistory(wallet, params, agentInstance);
          break;
        case 'getGasEstimate':
          result = await getGasEstimate(params, agentInstance);
          break;
        case 'getQuote':
          result = await getQuote(params, agentInstance);
          break;
        case 'getProtocolInfo':
          result = await getProtocolInfo(params, agentInstance);
          break;
        default:
          result = await agentInstance.chat(part.query);
      }

      // Store the result
      const partResult = {
        id: part.id,
        query: part.query,
        function: functionInfo.function,
        description: functionInfo.description,
        parameters: params,
        results: result,
        timestamp: new Date().toISOString()
      };

      results.push(partResult);
      
      // Update context for next iterations
      context[part.id] = partResult;

    } catch (error) {
      console.error(`Error processing part ${part.id}:`, error);
      results.push({
        id: part.id,
        query: part.query,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

// Individual agent function implementations
async function getWalletOverview(wallet, params, agentInstance) {
  if (!wallet?.address) {
    throw new Error('Wallet address required for wallet overview');
  }

  try {
    // Use the agent's chat function to get wallet overview
    const response = await agentInstance.chat(`Get a complete overview of my wallet ${wallet.address} on chain ${params.chainId}. Show me my balances, portfolio value, and token count.`);
    
    return {
      chainId: params.chainId,
      address: wallet.address,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get wallet overview: ${error.message}`);
  }
}

async function getTopAssets(wallet, params, agentInstance) {
  if (!wallet?.address) {
    throw new Error('Wallet address required for top assets');
  }

  const limit = params.limit || 2;
  
  try {
    // Use the agent's chat function to get top assets
    const response = await agentInstance.chat(`Get my top ${limit} assets by value from wallet ${wallet.address} on chain ${params.chainId}. Return the token addresses, symbols, names, balances, values, and prices.`);
    
    return {
      chainId: params.chainId,
      limit,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get top assets: ${error.message}`);
  }
}

async function getPriceChart(params, agentInstance) {
  const tokenAddresses = params.tokenAddresses;
  
  if (!tokenAddresses || tokenAddresses.length === 0) {
    throw new Error('Token addresses required for price chart');
  }

  try {
    // Use the agent's chat function to get price charts
    const tokenList = tokenAddresses.join(', ');
    const response = await agentInstance.chat(`Get historical price charts for the following tokens: ${tokenList} on chain ${params.chainId}. Show me the price data for the last 30 days.`);
    
    return {
      chainId: params.chainId,
      tokenAddresses,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get price charts: ${error.message}`);
  }
}

async function getTransactionHistory(wallet, params, agentInstance) {
  if (!wallet?.address) {
    throw new Error('Wallet address required for transaction history');
  }

  const limit = params.limit || 5;
  
  try {
    // Use the agent's chat function to get transaction history
    const response = await agentInstance.chat(`Get the last ${limit} transactions for wallet ${wallet.address} on chain ${params.chainId}. Show me transaction hashes, types, and details.`);
    
    return {
      chainId: params.chainId,
      address: wallet.address,
      limit,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }
}

async function getGasEstimate(params, agentInstance) {
  try {
    // Use the agent's chat function to get gas estimates
    const response = await agentInstance.chat(`Get current gas fee estimates for chain ${params.chainId}. Show me slow, standard, fast, and instant gas prices.`);
    
    return {
      chainId: params.chainId,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get gas estimates: ${error.message}`);
  }
}

async function getQuote(params, agentInstance) {
  try {
    // Use the agent's chat function to get quotes
    const response = await agentInstance.chat(`Get a swap quote for the specified parameters on chain ${params.chainId}.`);
    
    return {
      chainId: params.chainId,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get quote: ${error.message}`);
  }
}

async function getProtocolInfo(params, agentInstance) {
  try {
    // Use the agent's chat function to get protocol information
    const response = await agentInstance.chat(`Get information about DeFi protocols on chain ${params.chainId}. Show me the top protocols, their features, and TVL.`);
    
    return {
      chainId: params.chainId,
      response: response.content,
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    throw new Error(`Failed to get protocol info: ${error.message}`);
  }
} 