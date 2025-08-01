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
    <div
      className={"font-sans flex items-center justify-center min-h-screen bg-white p-8"}
    >
      {/* Centered content with logo and text side by side */}
      <LogoHeader />
    </div>
  );
}
