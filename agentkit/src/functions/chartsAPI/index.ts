import { OneInchFetcher } from "../../utils/fetcher";
import { Wallet } from "../../utils/wallet";

export interface LineData {
  time: number;
  value: number;
}

export interface LinesResponse {
  data: LineData[];
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlesResponse {
  data: CandleData[];
}

export type ChartPeriod = "24H" | "1W" | "1M" | "1Y" | "AllTime";
export type CandleSeconds = 300 | 900 | 3600 | 14400 | 86400 | 604800;

export interface LineChartParams {
  token0: string;
  token1: string;
  period: ChartPeriod;
  chainId: number;
}

export interface CandleChartParams {
  token0: string;
  token1: string;
  seconds: CandleSeconds;
  chainId: number;
}

/**
 * Get historical line chart data for a specific token pair and period
 */
export async function getLineChart(params: LineChartParams): Promise<LinesResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/charts/v1.0/chart/line/${params.token0}/${params.token1}/${params.period}/${params.chainId}`;
  
  return await fetcher.get<LinesResponse>(url);
}

/**
 * Get historical candle chart data for a specific token pair and period
 */
export async function getCandleChart(params: CandleChartParams): Promise<CandlesResponse> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/charts/v1.0/chart/aggregated/candle/${params.token0}/${params.token1}/${params.seconds}/${params.chainId}`;
  
  return await fetcher.get<CandlesResponse>(url);
}

/**
 * Main charts API function that can handle both line and candle charts
 */
export async function chartsAPI(params: {
  type: "line" | "candle";
  token0: string;
  token1: string;
  period?: ChartPeriod;
  seconds?: CandleSeconds;
  chainId: number;
  wallet?: Wallet;
}): Promise<LinesResponse | CandlesResponse> {
  if (params.type === "line") {
    if (!params.period) {
      throw new Error("Period is required for line charts. Supported periods: 24H, 1W, 1M, 1Y, AllTime");
    }
    return await getLineChart({
      token0: params.token0,
      token1: params.token1,
      period: params.period,
      chainId: params.chainId
    });
  } else if (params.type === "candle") {
    if (!params.seconds) {
      throw new Error("Seconds is required for candle charts. Supported seconds: 300, 900, 3600, 14400, 86400, 604800");
    }
    return await getCandleChart({
      token0: params.token0,
      token1: params.token1,
      seconds: params.seconds,
      chainId: params.chainId
    });
  } else {
    throw new Error("Invalid chart type. Must be 'line' or 'candle'");
  }
} 