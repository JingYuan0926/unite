/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 * 
 * This package provides an AI agent that can interact with 1inch's DeFi protocols
 * through natural language, powered by OpenAI's GPT models.
 */

// Core exports
export { OneInchAgentKit, createAgent, llmAgent } from './core/llmAgent';
export type { 
  AgentKitConfig, 
  AgentResponse, 
  FunctionDefinition, 
  FunctionRegistry,
  QuoteParams,
  SwapParams,
  ChainParams,
  TokenParams,
  OneInchError
} from './core/types';

// Utility exports
export { OneInchFetcher } from './utils/fetcher';
export { Logger, logger, LogLevel } from './utils/logger';
export type { LoggerOptions } from './utils/logger';

export { gasAPI } from './functions/gasAPI';
export type { Eip1559GasPriceResponse, Eip1559GasValueResponse } from './functions/gasAPI';

// Registry export
export { default as registry } from './core/registry';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { OneInchAgentKit } from '1inch-agent-kit';
 * 
 * const agent = new OneInchAgentKit({
 *   openaiApiKey: 'your-openai-key',
 *   oneinchApiKey: 'your-1inch-key'
 * });
 * 
 * const response = await agent.chat('Get me a quote for swapping 1 ETH to USDC on Ethereum');
 * console.log(response.content);
 * ```
 */ 