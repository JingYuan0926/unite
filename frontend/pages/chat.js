import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ChatBox from '../components/ChatBox';

export default function ChatPage() {
  return (
    <div className="font-sans bg-white">
      <Head>
        <title>1inch DeFi Chat</title>
        <meta name="description" content="AI-powered DeFi chat powered by 1inch protocols" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Header with RainbowKit ConnectButton */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - Logo and text */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 italic">
              1inch DeFi Chat
            </span>
          </div>

          {/* Middle - Navigation */}
          <nav className="flex items-center space-x-8">
            <button 
              className="relative group transition-all duration-300 text-black font-bold text-lg"
            >
              <span className="font-medium">Chat</span>
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            </button>
          </nav>

          {/* Right side - Connect Wallet Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </header>
      
      {/* Main Chat Section */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ChatBox />
      </main>
    </div>
  );
}
