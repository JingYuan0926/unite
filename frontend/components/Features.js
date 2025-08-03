import React from "react";
import BlackLine from "@/components/BlackLine";
import {
  Package,
  Database,
  Brain,
  Globe,
  BarChart2,
  MessageSquare
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      title: "Easy Installation",
      description: "Install with a single npm command to access the entire platform.",
      link: "Learn more >"
    },
    {
      icon: <Database className="w-8 h-8 text-purple-600" />,
      title: "Full 1inch API Suite",
      description: "Access all 15 core 1inch endpoints programmatically in one package.",
      link: "Learn more >"
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Agent",
      description: "Natural-language trading and smart routing with ChatGPT integration.",
      link: "Learn more >"
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      title: "Fusion+ Cross-Chain",
      description: "Seamless bridging between EVM networks, Tron and XRP.",
      link: "Learn more >"
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-600" />,
      title: "Visual Dashboard",
      description: "Interactive charts and tables for portfolio, swaps, NFTs and more.",
      link: "Learn more >"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Chat Interface",
      description: "No-code ChatGPT UI for non-technical users to interact easily.",
      link: "Learn more >"
    }
  ];

  return (
    <div className="flex items-center justify-center p-8 bg-white">
      <div className="text-center w-full max-w-6xl">
        {/* Top Line */}
        <BlackLine className="mb-8" />

        <p className="text-xl font-bold text-gray-500 mb-8">FEATURES</p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Learn More Link */}
              <a
                href="https://1inch-agent-kit.gitbook.io/1inch-agent-kit-docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
              >
                {feature.link}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Line */}
        <BlackLine className="mt-8" />
      </div>
    </div>
  );
}
