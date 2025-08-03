import { useState } from 'react';

export default function PortfolioConfigModal({ isOpen, onClose, onSave, progress }) {
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [includeCurrentWallet, setIncludeCurrentWallet] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState([]);

  const supportedNetworks = [
    "Ethereum Mainnet",
    "Arbitrum",
    "BNB Chain",
    "Gnosis",
    "Optimism",
    "Sonic",
    "Polygon",
    "Base",
    "ZKsync Era",
    "Linea",
    "Avalanche",
    "Unichain"
  ];

  const handleAddWallet = () => {
    if (newWalletAddress.trim() && !trackedWallets.includes(newWalletAddress.trim())) {
      setTrackedWallets([...trackedWallets, newWalletAddress.trim()]);
      setNewWalletAddress('');
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

  const handleSave = () => {
    const config = {
      trackedWallets,
      includeCurrentWallet,
      selectedNetworks
    };
    onSave(config);
  };

  const handleCancel = () => {
    setTrackedWallets([]);
    setNewWalletAddress('');
    setIncludeCurrentWallet(false);
    setSelectedNetworks([]);
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
                <label key={network} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedNetworks.includes(network)}
                    onChange={() => handleToggleNetwork(network)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
            disabled={selectedNetworks.length === 0 || (trackedWallets.length === 0 && !includeCurrentWallet)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
} 