import DashboardHeader from "@/components/DashboardHeader";

export default function Dashboard() {
  const apis = [
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

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Dashboard</h1>
          <p className="text-gray-600">Manage and monitor your 1inch API integrations</p>
        </div>
        
        {/* API Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apis.map((api, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{api.name}</h3>
              <p className="text-sm text-gray-600">{api.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 