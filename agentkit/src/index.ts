/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 * 
 * This package provides an AI agent that can interact with 1inch's DeFi protocols
 * through natural language, powered by OpenAI's GPT models.
 */

// Core exports
export { OneInchAgentKit } from "./core/llmAgent";
export { default as Registry } from "./core/registry";
export type { FunctionDefinition, FunctionRegistry, FunctionParametersSchema } from "./core/types";

// Function exports
export { gasAPI } from "./functions/gasAPI";
export { rpcAPI } from "./functions/rpcAPI";
export { chartsAPI } from "./functions/chartsAPI";
export { tokenDetailsAPI } from "./functions/tokenDetailsAPI";
export { historyAPI } from "./functions/historyAPI";
export { tracesAPI } from "./functions/tracesAPI";
export { spotPriceAPI } from "./functions/spotPriceAPI";

// Type exports
export type {
  Eip1559GasValueResponse,
  Eip1559GasPriceResponse
} from "./functions/gasAPI";

export type {
  RpcRequest,
  RpcResponse
} from "./functions/rpcAPI";

export type {
  LineData,
  LinesResponse,
  CandleData,
  CandlesResponse,
  ChartPeriod,
  CandleSeconds,
  LineChartParams,
  CandleChartParams
} from "./functions/chartsAPI";

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
} from "./functions/tokenDetailsAPI";

export type {
  TokenActionDto,
  TransactionDetailsMetaDto,
  TransactionDetailsDto,
  HistoryEventDto,
  HistoryResponseDto,
  HistoryEventResponseDto,
  MultiFilterDto,
  PostMultiFilterDto,
  SearchAndMultiFilterDto,
  SearchOrMultiFilterDto,
  HistorySearchMultiFilterRootAndDto,
  HistorySearchMultiFilterRootFilterDto,
  HistorySearchMultiFilterRootDto,
  UnifiedTokenAddress,
  HistorySwapFilterDto,
  HistorySwapFilterRootDto,
  TransactionType,
  GetHistoryEventsParams,
  PostHistoryEventsParams,
  SearchHistoryEventsParams,
  GetSwapEventsParams
} from "./functions/historyAPI";

export type {
  GetSyncedIntervalParams,
  GetBlockTraceByNumberParams,
  GetTransactionTraceByHashParams,
  GetTransactionTraceByOffsetParams,
  SyncedIntervalResponse,
  BlockTraceResponse,
  TransactionTraceResponse
} from "./functions/tracesAPI";

export type {
  GetWhitelistedPricesRequest,
  GetRequestedPricesRequest,
  GetCurrenciesRequest,
  GetPricesForAddressesRequest,
  SpotPriceResponse,
  CurrenciesResponse
} from "./functions/spotPriceAPI";

// Utility exports
export { OneInchFetcher } from "./utils/fetcher";
export { logger } from "./utils/logger";
