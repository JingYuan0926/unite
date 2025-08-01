import { OneInchFetcher } from "../../utils/fetcher";

// Types for Transaction Gateway API
export interface BroadcastRequest {
  rawTransaction: string;
}

export interface BroadcastResponse {
  transactionHash: string;
}

// Individual endpoint functions
export async function broadcastPublicTransaction(params: {
  chain: number;
  rawTransaction: string;
}): Promise<BroadcastResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.post(`/tx-gateway/v1.1/${params.chain}/broadcast`, {
    rawTransaction: params.rawTransaction
  });
  return response as BroadcastResponse;
}

export async function broadcastPrivateTransaction(params: {
  chain: number;
  rawTransaction: string;
}): Promise<BroadcastResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.post(`/tx-gateway/v1.1/${params.chain}/flashbots`, {
    rawTransaction: params.rawTransaction
  });
  return response as BroadcastResponse;
}

/**
 * Main transactionAPI function that handles all Transaction Gateway operations
 */
export async function transactionAPI(params: {
  endpoint: 'broadcastPublicTransaction' | 'broadcastPrivateTransaction';
  chain: number;
  rawTransaction: string;
}): Promise<BroadcastResponse> {
  try {
    switch (params.endpoint) {
      case 'broadcastPublicTransaction':
        return await broadcastPublicTransaction({
          chain: params.chain,
          rawTransaction: params.rawTransaction
        });

      case 'broadcastPrivateTransaction':
        return await broadcastPrivateTransaction({
          chain: params.chain,
          rawTransaction: params.rawTransaction
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Transaction Gateway API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 