import React from "react";
import BlackLine from "@/components/BlackLine";

export default function Features() {
  const features = [
    {
      icon: "🧠",
      title: "Simple Agent Workflows",
      description: "Easily create and manage AI agent workflows with intuitive APIs.",
      link: "Learn more >"
    },
    {
      icon: "👥",
      title: "Multi-Agent Systems",
      description: "Build complex systems with multiple AI agents working together.",
      link: "Learn more >"
    },
    {
      icon: "🔌",
      title: "Tool Integration",
      description: "Seamlessly integrate external tools and APIs into your agent workflows.",
      link: "Learn more >"
    },
    {
      icon: "🌐",
      title: "Cross-Language Support",
      description: "Available in all major programming languages for maximum flexibility.",
      link: "Learn more >"
    },
    {
      icon: "⚙️",
      title: "Customizable Agents",
      description: "Design and customize agents to fit your specific use case and requirements.",
      link: "Learn more >"
    },
    {
      icon: "⚡",
      title: "Efficient Execution",
      description: "Optimize agent performance with built-in efficiency and scalability features.",
      link: "Learn more >"
    }
  ];

  return (
    <div className="flex items-center justify-center p-8 bg-white">
      <div className="text-center w-full max-w-6xl">
        {/* Horizontal Line */}
        <BlackLine className="mb-8" />
        
        <p className="text-xl font-bold text-gray-500 mb-8">FEATURES</p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Icon */}
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">{feature.icon}</span>
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
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
                {feature.link}
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Line */}
      <BlackLine className="mt-8" />
    </div>
  );
} 