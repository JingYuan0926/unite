import chainData from '../data/chains.json';

// Create a mapping from network names to chain IDs
const networkToChainId = chainData.networks.reduce((acc, network) => {
  acc[network.name] = network.chainId;
  return acc;
}, {});

// Create a mapping from chain IDs to network names
const chainIdToNetwork = chainData.networks.reduce((acc, network) => {
  acc[network.chainId] = network.name;
  return acc;
}, {});

// Validate wallet address format
export function validateWalletAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get chain ID from network name
function getChainId(networkName) {
  return networkToChainId[networkName];
}

// Get network name from chain ID
function getNetworkName(chainId) {
  return chainIdToNetwork[chainId];
}

// Call the portfolio API through the backend
async function callPortfolioAPI(params) {
  try {
    console.log('📊 Calling Portfolio API with params:', params);
    
    // Add a shorter timeout for frontend requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'function',
        functionCall: {
          name: 'portfolioAPI',
          parameters: params
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        console.error('❌ Backend Portfolio API Error:', errorData);
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Portfolio API Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.result;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Portfolio API request timed out');
      throw new Error('Portfolio API request timed out. Please try again.');
    }
    console.error('❌ Portfolio API call failed:', error);
    throw error;
  }
}

// Get portfolio value for multiple wallets and networks
export async function getPortfolioValue(walletAddresses, selectedNetworks) {
  const maxRetries = 2;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Starting portfolio fetch (attempt ${attempt}/${maxRetries}) for:`, { walletAddresses, selectedNetworks });
      
      const portfolioResponse = await callPortfolioAPI({
        endpoint: 'getCurrentPortfolioValue',
        addresses: walletAddresses,
        use_cache: true
      });
      
      console.log('📊 Portfolio API Response:', portfolioResponse);
      
      let totalValue = 0;
      if (portfolioResponse && portfolioResponse.result && typeof portfolioResponse.result.total === 'number') {
        totalValue = portfolioResponse.result.total;
        console.log(`✅ Total portfolio value: $${totalValue}`);
      }
      
      const portfolioData = {};
      
      selectedNetworks.forEach((networkName, index) => {
        const chainId = getChainId(networkName) || 0;
        
        const networkValue = index === 0 ? totalValue : 0;
        
        portfolioData[networkName] = {
          chainId,
          totalValue: networkValue,
          byAddress: portfolioResponse?.result?.by_address || [],
          byCategory: portfolioResponse?.result?.by_category || [],
          byProtocolGroup: portfolioResponse?.result?.by_protocol_group || []
        };
        
        console.log(`📋 ${networkName}: $${networkValue}`);
      });
      
      console.log('✅ Final portfolio data:', portfolioData);
      return portfolioData;
      
    } catch (error) {
      console.error(`❌ Portfolio fetch attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s delay
        console.log(`⏱️ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error('❌ All portfolio fetch attempts failed:', lastError);
  
  const portfolioData = {};
  selectedNetworks.forEach(networkName => {
    portfolioData[networkName] = {
      chainId: getChainId(networkName) || 0,
      totalValue: 0,
      byAddress: [],
      byCategory: [],
      byProtocolGroup: [],
      error: lastError?.message || 'Portfolio API unavailable'
    };
  });
  
  return portfolioData;
}

// Get portfolio value chart data
export async function getPortfolioChart(walletAddresses, selectedNetworks, timerange = '1year') {
  try {
    const chartData = {};
    
    for (const networkName of selectedNetworks) {
      const chainId = getChainId(networkName);
      
      if (!chainId) {
        console.warn(`Unknown network: ${networkName}`);
        continue;
      }

      try {
        const response = await callPortfolioAPI({
          endpoint: 'getGeneralValueChart',
          addresses: walletAddresses,
          chain_id: chainId,
          timerange,
          use_cache: true
        });

        chartData[networkName] = {
          chainId,
          data: response.result || []
        };
      } catch (error) {
        console.error(`Error fetching chart for ${networkName}:`, error);
        chartData[networkName] = {
          chainId,
          data: [],
          error: error.message
        };
      }
    }

    return chartData;
  } catch (error) {
    console.error('Error in getPortfolioChart:', error);
    throw error;
  }
}

// Get tokens snapshot
export async function getTokensSnapshot(walletAddresses, selectedNetworks) {
  try {
    const tokensData = {};
    
    for (const networkName of selectedNetworks) {
      const chainId = getChainId(networkName);
      
      if (!chainId) {
        console.warn(`Unknown network: ${networkName}`);
        continue;
      }

      try {
        const response = await callPortfolioAPI({
          endpoint: 'getTokensSnapshot',
          addresses: walletAddresses,
          chain_id: chainId
        });

        tokensData[networkName] = {
          chainId,
          tokens: response || []
        };
      } catch (error) {
        console.error(`Error fetching tokens for ${networkName}:`, error);
        tokensData[networkName] = {
          chainId,
          tokens: [],
          error: error.message
        };
      }
    }

    return tokensData;
  } catch (error) {
    console.error('Error in getTokensSnapshot:', error);
    throw error;
  }
}

// Get protocols snapshot
export async function getProtocolsSnapshot(walletAddresses, selectedNetworks) {
  try {
    const protocolsData = {};
    
    for (const networkName of selectedNetworks) {
      const chainId = getChainId(networkName);
      
      if (!chainId) {
        console.warn(`Unknown network: ${networkName}`);
        continue;
      }

      try {
        const response = await callPortfolioAPI({
          endpoint: 'getProtocolsSnapshot',
          addresses: walletAddresses,
          chain_id: chainId
        });

        protocolsData[networkName] = {
          chainId,
          protocols: response.result || []
        };
      } catch (error) {
        console.error(`Error fetching protocols for ${networkName}:`, error);
        protocolsData[networkName] = {
          chainId,
          protocols: [],
          error: error.message
        };
      }
    }

    return protocolsData;
  } catch (error) {
    console.error('Error in getProtocolsSnapshot:', error);
    throw error;
  }
}

// Check if portfolio service is available
export async function checkPortfolioStatus() {
  try {
    console.log('🔍 Checking portfolio service status...');
    
    // Try the direct status endpoint first (faster and more reliable)
    try {
      const response = await fetch('/api/portfolio/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout for status check
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Portfolio status via direct endpoint:', data);
        return data.available !== false; // Default to true if not explicitly false
      }
    } catch (directError) {
      console.warn('⚠️ Direct status endpoint failed:', directError.message);
    }
    
    // Fallback: try a quick portfolio API call with short timeout
    try {
      const response = await callPortfolioAPI({
        endpoint: 'checkPortfolioStatus'
      });
      
      console.log('✅ Portfolio status via API:', response);
      return response.result?.is_available !== false;
    } catch (apiError) {
      console.warn('⚠️ Portfolio API status check failed:', apiError.message);
    }
    
    // If both fail, return true to allow the app to continue
    // Individual portfolio calls will handle their own errors
    console.log('⚠️ Portfolio status unknown, assuming available');
    return true;
    
  } catch (error) {
    console.error('❌ Portfolio status check failed:', error);
    // Return true to allow the app to continue functioning
    return true;
  }
}

// Get supported chains from the API
export async function getSupportedChains() {
  try {
    const response = await callPortfolioAPI({
      endpoint: 'getSupportedChains'
    });
    
    return response || [];
  } catch (error) {
    console.error('Error getting supported chains:', error);
    return [];
  }
}

// Helper function to get chain ID from network name (for backwards compatibility)
export function getChainIdFromNetworkName(networkName) {
  return getChainId(networkName);
} 