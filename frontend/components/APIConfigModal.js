import { useState } from 'react';

export default function APIConfigModal({ isOpen, onClose, apiName, onConfirm }) {
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: '',
    description: '',
    customName: apiName || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      name: config.customName || apiName,
      description: config.description,
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      isCustom: true
    });
    onClose();
  };

  const handleCancel = () => {
    setConfig({
      apiKey: '',
      endpoint: '',
      description: '',
      customName: apiName || ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {apiName === "Custom API" ? "Configure Custom API" : `Configure ${apiName}`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Set up your API configuration</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Name (Optional)
              </label>
              <input
                type="text"
                value={config.customName}
                onChange={(e) => setConfig({...config, customName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={apiName === "Custom API" ? "Enter API name" : apiName}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API key"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL
              </label>
              <input
                type="url"
                value={config.endpoint}
                onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({...config, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe what this API integration does..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 