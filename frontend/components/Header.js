import { LineShadowText } from "@/components/magicui/line-shadow-text";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and text */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 italic">
            1inch Agent Kit
          </span>
        </div>

        {/* Middle - Navigation */}
        <nav className="flex items-center space-x-8">
          <a href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Home
          </a>
          <a href="/how-it-works" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            How It Works
          </a>
          <a href="/features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Features
          </a>
          <a href="/documentation" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            Documentation
          </a>
        </nav>

        {/* Right side - Empty for now, can be used for buttons later */}
        <div className="w-32"></div>
      </div>
    </header>
  );
} 