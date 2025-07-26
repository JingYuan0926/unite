import { OneInchFetcher } from "../../utils/fetcher";

// Response interfaces
export interface SocialLink {
  name: string;
  url: string;
  handle: string;
}

export interface AssetsResponse {
  name: string;
  website: string;
  sourceCode: string;
  whitePaper: string;
  description: string;
  shortDescription: string;
  research: string;
  explorer: string;
  social_links: SocialLink[];
}

export interface DetailsResponse {
  provider: string;
  providerURL: string;
  vol24: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
}

export interface InfoDataResponse {
  assets: AssetsResponse;
  details: DetailsResponse;
}

export interface ChartPointResponse {
  t: number; // timestamp
  v: number; // value/price
  p: string; // price string
}

export interface ChartDataResponse {
  d: ChartPointResponse[];
}

export interface TokenPriceChangeResponseDto {
  inUSD: number;
  inPercent: number;
}

export interface TokenListPriceChangeResponseDto {
  tokenAddress: string;
  inUSD: number;
  inPercent: number;
}

export interface GetTokenListPriceRequestDto {
  tokenAddresses: string[];
  interval: string;
}

// Supported intervals
export type SupportedInterval = 
  | "5m" | "10m" | "15m" | "30m" | "50m" 
  | "1h" | "2h" | "3h" | "4h" | "6h" | "12h" | "24h" 
  | "2d" | "3d" | "7d" | "14d" | "15d" | "30d" | "60d" | "90d" | "365d" | "max";

// Function parameters interfaces
export interface GetNativeTokenDetailsParams {
  chainId: number;
  provider?: string;
}

export interface GetTokenDetailsParams {
  chainId: number;
  contractAddress: string;
  provider?: string;
}

export interface GetNativeTokenPricesByRangeParams {
  chainId: number;
  from: number; // Unix timestamp in seconds
  to: number; // Unix timestamp in seconds
  provider?: string;
  from_time?: number;
}

export interface GetTokenPricesByRangeParams {
  chainId: number;
  tokenAddress: string;
  from: number; // Unix timestamp in seconds
  to: number; // Unix timestamp in seconds
  provider?: string;
  from_time?: number;
}

export interface GetNativeTokenPricesByIntervalParams {
  chainId: number;
  interval: SupportedInterval;
  provider?: string;
  from_time?: number;
}

export interface GetTokenPricesByIntervalParams {
  chainId: number;
  tokenAddress: string;
  interval: SupportedInterval;
  provider?: string;
  from_time?: number;
}

export interface GetNativeTokenPriceChangeParams {
  chainId: number;
  interval: SupportedInterval;
}

export interface GetTokenPriceChangeParams {
  chainId: number;
  tokenAddress: string;
  interval: SupportedInterval;
}

export interface GetTokenListPriceChangeParams {
  chainId: number;
  tokenAddresses: string[];
  interval: SupportedInterval;
}

// Individual endpoint functions
export async function getNativeTokenDetails(params: GetNativeTokenDetailsParams): Promise<InfoDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/details/${params.chainId}`;
  
  if (params.provider) {
    url += `?provider=${params.provider}`;
  }
  
  return await fetcher.get<InfoDataResponse>(url);
}

export async function getTokenDetails(params: GetTokenDetailsParams): Promise<InfoDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/details/${params.chainId}/${params.contractAddress}`;
  
  if (params.provider) {
    url += `?provider=${params.provider}`;
  }
  
  return await fetcher.get<InfoDataResponse>(url);
}

export async function getNativeTokenPricesByRange(params: GetNativeTokenPricesByRangeParams): Promise<ChartDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/charts/range/${params.chainId}?from=${params.from}&to=${params.to}`;
  
  if (params.provider) {
    url += `&provider=${params.provider}`;
  }
  if (params.from_time) {
    url += `&from_time=${params.from_time}`;
  }
  
  return await fetcher.get<ChartDataResponse>(url);
}

export async function getTokenPricesByRange(params: GetTokenPricesByRangeParams): Promise<ChartDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/charts/range/${params.chainId}/${params.tokenAddress}?from=${params.from}&to=${params.to}`;
  
  if (params.provider) {
    url += `&provider=${params.provider}`;
  }
  if (params.from_time) {
    url += `&from_time=${params.from_time}`;
  }
  
  return await fetcher.get<ChartDataResponse>(url);
}

export async function getNativeTokenPricesByInterval(params: GetNativeTokenPricesByIntervalParams): Promise<ChartDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/charts/interval/${params.chainId}?interval=${params.interval}`;
  
  if (params.provider) {
    url += `&provider=${params.provider}`;
  }
  if (params.from_time) {
    url += `&from_time=${params.from_time}`;
  }
  
  return await fetcher.get<ChartDataResponse>(url);
}

export async function getTokenPricesByInterval(params: GetTokenPricesByIntervalParams): Promise<ChartDataResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  let url = `/token-details/v1.0/charts/interval/${params.chainId}/${params.tokenAddress}?interval=${params.interval}`;
  
  if (params.provider) {
    url += `&provider=${params.provider}`;
  }
  if (params.from_time) {
    url += `&from_time=${params.from_time}`;
  }
  
  return await fetcher.get<ChartDataResponse>(url);
}

export async function getNativeTokenPriceChange(params: GetNativeTokenPriceChangeParams): Promise<TokenPriceChangeResponseDto> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/token-details/v1.0/prices/change/${params.chainId}?interval=${params.interval}`;
  
  return await fetcher.get<TokenPriceChangeResponseDto>(url);
}

export async function getTokenPriceChange(params: GetTokenPriceChangeParams): Promise<TokenPriceChangeResponseDto> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/token-details/v1.0/prices/change/${params.chainId}/${params.tokenAddress}?interval=${params.interval}`;
  
  return await fetcher.get<TokenPriceChangeResponseDto>(url);
}

export async function getTokenListPriceChange(params: GetTokenListPriceChangeParams): Promise<TokenListPriceChangeResponseDto[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/token-details/v1.0/prices/change/${params.chainId}`;
  const body: GetTokenListPriceRequestDto = {
    tokenAddresses: params.tokenAddresses,
    interval: params.interval
  };
  
  return await fetcher.post<TokenListPriceChangeResponseDto[]>(url, body);
}

// Main function that handles all endpoints
export async function tokenDetailsAPI(params: {
  endpoint: "native-details" | "token-details" | "native-prices-range" | "token-prices-range" | 
           "native-prices-interval" | "token-prices-interval" | "native-price-change" | 
           "token-price-change" | "token-list-price-change";
  chainId: number;
  contractAddress?: string;
  tokenAddress?: string;
  tokenAddresses?: string[];
  interval?: SupportedInterval;
  from?: number;
  to?: number;
  provider?: string;
  from_time?: number;
}): Promise<any> {
  switch (params.endpoint) {
    case "native-details":
      return await getNativeTokenDetails({
        chainId: params.chainId,
        provider: params.provider
      });

    case "token-details":
      if (!params.contractAddress) {
        throw new Error("contractAddress is required for token-details endpoint");
      }
      return await getTokenDetails({
        chainId: params.chainId,
        contractAddress: params.contractAddress,
        provider: params.provider
      });

    case "native-prices-range":
      if (!params.from || !params.to) {
        throw new Error("from and to timestamps are required for native-prices-range endpoint");
      }
      return await getNativeTokenPricesByRange({
        chainId: params.chainId,
        from: params.from,
        to: params.to,
        provider: params.provider,
        from_time: params.from_time
      });

    case "token-prices-range":
      if (!params.tokenAddress || !params.from || !params.to) {
        throw new Error("tokenAddress, from, and to timestamps are required for token-prices-range endpoint");
      }
      return await getTokenPricesByRange({
        chainId: params.chainId,
        tokenAddress: params.tokenAddress,
        from: params.from,
        to: params.to,
        provider: params.provider,
        from_time: params.from_time
      });

    case "native-prices-interval":
      if (!params.interval) {
        throw new Error("interval is required for native-prices-interval endpoint");
      }
      return await getNativeTokenPricesByInterval({
        chainId: params.chainId,
        interval: params.interval,
        provider: params.provider,
        from_time: params.from_time
      });

    case "token-prices-interval":
      if (!params.tokenAddress || !params.interval) {
        throw new Error("tokenAddress and interval are required for token-prices-interval endpoint");
      }
      return await getTokenPricesByInterval({
        chainId: params.chainId,
        tokenAddress: params.tokenAddress,
        interval: params.interval,
        provider: params.provider,
        from_time: params.from_time
      });

    case "native-price-change":
      if (!params.interval) {
        throw new Error("interval is required for native-price-change endpoint");
      }
      return await getNativeTokenPriceChange({
        chainId: params.chainId,
        interval: params.interval
      });

    case "token-price-change":
      if (!params.tokenAddress || !params.interval) {
        throw new Error("tokenAddress and interval are required for token-price-change endpoint");
      }
      return await getTokenPriceChange({
        chainId: params.chainId,
        tokenAddress: params.tokenAddress,
        interval: params.interval
      });

    case "token-list-price-change":
      if (!params.tokenAddresses || !params.interval) {
        throw new Error("tokenAddresses and interval are required for token-list-price-change endpoint");
      }
      return await getTokenListPriceChange({
        chainId: params.chainId,
        tokenAddresses: params.tokenAddresses,
        interval: params.interval
      });

    default:
      throw new Error(`Unknown endpoint: ${params.endpoint}`);
  }
} 