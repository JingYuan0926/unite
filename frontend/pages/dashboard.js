import { useState, useEffect } from 'react';
import DashboardHeader from "@/components/DashboardHeader";
import APISelectionModal from "@/components/APISelectionModal";
import PortfolioConfigModal from "@/components/PortfolioConfigModal";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { getPortfolioValue, checkPortfolioStatus } from '../lib/portfolioAPI';
import { getGasPrices } from '../lib/gasAPI';
import chainData from '../data/chains.json';

export default function Dashboard() {
  const [apis, setApis] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showPortfolioConfig, setShowPortfolioConfig] = useState(false);
  const [portfolioConfigs, setPortfolioConfigs] = useState([]);
  const [portfolioData, setPortfolioData] = useState({});
  const [gasData, setGasData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddAPI = () => {
    setShowSelectionModal(true);
  };

  const handleSaveChanges = (selectedAPIs) => {
    setApis(selectedAPIs);
    
    const portfolioAPI = selectedAPIs.find(api => api.name === "Portfolio API");
    if (portfolioAPI && portfolioAPI.config) {
      if (Array.isArray(portfolioAPI.config)) {
        setPortfolioConfigs(portfolioAPI.config);
      } else {
        setPortfolioConfigs([portfolioAPI.config]);
      }
    } else {
      setPortfolioConfigs([]);
    }

    const gasPriceAPI = selectedAPIs.find(api => api.name === "Gas Price API");
    if (gasPriceAPI && gasPriceAPI.config) {
      fetchGasData(gasPriceAPI.config.selectedNetworks);
    }
  };

  const handleConfigurePortfolio = () => {
    setShowPortfolioConfig(true);
  };

  const handlePortfolioConfigSave = (config) => {
    const newConfigs = [...portfolioConfigs, config];
    setPortfolioConfigs(newConfigs);
    setShowPortfolioConfig(false);
    fetchPortfolioData(newConfigs);
  };

  const fetchPortfolioData = async (configs = portfolioConfigs) => {
    if (configs.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let isAvailable = true;
      try {
        isAvailable = await checkPortfolioStatus();
      } catch (statusError) {
        console.warn('Portfolio status check failed, continuing anyway:', statusError.message);
      }

      const newPortfolioData = {};
      
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        const { trackedWallets, selectedNetworks } = config;
        
        if (trackedWallets.length === 0 || selectedNetworks.length === 0) {
          continue;
        }

        try {
          const data = await getPortfolioValue(trackedWallets, selectedNetworks);
          newPortfolioData[i] = data;
        } catch (configError) {
          newPortfolioData[i] = { 
            error: configError.message.includes('timeout') 
              ? 'Portfolio API is slow. Please try again later.' 
              : configError.message 
          };
        }
      }
      
      setPortfolioData(newPortfolioData);
    } catch (err) {
      const errorMessage = err.message.includes('timeout') 
        ? 'Portfolio API is experiencing delays. Please try again later.' 
        : err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchGasData = async (selectedNetworks) => {
    if (!selectedNetworks || selectedNetworks.length === 0) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getGasPrices(selectedNetworks);
      setGasData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (portfolioConfigs.length > 0) {
      fetchPortfolioData();
    }
  }, [portfolioConfigs]);

  useEffect(() => {
    const gasPriceAPI = apis.find(api => api.name === "Gas Price API");
    if (gasPriceAPI && gasPriceAPI.config && gasPriceAPI.config.selectedNetworks) {
      fetchGasData(gasPriceAPI.config.selectedNetworks);
    } else {
      setGasData({});
    }
  }, [apis]);

  const getConfigStatusText = (api) => {
    if (api.name === "Portfolio API") {
      return portfolioConfigs.length > 0 ? `✓ ${portfolioConfigs.length} wallet(s) configured` : "⚙️ Configure Wallets";
    }
    if (!api.requiresConfig) return null;
    return api.config ? "✓ Configured" : "⚙️ Needs Configuration";
  };

  const getConfigSummary = (api) => {
    if (!api.config && api.name !== "Portfolio API") return null;
    
    if (api.name === "Gas Price API") {
      const config = api.config;
      const networkCount = config.selectedNetworks.length;
      return `${networkCount} network(s) configured`;
    }
    
    return null;
  };

  const GasPriceChart = ({ config }) => {
    const selectedNetworks = config.selectedNetworks;
    
    if (!gasData || Object.keys(gasData).length === 0) {
      return (
        <div className="text-center py-6">
          <div className="text-gray-500">Loading gas prices...</div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {selectedNetworks.map((networkName) => {
          const networkGasData = gasData[networkName];
          
          if (!networkGasData) {
            return (
              <div key={networkName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chainColors[networkName] || '#8884d8' }}
                  ></div>
                  <span className="font-medium text-gray-900">{networkName}</span>
                </div>
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            );
          }

          if (networkGasData.error) {
            return (
              <div key={networkName} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chainColors[networkName] || '#8884d8' }}
                  ></div>
                  <span className="font-medium text-gray-900">{networkName}</span>
                </div>
                <div className="text-sm text-red-600">Error</div>
              </div>
            );
          }

          return (
            <div key={networkName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: chainColors[networkName] || '#8884d8' }}
                ></div>
                <span className="font-medium text-gray-900">{networkName}</span>
              </div>
              <div className="flex space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-semibold">{networkGasData.low.toFixed(3)}</div>
                  <div className="text-xs text-gray-500">Low</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-semibold">{networkGasData.medium.toFixed(3)}</div>
                  <div className="text-xs text-gray-500">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-600 font-semibold">{networkGasData.high.toFixed(3)}</div>
                  <div className="text-xs text-gray-500">High</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-semibold">{networkGasData.instant.toFixed(3)}</div>
                  <div className="text-xs text-gray-500">Instant</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const generateChainColors = () => {
    const colors = {};
    const defaultColors = [
      '#627EEA', '#28A0F0', '#8247E5', '#F3BA2F', '#FF0420', 
      '#E84142', '#1969FF', '#04795B', '#2775CA', '#8C4FE6',
      '#FF6B00', '#000000'
    ];
    
    chainData.networks.forEach((network, index) => {
      const knownColors = {
        'Ethereum Mainnet': '#627EEA',
        'Ethereum': '#627EEA',
        'Polygon': '#8247E5',
        'BNB Chain': '#F3BA2F',
        'Arbitrum': '#28A0F0',
        'Optimism': '#FF0420',
        'Avalanche': '#E84142',
        'Fantom': '#1969FF',
        'Gnosis': '#04795B',
        'Base': '#0052FF',
        'ZKsync Era': '#4E529A',
        'Linea': '#61DFFF',
        'Sonic': '#643CDD',
        'Unichain': '#FF007A'
      };
      
      colors[network.name] = knownColors[network.name] || defaultColors[index % defaultColors.length];
    });
    
    return colors;
  };

  const chainColors = generateChainColors();

  const PortfolioChart = ({ walletConfig, walletIndex }) => {
    const configData = portfolioData[walletIndex];
    
    if (!configData) {
      return (
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-xs text-gray-500 font-mono">Loading...</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="text-gray-500">Loading portfolio data...</div>
          </div>
        </div>
      );
    }

    if (configData.error) {
      return (
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-xs text-gray-500 font-mono">Error</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="text-red-500 text-sm text-center">
              <p>Error loading portfolio</p>
            </div>
          </div>
        </div>
      );
    }

    const chartData = [];
    let totalValue = 0;
    
    walletConfig.selectedNetworks.forEach(networkName => {
      const networkData = configData[networkName];
      const value = networkData?.totalValue || 0;
      
      if (value > 0) {
        chartData.push({
          chain: networkName,
          amount: value
        });
        totalValue += value;
      }
    });

    const walletLabel = walletConfig.trackedWallets[0] || 'Wallet';
    
    return (
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-mono">
            {walletLabel.slice(0, 10)}...{walletLabel.slice(-8)}
          </p>
          <p className="text-sm font-semibold text-gray-700">
            Total: ${totalValue.toFixed(2)}
          </p>
        </div>
        
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded">
            <div className="text-gray-500 text-sm text-center">
              <p>No portfolio value found</p>
            </div>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="horizontal"
                margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `$${Math.round(value)}`}
                  fontSize={10}
                />
                <YAxis 
                  dataKey="chain" 
                  type="category"
                  width={55}
                  tickFormatter={(value) => value.slice(0, 8)}
                  fontSize={10}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[0, 3, 3, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chainColors[entry.chain] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-2 flex flex-wrap gap-1">
          {walletConfig.selectedNetworks.map(network => {
            const networkData = configData[network];
            const value = networkData?.totalValue || 0;
            const hasValue = value > 0;
            
            return (
              <div key={network} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: chainColors[network] || '#8884d8' }}
                ></div>
                <span className={`${hasValue ? 'text-gray-700' : 'text-gray-400'}`}>
                  {network.slice(0, 8)}
                  {hasValue && (
                    <span className="ml-1 font-medium">
                      ${Math.round(value)}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">API Dashboard</h1>
            <p className="text-gray-600">Manage and monitor your 1inch API integrations</p>
          </div>
          
          <button
            onClick={handleAddAPI}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Edit API</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {apis.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No APIs added</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first API to the dashboard.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {apis.map((api, index) => {
              const configStatusText = getConfigStatusText(api);
              const configSummary = getConfigSummary(api);
              
              if (api.name === "Portfolio API") {
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={handleConfigurePortfolio}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                        <p className="text-sm text-gray-600">{api.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {loading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        {configStatusText && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            portfolioConfigs.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {configStatusText}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {portfolioConfigs.length > 0 ? (
                      <div className={`flex gap-6 ${portfolioConfigs.length > 1 ? 'overflow-x-auto' : ''}`}>
                        {portfolioConfigs.map((config, configIndex) => (
                          <PortfolioChart key={configIndex} walletConfig={config} walletIndex={configIndex} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Click to configure wallets and view portfolio</p>
                      </div>
                    )}
                  </div>
                );
              }
              
              if (api.name === "Gas Price API") {
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                        <p className="text-sm text-gray-600">{api.description}</p>
                      </div>
                      {configStatusText && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          api.config ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {configStatusText}
                        </span>
                      )}
                    </div>
                    
                    {configSummary && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
                        {configSummary}
                      </div>
                    )}
                    
                    {api.config ? (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Current Gas Prices (Gwei)</h4>
                          <div className="text-xs text-gray-500">Live data</div>
                        </div>
                        <GasPriceChart config={api.config} />
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Configure networks to view gas prices</p>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                    {configStatusText && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        api.config ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {configStatusText}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{api.description}</p>
                  {configSummary && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3">
                      {configSummary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <APISelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSaveChanges={handleSaveChanges}
        existingAPIs={apis}
      />

      <PortfolioConfigModal
        isOpen={showPortfolioConfig}
        onClose={() => setShowPortfolioConfig(false)}
        onSave={handlePortfolioConfigSave}
      />
    </div>
  );
} 