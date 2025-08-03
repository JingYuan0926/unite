import DashboardHeader from "@/components/DashboardHeader";

export default function Dashboard() {
  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to your 1inch Agent Kit dashboard
          </p>
          
          {/* Dashboard content can be added here */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <p className="text-gray-600">
              Dashboard content will be displayed here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 