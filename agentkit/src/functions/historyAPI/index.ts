import { OneInchFetcher } from "../../utils/fetcher";

// Response interfaces
export interface TokenActionDto {
  address: string;
  standard: string;
  fromAddress: string;
  toAddress: string;
  tokenId?: any;
  amount?: any;
  direction: "In" | "Out" | "Self" | "On";
}

export interface TransactionDetailsMetaDto {
  is1inchFusionSwap?: any;
  is1inchCrossChainSwap?: any;
  orderFillPercentage?: any;
  ensDomainName?: any;
  fromChainId?: any;
  toChainId?: any;
  safeAddress?: any;
  protocol?: any;
}

export interface TransactionDetailsDto {
  orderInBlock: number;
  txHash: string;
  chainId: number;
  blockNumber: number;
  blockTimeSec: number;
  status: string;
  type: string;
  tokenActions: TokenActionDto[];
  fromAddress: string;
  toAddress: string;
  nonce: number;
  feeInSmallestNative: string;
  meta: TransactionDetailsMetaDto;
}

export interface HistoryEventDto {
  id: string;
  address: string;
  type: number;
  rating: "Reliable" | "Scam";
  timeMs: number;
  details: TransactionDetailsDto;
}

export interface HistoryResponseDto {
  items: HistoryEventDto[];
  cache_counter: number;
}

export interface HistoryEventResponseDto {
  item: any;
  cache_counter: number;
}

// Filter interfaces
export interface MultiFilterDto {
  from_time_ms?: number | null;
  to_time_ms?: number | null;
  chain_ids?: string[];
  transaction_types?: string[];
  token_addresses?: string[];
  chain_based_token_addresses?: string[];
  limit?: number;
}

export interface PostMultiFilterDto {
  filter: MultiFilterDto;
}

export interface SearchAndMultiFilterDto {
  from_time_ms?: number | null;
  to_time_ms?: number | null;
  chain_ids?: string[];
  transaction_types?: string[];
  token_addresses?: string[];
  chain_based_token_addresses?: string[];
}

export interface SearchOrMultiFilterDto {
  chain_ids?: string[];
  transaction_types?: string[];
  chain_based_token_addresses?: string[];
  transaction_hash?: any;
  from_or_to_address?: any;
}

export interface HistorySearchMultiFilterRootAndDto {
  and: SearchAndMultiFilterDto;
  or: SearchOrMultiFilterDto;
}

export interface HistorySearchMultiFilterRootFilterDto {
  and: HistorySearchMultiFilterRootAndDto;
  limit?: number;
}

export interface HistorySearchMultiFilterRootDto {
  filter: HistorySearchMultiFilterRootFilterDto;
}

export interface UnifiedTokenAddress {
  [key: string]: string;
}

export interface HistorySwapFilterDto {
  chain_ids: string[];
  token_address_from: UnifiedTokenAddress;
  token_address_to: UnifiedTokenAddress;
  limit?: number;
}

export interface HistorySwapFilterRootDto {
  filter: HistorySwapFilterDto;
}

// Supported transaction types
export type TransactionType = 
  | "Unknown" | "Approve" | "Wrap" | "Unwrap" | "Transfer" | "SwapExactInput" 
  | "SwapExactOutput" | "LimitOrderFill" | "LimitOrderCancel" | "LimitOrderCancelAll" 
  | "Multicall" | "AddLiquidity" | "RemoveLiquidity" | "Borrow" | "Repay" | "Stake" 
  | "Unstake" | "Vote" | "DelegateVotePower" | "UnDelegateVotePower" | "DiscardVote" 
  | "DeployPool" | "Claim" | "AbiDecoded" | "TraceDecoded" | "Action" | "Bridge" 
  | "BuyNft" | "BidNft" | "OfferSellNft" | "Burn" | "WrappedTx" | "RegisterENSDomain" 
  | "Revoke" | "CreateSafe" | "AddOwner" | "Send" | "Receive" | "MultiStage" 
  | "Swap" | "LimitOrderCreate";

// Function parameters interfaces
export interface GetHistoryEventsParams {
  address: string;
  limit?: number;
  tokenAddress?: string;
  chainId?: number;
  toTimestampMs?: string;
  fromTimestampMs?: string;
}

export interface PostHistoryEventsParams {
  address: string;
  filter: MultiFilterDto;
}

export interface SearchHistoryEventsParams {
  address: string;
  filter: HistorySearchMultiFilterRootFilterDto;
}

export interface GetSwapEventsParams {
  address: string;
  filter: HistorySwapFilterDto;
}

// Individual endpoint functions
export async function getHistoryEvents(params: GetHistoryEventsParams): Promise<HistoryResponseDto> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/history/v2.0/history/${params.address}/events`;
  
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.tokenAddress) queryParams.append('tokenAddress', params.tokenAddress);
  if (params.chainId) queryParams.append('chainId', params.chainId.toString());
  if (params.toTimestampMs) queryParams.append('toTimestampMs', params.toTimestampMs);
  if (params.fromTimestampMs) queryParams.append('fromTimestampMs', params.fromTimestampMs);
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  return await fetcher.get<HistoryResponseDto>(url);
}

export async function postHistoryEvents(params: PostHistoryEventsParams): Promise<HistoryResponseDto> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/history/v2.0/history/${params.address}/events`;
  const body: PostMultiFilterDto = {
    filter: params.filter
  };
  
  return await fetcher.post<HistoryResponseDto>(url, body);
}

export async function searchHistoryEvents(params: SearchHistoryEventsParams): Promise<HistoryEventResponseDto[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/history/v2.0/history/${params.address}/search/events`;
  const body: HistorySearchMultiFilterRootDto = {
    filter: params.filter
  };
  
  return await fetcher.post<HistoryEventResponseDto[]>(url, body);
}

export async function getSwapEvents(params: GetSwapEventsParams): Promise<HistoryEventResponseDto[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/history/v2.0/history/${params.address}/events/swaps`;
  const body: HistorySwapFilterRootDto = {
    filter: params.filter
  };
  
  return await fetcher.post<HistoryEventResponseDto[]>(url, body);
}

// Main function that handles all endpoints
export async function historyAPI(params: {
  endpoint: "get-events" | "post-events" | "search-events" | "swap-events";
  address: string;
  limit?: number;
  tokenAddress?: string;
  chainId?: number;
  toTimestampMs?: string;
  fromTimestampMs?: string;
  filter?: MultiFilterDto;
  searchFilter?: HistorySearchMultiFilterRootFilterDto;
  swapFilter?: HistorySwapFilterDto;
}): Promise<any> {
  switch (params.endpoint) {
    case "get-events":
      return await getHistoryEvents({
        address: params.address,
        limit: params.limit,
        tokenAddress: params.tokenAddress,
        chainId: params.chainId,
        toTimestampMs: params.toTimestampMs,
        fromTimestampMs: params.fromTimestampMs
      });

    case "post-events":
      if (!params.filter) {
        throw new Error("filter is required for post-events endpoint");
      }
      return await postHistoryEvents({
        address: params.address,
        filter: params.filter
      });

    case "search-events":
      if (!params.searchFilter) {
        throw new Error("searchFilter is required for search-events endpoint");
      }
      return await searchHistoryEvents({
        address: params.address,
        filter: params.searchFilter
      });

    case "swap-events":
      if (!params.swapFilter) {
        throw new Error("swapFilter is required for swap-events endpoint");
      }
      return await getSwapEvents({
        address: params.address,
        filter: params.swapFilter
      });

    default:
      throw new Error(`Unknown endpoint: ${params.endpoint}`);
  }
} 