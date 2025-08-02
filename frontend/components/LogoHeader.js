import Image from "next/image";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function LogoHeader() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <Image
          src="/1inch_color_black.svg"
          alt="1inch logo"
          width={300}
          height={140}
          priority
        />
        <div className="relative">
          <LineShadowText 
            as="h1" 
            className="text-6xl font-bold text-gray-900 italic whitespace-nowrap mb-5"
          >
            Agent Kit
          </LineShadowText>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-lg text-black-600 text-center max-w-3xl leading-relaxed">
        Harness 15 unified <strong><em>1inch</em></strong> APIs through a developer-ready SDK and an AI NLP web app that lets anyone quote, route, and swap in seconds
      </p>
      
      {/* Rainbow Buttons */}
      <div className="flex items-center space-x-4 mt-8">
        <RainbowButton className="flex items-center space-x-2">
          <span>GitHub</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
        </RainbowButton>
        
        {/* Transparent rainbow button with shimmer effect */}
        <button className="group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-sm px-8 py-2 font-medium text-gray-900 transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[length:200%] bg-[linear-gradient(rgba(255,255,255,0.8),rgba(255,255,255,0.8)),linear-gradient(rgba(255,255,255,0.8)_50%,rgba(255,255,255,0.6)_80%,rgba(255,255,255,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]">
          <span className="flex items-center space-x-2">
            <span>Docs</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
} 