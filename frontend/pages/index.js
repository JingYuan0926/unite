import { Geist, Geist_Mono } from "next/font/google";
import HomePage from "@/components/HomePage";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
  return (
    <div className="font-sans bg-white">
      {/* Home Section */}
      <HomePage />
      
      {/* How It Works Section */}
      <HowItWorks />
    </div>
  );
}
