/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 * 
 * This package provides an AI agent that can interact with 1inch's DeFi protocols
 * through natural language, powered by OpenAI's GPT models.
 */

// Core exports
export { OneInchAgentKit } from './core/llmAgent';
export { default as Registry } from './core/registry';
export type { FunctionDefinition, FunctionRegistry } from './core/types';

// Function exports
export { gasAPI } from './functions/gasAPI';
export { rpcAPI } from './functions/rpcAPI';
export { chartsAPI, getLineChart, getCandleChart } from './functions/chartsAPI';
export { tokenDetailsAPI, getNativeTokenDetails, getTokenDetails, getNativeTokenPricesByRange, getTokenPricesByRange, getNativeTokenPricesByInterval, getTokenPricesByInterval, getNativeTokenPriceChange, getTokenPriceChange, getTokenListPriceChange } from './functions/tokenDetailsAPI';

// Type exports
export type { 
  Eip1559GasValueResponse,
  Eip1559GasPriceResponse
} from './functions/gasAPI';

export type { 
  RpcRequest,
  RpcResponse
} from './functions/rpcAPI';

export type { 
  LineData,
  LinesResponse,
  CandleData,
  CandlesResponse,
  ChartPeriod,
  CandleSeconds,
  LineChartParams,
  CandleChartParams
} from './functions/chartsAPI';

export type {
  SocialLink,
  AssetsResponse,
  DetailsResponse,
  InfoDataResponse,
  ChartPointResponse,
  ChartDataResponse,
  TokenPriceChangeResponseDto,
  TokenListPriceChangeResponseDto,
  GetTokenListPriceRequestDto,
  SupportedInterval,
  GetNativeTokenDetailsParams,
  GetTokenDetailsParams,
  GetNativeTokenPricesByRangeParams,
  GetTokenPricesByRangeParams,
  GetNativeTokenPricesByIntervalParams,
  GetTokenPricesByIntervalParams,
  GetNativeTokenPriceChangeParams,
  GetTokenPriceChangeParams,
  GetTokenListPriceChangeParams
} from './functions/tokenDetailsAPI';

// Utility exports
export { OneInchFetcher } from './utils/fetcher';
export { Logger, logger, LogLevel } from './utils/logger';
export type { LoggerOptions } from './utils/logger';

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