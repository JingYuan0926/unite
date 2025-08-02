import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export default function HowItWorks() {
  return (
    <div className="flex items-center justify-center p-8 bg-white">
      <div className="text-center w-full max-w-6xl">
        <p className="text-xl font-bold text-gray-500 mb-8">HOW IT WORKS</p>
        
        {/* Terminal and Text Section */}
        <div className="flex items-start justify-between gap-8 mb-8">
          {/* Left Side - Terminal */}
          <div className="flex-1">
            <Terminal className="w-full h-80">
              <TypingAnimation>
                {`import { SolanaAgentKit } from "solana-agent-kit";

const agent = new SolanaAgentKit(
  wallet,
  "YOUR_RPC_URL",
  {
    OPENAI_API_KEY: "YOUR_OPENAI_API_KEY",
  }
).use(TokenPlugin)
  .use(NFTPlugin)
  .use(DefiPlugin)
  .use(MiscPlugin)
  .use(BlinksPlugin);`}
              </TypingAnimation>
            </Terminal>
          </div>
          
          {/* Right Side - Text and Button */}
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The simplest 1inch Agent Kit
            </h2>
            
            {/* Take me to the docs button */}
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span>Take me to the docs &gt;&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 