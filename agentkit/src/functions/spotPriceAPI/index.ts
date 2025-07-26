import { OneInchFetcher } from '../../utils/fetcher';

// Interfaces for request parameters
export interface GetWhitelistedPricesRequest {
  chain: number;
  currency?: string;
}

export interface GetRequestedPricesRequest {
  chain: number;
  tokens: string[];
  currency?: string;
}

export interface GetCurrenciesRequest {
  chain: number;
}

export interface GetPricesForAddressesRequest {
  chain: number;
  addresses: string[];
  currency?: string;
}

// Response interfaces
export interface SpotPriceResponse {
  [tokenAddress: string]: string | number;
}

export interface CurrenciesResponse {
  codes: string[];
}

/**
 * Get prices for whitelisted tokens
 */
async function getWhitelistedPrices(params: GetWhitelistedPricesRequest): Promise<SpotPriceResponse> {
  const { chain, currency } = params;
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  
  let url = `https://api.1inch.dev/price/v1.1/${chain}`;
  if (currency) {
    url += `?currency=${currency}`;
  }
  
  return await fetcher.get(url);
}

/**
 * Get prices for requested tokens via POST
 */
async function getRequestedPrices(params: GetRequestedPricesRequest): Promise<SpotPriceResponse> {
  const { chain, tokens, currency } = params;
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  
  let url = `https://api.1inch.dev/price/v1.1/${chain}`;
  if (currency) {
    url += `?currency=${currency}`;
  }
  
  const payload = { tokens };
  return await fetcher.post(url, payload);
}

/**
 * Get list of custom currencies
 */
async function getCurrencies(params: GetCurrenciesRequest): Promise<CurrenciesResponse> {
  const { chain } = params;
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  
  const url = `https://api.1inch.dev/price/v1.1/${chain}/currencies`;
  return await fetcher.get(url);
}

/**
 * Get prices for multiple addresses via GET
 */
async function getPricesForAddresses(params: GetPricesForAddressesRequest): Promise<SpotPriceResponse> {
  const { chain, addresses, currency } = params;
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  
  let url = `https://api.1inch.dev/price/v1.1/${chain}/${addresses.join(',')}`;
  if (currency) {
    url += `?currency=${currency}`;
  }
  
  return await fetcher.get(url);
}

/**
 * Main spotPriceAPI function
 */
export async function spotPriceAPI(params: {
  endpoint?: 'getWhitelistedPrices' | 'getRequestedPrices' | 'getCurrencies' | 'getPricesForAddresses';
  chain?: number;
  tokens?: string[];
  addresses?: string[];
  currency?: string;
}): Promise<any> {
  try {
    // If no parameters provided, default to getWhitelistedPrices for Ethereum
    if (!params.endpoint && !params.chain) {
      return await getWhitelistedPrices({ chain: 1 });
    }

    // Validate required parameters
    if (!params.endpoint) {
      throw new Error('endpoint parameter is required. Must be one of: getWhitelistedPrices, getRequestedPrices, getCurrencies, getPricesForAddresses');
    }

    if (!params.chain) {
      throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
    }

    switch (params.endpoint) {
      case 'getWhitelistedPrices':
        return await getWhitelistedPrices({
          chain: params.chain,
          currency: params.currency
        });

      case 'getRequestedPrices':
        if (!params.tokens || params.tokens.length === 0) {
          throw new Error('tokens array is required for getRequestedPrices endpoint');
        }
        return await getRequestedPrices({
          chain: params.chain,
          tokens: params.tokens,
          currency: params.currency
        });

      case 'getCurrencies':
        return await getCurrencies({
          chain: params.chain
        });

      case 'getPricesForAddresses':
        if (!params.addresses || params.addresses.length === 0) {
          throw new Error('addresses array is required for getPricesForAddresses endpoint');
        }
        return await getPricesForAddresses({
          chain: params.chain,
          addresses: params.addresses,
          currency: params.currency
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Spot Price API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 