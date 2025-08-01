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
export { balanceAPI } from "./functions/balanceAPI";
export { fusionAPI } from "./functions/fusionAPI";
export { fusionPlusAPI } from "./functions/fusionPlusAPI";
export { orderbookAPI } from "./functions/orderbookAPI";
export { nftAPI } from "./functions/nftAPI";
export { domainAPI } from "./functions/domainAPI";
export { portfolioAPI } from "./functions/portfolioAPI";
export { transactionAPI } from "./functions/transactionAPI";

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

export type {
  CustomTokensRequest,
  CustomTokensAndWalletsRequest,
  TokenBalance,
  AggregatedBalancesAndAllowancesResponse,
  BalancesAndAllowancesResponse,
  GetAggregatedBalancesAndAllowancesParams,
  GetBalancesParams,
  GetCustomTokenBalancesParams,
  GetMultipleWalletsTokenBalancesParams,
  GetBalancesAndAllowancesParams,
  GetCustomTokenBalancesAndAllowancesParams,
  GetAllowancesParams,
  GetCustomTokenAllowancesParams
} from "./functions/balanceAPI";

export type {
  FusionOrder,
  FusionOrderV4,
  ActiveOrdersOutput,
  Meta,
  GetActiveOrdersOutput,
  SettlementAddressOutput,
  OrdersByHashesInput,
  AuctionPointOutput,
  FillsOutput,
  LimitOrderV4StructOutput,
  GetOrderFillsByHashOutput,
  FillOutputDto,
  OrderFillsByMakerOutput,
  ResolverFee,
  AuctionPointClass,
  GasCostConfigClass,
  PresetClass,
  QuotePresetsClass,
  PairCurrencyValue,
  TokenPairValue,
  GetQuoteOutput,
  CustomPresetInput,
  OrderInput,
  SignedOrderInput,
  GetActiveOrdersParams,
  GetSettlementAddressParams,
  GetOrderByHashParams,
  GetOrdersByHashesParams,
  GetOrdersByMakerParams,
  GetQuoteParams,
  GetQuoteWithCustomPresetParams,
  SubmitOrderParams,
  SubmitMultipleOrdersParams,
  FusionAPIParams
} from "./functions/fusionAPI";

export type {
  GetActiveOrdersOutput as FusionPlusGetActiveOrdersOutput,
  EscrowFactory,
  GetQuoteOutput as FusionPlusGetQuoteOutput,
  BuildOrderOutput
} from "./functions/fusionPlusAPI";

export type {
  LimitOrderV4Data,
  LimitOrderV4Request,
  LimitOrderV4Response,
  GetLimitOrdersV4Response,
  GetLimitOrdersCountV4Response,
  GetEventsV4Response,
  GetHasActiveOrdersWithPermitV4Response,
  UniquePairs,
  Meta as OrderbookMeta,
  GetActiveUniquePairsResponse,
  WhitelistedResolvers,
  AccountAddress,
  FeeInfoResponse
} from "./functions/orderbookAPI";

export type {
  AssetContract,
  NftV2Model,
  AssetsResponse as NftAssetsResponse,
  Creator,
  User,
  Collection,
  Traits,
  SingleNft
} from "./functions/nftAPI";

export type {
  ProviderResponse,
  ResponseV2Dto,
  ProviderReverseResponse,
  ResponseReverseV2Dto,
  ResponseBatchV2ReturnTypeDto,
  ProviderResponseWithAvatar,
  AvatarsResponse
} from "./functions/domainAPI";

export type {
  ApiStatusResponse,
  ResponseEnvelope,
  ResponseMeta,
  ProcessingInfo,
  Token,
  SupportedChainResponse,
  SupportedProtocolGroupResponse,
  AddressValue,
  CategoryValue,
  ProtocolGroupValue,
  ChainValue,
  CurrentValueResponse,
  AssetChartResponseItem,
  ValueChartResponseMeta,
  ValueChartDataIssues,
  TokenBalance as PortfolioTokenBalance,
  AdapterResult,
  HistoryMetrics
} from "./functions/portfolioAPI";

export type {
  BroadcastRequest,
  BroadcastResponse
} from "./functions/transactionAPI";

// Utility exports
export { OneInchFetcher } from "./utils/fetcher";
export { logger } from "./utils/logger";
export { walletManager, WalletUtils } from "./utils/wallet";
export type { Wallet, WalletContext } from "./utils/wallet";
