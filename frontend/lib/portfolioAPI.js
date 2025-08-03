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
    console.log('📡 Calling Portfolio API with params:', params);
    
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
      })
    });

    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        console.error('❌ Backend API Error:', errorData);
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
    console.error('❌ Portfolio API call failed:', error);
    throw error;
  }
}

// Get portfolio value for multiple wallets and networks
export async function getPortfolioValue(walletAddresses, selectedNetworks) {
  try {
    console.log('🚀 Starting portfolio fetch for:', { walletAddresses, selectedNetworks });
    
    // Get the total portfolio value (single API call, no chain restrictions)
    const portfolioResponse = await callPortfolioAPI({
      endpoint: 'getCurrentPortfolioValue',
      addresses: walletAddresses,
      use_cache: true
    });
    
    console.log('📊 Portfolio API Response:', portfolioResponse);
    
    // Extract the total value safely
    let totalValue = 0;
    if (portfolioResponse && portfolioResponse.result && typeof portfolioResponse.result.total === 'number') {
      totalValue = portfolioResponse.result.total;
      console.log(`✅ Total portfolio value: $${totalValue}`);
    }
    
    // Create portfolio data for each selected network
    // For simplicity, show the total value divided by number of networks, or show full value for first network
    const portfolioData = {};
    
    selectedNetworks.forEach((networkName, index) => {
      const chainId = getChainId(networkName) || 0;
      
      // Show full portfolio value for the first network, 0 for others (to avoid duplication)
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
    console.error('❌ Error in getPortfolioValue:', error);
    
    // Return safe fallback data
    const portfolioData = {};
    selectedNetworks.forEach(networkName => {
      portfolioData[networkName] = {
        chainId: getChainId(networkName) || 0,
        totalValue: 0,
        byAddress: [],
        byCategory: [],
        byProtfolioGroup: [],
        error: error.message
      };
    });
    
    return portfolioData;
  }
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
    const response = await callPortfolioAPI({
      endpoint: 'checkPortfolioStatus'
    });
    
    return response.result?.is_available || false;
  } catch (error) {
    console.error('Error checking portfolio status:', error);
    
    // Fallback: try the direct portfolio API endpoint
    try {
      console.log('🔄 Trying fallback portfolio status check...');
      const fallbackResponse = await fetch('/api/portfolio/status');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return data.result?.is_available || false;
      }
    } catch (fallbackError) {
      console.error('Fallback portfolio status check failed:', fallbackError);
    }
    
    return false;
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