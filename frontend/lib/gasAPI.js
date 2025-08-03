import chainData from '../data/chains.json';

// Create a mapping from network names to chain IDs
const networkToChainId = chainData.networks.reduce((acc, network) => {
  acc[network.name] = network.chainId;
  return acc;
}, {});

// Get chain ID from network name
function getChainId(networkName) {
  return networkToChainId[networkName];
}

// Call the gas API through the backend
async function callGasAPI(params) {
  try {
    console.log('⛽ Calling Gas API with params:', params);
    
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'function',
        functionCall: {
          name: 'gasAPI',
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
        console.error('❌ Backend Gas API Error:', errorData);
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Gas API Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.result;
  } catch (error) {
    console.error('❌ Gas API call failed:', error);
    throw error;
  }
}

// Convert Wei to Gwei (divide by 1e9)
function weiToGwei(wei) {
  if (!wei || typeof wei !== 'string') return 0;
  try {
    return parseFloat(wei) / 1e9;
  } catch (error) {
    console.error('Error converting Wei to Gwei:', error);
    return 0;
  }
}

// Get gas prices for multiple networks
export async function getGasPrices(selectedNetworks) {
  try {
    console.log('🚀 Starting gas price fetch for networks:', selectedNetworks);
    const gasData = {};
    
    // Process each network separately to get chain-specific gas data
    for (const networkName of selectedNetworks) {
      const chainId = getChainId(networkName);
      
      if (!chainId) {
        console.warn(`❌ Unknown network: ${networkName}`);
        continue;
      }

      try {
        console.log(`⛽ Fetching gas prices for ${networkName} (chain ${chainId})...`);
        const response = await callGasAPI({
          chain: chainId
        });

        // Extract gas prices and convert from Wei to Gwei
        const gasInfo = {
          chainId,
          network: networkName,
          baseFee: weiToGwei(response.baseFee),
          low: weiToGwei(response.low?.maxFeePerGas),
          medium: weiToGwei(response.medium?.maxFeePerGas),
          high: weiToGwei(response.high?.maxFeePerGas),
          instant: weiToGwei(response.instant?.maxFeePerGas)
        };

        gasData[networkName] = gasInfo;
        console.log(`✅ Gas prices for ${networkName}:`, gasInfo);
      } catch (error) {
        console.error(`❌ Error fetching gas prices for ${networkName}:`, error);
        gasData[networkName] = {
          chainId,
          network: networkName,
          baseFee: 0,
          low: 0,
          medium: 0,
          high: 0,
          instant: 0,
          error: error.message
        };
      }
    }

    console.log('🎉 Final gas data:', gasData);
    return gasData;
  } catch (error) {
    console.error('❌ Error in getGasPrices:', error);
    throw error;
  }
}

// Get gas prices for a single network
export async function getNetworkGasPrice(networkName) {
  try {
    const chainId = getChainId(networkName);
    
    if (!chainId) {
      throw new Error(`Unknown network: ${networkName}`);
    }

    const response = await callGasAPI({
      chain: chainId
    });

    return {
      chainId,
      network: networkName,
      baseFee: weiToGwei(response.baseFee),
      low: weiToGwei(response.low?.maxFeePerGas),
      medium: weiToGwei(response.medium?.maxFeePerGas),
      high: weiToGwei(response.high?.maxFeePerGas),
      instant: weiToGwei(response.instant?.maxFeePerGas)
    };
  } catch (error) {
    console.error(`Error fetching gas price for ${networkName}:`, error);
    throw error;
  }
} 