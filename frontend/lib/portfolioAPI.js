// Portfolio API utility functions for frontend
// Using Next.js API routes to avoid CORS issues

// Helper function to make API calls to our Next.js API routes
async function makeAPICall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`/api/portfolio${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Portfolio API call failed:', error);
    throw error;
  }
}

// Portfolio API functions
export const portfolioAPI = {
  // Check if portfolio service is available
  async checkStatus() {
    return await makeAPICall('/status');
  },

  // Get supported chains
  async getSupportedChains() {
    return await makeAPICall('/supported-chains');
  },

  // Get supported protocols
  async getSupportedProtocols() {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getSupportedProtocols not yet implemented');
  },

  // Check addresses compliance
  async checkAddressesCompliance(addresses, chainId, useCache) {
    return await makeAPICall('/address-check', 'POST', {
      addresses,
      chain_id: chainId,
      use_cache: useCache
    });
  },

  // Get current portfolio value
  async getCurrentPortfolioValue(addresses, chainId, useCache) {
    return await makeAPICall('/current-value', 'POST', {
      addresses,
      chain_id: chainId,
      use_cache: useCache
    });
  },

  // Get portfolio value chart
  async getValueChart(addresses, chainId, timerange, useCache) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getValueChart not yet implemented');
  },

  // Get overview report
  async getOverviewReport(addresses, chainId) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getOverviewReport not yet implemented');
  },

  // Get protocols snapshot
  async getProtocolsSnapshot(addresses, chainId, timestamp) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getProtocolsSnapshot not yet implemented');
  },

  // Get protocols metrics
  async getProtocolsMetrics(addresses, chainId, protocolGroupId, contractAddress, tokenId, useCache) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getProtocolsMetrics not yet implemented');
  },

  // Get tokens snapshot
  async getTokensSnapshot(addresses, chainId, timestamp) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getTokensSnapshot not yet implemented');
  },

  // Get tokens metrics
  async getTokensMetrics(addresses, chainId, timerange, useCache) {
    // Note: This endpoint would need to be implemented in the API routes
    throw new Error('getTokensMetrics not yet implemented');
  }
};

// Helper function to validate wallet addresses
export function validateWalletAddress(address) {
  // Basic Ethereum address validation
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

// Helper function to get chain ID from network name
export function getChainIdFromNetworkName(networkName) {
  const chainMap = {
    'Ethereum': 1,
    'Polygon': 137,
    'BNB Chain': 56,
    'Arbitrum One': 42161,
    'Optimism': 10,
    'Avalanche C-Chain': 43114,
    'Base': 8453,
    'Polygon zkEVM': 1101,
    'zkSync Era': 324,
    'Gnosis': 100
  };
  return chainMap[networkName] || null;
}

// Helper function to test portfolio configuration
export async function testPortfolioConfiguration(config) {
  try {
    const { trackedWallets, includeCurrentWallet, selectedNetworks } = config;
    
    // Get all addresses to test
    const addresses = [...trackedWallets];
    if (includeCurrentWallet) {
      // Note: In a real implementation, you'd get the current wallet address
      // For now, we'll just add a placeholder
      addresses.push('0x0000000000000000000000000000000000000000');
    }

    if (addresses.length === 0) {
      throw new Error('No wallet addresses provided');
    }

    // Test with the first network
    const firstNetwork = selectedNetworks[0];
    const chainId = getChainIdFromNetworkName(firstNetwork);

    // Test portfolio status
    const status = await portfolioAPI.checkStatus();
    if (!status.result?.is_available) {
      throw new Error('Portfolio service is not available');
    }

    // Test address compliance
    const compliance = await portfolioAPI.checkAddressesCompliance(addresses, chainId, true);
    
    // Test current portfolio value
    const portfolioValue = await portfolioAPI.getCurrentPortfolioValue(addresses, chainId, true);

    return {
      success: true,
      status: status.result,
      compliance: compliance.result,
      portfolioValue: portfolioValue.result,
      message: 'Portfolio configuration test successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Portfolio configuration test failed'
    };
  }
} 