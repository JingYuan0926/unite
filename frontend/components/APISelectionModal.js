import { useState, useEffect } from 'react';
import PortfolioConfigModal from './PortfolioConfigModal';
import GasPriceConfigModal from './GasPriceConfigModal';

export default function APISelectionModal({ isOpen, onClose, onSaveChanges, existingAPIs }) {
  const availableAPIs = [
    { name: "Swap APIs", description: "Execute token swaps across multiple DEXs" },
    { name: "Orderbook API", description: "Real-time order book data" },
    { name: "History API", description: "Transaction history and analytics" },
    { name: "Traces API", description: "Detailed transaction traces" },
    { name: "Portfolio API", description: "Portfolio tracking and management", requiresConfig: true },
    { name: "Balance API", description: "Token balance information" },
    { name: "Gas Price API", description: "Real-time gas price data", requiresConfig: true },
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
  const [configStatus, setConfigStatus] = useState({});
  const [showPortfolioConfig, setShowPortfolioConfig] = useState(false);
  const [showGasPriceConfig, setShowGasPriceConfig] = useState(false);
  const [currentStep, setCurrentStep] = useState('selection'); // 'selection' or 'configuration'
  const [originalAPIs, setOriginalAPIs] = useState([]); // Track original state

  // Initialize selected APIs based on existing APIs
  useEffect(() => {
    const existingAPINames = existingAPIs.map(api => api.name);
    setSelectedAPIs(existingAPINames);
    setOriginalAPIs(existingAPINames); // Store original state
    
    // Initialize config status for existing APIs
    const initialConfigStatus = {};
    existingAPIs.forEach(api => {
      if (api.requiresConfig) {
        initialConfigStatus[api.name] = api.config || false;
      }
    });
    setConfigStatus(initialConfigStatus);
  }, [existingAPIs]);

  // Check if there are changes compared to original state
  const hasChanges = () => {
    const originalSet = new Set(originalAPIs);
    const currentSet = new Set(selectedAPIs);
    
    if (originalSet.size !== currentSet.size) return true;
    
    for (const api of originalSet) {
      if (!currentSet.has(api)) return true;
    }
    
    return false;
  };

  const handleToggleAPI = (apiName) => {
    const isCurrentlySelected = selectedAPIs.includes(apiName);
    
    setSelectedAPIs(prev => {
      if (isCurrentlySelected) {
        return prev.filter(name => name !== apiName);
      } else {
        return [...prev, apiName];
      }
    });
    
    // Reset config status when unselecting
    if (isCurrentlySelected) {
      setConfigStatus(prev => ({
        ...prev,
        [apiName]: false
      }));
    }
  };

  const handleNext = () => {
    const apisNeedingConfig = selectedAPIs.filter(apiName => {
      const api = availableAPIs.find(a => a.name === apiName);
      return api && api.requiresConfig;
    });

    if (apisNeedingConfig.length === 0) {
      // No configuration needed, save directly
      handleSaveChanges();
    } else {
      // Move to configuration step
      setCurrentStep('configuration');
      // Open first config modal
      const firstApi = apisNeedingConfig[0];
      if (firstApi === "Portfolio API") {
        setShowPortfolioConfig(true);
      } else if (firstApi === "Gas Price API") {
        setShowGasPriceConfig(true);
      }
    }
  };

  const handleConfigComplete = (apiName, config) => {
    setConfigStatus(prev => ({
      ...prev,
      [apiName]: config // Store the actual config instead of just true
    }));
    
    // Close the current config modal
    if (apiName === "Portfolio API") {
      setShowPortfolioConfig(false);
    } else if (apiName === "Gas Price API") {
      setShowGasPriceConfig(false);
    }

    // Check if there are more APIs to configure - use updated config status
    const updatedConfigStatus = { ...configStatus, [apiName]: config };
    const apisNeedingConfig = selectedAPIs.filter(apiName => {
      const api = availableAPIs.find(a => a.name === apiName);
      return api && api.requiresConfig && !updatedConfigStatus[apiName];
    });

    if (apisNeedingConfig.length === 0) {
      // All configurations complete, save immediately
      const selectedAPIData = availableAPIs
        .filter(api => selectedAPIs.includes(api.name))
        .map(api => ({
          ...api,
          config: updatedConfigStatus[api.name] || false
        }));
      onSaveChanges(selectedAPIData);
      setCurrentStep('selection'); // Reset to selection step
      onClose();
    } else {
      // Open next config modal
      const nextApi = apisNeedingConfig[0];
      if (nextApi === "Portfolio API") {
        setShowPortfolioConfig(true);
      } else if (nextApi === "Gas Price API") {
        setShowGasPriceConfig(true);
      }
    }
  };

  const handleSaveChanges = () => {
    const selectedAPIData = availableAPIs
      .filter(api => selectedAPIs.includes(api.name))
      .map(api => ({
        ...api,
        config: configStatus[api.name] || false
      }));
    onSaveChanges(selectedAPIData);
    setCurrentStep('selection'); // Reset to selection step
    onClose();
  };

  const handleCancel = () => {
    // Reset to original state
    const existingAPINames = existingAPIs.map(api => api.name);
    setSelectedAPIs(existingAPINames);
    setOriginalAPIs(existingAPINames); // Reset original state
    
    const initialConfigStatus = {};
    existingAPIs.forEach(api => {
      if (api.requiresConfig) {
        initialConfigStatus[api.name] = api.config || false;
      }
    });
    setConfigStatus(initialConfigStatus);
    setCurrentStep('selection');
    onClose();
  };

  const getConfigStatusText = (apiName) => {
    if (!selectedAPIs.includes(apiName)) return null;
    
    const api = availableAPIs.find(a => a.name === apiName);
    if (!api.requiresConfig) return null;
    
    const isConfigured = configStatus[apiName];
    return isConfigured ? "✓ Configured" : "⚙️ Configure";
  };

  const getNextButtonText = () => {
    const apisNeedingConfig = selectedAPIs.filter(apiName => {
      const api = availableAPIs.find(a => a.name === apiName);
      return api && api.requiresConfig;
    });

    if (apisNeedingConfig.length === 0) {
      return "Save Changes";
    } else {
      return `Next (${apisNeedingConfig.length} config${apisNeedingConfig.length > 1 ? 's' : ''} needed)`;
    }
  };

  const getConfigProgress = () => {
    const apisNeedingConfig = selectedAPIs.filter(apiName => {
      const api = availableAPIs.find(a => a.name === apiName);
      return api && api.requiresConfig;
    });

    const configuredCount = apisNeedingConfig.filter(apiName => configStatus[apiName]).length;
    const totalCount = apisNeedingConfig.length;

    if (totalCount === 0) return null;
    return `(${configuredCount}/${totalCount} config${totalCount > 1 ? 's' : ''} done)`;
  };

  const getModalTitle = () => {
    if (currentStep === 'configuration') {
      const apisNeedingConfig = selectedAPIs.filter(apiName => {
        const api = availableAPIs.find(a => a.name === apiName);
        return api && api.requiresConfig && !configStatus[apiName];
      });

      if (apisNeedingConfig.length > 0) {
        const currentApi = apisNeedingConfig[0];
        const progress = getConfigProgress();
        return `Configure ${currentApi} ${progress}`;
      }
    }
    return "Edit API Dashboard";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[82vh] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === 'selection' ? 'Select APIs to add to your dashboard' : 'Configure your selected APIs'}
            </p>
          </div>

          {/* API list */}
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableAPIs.map((api, index) => {
                  const isSelected = selectedAPIs.includes(api.name);
                  const configStatusText = getConfigStatusText(api.name);
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between pb-8">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={!hasChanges()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {getNextButtonText()}
            </button>
          </div>

        </div>
      </div>

      {/* Configuration Modals */}
      {showPortfolioConfig && (
        <PortfolioConfigModal
          isOpen={showPortfolioConfig}
          onClose={() => {
            setShowPortfolioConfig(false);
            setCurrentStep('selection'); // Reset to selection step if closed without saving
          }}
          onSave={(config) => handleConfigComplete("Portfolio API", config)}
          progress={getConfigProgress()}
        />
      )}

      {showGasPriceConfig && (
        <GasPriceConfigModal
          isOpen={showGasPriceConfig}
          onClose={() => {
            setShowGasPriceConfig(false);
            setCurrentStep('selection'); // Reset to selection step if closed without saving
          }}
          onSave={(config) => handleConfigComplete("Gas Price API", config)}
          progress={getConfigProgress()}
        />
      )}
    </>
  );
}
