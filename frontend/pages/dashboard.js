import { useState } from 'react';
import DashboardHeader from "@/components/DashboardHeader";
import APISelectionModal from "@/components/APISelectionModal";
import PortfolioConfigModal from "@/components/PortfolioConfigModal";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [apis, setApis] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showPortfolioConfig, setShowPortfolioConfig] = useState(false);
  const [portfolioConfigs, setPortfolioConfigs] = useState([
    // Temporary fake data for testing - will be replaced by user configuration
    {
      trackedWallets: ['0x987cff8...b5ca8f1'],
      includeCurrentWallet: false,
      selectedNetworks: ['Ethereum', 'BNB Chain']
    },
    {
      trackedWallets: ['0x123abc7...d4ef9g2'],
      includeCurrentWallet: true,
      selectedNetworks: ['Polygon', 'Arbitrum', 'Optimism']
    }
  ]);

  const handleAddAPI = () => {
    setShowSelectionModal(true);
  };

  const handleSaveChanges = (selectedAPIs) => {
    setApis(selectedAPIs);
    
    // Extract portfolio configurations from the Portfolio API
    const portfolioAPI = selectedAPIs.find(api => api.name === "Portfolio API");
    if (portfolioAPI && portfolioAPI.config) {
      // If it's a single config object, wrap it in an array
      if (Array.isArray(portfolioAPI.config)) {
        setPortfolioConfigs(portfolioAPI.config);
      } else {
        setPortfolioConfigs([portfolioAPI.config]);
      }
    }
  };

  const handleConfigurePortfolio = () => {
    setShowPortfolioConfig(true);
  };

  const handlePortfolioConfigSave = (config) => {
    // Add the new config to the list
    setPortfolioConfigs(prev => [...prev, config]);
    setShowPortfolioConfig(false);
  };

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
      return `${networkCount} network(s), ${config.gasPricePreferences.updateInterval}s updates`;
    }
    
    return null;
  };

  // Mock portfolio data generator for demonstration
  const generateMockPortfolioData = (walletConfig, walletIndex) => {
    const chains = walletConfig.selectedNetworks;
    const baseAmounts = [
      [5200, 3800], // Wallet 1 amounts
      [7100, 4500, 2300], // Wallet 2 amounts
      [6800, 5200, 3100] // Wallet 3 amounts
    ];
    
    const mockData = chains.map((chain, index) => ({
      chain,
      amount: baseAmounts[walletIndex] ? baseAmounts[walletIndex][index] || Math.floor(Math.random() * 5000) + 2000 : Math.floor(Math.random() * 5000) + 2000,
    }));
    return mockData;
  };

  // Chart colors for different chains
  const chainColors = {
    'Ethereum': '#627EEA',
    'Polygon': '#8247E5',
    'BNB Chain': '#F3BA2F',
    'Arbitrum': '#28A0F0',
    'Optimism': '#FF0420',
    'Avalanche': '#E84142',
    'Fantom': '#1969FF',
    'Gnosis': '#04795B',
  };

  const PortfolioChart = ({ walletConfig, walletIndex }) => {
    const chartData = generateMockPortfolioData(walletConfig, walletIndex);
    const walletLabel = walletConfig.trackedWallets[0] || `Connected Wallet`;
    
    return (
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-mono">{walletLabel.slice(0, 10)}...{walletLabel.slice(-8)}</p>
        </div>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                fontSize={10}
              />
              <YAxis 
                dataKey="chain" 
                type="category"
                width={55}
                tickFormatter={(value) => value.slice(0, 6)}
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
        <div className="mt-2 flex flex-wrap gap-1">
          {walletConfig.selectedNetworks.map(network => (
            <div key={network} className="flex items-center gap-1 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: chainColors[network] || '#8884d8' }}
              ></div>
              <span className="text-gray-600">{network.slice(0, 8)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">API Dashboard</h1>
            <p className="text-gray-600">Manage and monitor your 1inch API integrations</p>
          </div>
          
          {/* Edit API Button */}
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
        
        {/* API Cards Grid */}
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
              
              // Special handling for Portfolio API
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
                      {configStatusText && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          portfolioConfigs.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {configStatusText}
                        </span>
                      )}
                    </div>
                    
                    {/* Portfolio Charts */}
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
              
              // Regular API cards
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

      {/* API Selection Modal */}
      <APISelectionModal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onSaveChanges={handleSaveChanges}
        existingAPIs={apis}
      />

      {/* Portfolio Configuration Modal */}
      <PortfolioConfigModal
        isOpen={showPortfolioConfig}
        onClose={() => setShowPortfolioConfig(false)}
        onSave={handlePortfolioConfigSave}
      />
    </div>
  );
} 