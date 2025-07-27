import { OneInchFetcher } from "../../utils/fetcher";
import { Wallet } from "../../utils/wallet";

export interface Eip1559GasValueResponse {
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}

export interface Eip1559GasPriceResponse {
  baseFee: string;
  low: Eip1559GasValueResponse;
  medium: Eip1559GasValueResponse;
  high: Eip1559GasValueResponse;
  instant: Eip1559GasValueResponse;
}

/**
 * Get gas price data from 1inch Gas Price API
 * Provides real-time, accurate gas price data across various blockchains
 */
export async function gasAPI(params: {
  chain: number;
  wallet?: Wallet;
}): Promise<Eip1559GasPriceResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  // Supported chains: 1 (Ethereum), 42161 (Arbitrum), 43114 (Avalanche), 
  // 56 (BNB Chain), 100 (Gnosis), 7565164 (Solana), 10 (Optimism), 
  // 137 (Polygon), 324 (zkSync Era), 8453 (Base), etc.
  return await fetcher.get<Eip1559GasPriceResponse>(`/gas-price/v1.6/${params.chain}`);
} 