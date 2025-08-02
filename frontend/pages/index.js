import { Geist, Geist_Mono } from "next/font/google";
import LogoHeader from "@/components/LogoHeader";

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
      <div className="flex items-center justify-center min-h-screen p-8">
        <LogoHeader />
      </div>
      
      {/* How It Works Section */}
      <div className="flex items-center justify-center min-h-screen p-8 bg-white">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-500 mb-2">HOW IT WORKS</p>
        </div>
      </div>
    </div>
  );
}
