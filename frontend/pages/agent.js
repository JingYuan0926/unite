import Head from 'next/head';
import AgentChat from '../components/AgentChat';

export default function AgentPage() {
  return (
    <>
      <Head>
        <title>1inch DeFi Assistant</title>
        <meta name="description" content="AI-powered DeFi assistant powered by 1inch protocols" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <AgentChat />
      </main>
    </>
  );
}
