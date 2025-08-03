import { useState } from 'react';
import chainData from '../data/chains.json';
import { validateWalletAddress } from '../lib/portfolioAPI';

export default function PortfolioConfigModal({ isOpen, onClose, onSave, progress }) {
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [includeCurrentWallet, setIncludeCurrentWallet] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supportedNetworks = chainData.networks.map(network => network.name);

  const networkLogos = chainData.networks.reduce((acc, network) => {
    acc[network.name] = network.logo;
    return acc;
  }, {});

  const handleAddWallet = () => {
    const address = newWalletAddress.trim();
    if (address && !trackedWallets.includes(address)) {
      if (validateWalletAddress(address)) {
        setTrackedWallets([...trackedWallets, address]);
        setNewWalletAddress('');
        setError('');
      } else {
        setError('Please enter a valid Ethereum wallet address (0x followed by 40 hex characters)');
      }
    }
  };

  const handleRemoveWallet = (address) => {
    setTrackedWallets(trackedWallets.filter(wallet => wallet !== address));
  };

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
    if (selectedNetworks.length === 0 || (trackedWallets.length === 0 && !includeCurrentWallet)) {
      setError('Please add at least one wallet address and select at least one network');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const config = {
        trackedWallets,
        includeCurrentWallet,
        selectedNetworks
      };

      // Save the configuration
      onSave(config);
      setSuccess('Portfolio configuration saved successfully!');
      
      // Reset form state
      setTrackedWallets([]);
      setNewWalletAddress('');
      setIncludeCurrentWallet(false);
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
    setTrackedWallets([]);
    setNewWalletAddress('');
    setIncludeCurrentWallet(false);
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
              Configure Portfolio API {progress && <span className="text-sm font-normal text-gray-500">{progress}</span>}
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
          <p className="text-sm text-gray-600 mt-1">Configure which wallets and networks to track</p>
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
          
          {/* Wallet Configuration */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Wallet Addresses to Track</h4>
            
            {/* Current Wallet Option */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeCurrentWallet}
                  onChange={(e) => setIncludeCurrentWallet(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include currently connected wallet</span>
              </label>
            </div>

            {/* Add New Wallet */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddWallet}
                  disabled={!newWalletAddress.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tracked Wallets List */}
            {trackedWallets.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Tracked Wallets:</h5>
                {trackedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 font-mono">{wallet}</span>
                    <button
                      onClick={() => handleRemoveWallet(wallet)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Network Configuration */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Supported Networks</h4>
            <p className="text-sm text-gray-600 mb-3">Select which networks to track for portfolio data</p>
            
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
            disabled={isLoading || selectedNetworks.length === 0 || (trackedWallets.length === 0 && !includeCurrentWallet)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

      </div>
    </div>
  );
} 