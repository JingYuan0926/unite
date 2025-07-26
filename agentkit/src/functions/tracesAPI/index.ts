import { OneInchFetcher } from "../../utils/fetcher";

// Interfaces for request parameters
export interface GetSyncedIntervalParams {
  chain: number;
}

export interface GetBlockTraceByNumberParams {
  chain: number;
  blockNumber: string;
}

export interface GetTransactionTraceByHashParams {
  chain: number;
  blockNumber: string;
  txHash: string;
}

export interface GetTransactionTraceByOffsetParams {
  chain: number;
  blockNumber: string;
  offset: number;
}

// Interfaces for responses
export interface SyncedIntervalResponse {
  from: number;
  to: number;
}

export interface BlockTraceResponse {
  type: string;
  version: string;
  number: number;
  blockHash: string;
  blockTimestamp: string;
  traces: any[];
}

export interface TransactionTraceResponse {
  transactionTrace: any[];
  type: string;
}

// Individual functions for each endpoint
async function getSyncedInterval(params: GetSyncedIntervalParams): Promise<SyncedIntervalResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  const response = await fetcher.get(`/traces/v1.0/chain/${params.chain}/synced-interval`);
  return response as SyncedIntervalResponse;
}

async function getBlockTraceByNumber(params: GetBlockTraceByNumberParams): Promise<BlockTraceResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  const response = await fetcher.get(`/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}`);
  return response as BlockTraceResponse;
}

async function getTransactionTraceByHash(params: GetTransactionTraceByHashParams): Promise<TransactionTraceResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  const response = await fetcher.get(`/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}/tx-hash/${params.txHash}`);
  return response as TransactionTraceResponse;
}

async function getTransactionTraceByOffset(params: GetTransactionTraceByOffsetParams): Promise<TransactionTraceResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error('ONEINCH_API_KEY environment variable is required');
  }
  const fetcher = new OneInchFetcher(apiKey);
  const response = await fetcher.get(`/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}/offset/${params.offset}`);
  return response as TransactionTraceResponse;
}

// Main tracesAPI function
export async function tracesAPI(params: {
  endpoint: 'getSyncedInterval' | 'getBlockTraceByNumber' | 'getTransactionTraceByHash' | 'getTransactionTraceByOffset';
  chain: number;
  blockNumber?: string;
  txHash?: string;
  offset?: number;
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'getSyncedInterval':
        return await getSyncedInterval({ chain: params.chain });

      case 'getBlockTraceByNumber':
        if (!params.blockNumber) {
          throw new Error('blockNumber is required for getBlockTraceByNumber endpoint');
        }
        return await getBlockTraceByNumber({ 
          chain: params.chain, 
          blockNumber: params.blockNumber 
        });

      case 'getTransactionTraceByHash':
        if (!params.blockNumber || !params.txHash) {
          throw new Error('blockNumber and txHash are required for getTransactionTraceByHash endpoint');
        }
        return await getTransactionTraceByHash({ 
          chain: params.chain, 
          blockNumber: params.blockNumber, 
          txHash: params.txHash 
        });

      case 'getTransactionTraceByOffset':
        if (!params.blockNumber || params.offset === undefined) {
          throw new Error('blockNumber and offset are required for getTransactionTraceByOffset endpoint');
        }
        return await getTransactionTraceByOffset({ 
          chain: params.chain, 
          blockNumber: params.blockNumber, 
          offset: params.offset 
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Traces API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export individual functions for direct use
export {
  getSyncedInterval,
  getBlockTraceByNumber,
  getTransactionTraceByHash,
  getTransactionTraceByOffset
}; 