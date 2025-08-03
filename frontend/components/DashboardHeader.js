import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and text */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 italic">
            1inch Agent Kit
          </span>
        </div>

        {/* Right side - Connect Wallet Button */}
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
} 