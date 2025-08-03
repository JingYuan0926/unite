import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from "next/router";

export default function DashboardHeader() {
  const router = useRouter();
  const currentPath = router.pathname;

  const goToChat = () => {
    router.push('/chat');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToHome = () => {
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left side - Logo and text */}
        <div className="flex items-center flex-1">
          <span 
            onClick={goToHome}
            className="text-2xl font-bold text-gray-900 italic cursor-pointer hover:text-gray-700 transition-colors duration-200"
          >
            1inch Agent Platform
          </span>
        </div>

        {/* Center - Navigation */}
        <nav className="flex items-center space-x-8 flex-1 justify-center">
          <button 
            onClick={goToChat}
            className={`relative group transition-all duration-300 ${
              currentPath === '/chat' 
                ? 'text-black font-bold text-lg' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="font-medium">Chat</span>
            {currentPath === '/chat' && (
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            )}
          </button>
          
          <button 
            onClick={goToDashboard}
            className={`relative group transition-all duration-300 ${
              currentPath === '/dashboard' 
                ? 'text-black font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="font-medium">Dashboard</span>
            {currentPath === '/dashboard' && (
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            )}
          </button>
          
          <button 
            onClick={goToChat}
            className={`relative group transition-all duration-300 ${
              currentPath === '/chat' 
                ? 'text-black font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
          </button>
        </nav>

        {/* Right side - Connect Wallet Button */}
        <div className="flex items-center flex-1 justify-end">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
} 