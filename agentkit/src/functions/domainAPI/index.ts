import { OneInchFetcher } from "../../utils/fetcher";

// Types for Domain API
export interface ProviderResponse {
  protocol: string;
  address: string;
  checkUrl: string;
}

export interface ResponseV2Dto {
  result: ProviderResponse;
}

export interface ProviderReverseResponse {
  protocol: string;
  domain: string;
  checkUrl: string;
}

export interface ResponseReverseV2Dto {
  result: ProviderReverseResponse;
}

export interface ResponseBatchV2ReturnTypeDto {
  [address: string]: ProviderReverseResponse[];
}

export interface ProviderResponseWithAvatar {
  protocol: string;
  domain: string;
  address: string;
  avatar: object;
}

export interface AvatarsResponse {
  result: ProviderResponseWithAvatar;
}

// Individual endpoint functions
export async function lookupDomain(params: {
  name: string;
}): Promise<ResponseV2Dto> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('name', params.name);

  const url = `/domains/v2.0/lookup?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseV2Dto;
}

export async function reverseLookup(params: {
  address: string;
}): Promise<ResponseReverseV2Dto> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('address', params.address);

  const url = `/domains/v2.0/reverse-lookup?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ResponseReverseV2Dto;
}

export async function reverseLookupBatch(params: {
  addresses: string[];
}): Promise<ResponseBatchV2ReturnTypeDto> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.post('/domains/v2.0/reverse-lookup-batch', params.addresses);
  return response as ResponseBatchV2ReturnTypeDto;
}

export async function getProvidersDataWithAvatar(params: {
  addressOrDomain: string;
}): Promise<AvatarsResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('addressOrDomain', params.addressOrDomain);

  const url = `/domains/v2.0/get-providers-data-with-avatar?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as AvatarsResponse;
}

/**
 * Main domainAPI function that handles all Domain operations
 */
export async function domainAPI(params: {
  endpoint: 'lookupDomain' | 'reverseLookup' | 'reverseLookupBatch' | 'getProvidersDataWithAvatar';
  // lookupDomain params
  name?: string;
  // reverseLookup params
  address?: string;
  // reverseLookupBatch params
  addresses?: string[];
  // getProvidersDataWithAvatar params
  addressOrDomain?: string;
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'lookupDomain':
        if (!params.name) {
          throw new Error('name is required for lookupDomain');
        }
        return await lookupDomain({
          name: params.name
        });

      case 'reverseLookup':
        if (!params.address) {
          throw new Error('address is required for reverseLookup');
        }
        return await reverseLookup({
          address: params.address
        });

      case 'reverseLookupBatch':
        if (!params.addresses) {
          throw new Error('addresses is required for reverseLookupBatch');
        }
        return await reverseLookupBatch({
          addresses: params.addresses
        });

      case 'getProvidersDataWithAvatar':
        if (!params.addressOrDomain) {
          throw new Error('addressOrDomain is required for getProvidersDataWithAvatar');
        }
        return await getProvidersDataWithAvatar({
          addressOrDomain: params.addressOrDomain
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Domain API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 