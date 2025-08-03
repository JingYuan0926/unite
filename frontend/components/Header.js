import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { useScrollSpy } from "@/hooks/useScrollSpy";

export default function Header() {
  const sectionIds = ['home', 'how-it-works', 'features'];
  const activeSection = useScrollSpy(sectionIds, 100); // 100px offset for header height

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and text */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-900 italic">
            1inch Agent Kit
          </span>
        </div>

        {/* Middle - Navigation */}
        <nav className="flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('home')}
            className={`relative group transition-all duration-300 ${
              activeSection === 'home' 
                ? 'text-black font-bold text-lg' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="font-medium">Home</span>
            {activeSection === 'home' && (
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            )}
          </button>
          
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className={`relative group transition-all duration-300 ${
              activeSection === 'how-it-works' 
                ? 'text-black font-bold text-lg' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="font-medium">How It Works</span>
            {activeSection === 'how-it-works' && (
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            )}
          </button>
          
          <button 
            onClick={() => scrollToSection('features')}
            className={`relative group transition-all duration-300 ${
              activeSection === 'features' 
                ? 'text-black font-bold text-lg' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="font-medium">Features</span>
            {activeSection === 'features' && (
              <div className="absolute -inset-2 rounded-full border-2 border-gray-300 transition-all duration-300"></div>
            )}
          </button>
        </nav>

        {/* Right side - Blue button */}
        <div className="w-32 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-2xl transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
} 