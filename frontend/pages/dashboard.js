import { useState } from 'react';
import DashboardHeader from "@/components/DashboardHeader";
import APISelectionModal from "@/components/APISelectionModal";

export default function Dashboard() {
  const [apis, setApis] = useState([]);

  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const handleAddAPI = () => {
    setShowSelectionModal(true);
  };

  const handleSaveChanges = (selectedAPIs) => {
    setApis(selectedAPIs);
  };

  const getConfigStatusText = (api) => {
    if (!api.requiresConfig) return null;
    return api.config ? "✓ Configured" : "⚙️ Needs Configuration";
  };

  const getConfigSummary = (api) => {
    if (!api.config) return null;
    
    if (api.name === "Portfolio API") {
      const config = api.config;
      const walletCount = config.trackedWallets.length + (config.includeCurrentWallet ? 1 : 0);
      const networkCount = config.selectedNetworks.length;
      return `${walletCount} wallet(s), ${networkCount} network(s)`;
    }
    
    if (api.name === "Gas Price API") {
      const config = api.config;
      const networkCount = config.selectedNetworks.length;
      return `${networkCount} network(s), ${config.gasPricePreferences.updateInterval}s updates`;
    }
    
    return null;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apis.map((api, index) => {
              const configStatusText = getConfigStatusText(api);
              const configSummary = getConfigSummary(api);
              
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
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
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
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
    </div>
  );
} 