import { OneInchFetcher } from "../../utils/fetcher";
import { Wallet, walletManager } from "../../utils/wallet";

// Request interfaces
export interface CustomTokensRequest {
  tokens: string[];
}

export interface CustomTokensAndWalletsRequest {
  tokens: string[];
  wallets: string[];
}

// Response interfaces
export interface TokenBalance {
  [tokenAddress: string]: string;
}

export interface AggregatedBalancesAndAllowancesResponse {
  decimals: number;
  symbol: string;
  tags: string[];
  address: string;
  name: string;
  logoURI: string;
  isCustom: boolean;
  wallets: Record<string, any>;
  type: string;
  tracked?: boolean;
}

export interface BalancesAndAllowancesResponse {
  [tokenAddress: string]: {
    balance: string;
    allowance?: string;
  };
}

// Parameter interfaces for individual functions
export interface GetAggregatedBalancesAndAllowancesParams {
  chain: number;
  spender: string;
  wallets: string[];
  filterEmpty?: boolean;
}

export interface GetBalancesParams {
  chain: number;
  walletAddress: string;
}

export interface GetCustomTokenBalancesParams {
  chain: number;
  walletAddress: string;
  tokens: string[];
}

export interface GetMultipleWalletsTokenBalancesParams {
  chain: number;
  tokens: string[];
  wallets: string[];
}

export interface GetBalancesAndAllowancesParams {
  chain: number;
  spender: string;
  walletAddress: string;
}

export interface GetCustomTokenBalancesAndAllowancesParams {
  chain: number;
  spender: string;
  walletAddress: string;
  tokens: string[];
}

export interface GetAllowancesParams {
  chain: number;
  spender: string;
  walletAddress: string;
}

export interface GetCustomTokenAllowancesParams {
  chain: number;
  spender: string;
  walletAddress: string;
  tokens: string[];
}

/**
 * Get balances and allowances by spender for list of wallets addresses
 */
async function getAggregatedBalancesAndAllowances(
  params: GetAggregatedBalancesAndAllowancesParams
): Promise<AggregatedBalancesAndAllowancesResponse[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  let url = `/balance/v1.2/${params.chain}/aggregatedBalancesAndAllowances/${params.spender}`;
  
  const queryParams: Record<string, any> = {
    wallets: params.wallets
  };
  
  if (params.filterEmpty !== undefined) {
    queryParams.filterEmpty = params.filterEmpty;
  }

  return await fetcher.get<AggregatedBalancesAndAllowancesResponse[]>(url, queryParams);
}

/**
 * Get balances of tokens for walletAddress
 */
async function getBalances(params: GetBalancesParams): Promise<TokenBalance> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/balances/${params.walletAddress}`;
  
  return await fetcher.get<TokenBalance>(url);
}

/**
 * Get balances of custom tokens for walletAddress
 */
async function getCustomTokenBalances(
  params: GetCustomTokenBalancesParams
): Promise<TokenBalance> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/balances/${params.walletAddress}`;
  
  const requestBody: CustomTokensRequest = {
    tokens: params.tokens
  };

  return await fetcher.post<TokenBalance>(url, requestBody);
}

/**
 * Get balances of custom tokens for list of wallets addresses
 */
async function getMultipleWalletsTokenBalances(
  params: GetMultipleWalletsTokenBalancesParams
): Promise<Record<string, TokenBalance>> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/balances/multiple/walletsAndTokens`;
  
  const requestBody: CustomTokensAndWalletsRequest = {
    tokens: params.tokens,
    wallets: params.wallets
  };

  return await fetcher.post<Record<string, TokenBalance>>(url, requestBody);
}

/**
 * Get balances and allowances of tokens by spender for walletAddress
 */
async function getBalancesAndAllowances(
  params: GetBalancesAndAllowancesParams
): Promise<BalancesAndAllowancesResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/allowancesAndBalances/${params.spender}/${params.walletAddress}`;
  
  return await fetcher.get<BalancesAndAllowancesResponse>(url);
}

/**
 * Get balances and allowances of custom tokens by spender for walletAddress
 */
async function getCustomTokenBalancesAndAllowances(
  params: GetCustomTokenBalancesAndAllowancesParams
): Promise<BalancesAndAllowancesResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/allowancesAndBalances/${params.spender}/${params.walletAddress}`;
  
  const requestBody: CustomTokensRequest = {
    tokens: params.tokens
  };

  return await fetcher.post<BalancesAndAllowancesResponse>(url, requestBody);
}

/**
 * Get allowances of tokens by spender for walletAddress
 */
async function getAllowances(params: GetAllowancesParams): Promise<TokenBalance> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/allowances/${params.spender}/${params.walletAddress}`;
  
  return await fetcher.get<TokenBalance>(url);
}

/**
 * Get allowances of custom tokens by spender for walletAddress
 */
async function getCustomTokenAllowances(
  params: GetCustomTokenAllowancesParams
): Promise<TokenBalance> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/balance/v1.2/${params.chain}/allowances/${params.spender}/${params.walletAddress}`;
  
  const requestBody: CustomTokensRequest = {
    tokens: params.tokens
  };

  return await fetcher.post<TokenBalance>(url, requestBody);
}

/**
 * Main balanceAPI function that handles all 8 endpoints
 */
export async function balanceAPI(params: {
  endpoint: 
    | "aggregatedBalancesAndAllowances"
    | "getBalances" 
    | "getCustomTokenBalances"
    | "getMultipleWalletsTokenBalances"
    | "getBalancesAndAllowances"
    | "getCustomTokenBalancesAndAllowances"
    | "getAllowances"
    | "getCustomTokenAllowances";
  chain: number;
  walletAddress?: string;
  spender?: string;
  wallets?: string[];
  tokens?: string[];
  filterEmpty?: boolean;
  wallet?: Wallet;
}): Promise<any> {
  try {
    // Initialize wallet manager if not already done
    if (!walletManager.getWalletContext().isConnected) {
      await walletManager.initialize();
    }
    
    // Use wallet address from connected wallet if not provided
    const connectedWallet = walletManager.getWalletContext().wallet;
    const walletAddress = params.walletAddress || params.wallet?.address || connectedWallet?.address;
    
    // Optional debug logging (uncomment for debugging)
    // console.log('Balance API Debug:');
    // console.log('  - params.walletAddress:', params.walletAddress);
    // console.log('  - params.wallet?.address:', params.wallet?.address);
    // console.log('  - connectedWallet?.address:', connectedWallet?.address);
    // console.log('  - final walletAddress:', walletAddress);
    // console.log('  - chain:', params.chain);
    // console.log('  - endpoint:', params.endpoint);
    
    switch (params.endpoint) {
      case "aggregatedBalancesAndAllowances":
        if (!params.spender) {
          throw new Error("spender is required for aggregatedBalancesAndAllowances endpoint");
        }
        if (!params.wallets || params.wallets.length === 0) {
          throw new Error("wallets array is required for aggregatedBalancesAndAllowances endpoint");
        }
        return await getAggregatedBalancesAndAllowances({
          chain: params.chain,
          spender: params.spender,
          wallets: params.wallets,
          filterEmpty: params.filterEmpty
        });

      case "getBalances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getBalances endpoint");
        }
        return await getBalances({
          chain: params.chain,
          walletAddress: walletAddress
        });

      case "getCustomTokenBalances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getCustomTokenBalances endpoint");
        }
        if (!params.tokens || params.tokens.length === 0) {
          throw new Error("tokens array is required for getCustomTokenBalances endpoint");
        }
        return await getCustomTokenBalances({
          chain: params.chain,
          walletAddress: walletAddress,
          tokens: params.tokens
        });

      case "getMultipleWalletsTokenBalances":
        if (!params.wallets || params.wallets.length === 0) {
          throw new Error("wallets array is required for getMultipleWalletsTokenBalances endpoint");
        }
        if (!params.tokens || params.tokens.length === 0) {
          throw new Error("tokens array is required for getMultipleWalletsTokenBalances endpoint");
        }
        return await getMultipleWalletsTokenBalances({
          chain: params.chain,
          tokens: params.tokens,
          wallets: params.wallets
        });

      case "getBalancesAndAllowances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getBalancesAndAllowances endpoint");
        }
        if (!params.spender) {
          throw new Error("spender is required for getBalancesAndAllowances endpoint");
        }
        return await getBalancesAndAllowances({
          chain: params.chain,
          spender: params.spender,
          walletAddress: walletAddress
        });

      case "getCustomTokenBalancesAndAllowances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getCustomTokenBalancesAndAllowances endpoint");
        }
        if (!params.spender) {
          throw new Error("spender is required for getCustomTokenBalancesAndAllowances endpoint");
        }
        if (!params.tokens || params.tokens.length === 0) {
          throw new Error("tokens array is required for getCustomTokenBalancesAndAllowances endpoint");
        }
        return await getCustomTokenBalancesAndAllowances({
          chain: params.chain,
          spender: params.spender,
          walletAddress: walletAddress,
          tokens: params.tokens
        });

      case "getAllowances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getAllowances endpoint");
        }
        if (!params.spender) {
          throw new Error("spender is required for getAllowances endpoint");
        }
        return await getAllowances({
          chain: params.chain,
          spender: params.spender,
          walletAddress: walletAddress
        });

      case "getCustomTokenAllowances":
        if (!walletAddress) {
          throw new Error("walletAddress is required for getCustomTokenAllowances endpoint");
        }
        if (!params.spender) {
          throw new Error("spender is required for getCustomTokenAllowances endpoint");
        }
        if (!params.tokens || params.tokens.length === 0) {
          throw new Error("tokens array is required for getCustomTokenAllowances endpoint");
        }
        return await getCustomTokenAllowances({
          chain: params.chain,
          spender: params.spender,
          walletAddress: walletAddress,
          tokens: params.tokens
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Balance API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export individual functions for direct use
export {
  getAggregatedBalancesAndAllowances,
  getBalances,
  getCustomTokenBalances,
  getMultipleWalletsTokenBalances,
  getBalancesAndAllowances,
  getCustomTokenBalancesAndAllowances,
  getAllowances,
  getCustomTokenAllowances
};