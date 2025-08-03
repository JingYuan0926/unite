import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import HomePage from "@/components/HomePage";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="font-sans bg-white">
      {/* Header */}
      <Header />
      
      {/* Home Section */}
      <section id="home">
        <HomePage />
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works">
        <HowItWorks />
      </section>
      
      {/* Features Section */}
      <section id="features">
        <Features />
      </section>
    </div>
  );
}
