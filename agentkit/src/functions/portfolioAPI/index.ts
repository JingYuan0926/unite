import { OneInchFetcher } from "../../utils/fetcher";

// Types for Portfolio API
export interface ApiStatusResponse {
  is_available: boolean;
}

export interface ResponseEnvelope<T> {
  result: T;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  cached_at?: number | null;
  system?: ProcessingInfo | null;
}

export interface ProcessingInfo {
  click_time: number;
  node_time: number;
  microservices_time: number;
  redis_time: number;
  total_time: number;
}

export interface Token {
  chain: number;
  address: string;
  decimals: number;
  symbol?: string | null;
  name?: string | null;
}

export interface SupportedChainResponse {
  chain_id: number;
  chain_name: string;
  chain_icon: string;
  native_token: Token;
}

export interface SupportedProtocolGroupResponse {
  chain_id: number;
  protocol_group_id: string;
  protocol_group_name: string;
  protocol_group_icon?: string | null;
}

export interface AddressValue {
  value_usd: number;
  address: string;
}

export interface CategoryValue {
  value_usd: number;
  category_id: string;
  category_name: string;
}

export interface ProtocolGroupValue {
  value_usd: number;
  protocol_group_id: string;
  protocol_group_name: string;
}

export interface ChainValue {
  value_usd: number;
  chain_id: number;
  chain_name: string;
}

export interface CurrentValueResponse {
  total: number;
  by_address: AddressValue[];
  by_category: CategoryValue[];
  by_protocol_group: ProtocolGroupValue[];
  by_chain: ChainValue[];
}

export interface AssetChartResponseItem {
  timestamp: number;
  value_usd: number;
}

export interface ValueChartResponseMeta {
  cached_at?: number | null;
  system?: ProcessingInfo | null;
  data_issues?: ValueChartDataIssues | null;
}

export interface ValueChartDataIssues {
  price_outliers: object[];
}

export interface TokenBalance {
  chain: number;
  address: string;
  decimals: number;
  symbol?: string | null;
  name?: string | null;
  amount: number;
  price_usd?: number | null;
}

export interface AdapterResult {
  index: string;
  chain_id: number;
  contract_address: string;
  token_id: number;
  address: string;
  block_number_created: number;
  block_number?: number | null;
  timestamp?: number | null;
  protocol_type: string;
  protocol_handler_id: string;
  protocol_group_id: string;
  protocol_group_name: string;
  protocol_group_icon?: string | null;
  protocol_sub_group_id?: string | null;
  protocol_sub_group_name?: string | null;
  contract_name: string;
  contract_symbol: string;
  asset_sign: number;
  status: number; // Status enum: 1, 0, -1
  underlying_tokens: TokenBalance[];
  reward_tokens: TokenBalance[];
  value_usd: number;
  locked: boolean;
}

export interface HistoryMetrics {
  index: string;
  profit_abs_usd?: number | null;
  roi?: number | null;
  weighted_apr?: number | null;
  holding_time_days?: number | null;
  rewards_tokens?: TokenBalance[] | null;
  rewards_usd?: number | null;
  claimed_fees?: TokenBalance[] | null;
  unclaimed_fees?: TokenBalance[] | null;
  impermanent_loss?: TokenBalance[] | null;
  claimed_fees_usd?: number | null;
  unclaimed_fees_usd?: number | null;
  impermanent_loss_usd?: number | null;
}

// Individual endpoint functions
export async function checkPortfolioStatus(): Promise<ResponseEnvelope<ApiStatusResponse>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get('/portfolio/portfolio/v5.0/general/status');
  return response as ResponseEnvelope<ApiStatusResponse>;
}

export async function checkAddressesCompliance(params: {
  addresses: string[];
  chain_id?: number;
  use_cache?: boolean;
}): Promise<any> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

  const url = `/portfolio/portfolio/v5.0/general/address_check?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response;
}

export async function getSupportedChains(): Promise<SupportedChainResponse[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get('/portfolio/portfolio/v5.0/general/supported_chains');
  return response as SupportedChainResponse[];
}

export async function getSupportedProtocols(): Promise<ResponseEnvelope<SupportedProtocolGroupResponse[]>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get('/portfolio/portfolio/v5.0/general/supported_protocols');
  return response as ResponseEnvelope<SupportedProtocolGroupResponse[]>;
}

export async function getCurrentPortfolioValue(params: {
  addresses: string[];
  chain_id?: number;
  use_cache?: boolean;
}): Promise<ResponseEnvelope<CurrentValueResponse>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

  const url = `/portfolio/portfolio/v5.0/general/current_value?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseEnvelope<CurrentValueResponse>;
}

export async function getGeneralValueChart(params: {
  addresses: string[];
  chain_id?: number;
  timerange?: string;
  use_cache?: boolean;
}): Promise<{
  result: AssetChartResponseItem[];
  meta?: ValueChartResponseMeta;
}> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.timerange) queryParams.append('timerange', params.timerange);
  if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

  const url = `/portfolio/portfolio/v5.0/general/chart?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as { result: AssetChartResponseItem[]; meta?: ValueChartResponseMeta };
}

export async function getOverviewReport(params: {
  addresses: string[];
  chain_id?: number;
}): Promise<any> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());

  const url = `/portfolio/portfolio/v5.0/general/report?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response;
}

export async function getProtocolsSnapshot(params: {
  addresses: string[];
  chain_id?: number;
  timestamp?: number;
}): Promise<ResponseEnvelope<AdapterResult[]>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.timestamp) queryParams.append('timestamp', params.timestamp.toString());

  const url = `/portfolio/portfolio/v5.0/protocols/snapshot?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseEnvelope<AdapterResult[]>;
}

export async function getProtocolsMetrics(params: {
  addresses: string[];
  chain_id?: number;
  protocol_group_id?: string;
  contract_address?: string;
  token_id?: number;
  use_cache?: boolean;
}): Promise<ResponseEnvelope<HistoryMetrics[]>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.protocol_group_id) queryParams.append('protocol_group_id', params.protocol_group_id);
  if (params.contract_address) queryParams.append('contract_address', params.contract_address);
  if (params.token_id) queryParams.append('token_id', params.token_id.toString());
  if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

  const url = `/portfolio/portfolio/v5.0/protocols/metrics?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseEnvelope<HistoryMetrics[]>;
}

export async function getTokensSnapshot(params: {
  addresses: string[];
  chain_id?: number;
  timestamp?: number;
}): Promise<AdapterResult[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.timestamp) queryParams.append('timestamp', params.timestamp.toString());

  const url = `/portfolio/portfolio/v5.0/tokens/snapshot?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as AdapterResult[];
}

export async function getTokensMetrics(params: {
  addresses: string[];
  chain_id?: number;
  timerange?: string;
  use_cache?: boolean;
}): Promise<ResponseEnvelope<HistoryMetrics[]>> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  params.addresses.forEach(address => queryParams.append('addresses', address));
  if (params.chain_id) queryParams.append('chain_id', params.chain_id.toString());
  if (params.timerange) queryParams.append('timerange', params.timerange);
  if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

  const url = `/portfolio/portfolio/v5.0/tokens/metrics?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseEnvelope<HistoryMetrics[]>;
}

/**
 * Main portfolioAPI function that handles all Portfolio operations
 */
export async function portfolioAPI(params: {
  endpoint: 'checkPortfolioStatus' | 'checkAddressesCompliance' | 'getSupportedChains' | 'getSupportedProtocols' | 'getCurrentPortfolioValue' | 'getGeneralValueChart' | 'getOverviewReport' | 'getProtocolsSnapshot' | 'getProtocolsMetrics' | 'getTokensSnapshot' | 'getTokensMetrics';
  // checkAddressesCompliance params
  addresses?: string[];
  chain_id?: number;
  use_cache?: boolean;
  // getCurrentPortfolioValue params
  // getGeneralValueChart params
  timerange?: string;
  // getOverviewReport params
  // getProtocolsSnapshot params
  timestamp?: number;
  // getProtocolsMetrics params
  protocol_group_id?: string;
  contract_address?: string;
  token_id?: number;
  // getTokensMetrics params
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'checkPortfolioStatus':
        return await checkPortfolioStatus();

      case 'checkAddressesCompliance':
        if (!params.addresses) {
          throw new Error('addresses is required for checkAddressesCompliance');
        }
        return await checkAddressesCompliance({
          addresses: params.addresses,
          chain_id: params.chain_id,
          use_cache: params.use_cache
        });

      case 'getSupportedChains':
        return await getSupportedChains();

      case 'getSupportedProtocols':
        return await getSupportedProtocols();

      case 'getCurrentPortfolioValue':
        if (!params.addresses) {
          throw new Error('addresses is required for getCurrentPortfolioValue');
        }
        return await getCurrentPortfolioValue({
          addresses: params.addresses,
          chain_id: params.chain_id,
          use_cache: params.use_cache
        });

      case 'getGeneralValueChart':
        if (!params.addresses) {
          throw new Error('addresses is required for getGeneralValueChart');
        }
        return await getGeneralValueChart({
          addresses: params.addresses,
          chain_id: params.chain_id,
          timerange: params.timerange,
          use_cache: params.use_cache
        });

      case 'getOverviewReport':
        if (!params.addresses) {
          throw new Error('addresses is required for getOverviewReport');
        }
        return await getOverviewReport({
          addresses: params.addresses,
          chain_id: params.chain_id
        });

      case 'getProtocolsSnapshot':
        if (!params.addresses) {
          throw new Error('addresses is required for getProtocolsSnapshot');
        }
        return await getProtocolsSnapshot({
          addresses: params.addresses,
          chain_id: params.chain_id,
          timestamp: params.timestamp
        });

      case 'getProtocolsMetrics':
        if (!params.addresses) {
          throw new Error('addresses is required for getProtocolsMetrics');
        }
        return await getProtocolsMetrics({
          addresses: params.addresses,
          chain_id: params.chain_id,
          protocol_group_id: params.protocol_group_id,
          contract_address: params.contract_address,
          token_id: params.token_id,
          use_cache: params.use_cache
        });

      case 'getTokensSnapshot':
        if (!params.addresses) {
          throw new Error('addresses is required for getTokensSnapshot');
        }
        return await getTokensSnapshot({
          addresses: params.addresses,
          chain_id: params.chain_id,
          timestamp: params.timestamp
        });

      case 'getTokensMetrics':
        if (!params.addresses) {
          throw new Error('addresses is required for getTokensMetrics');
        }
        return await getTokensMetrics({
          addresses: params.addresses,
          chain_id: params.chain_id,
          timerange: params.timerange,
          use_cache: params.use_cache
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Portfolio API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 