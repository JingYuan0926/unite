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
      console.log('✅ 1inch Agent Kit initialized successfully for query API');
    } catch (error) {
      console.error('❌ Failed to initialize 1inch Agent Kit for query API:', error.message);
    }
  }
  return agent;
};

// Helper function to extract portfolio data from function calls
const extractPortfolioData = (functionCalls) => {
  if (!functionCalls || functionCalls.length === 0) return null;
  
  const portfolioCall = functionCalls.find(call => call.name === 'portfolioAPI');
  if (!portfolioCall || !portfolioCall.result) return null;
  
  const result = portfolioCall.result;
  if (!result.result) return null;
  
  const portfolioData = result.result;
  
  return {
    totalValue: parseFloat(portfolioData.total || 0),
    breakdown: {
      tokens: 0,
      nativeAssets: 0,
      protocols: 0
    }
  };
};

// Helper function to extract balance data from function calls
const extractBalanceData = (functionCalls) => {
  if (!functionCalls || functionCalls.length === 0) return [];
  
  const balanceCall = functionCalls.find(call => call.name === 'balanceAPI');
  if (!balanceCall || !balanceCall.result) return [];
  
  const result = balanceCall.result;
  if (!result.result || !result.result.balances) return [];
  
  return result.result.balances
    .filter(balance => parseFloat(balance.balance) > 0)
    .map(balance => {
      const balanceValue = parseFloat(balance.balance);
      let balanceInUnits = balanceValue;
      
      // Convert based on token decimals
      if (balance.symbol === 'USDC') {
        balanceInUnits = balanceValue / 1000000; // 6 decimals
      } else if (balance.symbol === 'WETH' || balance.symbol === 'ETH') {
        balanceInUnits = balanceValue / 1000000000000000000; // 18 decimals
      }
      
      return {
        symbol: balance.symbol,
        balance: balanceValue,
        balanceInUnits: balanceInUnits,
        address: balance.address,
        decimals: balance.symbol === 'USDC' ? 6 : 18
      };
    });
};

// Helper function to extract chart data from function calls
const extractChartData = (functionCalls) => {
  if (!functionCalls || functionCalls.length === 0) return [];
  
  const chartCall = functionCalls.find(call => call.name === 'chartsAPI');
  if (!chartCall || !chartCall.result) return [];
  
  const result = chartCall.result;
  if (!result.result || !Array.isArray(result.result)) return [];
  
  return result.result.slice(-7).map(item => ({
    timestamp: item.time,
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close)
  }));
};

// Helper function to extract gas data from function calls
const extractGasData = (functionCalls) => {
  if (!functionCalls || functionCalls.length === 0) return null;
  
  const gasCall = functionCalls.find(call => call.name === 'gasAPI');
  if (!gasCall || !gasCall.result) return null;
  
  const result = gasCall.result;
  if (!result.result) return null;
  
  const gasData = result.result;
  
  return {
    baseFee: {
      value: parseInt(gasData.baseFee || 0),
      unit: 'gwei'
    },
    priorityFees: {
      low: {
        maxPriorityFee: parseInt(gasData.priorityFees?.slow?.maxPriorityFee || 0),
        maxFee: parseInt(gasData.priorityFees?.slow?.maxFee || 0),
        unit: 'gwei'
      },
      medium: {
        maxPriorityFee: parseInt(gasData.priorityFees?.standard?.maxPriorityFee || 0),
        maxFee: parseInt(gasData.priorityFees?.standard?.maxFee || 0),
        unit: 'gwei'
      },
      high: {
        maxPriorityFee: parseInt(gasData.priorityFees?.fast?.maxPriorityFee || 0),
        maxFee: parseInt(gasData.priorityFees?.fast?.maxFee || 0),
        unit: 'gwei'
      },
      instant: {
        maxPriorityFee: parseInt(gasData.priorityFees?.instant?.maxPriorityFee || 0),
        maxFee: parseInt(gasData.priorityFees?.instant?.maxFee || 0),
        unit: 'gwei'
      }
    }
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet } = req.body;

    if (!wallet?.address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Initialize agent
    const agentInstance = initializeAgent();
    if (!agentInstance) {
      return res.status(500).json({ 
        error: 'Agent not initialized. Please check your API keys.' 
      });
    }

    // Set wallet
    agentInstance.setWallet(wallet);

    // 1. Portfolio API - Get current portfolio value
    console.log('📊 Running Portfolio API...');
    let portfolioData = null;
    let portfolioFunctionCalls = [];
    try {
      const portfolioResult = await agentInstance.chat(`Get the current portfolio value for wallet ${wallet.address} on chain ${wallet.chainId || 42161}`);
      portfolioFunctionCalls = portfolioResult.functionCalls || [];
      portfolioData = extractPortfolioData(portfolioFunctionCalls);
    } catch (error) {
      console.error('Portfolio API error:', error);
    }

    // 2. Balance API - Get wallet balances
    console.log('💰 Running Balance API...');
    let balanceData = [];
    let balanceFunctionCalls = [];
    try {
      const balanceResult = await agentInstance.chat(`Get all token balances for wallet ${wallet.address} on chain ${wallet.chainId || 42161}`);
      balanceFunctionCalls = balanceResult.functionCalls || [];
      balanceData = extractBalanceData(balanceFunctionCalls);
    } catch (error) {
      console.error('Balance API error:', error);
    }

    // 3. Charts API for USDC and ETH
    console.log('📈 Running Charts API...');
    let chartData = [];
    let chartFunctionCalls = [];
    try {
      const chartsResult = await agentInstance.chat(`Get 7-day candle chart data for USDC and ETH on Arbitrum chain ${wallet.chainId || 42161}`);
      chartFunctionCalls = chartsResult.functionCalls || [];
      chartData = extractChartData(chartFunctionCalls);
    } catch (error) {
      console.error('Charts API error:', error);
    }

    // 4. Gas API
    console.log('⛽ Running Gas API...');
    let gasData = null;
    let gasFunctionCalls = [];
    try {
      const gasResult = await agentInstance.chat(`Get current gas prices for chain ${wallet.chainId || 42161}`);
      gasFunctionCalls = gasResult.functionCalls || [];
      gasData = extractGasData(gasFunctionCalls);
    } catch (error) {
      console.error('Gas API error:', error);
    }

    // Calculate chart summary
    let chartSummary = null;
    if (chartData.length > 0) {
      const prices = chartData.map(item => item.close);
      const currentPrice = prices[prices.length - 1];
      const firstPrice = prices[0];
      const changePercentage = ((currentPrice - firstPrice) / firstPrice) * 100;
      
      chartSummary = {
        currentPrice: currentPrice,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        changePercentage: changePercentage
      };
    }

    // Build the structured response
    const structuredResponse = {
      walletOverview: {
        originalQuery: "Show me my wallet overview on Arbitrum, get my top 2 assets, show their price charts, and estimate gas fees",
        walletAddress: wallet.address,
        chainId: wallet.chainId || 42161,
        chainName: "Arbitrum",
        portfolio: portfolioData || {
          totalValue: 0,
          breakdown: { tokens: 0, nativeAssets: 0, protocols: 0 }
        },
        balances: {
          tokens: balanceData
        },
        priceCharts: {
          pair: "ETH/USDC",
          timeframe: "7-day",
          dataPoints: chartData,
          summary: chartSummary
        },
        gasEstimates: gasData || {
          baseFee: { value: 0, unit: 'gwei' },
          priorityFees: {
            low: { maxPriorityFee: 0, maxFee: 0, unit: 'gwei' },
            medium: { maxPriorityFee: 0, maxFee: 0, unit: 'gwei' },
            high: { maxPriorityFee: 0, maxFee: 0, unit: 'gwei' },
            instant: { maxPriorityFee: 0, maxFee: 0, unit: 'gwei' }
          }
        },
        metadata: {
          queryParts: [
            {
              id: "p1",
              description: "Get wallet portfolio overview",
              function: "portfolioAPI",
              status: portfolioData ? "completed" : "error",
              functionCalls: portfolioFunctionCalls.length
            },
            {
              id: "p2",
              description: "Get wallet balances",
              function: "balanceAPI",
              status: balanceData.length > 0 ? "completed" : "error",
              functionCalls: balanceFunctionCalls.length
            },
            {
              id: "p3",
              description: "Get price charts for USDC and ETH",
              function: "chartsAPI",
              status: chartData.length > 0 ? "completed" : "error",
              functionCalls: chartFunctionCalls.length
            },
            {
              id: "p4",
              description: "Get gas fee estimates",
              function: "gasAPI",
              status: gasData ? "completed" : "error",
              functionCalls: gasFunctionCalls.length
            }
          ],
          totalFunctionCalls: portfolioFunctionCalls.length + balanceFunctionCalls.length + chartFunctionCalls.length + gasFunctionCalls.length,
          processingTime: "completed"
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: structuredResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Query API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
} 