import { OneInchFetcher } from "../../utils/fetcher";

// Types for Orderbook API
export interface LimitOrderV4Data {
  makerAsset: string;
  takerAsset: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  extension: string;
  makerTraits: string;
}

export interface LimitOrderV4Request {
  orderHash: string;
  signature: string;
  data: LimitOrderV4Data;
}

export interface LimitOrderV4Response {
  success: boolean;
}

export interface GetLimitOrdersV4Response {
  signature: string;
  orderHash: string;
  createDateTime: string;
  remainingMakerAmount: string;
  makerBalance: string;
  makerAllowance: string;
  data: LimitOrderV4Data;
  makerRate: string;
  takerRate: string;
  isMakerContract: boolean;
  orderInvalidReason: string;
}

export interface GetLimitOrdersCountV4Response {
  count: number;
}

export interface GetEventsV4Response {
  id: number;
  network: number;
  logId: string;
  version: number;
  action: string;
  orderHash: string;
  taker: string;
  remainingMakerAmount: string;
  transactionHash: string;
  blockNumber: number;
  createDateTime: string;
}

export interface GetHasActiveOrdersWithPermitV4Response {
  result: boolean;
}

export interface UniquePairs {
  makerAsset: string;
  takerAsset: string;
}

export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface GetActiveUniquePairsResponse {
  meta: Meta;
  items: UniquePairs[];
}

export interface WhitelistedResolvers {
  // This would be populated based on actual API response
  [key: string]: any;
}

export interface AccountAddress {
  // This would be populated based on actual API response
  [key: string]: any;
}

export interface FeeInfoResponse {
  whitelist: WhitelistedResolvers;
  feeBps: number;
  whitelistDiscountPercent: number;
  protocolFeeReceiver: AccountAddress;
  extensionAddress: AccountAddress;
}

// Individual endpoint functions
export async function submitOrder(params: {
  chain: number;
  orderHash: string;
  signature: string;
  data: LimitOrderV4Data;
}): Promise<LimitOrderV4Response> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.post(`/orderbook/v4.0/${params.chain}`, {
    orderHash: params.orderHash,
    signature: params.signature,
    data: params.data
  });
  return response as LimitOrderV4Response;
}

export async function getOrdersByAddress(params: {
  chain: number;
  address: string;
  page?: number;
  limit?: number;
  statuses?: string;
  sortBy?: string;
  takerAsset?: string;
  makerAsset?: string;
}): Promise<GetLimitOrdersV4Response[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.statuses) queryParams.append('statuses', params.statuses);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
  if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);

  const url = `/orderbook/v4.0/${params.chain}/address/${params.address}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetcher.get(url);
  return response as GetLimitOrdersV4Response[];
}

export async function getOrderByHash(params: {
  chain: number;
  orderHash: string;
}): Promise<GetLimitOrdersV4Response> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/orderbook/v4.0/${params.chain}/order/${params.orderHash}`);
  return response as GetLimitOrdersV4Response;
}

export async function getAllOrders(params: {
  chain: number;
  page?: number;
  limit?: number;
  statuses?: string;
  sortBy?: string;
  takerAsset?: string;
  makerAsset?: string;
}): Promise<GetLimitOrdersV4Response[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.statuses) queryParams.append('statuses', params.statuses);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
  if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);

  const url = `/orderbook/v4.0/${params.chain}/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetcher.get(url);
  return response as GetLimitOrdersV4Response[];
}

export async function getOrdersCount(params: {
  chain: number;
  statuses?: string;
  takerAsset?: string;
  makerAsset?: string;
}): Promise<GetLimitOrdersCountV4Response> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  if (params.statuses) queryParams.append('statuses', params.statuses);
  if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
  if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);

  const url = `/orderbook/v4.0/${params.chain}/count${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetcher.get(url);
  return response as GetLimitOrdersCountV4Response;
}

export async function getOrderEvents(params: {
  chain: number;
  orderHash: string;
}): Promise<any> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/orderbook/v4.0/${params.chain}/events/${params.orderHash}`);
  return response;
}

export async function getAllEvents(params: {
  chain: number;
  limit?: number;
}): Promise<GetEventsV4Response[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `/orderbook/v4.0/${params.chain}/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetcher.get(url);
  return response as GetEventsV4Response[];
}

export async function hasActiveOrdersWithPermit(params: {
  chain: number;
  walletAddress: string;
  token: string;
}): Promise<GetHasActiveOrdersWithPermitV4Response> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/orderbook/v4.0/${params.chain}/has-active-orders-with-permit/${params.walletAddress}/${params.token}`);
  return response as GetHasActiveOrdersWithPermitV4Response;
}

export async function getUniqueActivePairs(params: {
  chain: number;
  page?: number;
  limit?: number;
}): Promise<GetActiveUniquePairsResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `/orderbook/v4.0/${params.chain}/unique-active-pairs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetcher.get(url);
  return response as GetActiveUniquePairsResponse;
}

export async function getFeeInfo(params: {
  chain: number;
  makerAsset: string;
  takerAsset: string;
  makerAmount?: string;
  takerAmount?: string;
}): Promise<FeeInfoResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('makerAsset', params.makerAsset);
  queryParams.append('takerAsset', params.takerAsset);
  if (params.makerAmount) queryParams.append('makerAmount', params.makerAmount);
  if (params.takerAmount) queryParams.append('takerAmount', params.takerAmount);

  const url = `/orderbook/v4.0/${params.chain}/fee-info?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as FeeInfoResponse;
}

/**
 * Main orderbookAPI function that handles all Orderbook operations
 */
export async function orderbookAPI(params: {
  endpoint: 'submitOrder' | 'getOrdersByAddress' | 'getOrderByHash' | 'getAllOrders' | 'getOrdersCount' | 'getOrderEvents' | 'getAllEvents' | 'hasActiveOrdersWithPermit' | 'getUniqueActivePairs' | 'getFeeInfo';
  chain: number;
  // submitOrder params
  orderHash?: string;
  signature?: string;
  data?: LimitOrderV4Data;
  // getOrdersByAddress params
  address?: string;
  page?: number;
  limit?: number;
  statuses?: string;
  sortBy?: string;
  takerAsset?: string;
  makerAsset?: string;
  // getOrderByHash params
  orderHashParam?: string;
  // hasActiveOrdersWithPermit params
  walletAddress?: string;
  token?: string;
  // getFeeInfo params
  makerAmount?: string;
  takerAmount?: string;
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'submitOrder':
        if (!params.orderHash || !params.signature || !params.data) {
          throw new Error('orderHash, signature, and data are required for submitOrder');
        }
        return await submitOrder({
          chain: params.chain,
          orderHash: params.orderHash,
          signature: params.signature,
          data: params.data
        });

      case 'getOrdersByAddress':
        if (!params.address) {
          throw new Error('address is required for getOrdersByAddress');
        }
        return await getOrdersByAddress({
          chain: params.chain,
          address: params.address,
          page: params.page,
          limit: params.limit,
          statuses: params.statuses,
          sortBy: params.sortBy,
          takerAsset: params.takerAsset,
          makerAsset: params.makerAsset
        });

      case 'getOrderByHash':
        if (!params.orderHashParam) {
          throw new Error('orderHash is required for getOrderByHash');
        }
        return await getOrderByHash({
          chain: params.chain,
          orderHash: params.orderHashParam
        });

      case 'getAllOrders':
        return await getAllOrders({
          chain: params.chain,
          page: params.page,
          limit: params.limit,
          statuses: params.statuses,
          sortBy: params.sortBy,
          takerAsset: params.takerAsset,
          makerAsset: params.makerAsset
        });

      case 'getOrdersCount':
        return await getOrdersCount({
          chain: params.chain,
          statuses: params.statuses,
          takerAsset: params.takerAsset,
          makerAsset: params.makerAsset
        });

      case 'getOrderEvents':
        if (!params.orderHashParam) {
          throw new Error('orderHash is required for getOrderEvents');
        }
        return await getOrderEvents({
          chain: params.chain,
          orderHash: params.orderHashParam
        });

      case 'getAllEvents':
        return await getAllEvents({
          chain: params.chain,
          limit: params.limit
        });

      case 'hasActiveOrdersWithPermit':
        if (!params.walletAddress || !params.token) {
          throw new Error('walletAddress and token are required for hasActiveOrdersWithPermit');
        }
        return await hasActiveOrdersWithPermit({
          chain: params.chain,
          walletAddress: params.walletAddress,
          token: params.token
        });

      case 'getUniqueActivePairs':
        return await getUniqueActivePairs({
          chain: params.chain,
          page: params.page,
          limit: params.limit
        });

      case 'getFeeInfo':
        if (!params.makerAsset || !params.takerAsset) {
          throw new Error('makerAsset and takerAsset are required for getFeeInfo');
        }
        return await getFeeInfo({
          chain: params.chain,
          makerAsset: params.makerAsset,
          takerAsset: params.takerAsset,
          makerAmount: params.makerAmount,
          takerAmount: params.takerAmount
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Orderbook API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 