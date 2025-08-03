import React from "react";
import {
    AnimatedSpan,
    Terminal,
    TypingAnimation,
} from "@/components/magicui/terminal";
import BlackLine from "@/components/BlackLine";

export default function HowItWorks() {
    const goToDocs = () => {
        window.open('https://1inch-agent-kit.gitbook.io/1inch-agent-kit-docs/', '_blank');
    };

    return (
        <div className="flex items-center justify-center p-8 bg-white">
            <div className="text-center w-full max-w-6xl">
                {/* Horizontal Line */}
                <BlackLine className="mb-8" />

                <p className="text-xl font-bold text-gray-500 mb-8">HOW IT WORKS</p>

                {/* Terminal and Text Section */}
                <div className="flex items-start justify-between gap-8 mb-8">
                    {/* Left Side - Terminal */}
                    <div className="flex-1">
                        <Terminal className="w-full h-[500px]">
                            <TypingAnimation>&gt; npm install 1inch-agent-kit</TypingAnimation>

                            <AnimatedSpan delay={1500} className="text-green-500">
                                <span>✔ Downloading 1inch Agent Kit...</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={2000} className="text-green-500">
                                <span>✔ Installing dependencies...</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={2500} className="text-green-500">
                                <span>✔ Setting up OpenAI integration...</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={3000} className="text-green-500">
                                <span>✔ Configuring 1inch API...</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={3500} className="text-blue-500">
                                <span>ℹ Added 1inch-agent-kit to package.json</span>
                            </AnimatedSpan>

                            <TypingAnimation delay={4000}>&gt; touch .env</TypingAnimation>

                            <AnimatedSpan delay={4500} className="text-yellow-500">
                                <span>⚠ Add your API keys to .env file:</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={5000} className="text-gray-400">
                                <span>OPENAI_API_KEY=your_openai_key</span>
                            </AnimatedSpan>

                            <AnimatedSpan delay={5500} className="text-gray-400">
                                <span>ONEINCH_API_KEY=your_1inch_key</span>
                            </AnimatedSpan>

                            <TypingAnimation delay={6000}>&gt; node index.js</TypingAnimation>

                            <AnimatedSpan delay={6500} className="text-green-500">
                                <span>✔ 1inch Agent Kit initialized successfully!</span>
                            </AnimatedSpan>

                            <TypingAnimation delay={7000} className="text-muted-foreground">
                                Ready to process DeFi queries and transactions.
                            </TypingAnimation>

                            <TypingAnimation delay={7500} className="text-muted-foreground">
                                Try: &quot;Get me a quote for swapping 1 ETH to USDC&quot;
                            </TypingAnimation>
                        </Terminal>
                    </div>

                    {/* Right Side - Text and Button */}
                    <div className="flex-1 text-left">
                        <h2 className="text-4xl font-normal text-gray-900 mb-4">
                            Easily integrate the <span className="font-bold italic">1inch</span> Agent Kit into your project
                        </h2>

                        <p className="text-gray-600">
                            Select from our comprehensive suite of APIs including Portfolio tracking, Gas prices, Swap execution, and more. Each API can be configured to match your specific needs and trading strategy.
                        </p>

                        {/* Take me to the docs button */}
                        <button 
                            onClick={goToDocs}
                            className="group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-sm px-8 py-2 font-medium text-gray-900 transition-all hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[length:200%] bg-[linear-gradient(rgba(255,255,255,0.8),rgba(255,255,255,0.8)),linear-gradient(rgba(255,255,255,0.8)_50%,rgba(255,255,255,0.6)_80%,rgba(255,255,255,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]"
                        >
                          <span className="flex items-center space-x-2">
                            <span>Take me to the docs &gt;&gt;</span>
                          </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Line */}
            <BlackLine className="mt-8" />
        </div>
    );
} 