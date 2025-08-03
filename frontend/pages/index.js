import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import HomePage from "@/components/HomePage";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";

export default function Home() {
  // Animation variants for different entrance effects
  const fadeInFromBottom = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const fadeInFromTop = {
    hidden: {
      opacity: 0,
      y: -30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const fadeInFromLeft = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Head>
        <title>1inch Agent Platform</title>
        <meta
          name="description"
          content="Harness 15 unified 1inch APIs through a developer-ready Agent Kit and an AI NLP web app"
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <meta name="theme-color" content="#1B314F" />
      </Head>

      <motion.div
        className="font-sans bg-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          variants={fadeInFromTop}
          initial="hidden"
          animate="visible"
        >
          <Header />
        </motion.header>

        {/* Home Section */}
        <motion.section
          id="home"
          variants={fadeInFromBottom}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <HomePage />
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInFromBottom}
        >
          <HowItWorks />
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInFromBottom}
        >
          <Features />
        </motion.section>
      </motion.div>
    </>
  );
}
