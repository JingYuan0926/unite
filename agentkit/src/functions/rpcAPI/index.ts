import { OneInchFetcher } from "../../utils/fetcher";
import { Wallet } from "../../utils/wallet";

export interface RpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: any[];
  id: number | string | null;
}

export interface RpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
}

/**
 * Perform JSON-RPC calls against blockchain nodes using 1inch Web3 RPC API
 * Provides reliable, real-time data access and interaction capabilities
 */
export async function rpcAPI(params: {
  chainId: number;
  nodeType?: string;
  method: string;
  params?: any[];
  id?: number | string | null;
  wallet?: Wallet;
}): Promise<RpcResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  // Build the request body
  const requestBody: RpcRequest = {
    jsonrpc: "2.0",
    method: params.method,
    params: params.params || [],
    id: params.id || 1
  };

  // Build the URL with optional nodeType
  let url = `/web3/${params.chainId}`;
  if (params.nodeType) {
    url += `/${params.nodeType}`;
  }

  // Supported chains: 1 (Ethereum), 42161 (Arbitrum), 43114 (Avalanche), 
  // 56 (BNB Chain), 100 (Gnosis), 7565164 (Solana), 10 (Optimism), 
  // 137 (Polygon), 324 (zkSync Era), 8453 (Base), etc.
  
  return await fetcher.post<RpcResponse>(url, requestBody);
} 