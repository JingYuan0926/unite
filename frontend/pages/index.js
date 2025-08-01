import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

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
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans flex items-center justify-center min-h-screen bg-white p-8`}
    >
      {/* Centered content with text above logo */}
      <div className="flex flex-col items-center gap-8">
        <Image
          src="/1inch_color_black.svg"
          alt="1inch logo"
          width={300}
          height={140}
          priority
        />
         <h1 className="text-7xl font-bold text-gray-900">Agent Kit</h1>
      </div>
    </div>
  );
}
