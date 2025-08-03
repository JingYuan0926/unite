import { useState, useEffect } from 'react';

export default function APISelectionModal({ isOpen, onClose, onSaveChanges, existingAPIs }) {
  const availableAPIs = [
    { name: "Swap APIs", description: "Execute token swaps across multiple DEXs" },
    { name: "Orderbook API", description: "Real-time order book data" },
    { name: "History API", description: "Transaction history and analytics" },
    { name: "Traces API", description: "Detailed transaction traces" },
    { name: "Portfolio API", description: "Portfolio tracking and management" },
    { name: "Balance API", description: "Token balance information" },
    { name: "Gas Price API", description: "Real-time gas price data" },
    { name: "Spot Price API", description: "Current token prices" },
    { name: "Token API", description: "Token metadata and information" },
    { name: "NFT API", description: "NFT data and metadata" },
    { name: "Transaction Gateway API", description: "Transaction routing and execution" },
    { name: "Web3 RPC API", description: "Direct blockchain interactions" },
    { name: "Charts API", description: "Price charts and analytics" },
    { name: "Domains API", description: "ENS and domain resolution" },
    { name: "Token Details API", description: "Details about a token" }
  ];

  const [selectedAPIs, setSelectedAPIs] = useState([]);

  // Initialize selected APIs based on existing APIs
  useEffect(() => {
    const existingAPINames = existingAPIs.map(api => api.name);
    setSelectedAPIs(existingAPINames);
  }, [existingAPIs]);

  const handleToggleAPI = (apiName) => {
    setSelectedAPIs(prev => {
      if (prev.includes(apiName)) {
        return prev.filter(name => name !== apiName);
      } else {
        return [...prev, apiName];
      }
    });
  };

  const handleSaveChanges = () => {
    const selectedAPIData = availableAPIs.filter(api => selectedAPIs.includes(api.name));
    onSaveChanges(selectedAPIData);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original state
    const existingAPINames = existingAPIs.map(api => api.name);
    setSelectedAPIs(existingAPINames);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Add API to Dashboard</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Select APIs to add to your dashboard</p>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAPIs.map((api, index) => {
                const isSelected = selectedAPIs.includes(api.name);
                return (
                  <div
                    key={index}
                    className={`bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors duration-200 ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleAPI(api.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-2">{api.name}</h4>
                        <p className="text-sm text-gray-600">{api.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 