import { Geist, Geist_Mono } from "next/font/google";
import HomePage from "@/components/HomePage";
import HowItWorks from "@/components/HowItWorks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
