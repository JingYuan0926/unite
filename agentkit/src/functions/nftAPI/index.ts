import { OneInchFetcher } from "../../utils/fetcher";

// Types for NFT API
export interface AssetContract {
  address: string;
  schema_name: string;
  image_url: string;
}

export interface NftV2Model {
  id: string;
  token_id: string;
  provider: 'OPENSEA' | 'RARIBLE' | 'POAP';
  name: string;
  chainId: number;
  priority: number;
  asset_contract: AssetContract;
}

export interface AssetsResponse {
  assets: NftV2Model[];
  openseaNextToken: string;
}

export interface Creator {
  profile_img_url: string;
  address: string;
}

export interface User {
  username: string;
}

export interface Collection {
  image_url: string;
  name: string;
  description: string;
  creator: Creator;
  user: User;
}

export interface Traits {
  value: string;
}

export interface SingleNft {
  id: string;
  token_id: string;
  name: string;
  image_url: object;
  chainId: number;
  provider: string;
  description: string;
  permalink: string;
  collection: Collection;
  traits: Traits[];
  asset_contract: AssetContract;
}

// Individual endpoint functions
export async function getSupportedChains(): Promise<number[]> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get('/nft/v2/supportedchains');
  return response as number[];
}

export async function getNftsByAddress(params: {
  chainIds: number[];
  address: string;
  limit?: number;
  offset?: number;
  openseaNextToken?: string;
}): Promise<AssetsResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('chainIds', params.chainIds.join(','));
  queryParams.append('address', params.address);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.openseaNextToken) queryParams.append('openseaNextToken', params.openseaNextToken);

  const url = `/nft/v2/byaddress?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as AssetsResponse;
}

export async function getNftById(params: {
  chainId: number;
  contract: string;
  id: string;
  provider: string;
}): Promise<SingleNft> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('chainId', params.chainId.toString());
  queryParams.append('contract', params.contract);
  queryParams.append('id', params.id);
  queryParams.append('provider', params.provider);

  const url = `/nft/v2/contract?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as SingleNft;
}

/**
 * Main nftAPI function that handles all NFT operations
 */
export async function nftAPI(params: {
  endpoint: 'getSupportedChains' | 'getNftsByAddress' | 'getNftById';
  // getNftsByAddress params
  chainIds?: number[];
  address?: string;
  limit?: number;
  offset?: number;
  openseaNextToken?: string;
  // getNftById params
  chainId?: number;
  contract?: string;
  id?: string;
  provider?: string;
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'getSupportedChains':
        return await getSupportedChains();

      case 'getNftsByAddress':
        if (!params.chainIds || !params.address) {
          throw new Error('chainIds and address are required for getNftsByAddress');
        }
        return await getNftsByAddress({
          chainIds: params.chainIds,
          address: params.address,
          limit: params.limit,
          offset: params.offset,
          openseaNextToken: params.openseaNextToken
        });

      case 'getNftById':
        if (!params.chainId || !params.contract || !params.id || !params.provider) {
          throw new Error('chainId, contract, id, and provider are required for getNftById');
        }
        return await getNftById({
          chainId: params.chainId,
          contract: params.contract,
          id: params.id,
          provider: params.provider
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`NFT API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 