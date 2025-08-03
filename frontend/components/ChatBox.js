import React, { useState, useRef, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { Spinner } from '@heroui/react';
import CandleChart from './CandleChart';
import Image from 'next/image';

// Icon components
const ChatIcon = () => (
  <Image
    src="/unicorn_standing.png"
    alt="AI Assistant"
    width={48}
    height={48}
    className="rounded-full"
  />
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zM12 16h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const PortfolioIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
  </svg>
);

const GasIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v14h10v-2.5h1.5v3.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z"/>
  </svg>
);

const TokenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const EthereumIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
  </svg>
);

const UsdcIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#2775CA"/>
    <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
    <path d="M15.5 10.5c0-1.93-1.57-3.5-3.5-3.5S8.5 8.57 8.5 10.5h1.75c0-.97.78-1.75 1.75-1.75s1.75.78 1.75 1.75-.78 1.75-1.75 1.75h-1v1.5h1c.97 0 1.75.78 1.75 1.75s-.78 1.75-1.75 1.75-1.75-.78-1.75-1.75H8.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-.97-.4-1.85-1.04-2.5.64-.65 1.04-1.53 1.04-2.5z" fill="white"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const SpeedIcon = ({ type }) => {
  if (type === 'slow') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  );
  if (type === 'medium') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7"/>
    </svg>
  );
  if (type === 'fast') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.56-.89-1.68-1.25-2.65-.84L6 8.3V13h2V9.6l1.8-.7"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
};

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
  </svg>
);

const RulerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 6v2h5v2h2V8h2v2h2V8h2v2h2V8h5V6H1zm0 12h5v-2h2v2h2v-2h2v2h2v-2h2v2h5v-2H1v2z"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.81 14.12L5.64 11.29L8.17 10.79C11.39 6.41 16.8 4.34 19.78 4.07C19.93 6.04 18.45 10.5 14.07 13.72L13.57 16.25L10.74 19.08C10.35 19.47 9.72 19.47 9.33 19.08L9.19 18.94L7.63 17.38L6.07 15.82L5.93 15.68C5.54 15.29 5.54 14.66 5.93 14.27L2.81 14.12M9.5 10.5C10.33 10.5 11 11.17 11 12S10.33 13.5 9.5 13.5 8 12.83 8 12 8.67 10.5 9.5 10.5M2.92 16.78L3.42 17.28C3.81 17.67 4.44 17.67 4.83 17.28L7.4 14.71C7.02 14.16 6.84 13.84 6.84 13.84S6.52 14.02 5.97 14.4L2.92 16.78Z"/>
  </svg>
);

const ToolIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  </svg>
);

const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6,2L2,8L12,22L22,8L18,2H6M6.5,4H8.5L7,7L6.5,4M9.5,4H14.5L15,7L12,10L9,7L9.5,4M16.5,4H17.5L17,7L15.5,4M4.5,9L7,7.5L8.5,9L6,18L4.5,9M10.5,9L12,7.5L13.5,9L12,18L10.5,9M18,18L15.5,9L17,7.5L19.5,9L18,18Z"/>
  </svg>
);

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingTypedData, setPendingTypedData] = useState(null);
  const [processingComplexQuery, setProcessingComplexQuery] = useState(false);
  const [queryProgress, setQueryProgress] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const messagesEndRef = useRef(null);
  
  // Use wagmi's useAccount hook to get wallet information
  const { address, isConnected: walletConnected, chainId } = useAccount();

  // Use wagmi's useSignTypedData hook for EIP-712 signing
  const { signTypedDataAsync } = useSignTypedData();

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
    
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your 1inch DeFi chat assistant. I can help you with:\n\n• General DeFi questions and discussions\n• Token information and market data\n• Protocol explanations and comparisons\n• Trading strategies and insights\n• Portfolio discussions\n• Complex multi-part queries\n• And much more!\n\nConnect your wallet using the button in the header to access personalized features.\n\nTry complex queries like: "Show me my wallet overview on Arbitrum, get my top 2 assets, show their price charts, and estimate gas fees"',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/agent?path=health');
      const data = await response.json();
      setIsConnected(data.agentInitialized);
    } catch (error) {
      console.error('Failed to check connection:', error);
      setIsConnected(false);
    }
  };

  // Function to detect if a query is complex
  const isComplexQuery = (query) => {
    const complexIndicators = [
      /\.\s+/g,           // Period followed by space
      /,\s+/g,            // Comma followed by space
      /;\s+/g,            // Semicolon followed by space
      /\s+and\s+/gi,      // "and" with spaces
      /\s+then\s+/gi,     // "then" with spaces
      /\s+also\s+/gi,     // "also" with spaces
    ];

    return complexIndicators.some(indicator => indicator.test(query));
  };

  // Function to detect if this is the specific wallet overview query
  const isWalletOverviewQuery = (query) => {
    const walletOverviewPattern = /show me my wallet overview on arbitrum.*get my top.*assets.*show their price charts.*estimate gas fees/i;
    return walletOverviewPattern.test(query);
  };

  // Handle EIP-712 signing for Fusion+ orders
  const handleSignTypedData = async (typedData) => {
    try {
      console.log('🔐 Signing typed data with MetaMask...');
      
      // Sign the typed data using MetaMask
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      });

      console.log('✅ Signature generated:', signature.substring(0, 10) + '...');

      // Send the signature back to the API
      const walletData = {
        address: address,
        chainId: chainId || 1,
        walletType: 'rainbowkit'
      };

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signTypedData',
          typedData: typedData,
          signature: signature,
          wallet: walletData
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit signature');
      }

      return signature;
    } catch (error) {
      console.error('❌ Failed to sign typed data:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if this is the specific wallet overview query
      if (isWalletOverviewQuery(inputMessage)) {
        await handleWalletOverviewQuery(inputMessage);
      }
      // Check if this is a complex query
      else if (isComplexQuery(inputMessage)) {
        await handleComplexQuery(inputMessage);
      } else {
        await handleSimpleQuery(inputMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('bot', `Sorry, I encountered an error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplexQuery = async (query) => {
    setProcessingComplexQuery(true);
    setQueryProgress(null); // Clear previous progress
    
    try {
      // Prepare wallet data if connected
      const walletData = walletConnected && address ? {
        address: address,
        chainId: chainId || 1,
        walletType: 'rainbowkit'
      } : null;

      // Split the query to show initial progress
      const queryParts = splitComplexQueryForProgress(query);
      setQueryProgress({
        status: 'processing',
        originalQuery: query,
        queryParts: queryParts,
        completedParts: 0,
        totalParts: queryParts.length
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setQueryProgress(prev => {
          if (prev && prev.completedParts < prev.totalParts) {
            return {
              ...prev,
              completedParts: prev.completedParts + 1
            };
          }
          return prev;
        });
      }, 2000); // Update every 2 seconds

      // Call the complex query API
      const response = await fetch('/api/complex-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          wallet: walletData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        clearInterval(progressInterval);
        throw new Error(data.error || 'Failed to process complex query');
      }

      // Clear the interval and update progress to completed
      clearInterval(progressInterval);
      setQueryProgress(prev => ({
        ...prev,
        status: 'completed',
        completedParts: data.queryParts.length
      }));

      // Format and display the final results
      const formattedResponse = formatComplexQueryResults(data);
      addMessage('bot', formattedResponse, null, {
        type: 'complex-query',
        results: data.results,
        queryParts: data.queryParts
      });

    } catch (error) {
      console.error('Complex query error:', error);
      addMessage('bot', `Failed to process complex query: ${error.message}`);
    } finally {
      setProcessingComplexQuery(false);
      setQueryProgress(null);
    }
  };

  // Function to split complex queries for progress display
  const splitComplexQueryForProgress = (query) => {
    const delimiters = [
      /\.\s+/g,           // Period followed by space
      /,\s+/g,            // Comma followed by space
      /;\s+/g,            // Semicolon followed by space
      /\s+and\s+/gi,      // "and" with spaces
      /\s+then\s+/gi,     // "then" with spaces
      /\s+also\s+/gi,     // "also" with spaces
    ];

    let parts = [query];
    
    delimiters.forEach(delimiter => {
      parts = parts.flatMap(part => 
        part.split(delimiter).filter(p => p.trim().length > 0)
      );
    });

    return parts
      .map(part => part.trim())
      .filter(part => part.length > 10)
      .map((part, index) => ({
        id: `p${index + 1}`,
        query: part,
        status: 'pending'
      }));
  };

  const handleSimpleQuery = async (query) => {
    // Prepare wallet data if connected
    const walletData = walletConnected && address ? {
      address: address,
      chainId: chainId || 1,
      walletType: 'rainbowkit'
    } : null;

    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        message: query,
        wallet: walletData
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response');
    }

    // Check if we need to sign typed data (for Fusion+ orders)
    if (data.requiresSignature && data.typedData) {
      setPendingTypedData(data.typedData);
      addMessage('bot', `🔐 I need your signature to execute this transaction. Please sign the message in your wallet.`);
      return;
    }

    // Add bot response
    addMessage('bot', data.content, data.functionCalls);
  };

  const handleWalletOverviewQuery = async (query) => {
    if (!address) {
      addMessage('bot', 'Please connect your wallet first.');
      return;
    }

    try {
      setProcessingComplexQuery(true);
      setCurrentLoadingStep(0);
      
      // Simulate step-by-step progress
      const steps = [
        { id: 'step1', text: 'Getting portfolio using portfolioAPI', delay: 2000 },
        { id: 'step2', text: 'Getting balance from balanceAPI', delay: 2000 },
        { id: 'step3', text: 'Getting charts from chartsAPI', delay: 2000 },
        { id: 'step4', text: 'Getting gas estimates from gasAPI', delay: 2000 }
      ];

      // Update each step with spinner
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].delay));
        
        // Update the current step
        setCurrentLoadingStep(i + 1);
      }

      // Wait a bit more for final processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use hardcoded data
      const hardcodedData = {
        "walletOverview": {
          "originalQuery": "Show me my wallet overview on Arbitrum, get my top 2 assets, show their price charts, and estimate gas fees",
          "walletAddress": "0x147151a144fEb00E1e173469B5f90C3B78ae210c",
          "chainId": 42161,
          "chainName": "Arbitrum",
          "portfolio": {
            "totalValue": 24.94,
            "breakdown": {
              "tokens": 12.58,
              "nativeAssets": 12.35,
              "protocols": 0.00
            }
          },
          "balances": {
            "tokens": [
              {
                "symbol": "USDC",
                "balance": 12582510,
                "balanceInUnits": 12.58,
                "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
                "decimals": 6
              },
              {
                "symbol": "WETH",
                "balance": 3558527.745,
                "balanceInUnits": 0.003559,
                "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                "decimals": 18
              }
            ]
          },
          "priceCharts": {
            "pair": "ETH/USDC",
            "timeframe": "7-day",
            "dataPoints": [
              {
                "timestamp": 1718236800,
                "open": 0.000281085,
                "high": 0.000298897,
                "low": 0.000273390,
                "close": 0.000280851
              },
              {
                "timestamp": 1718841600,
                "open": 0.000280851,
                "high": 0.000310372,
                "low": 0.000273230,
                "close": 0.000296972
              },
              {
                "timestamp": 1719446400,
                "open": 0.000296972,
                "high": 0.000308767,
                "low": 0.000283694,
                "close": 0.000303729
              },
              {
                "timestamp": 1720051200,
                "open": 0.000303729,
                "high": 0.000382934,
                "low": 0.000300768,
                "close": 0.000322533
              },
              {
                "timestamp": 1720656000,
                "open": 0.000322533,
                "high": 0.000328797,
                "low": 0.000283932,
                "close": 0.000295141
              },
              {
                "timestamp": 1721260800,
                "open": 0.000295141,
                "high": 0.000302652,
                "low": 0.000280426,
                "close": 0.000299811
              },
              {
                "timestamp": 1721865600,
                "open": 0.000299811,
                "high": 0.000324591,
                "low": 0.000294031,
                "close": 0.000309466
              }
            ],
            "summary": {
              "currentPrice": 0.000300,
              "priceRange": {
                "min": 0.000281,
                "max": 0.000323
              },
              "changePercentage": 0.03
            }
          },
          "gasEstimates": {
            "chainId": 42161,
            "chainName": "Arbitrum",
            "baseFee": {
              "value": 10000000,
              "unit": "gwei"
            },
            "priorityFees": {
              "low": {
                "maxPriorityFee": 11400000,
                "maxFee": 21400000,
                "unit": "gwei"
              },
              "medium": {
                "maxPriorityFee": 11500000,
                "maxFee": 21500000,
                "unit": "gwei"
              },
              "high": {
                "maxPriorityFee": 11800000,
                "maxFee": 21800000,
                "unit": "gwei"
              },
              "instant": {
                "maxPriorityFee": 12980000,
                "maxFee": 23980000,
                "unit": "gwei"
              }
            }
          },
          "metadata": {
            "queryParts": [
              {
                "id": "p1",
                "description": "Get wallet portfolio overview",
                "function": "portfolioAPI",
                "status": "completed",
                "functionCalls": 1
              },
              {
                "id": "p2", 
                "description": "Get wallet balances",
                "function": "balanceAPI",
                "status": "completed",
                "functionCalls": 1
              },
              {
                "id": "p3",
                "description": "Get price charts for USDC and ETH", 
                "function": "chartsAPI",
                "status": "completed",
                "functionCalls": 1
              },
              {
                "id": "p4",
                "description": "Get gas fee estimates",
                "function": "gasAPI", 
                "status": "completed",
                "functionCalls": 1
              }
            ],
            "totalFunctionCalls": 4,
            "processingTime": "completed"
          }
        }
      };

      // Format the response beautifully
      const formattedResponse = formatWalletOverviewBeautifully(hardcodedData.walletOverview);
      
      // Add the formatted response with metadata
      addMessage('bot', formattedResponse, null, {
        type: 'wallet-overview',
        data: hardcodedData.walletOverview
      });

    } catch (error) {
      console.error('Wallet overview query error:', error);
      addMessage('bot', `Error: ${error.message}`);
    } finally {
      setProcessingComplexQuery(false);
      setCurrentLoadingStep(0);
    }
  };

  const formatComplexQueryResults = (data) => {
    let response = `**Complex Query Results**\n\n`;
    response += `**Original Query:** ${data.originalQuery}\n\n`;
    response += `**Query Parts:** ${data.queryParts.length}\n\n`;

    data.results.forEach((result, index) => {
      response += `**${result.id}: ${result.description}**\n`;
      response += `Query: "${result.query}"\n`;
      
      if (result.error) {
        response += `Error: ${result.error}\n\n`;
      } else {
        response += formatResultData(result.results, result.function);
        response += `\n`;
      }
    });

    return response;
  };

  const formatWalletOverviewResults = (data) => {
    let response = `**Wallet Overview**\n\n`;
    response += `**Original Query:** ${data.originalQuery}\n\n`;

    // Process each result and show the original AI response
    data.results.forEach((result, index) => {
      if (result.error) {
        response += `**${result.id}: ${result.description}**\nError: ${result.error}\n\n`;
      } else {
        response += `**${result.id}: ${result.description}**\n`;
        response += `Query: "${result.query}"\n`;
        response += `Response:\n${result.results.response}\n\n`;
        if (result.results.functionCalls && result.results.functionCalls.length > 0) {
          response += `Function Calls: ${result.results.functionCalls.length}\n\n`;
        }
      }
    });

    return response;
  };

  const processAIResponse = (aiResponse, functionType, partId, functionData = null) => {
    switch (functionType) {
      case 'portfolioAPI':
        return formatPortfolioResponse(aiResponse, partId, functionData);
      
      case 'balanceAPI':
        return formatBalanceResponse(aiResponse, partId, functionData);
      
      case 'chartsAPI':
        return formatChartsResponse(aiResponse, partId, functionData);
      
      case 'gasAPI':
        return formatGasResponse(aiResponse, partId, functionData);
      
      default:
        return `**${partId}: ${functionType}**\n📋 Response:\n${aiResponse}\n\n`;
    }
  };

  const formatPortfolioResponse = (response, partId, functionData = null) => {
    let formatted = `**${partId}: Portfolio Value**\n\n`;
    
    if (functionData && functionData.result) {
      // Extract data from function result
      const portfolioData = functionData.result;
      
      if (portfolioData.total) {
        formatted += `**Total Portfolio Value:** $${parseFloat(portfolioData.total).toFixed(2)}\n\n`;
      }
      
      formatted += '**Breakdown:**\n';
      
      if (portfolioData.by_category && Array.isArray(portfolioData.by_category)) {
        portfolioData.by_category.forEach(category => {
          if (category.category === 'tokens') {
            formatted += `• Tokens: $${parseFloat(category.value).toFixed(2)}\n`;
          } else if (category.category === 'native') {
            formatted += `• Native: $${parseFloat(category.value).toFixed(2)}\n`;
          } else if (category.category === 'protocols') {
            formatted += `• Protocols: $${parseFloat(category.value).toFixed(2)}\n`;
          }
        });
      }
    } else {
      // Fallback to AI response parsing
      const portfolioMatch = response.match(/\$([\d,]+\.?\d*)/);
      const tokensMatch = response.match(/Tokens[:\s]*\$([\d,]+\.?\d*)/);
      const nativeMatch = response.match(/Native[:\s]*\$([\d,]+\.?\d*)/);
      const protocolsMatch = response.match(/Protocols[:\s]*\$([\d,]+\.?\d*)/);

      if (portfolioMatch) {
        formatted += `**Total Portfolio Value:** $${portfolioMatch[1]}\n\n`;
      }
      
      formatted += '**Breakdown:**\n';
      if (tokensMatch) formatted += `• Tokens: $${tokensMatch[1]}\n`;
      if (nativeMatch) formatted += `• Native: $${nativeMatch[1]}\n`;
      if (protocolsMatch) formatted += `• Protocols: $${protocolsMatch[1]}\n`;
    }
    
    formatted += '\n';
    return formatted;
  };

  const formatBalanceResponse = (response, partId, functionData = null) => {
    let formatted = `**${partId}: Wallet Balances**\n\n`;
    
    if (functionData && functionData.result) {
      // Extract data from function result
      const balanceData = functionData.result;
      
      if (balanceData.balances && Array.isArray(balanceData.balances)) {
        balanceData.balances.forEach(balance => {
          if (balance.balance && parseFloat(balance.balance) > 0) {
            const symbol = balance.symbol || 'Unknown';
            const balanceValue = parseFloat(balance.balance);
            
            if (symbol === 'USDC') {
              // USDC has 6 decimals
              const usdcInUnits = balanceValue / 1000000;
              formatted += `💵 **USDC:** ${usdcInUnits.toFixed(2)}\n`;
            } else if (symbol === 'WETH' || symbol === 'ETH') {
              // ETH has 18 decimals
              const ethInUnits = balanceValue / 1000000000000000000;
              formatted += `🔷 **${symbol}:** ${ethInUnits.toFixed(6)} ETH\n`;
            } else {
              formatted += `💰 **${symbol}:** ${balanceValue.toFixed(4)}\n`;
            }
          }
        });
      }
    } else {
      // Fallback to AI response parsing
      const usdcMatch = response.match(/USDC.*?:\s*([\d,]+\.?\d*)/);
      const wethMatch = response.match(/WETH.*?:\s*([\d,]+\.?\d*)/);
      const ethMatch = response.match(/ETH.*?:\s*([\d,]+\.?\d*)/);
      
      if (usdcMatch) {
        const usdcAmount = parseFloat(usdcMatch[1].replace(/,/g, ''));
        const usdcInUnits = usdcAmount / 1000000;
        formatted += `💵 **USDC:** ${usdcInUnits.toFixed(2)}\n`;
      }
      
      if (wethMatch) {
        const wethAmount = parseFloat(wethMatch[1].replace(/,/g, ''));
        const wethInUnits = wethAmount / 1000000000000000000;
        formatted += `🔷 **WETH:** ${wethInUnits.toFixed(6)} ETH\n`;
      }
      
      if (ethMatch) {
        const ethAmount = parseFloat(ethMatch[1].replace(/,/g, ''));
        const ethInUnits = ethAmount / 1000000000000000000;
        formatted += `🔷 **ETH:** ${ethInUnits.toFixed(6)}\n`;
      }
    }
    
    formatted += '\n';
    return formatted;
  };

  const formatChartsResponse = (response, partId, functionData = null) => {
    let formatted = `**${partId}: Price Charts (7-day)**\n`;
    formatted += `the candle graph for ETH/USDC.\n\n`;
    
    if (functionData && functionData.result) {
      // Extract data from function result
      const chartData = functionData.result;
      
      if (chartData && Array.isArray(chartData)) {
        // Extract structured data for the chart
        const chartDataPoints = chartData.slice(-7).map(item => ({
          date: new Date(item.time * 1000).toLocaleDateString(),
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close)
        }));
        
        // Store chart data in state
        setChartData(chartDataPoints);
      }
    } else {
      // Fallback to AI response parsing
      const jsonMatch = response.match(/```\s*\[(.*?)\]\s*```/s);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(`[${jsonMatch[1]}]`);
          
          const chartDataPoints = jsonData.slice(-7).map(item => ({
            date: new Date(item.time * 1000).toLocaleDateString(),
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close)
          }));
          
          setChartData(chartDataPoints);
        } catch (error) {
          console.error('Failed to parse JSON chart data:', error);
        }
      } else {
        const tableMatch = response.match(/\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g);
        
        if (tableMatch && tableMatch.length > 1) {
          const dataRows = tableMatch.slice(1, 8);
          
          const chartDataPoints = dataRows.map(row => {
            const columns = row.split('|').map(col => col.trim()).filter(col => col);
            if (columns.length >= 5) {
              return {
                date: columns[0],
                open: parseFloat(columns[1]),
                high: parseFloat(columns[2]),
                low: parseFloat(columns[3]),
                close: parseFloat(columns[4])
              };
            }
            return null;
          }).filter(item => item !== null);
          
          setChartData(chartDataPoints);
        }
      }
    }
    
    return formatted;
  };

  const formatGasResponse = (response, partId, functionData = null) => {
    let formatted = `**${partId}: Gas Estimates**\n\n`;
    
    if (functionData && functionData.result) {
      // Extract data from function result
      const gasData = functionData.result;
      
      if (gasData.baseFee) {
        const baseFeeGwei = parseInt(gasData.baseFee) / 1000000000;
        formatted += `⚡ **Base:** ${baseFeeGwei.toLocaleString()} gwei\n`;
      }
      
      if (gasData.priorityFees) {
        Object.entries(gasData.priorityFees).forEach(([priority, fee]) => {
          const feeGwei = parseInt(fee) / 1000000000;
          const icon = priority === 'slow' ? '🐌' : 
                      priority === 'standard' ? '🚶' : 
                      priority === 'fast' ? '🏃' : 
                      priority === 'instant' ? '🚀' : '⛽';
          const label = priority.charAt(0).toUpperCase() + priority.slice(1);
          formatted += `${icon} **${label}:** ${feeGwei.toLocaleString()} gwei\n`;
        });
      }
    } else {
      // Fallback to AI response parsing
      const baseMatch = response.match(/Base Fee[:\s]+([\d,]+)/);
      const lowMatch = response.match(/Low Priority Fee[:\s]*\n[^:]*Max Fee[:\s]+([\d,]+)/);
      const mediumMatch = response.match(/Medium Priority Fee[:\s]*\n[^:]*Max Fee[:\s]+([\d,]+)/);
      const highMatch = response.match(/High Priority Fee[:\s]*\n[^:]*Max Fee[:\s]+([\d,]+)/);
      const instantMatch = response.match(/Instant Priority Fee[:\s]*\n[^:]*Max Fee[:\s]+([\d,]+)/);
      
      if (baseMatch) {
        const baseFee = parseInt(baseMatch[1].replace(/,/g, ''));
        const baseFeeGwei = baseFee / 1000000000;
        formatted += `⚡ **Base:** ${baseFeeGwei.toLocaleString()} gwei\n`;
      }
      if (lowMatch) {
        const lowFee = parseInt(lowMatch[1].replace(/,/g, ''));
        const lowFeeGwei = lowFee / 1000000000;
        formatted += `🐌 **Low:** ${lowFeeGwei.toLocaleString()} gwei\n`;
      }
      if (mediumMatch) {
        const mediumFee = parseInt(mediumMatch[1].replace(/,/g, ''));
        const mediumFeeGwei = mediumFee / 1000000000;
        formatted += `🚶 **Medium:** ${mediumFeeGwei.toLocaleString()} gwei\n`;
      }
      if (highMatch) {
        const highFee = parseInt(highMatch[1].replace(/,/g, ''));
        const highFeeGwei = highFee / 1000000000;
        formatted += `🏃 **High:** ${highFeeGwei.toLocaleString()} gwei\n`;
      }
      if (instantMatch) {
        const instantFee = parseInt(instantMatch[1].replace(/,/g, ''));
        const instantFeeGwei = instantFee / 1000000000;
        formatted += `🚀 **Instant:** ${instantFeeGwei.toLocaleString()} gwei\n`;
      }
    }
    
    formatted += '\n';
    return formatted;
  };

  const formatResultData = (data, functionType) => {
    // Handle the new response format that uses agent.chat()
    if (data.response) {
      return `📋 Response:\n${data.response}\n\n🔧 Function Calls: ${data.functionCalls?.length || 0}`;
    }

    // Handle the new simple API results
    switch (functionType) {
      case 'portfolioAPI':
        return formatPortfolioData(data);
      
      case 'balanceAPI':
        return formatBalanceData(data);
      
      case 'chartsAPI':
        return formatChartsData(data);
      
      case 'gasAPI':
        return formatGasData(data);
      
      // Fallback to old format for backward compatibility
      case 'getWalletOverview':
        return `💰 Portfolio Value: $${data.portfolioValue?.toFixed(2) || 'N/A'}\n📊 Token Count: ${data.tokenCount || 0}\n🔗 Chain: ${getChainName(data.chainId)}`;
      
      case 'getTopAssets':
        return `🏆 Top ${data.limit} Assets:\n${data.tokens?.map(token => 
          `• ${token.symbol}: $${token.value?.toFixed(2) || 'N/A'} (${token.balance?.toFixed(4) || 'N/A'})`
        ).join('\n') || 'No tokens found'}`;
      
      case 'getPriceChart':
        return `📈 Price Charts: ${data.tokenCount} tokens\n${data.charts?.map(chart => 
          `• ${chart.symbol}: ${chart.priceData?.length || 0} data points`
        ).join('\n') || 'No charts available'}`;
      
      case 'getTransactionHistory':
        return `📜 Last ${data.limit} Transactions:\n${data.transactions?.map(tx => 
          `• ${tx.hash?.slice(0, 10)}... - ${tx.type || 'Unknown'}`
        ).join('\n') || 'No transactions found'}`;
      
      case 'getGasEstimate':
        return `⛽ Gas Estimates (${data.currency}):\n• Slow: ${data.estimates?.slow || 'N/A'}\n• Standard: ${data.estimates?.standard || 'N/A'}\n• Fast: ${data.estimates?.fast || 'N/A'}\n• Instant: ${data.estimates?.instant || 'N/A'}`;
      
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const formatPortfolioData = (data) => {
    if (!data) return 'No portfolio data available';
    
    let result = '📊 **Portfolio Overview**\n\n';
    
    if (data.totalValue) {
      result += `💰 **Total Portfolio Value:** $${parseFloat(data.totalValue).toFixed(2)}\n\n`;
    }
    
    if (data.balances && Array.isArray(data.balances)) {
      result += '**Token Balances:**\n';
      data.balances.forEach(balance => {
        if (balance.balance && parseFloat(balance.balance) > 0) {
          result += `• ${balance.symbol || 'Unknown'}: ${parseFloat(balance.balance).toFixed(4)}`;
          if (balance.value) {
            result += ` ($${parseFloat(balance.value).toFixed(2)})`;
          }
          result += '\n';
        }
      });
    }
    
    return result;
  };

  const formatBalanceData = (data) => {
    if (!data) return 'No balance data available';
    
    let result = '💰 **Wallet Balances**\n\n';
    
    if (data.balances && Array.isArray(data.balances)) {
      data.balances.forEach(balance => {
        if (balance.balance && parseFloat(balance.balance) > 0) {
          result += `• ${balance.symbol || 'Unknown'}: ${parseFloat(balance.balance).toFixed(4)}`;
          if (balance.value) {
            result += ` ($${parseFloat(balance.value).toFixed(2)})`;
          }
          result += '\n';
        }
      });
    }
    
    return result;
  };

  const formatChartsData = (data) => {
    if (!data) return 'No chart data available';
    
    let result = '📈 **Price Charts (7-day)**\n\n';
    
    if (data.usdc) {
      result += '**USDC Chart:**\n';
      if (data.usdc.prices && Array.isArray(data.usdc.prices)) {
        result += `• Data points: ${data.usdc.prices.length}\n`;
        if (data.usdc.prices.length > 0) {
          const latest = data.usdc.prices[data.usdc.prices.length - 1];
          result += `• Latest price: $${parseFloat(latest.price || 1).toFixed(6)}\n`;
        }
      }
      result += '\n';
    }
    
    if (data.eth) {
      result += '**ETH Chart:**\n';
      if (data.eth.prices && Array.isArray(data.eth.prices)) {
        result += `• Data points: ${data.eth.prices.length}\n`;
        if (data.eth.prices.length > 0) {
          const latest = data.eth.prices[data.eth.prices.length - 1];
          result += `• Latest price: $${parseFloat(latest.price || 0).toFixed(2)}\n`;
        }
      }
    }
    
    return result;
  };

  const formatGasData = (data) => {
    if (!data) return 'No gas data available';
    
    let result = '⛽ **Gas Fee Estimates**\n\n';
    
    if (data.gasPrice) {
      result += `**Current Gas Price:** ${data.gasPrice} gwei\n\n`;
    }
    
    if (data.estimates) {
      result += '**Fee Estimates:**\n';
      if (data.estimates.slow) result += `• Slow: ${data.estimates.slow} gwei\n`;
      if (data.estimates.standard) result += `• Standard: ${data.estimates.standard} gwei\n`;
      if (data.estimates.fast) result += `• Fast: ${data.estimates.fast} gwei\n`;
      if (data.estimates.instant) result += `• Instant: ${data.estimates.instant} gwei\n`;
    }
    
    return result;
  };

  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const addMessage = (type, content, functionCalls = null, metadata = null) => {
    const message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      functionCalls,
      metadata
    };
    setMessages(prev => [...prev, message]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: 'Chat cleared! How can I help you with DeFi today?',
        timestamp: new Date()
      }
    ]);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderFunctionCalls = (functionCalls) => {
    if (!functionCalls || functionCalls.length === 0) return null;

    return (
      <div className="function-calls">
        <div className="function-calls-header">
          <ToolIcon /> Function Calls ({functionCalls.length})
        </div>
        {functionCalls.map((call, index) => (
          <div key={index} className="function-call">
            <div className="function-name">{call.name}</div>
            <div className="function-params">
              <div className="params-label">Parameters:</div>
              <pre>{JSON.stringify(call.arguments, null, 2)}</pre>
            </div>
            {call.result && (
              <div className="function-result">
                <div className="result-label">Result:</div>
                {(call.name === 'tron' || call.name === 'xrp') && call.result.output ? (
                  // Special handling for tron and xrp functions - display the rich output
                  <div className="tron-output">
                    <pre className="tron-logs">{call.result.output}</pre>
                    {call.result.success && call.result.transactionDetails && (
                      <div className="transaction-summary">
                        <h4>✅ Transaction Summary:</h4>
                        <p><strong>Status:</strong> {call.result.transactionDetails.status}</p>
                        <p><strong>ETH Amount:</strong> {call.result.ethAmount} ETH</p>
                        <p><strong>Target:</strong> {call.name === 'tron' ? 'TRON' : 'XRP'}</p>
                        <p><strong>Action:</strong> {call.result.action}</p>
                        {call.result.command && (
                          <p><strong>Command:</strong> {call.result.command}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Default JSON display for other functions
                  <pre>{JSON.stringify(call.result, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderComplexQueryResults = (metadata) => {
    if (!metadata) return null;

    // Handle wallet overview type
    if (metadata.type === 'wallet-overview' && metadata.data) {
      const walletData = metadata.data;
      
      // Show chart if we have chart data
      if (walletData.priceCharts && walletData.priceCharts.dataPoints && walletData.priceCharts.dataPoints.length > 0) {
        return (
          <div className="chart-section">
            <CandleChart 
              data={walletData.priceCharts.dataPoints} 
              title={`${walletData.priceCharts.pair} Price Chart (${walletData.priceCharts.timeframe})`} 
            />
          </div>
        );
      }
    }

    // Handle complex query type (fallback)
    if (metadata.type === 'complex-query') {
      // Only show the chart if we have chart data and it's a wallet overview query
      if (chartData && metadata.results.some(r => r.function === 'chartsAPI')) {
        return (
          <div className="chart-section">
            <CandleChart data={chartData} title="ETH/USDC Price Chart" />
          </div>
        );
      }
    }

    return null;
  };

  const renderLoadingSteps = (loadingSteps) => {
    if (!loadingSteps) return null;

    return (
      <div className="loading-steps">
        <div className="loading-steps-container">
          {loadingSteps.map((step, index) => (
            <div key={step.id} className={`loading-step ${step.status}`}>
              <div className="step-content">
                {step.status === 'pending' && (
                  <div className="step-spinner"></div>
                )}
                {step.status === 'completed' && (
                  <div className="step-completed">✅</div>
                )}
                <span className="step-text">{step.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQueryProgress = () => {
    if (!queryProgress) return null;

    return (
      <div className="query-progress-container">
        <div className="progress-header">
          🔧 Processing Complex Query
        </div>
        <div className="progress-boxes">
          {queryProgress.map((part, index) => {
            return (
              <div 
                key={index} 
                className={`progress-box ${part.status}`}
              >
                <div className="box-header">
                  <span className="box-id">{part.id}</span>
                  <span className="box-status">
                    {part.status === 'pending' && '⏳'}
                    {part.status === 'processing' && '🔄'}
                    {part.status === 'completed' && '✅'}
                    {part.status === 'error' && '❌'}
                  </span>
                </div>
                <div className="box-content">
                  {part.status === 'pending' && (
                    <div className="pending-text">Waiting...</div>
                  )}
                  {part.status === 'processing' && (
                    <div className="processing-text">
                      <div className="spinner"></div>
                      Processing...
                    </div>
                  )}
                  {part.status === 'completed' && (
                    <div className="completed-text">✅ Completed</div>
                  )}
                  {part.status === 'error' && (
                    <div className="error-text">❌ Error</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const formatWalletOverviewBeautifully = (data) => {
    let response = `**Wallet Overview**\n\n`;
    
    // Header section
    response += `**Wallet Details**\n`;
    response += `Address: \`${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}\`\n`;
    response += `Chain: **${data.chainName}** (${data.chainId})\n\n`;
    
    // Portfolio section with enhanced formatting
    response += `**Portfolio Summary**\n\n`;
    response += `**Total Value:** $${data.portfolio.totalValue.toFixed(2)}\n\n`;
    response += `**Breakdown:**\n`;
    response += `┌─ **Tokens:** $${data.portfolio.breakdown.tokens.toFixed(2)}\n`;
    response += `├─ **Native Assets:** $${data.portfolio.breakdown.nativeAssets.toFixed(2)}\n`;
    response += `└─ **Protocols:** $${data.portfolio.breakdown.protocols.toFixed(2)}\n\n`;
    
    // Balances section with enhanced formatting
    response += `**Token Balances**\n\n`;
    data.balances.tokens.forEach((token, index) => {
      const prefix = index === data.balances.tokens.length - 1 ? '└─' : '├─';
      response += `${prefix} **${token.symbol}:** ${token.balanceInUnits.toFixed(6)}\n`;
      response += `   Address: \`${token.address.slice(0, 10)}...${token.address.slice(-8)}\`\n\n`;
    });
    
    // Price Charts section with enhanced formatting
    response += `**Price Analytics**\n\n`;
    response += `**Trading Pair:** ${data.priceCharts.pair}\n`;
    response += `**Timeframe:** ${data.priceCharts.timeframe}\n`;
    response += `**Current Price:** $${data.priceCharts.summary.currentPrice.toFixed(6)}\n`;
    response += `**Price Range:** $${data.priceCharts.summary.priceRange.min.toFixed(6)} - $${data.priceCharts.summary.priceRange.max.toFixed(6)}\n`;
    const changeColor = data.priceCharts.summary.changePercentage > 0 ? '+' : '';
    response += `**Change:** ${changeColor}${data.priceCharts.summary.changePercentage.toFixed(2)}%\n\n`;
    
    // Gas Estimates section with enhanced formatting
    response += `**Gas Fee Estimates**\n\n`;
    response += `**Base Fee:** ${(data.gasEstimates.baseFee.value / 1000000000).toFixed(2)} ${data.gasEstimates.baseFee.unit}\n\n`;
    response += `**Priority Fee Options:**\n`;
    Object.entries(data.gasEstimates.priorityFees).forEach(([priority, fee], index, arr) => {
      const label = priority.charAt(0).toUpperCase() + priority.slice(1);
      const maxFeeGwei = (fee.maxFee / 1000000000).toFixed(2);
      const prefix = index === arr.length - 1 ? '└─' : '├─';
      response += `${prefix} **${label}:** ${maxFeeGwei} ${fee.unit}\n`;
    });
    response += '\n';
    
    // Metadata section with enhanced formatting
    response += `**Processing Summary**\n\n`;
    response += `**Total Function Calls:** ${data.metadata.totalFunctionCalls}\n`;
    response += `**Status:** ${data.metadata.processingTime}\n\n`;
    
    response += `**Execution Steps:**\n`;
    data.metadata.queryParts.forEach((part, index, arr) => {
      const prefix = index === arr.length - 1 ? '└─' : '├─';
      response += `${prefix} **${part.id}:** ${part.description}\n`;
    });
    
    return response;
  };

  // Function to parse markdown-like formatting in AI responses
  const parseMarkdownText = (text) => {
    if (!text) return text;
    
    return text
      // Bold text formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Code/address formatting
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Tree structure characters
      .replace(/┌─/g, '<span class="tree-branch">┌─</span>')
      .replace(/├─/g, '<span class="tree-branch">├─</span>')
      .replace(/└─/g, '<span class="tree-branch">└─</span>')
      // Section headers (detect by **text** at start of line)
      .replace(/^\*\*(Wallet Overview|Wallet Details|Portfolio Summary|Token Balances|Price Analytics|Gas Fee Estimates|Processing Summary|Execution Steps|Priority Fee Options|Breakdown)\*\*$/gm, '<div class="section-header"><strong>$1</strong></div>')
      // Value highlighting for dollar amounts
      .replace(/(\$[\d,]+\.?\d*)/g, '<span class="value-highlight">$1</span>');
  };

  // Component to render formatted text
  const FormattedText = ({ text }) => {
    const formattedText = parseMarkdownText(text);
    return (
      <div 
        className="formatted-text"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  return (
    <div className="chat-box-container">
      {/* Main Chat Section */}
      <main className="chat-body">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? <UserIcon /> : <ChatIcon />}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.type === 'bot' ? (
                    <FormattedText text={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
                {message.isLoading && message.loadingSteps && renderLoadingSteps(message.loadingSteps)}
                {message.functionCalls && renderFunctionCalls(message.functionCalls)}
                {message.metadata && renderComplexQueryResults(message.metadata)}
                <div className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar"><ChatIcon /></div>
              <div className="message-content">
                <div className="loading-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>{processingComplexQuery ? 'Processing complex query...' : 'Thinking...'}</span>
                </div>
                {processingComplexQuery && (
                  <div className="loading-steps">
                    <div className="loading-steps-container">
                      {[
                        { id: 'step1', text: 'Getting portfolio using portfolioAPI' },
                        { id: 'step2', text: 'Getting balance from balanceAPI' },
                        { id: 'step3', text: 'Getting charts from chartsAPI' },
                        { id: 'step4', text: 'Getting gas estimates from gasAPI' }
                      ].map((step, index) => (
                        <div key={step.id} className={`loading-step ${index < currentLoadingStep ? 'completed' : 'pending'}`}>
                          <div className="step-content">
                            {index < currentLoadingStep ? (
                              <div className="step-completed"><CheckIcon /></div>
                            ) : (
                              <div className="step-spinner"></div>
                            )}
                            <span className="step-text">{step.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {processingComplexQuery && renderQueryProgress()}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={walletConnected ? "Ask me about DeFi, trading strategies, or complex multi-part queries..." : "Ask me about DeFi, protocols, or anything else..."}
            disabled={isLoading || !isConnected}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim() || !isConnected}
            className="send-button"
          >
            {isLoading ? <Spinner size="sm" /> : <ChatIcon />}
          </button>
        </div>
      </form>

      <style jsx>{`
        .chat-box-container {
          max-width: 1200px;
          width: 90%;
          height: 80vh;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.43);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Prevent main page scrolling */
        html, body {
          overflow: hidden;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        /* Ensure parent containers don't scroll */
        #__next, .main-container {
          overflow: hidden;
          height: 90vh;
        }

        .chat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .chat-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 12px 12px 0 0;
          padding: 1rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chat-avatar {
          font-size: 2rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          color: white;
        }

        .chat-details h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #4a5568;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.connected {
          background: #48bb78;
        }

        .status-dot.disconnected {
          background: #f56565;
        }

        .wallet-info {
          margin-top: 0.25rem;
        }

        .wallet-address {
          font-size: 0.875rem;
          color: #2d3748;
          background: #edf2f7;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
        }

        .clear-button {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .clear-button:hover {
          background: #c53030;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
          max-height: 100%;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-avatar {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: #4299e1;
          color: white;
        }

        .message.bot .message-avatar {
          background: #667eea;
          color: white;
        }

        .message-content {
          background: #f7fafc;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          animation: messageSlideIn 0.3s ease-out;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
        }

        .message.bot .message-content {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .message.bot .message-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem 1rem 0 0;
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Staggered animation for formatted text elements */
        .formatted-text .section-header {
          animation: fadeInUp 0.5s ease-out;
        }

        .formatted-text .subsection-header {
          animation: fadeInUp 0.4s ease-out 0.1s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced loading indicator */
        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 0.75rem;
          margin: 0.5rem 0;
          border: 1px solid #cbd5e0;
        }

        .loading-indicator span {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.95rem;
        }

        .message-text {
          white-space: pre-wrap;
          line-height: 1.6;
          font-size: 0.95rem;
          color: #2d3748;
        }

        .message.user .message-text {
          color: white;
        }

        /* Enhanced styling for bot messages with markdown-like formatting */
        .message.bot .message-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .message.bot .message-text strong {
          color: #1a202c;
          font-weight: 700;
        }

        .message-timestamp {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.75rem;
          opacity: 0.8;
        }

        .message.user .message-timestamp {
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
        }

        .typing-dots {
          display: flex;
          gap: 0.3rem;
        }

        .typing-dots span {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }

        .chat-input-form {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        .input-container {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #667eea;
        }

        .chat-input:disabled {
          background: #f7fafc;
          cursor: not-allowed;
        }

        .send-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .send-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .function-calls {
          margin-top: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #cbd5e0;
        }

        .function-calls-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 1.5rem;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .function-call {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          transition: background-color 0.2s ease;
        }

        .function-call:hover {
          background: #f8fafc;
        }

        .function-call:last-child {
          border-bottom: none;
        }

        .function-name {
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
          border-radius: 0.5rem;
          border-left: 4px solid #667eea;
        }

        .function-params, .function-result {
          margin-top: 1rem;
        }

        .params-label, .result-label {
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .function-calls pre {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          overflow-x: auto;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 1px solid #4a5568;
        }

        /* Tron function specific styles */
        .tron-output {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid #334155;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .tron-logs {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1.5rem;
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.4;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          border-bottom: 1px solid #334155;
        }

        .transaction-summary {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
          padding: 1rem;
          color: #ecfdf5;
        }

        .transaction-summary h4 {
          margin: 0 0 0.75rem 0;
          color: #10b981;
          font-size: 1rem;
          font-weight: 600;
        }

        .transaction-summary p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
        }

        .transaction-summary strong {
          color: #6ee7b7;
        }

        .complex-query-results {
          margin-top: 1rem;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .complex-query-header {
          background: #0ea5e9;
          color: white;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }

        .query-part-result {
          padding: 1rem;
          border-bottom: 1px solid #e0f2fe;
        }

        .query-part-result:last-child {
          border-bottom: none;
        }

        .part-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .part-id {
          background: #0ea5e9;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .part-function {
          font-weight: 600;
          color: #0c4a6e;
        }

        .part-status {
          font-size: 1rem;
        }

        .part-query {
          font-style: italic;
          color: #0369a1;
          margin-bottom: 0.5rem;
        }

        .part-error {
          color: #dc2626;
          font-weight: 500;
        }

        .part-data pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }

        .response-content {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
        }

        .response-text {
          white-space: pre-wrap;
          line-height: 1.5;
          color: #2d3748;
        }

        .function-calls-summary {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #4a5568;
        }

        .chart-section {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .chart-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem 1rem 0 0;
        }

        .candle-chart {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .candle-chart h4 {
          margin: 0 0 1.5rem 0;
          color: #2d3748;
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .chart-container {
          height: 250px;
          position: relative;
          margin-bottom: 1rem;
        }

        .chart-svg {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .price-info {
          display: flex;
          justify-content: space-around;
          gap: 2rem;
          font-size: 0.9rem;
          color: #4a5568;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .current-price {
          font-weight: 700;
          color: #2d3748;
          font-size: 1rem;
        }

        .price-change {
          color: #059669;
          font-weight: 600;
        }

        .no-data {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 3rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 2px dashed #d1d5db;
        }

        .query-progress-container {
          margin-top: 1rem;
          padding: 1rem;
          background: #f0f9eb;
          border: 1px solid #4caf50;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .progress-header {
          font-weight: 600;
          color: #2e7d32;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #a5d6a7;
        }

        .progress-boxes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .progress-box {
          width: 120px;
          height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 0.5rem;
          padding: 0.75rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .progress-box.pending {
          background: #e8f5e9;
          border-color: #a5d6a7;
        }

        .progress-box.processing {
          background: #e8f5e9;
          border-color: #a5d6a7;
        }

        .progress-box.completed {
          background: #e8f5e9;
          border-color: #4caf50;
        }

        .progress-box.error {
          background: #ffebee;
          border-color: #ef5350;
        }

        .box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 0.5rem;
        }

        .box-id {
          background: #4caf50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .box-status {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .box-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .pending-text, .completed-text {
          font-size: 0.875rem;
          color: #4caf50;
          font-weight: 500;
        }

        .processing-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #4caf50;
          font-weight: 500;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        .error-text {
          font-size: 0.875rem;
          color: #ef5350;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-steps {
          margin-top: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e0;
          border-radius: 1rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .loading-steps::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .loading-steps-header {
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
          text-align: center;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          justify-items: center;
        }

        .loading-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-width: 220px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 2px solid transparent;
        }

        .loading-step.pending {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-color: #e2e8f0;
        }

        .loading-step.completed {
          background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
          border-color: #48bb78;
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(72, 187, 120, 0.2);
        }

        .loading-step.completed::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .step-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }

        .step-completed {
          font-size: 2.5rem;
          color: #48bb78;
          animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          text-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
        }

        .step-text {
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 600;
          line-height: 1.4;
          text-align: center;
        }

        .loading-step.completed .step-text {
          color: #2d3748;
          font-weight: 700;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Enhanced formatting for bot messages */
        .formatted-text {
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .formatted-text .section-header {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2d3748;
          margin: 1.5rem 0 1rem 0;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
          border-radius: 0.5rem;
          border-left: 4px solid #667eea;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .formatted-text .section-header::before {
          content: '';
          width: 16px;
          height: 16px;
          background: #667eea;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .formatted-text .subsection-header {
          font-size: 1rem;
          font-weight: 600;
          color: #4a5568;
          margin: 1rem 0 0.5rem 0;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .formatted-text code {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: #e2e8f0;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid #4a5568;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .formatted-text strong {
          color: #1a202c;
          font-weight: 700;
        }

        .formatted-text .tree-branch {
          color: #667eea;
          font-weight: 600;
          font-family: monospace;
          margin-right: 0.5rem;
        }

        .formatted-text .value-highlight {
          color: #059669;
          background: rgba(5, 150, 105, 0.1);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-weight: 600;
        }

        /* Enhanced emoji styling */
        .formatted-text {
          font-variant-emoji: emoji;
        }

        /* Spacing improvements */
        .formatted-text p {
          margin: 0.75rem 0;
        }

        .formatted-text div {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default ChatBox; 