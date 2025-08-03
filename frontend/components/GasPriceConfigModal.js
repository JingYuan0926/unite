import { useState } from 'react';
import chainData from '../data/chains.json';

export default function GasPriceConfigModal({ isOpen, onClose, onSave, progress }) {
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supportedNetworks = chainData.networks.map(network => network.name);

  const networkLogos = chainData.networks.reduce((acc, network) => {
    acc[network.name] = network.logo;
    return acc;
  }, {});

  const handleToggleNetwork = (network) => {
    setSelectedNetworks(prev => {
      if (prev.includes(network)) {
        return prev.filter(n => n !== network);
      } else {
        return [...prev, network];
      }
    });
  };

  const handleSave = async () => {
    if (selectedNetworks.length === 0) {
      setError('Please select at least one network to monitor gas prices');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const config = {
        selectedNetworks
      };

      onSave(config);
      setSuccess('Gas Price configuration saved successfully!');
      
      // Reset form state
      setSelectedNetworks([]);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(`Failed to save configuration: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedNetworks([]);
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Configure Gas Price API {progress && <span className="text-sm font-normal text-gray-500">{progress}</span>}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Select which networks to monitor for gas prices</p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          
          {/* Network Configuration */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Supported Networks</h4>
            <p className="text-sm text-gray-600 mb-3">Select which networks to monitor for gas prices</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportedNetworks.map((network) => (
                <label key={network} className="flex items-center space-x-3 p-3 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNetworks.includes(network)}
                    onChange={() => handleToggleNetwork(network)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <img 
                    src={networkLogos[network]} 
                    alt={`${network} logo`}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-gray-700">{network}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || selectedNetworks.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

      </div>
    </div>
  );
} 