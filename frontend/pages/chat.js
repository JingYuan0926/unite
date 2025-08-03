import Head from 'next/head';
import ChatBox from '../components/ChatBox';
import DashboardHeader from '../components/DashboardHeader';

export default function ChatPage() {
  return (
    <div className="font-sans bg-white" style={{ height: '100vh', overflow: 'hidden' }}>
      <Head>
        <title>1inch DeFi Chat</title>
        <meta name="description" content="AI-powered DeFi chat powered by 1inch protocols" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Use shared DashboardHeader component */}
      <DashboardHeader />
      
      {/* Main Chat Section */}
      <main className="bg-white" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', position: 'relative' }}>
        <ChatBox />
      </main>
    </div>
  );
}
