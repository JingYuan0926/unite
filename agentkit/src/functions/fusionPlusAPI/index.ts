import { OneInchFetcher } from "../../utils/fetcher";

// Basic types for Fusion+ API
export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface CrossChainOrderDto {
  salt: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
  secretHashes: string[][];
  fills: string[];
}

export interface ActiveOrdersOutput {
  orderHash: string;
  signature: string;
  deadline: number;
  auctionStartDate: number;
  auctionEndDate: number;
  quoteId: string;
  remainingMakerAmount: string;
  makerBalance: string;
  makerAllowance: string;
  isMakerContract: boolean;
  extension: string;
  srcChainId: number;
  dstChainId: number;
  order: CrossChainOrderDto;
}

export interface GetActiveOrdersOutput {
  meta: Meta;
  items: ActiveOrdersOutput[];
}

export interface EscrowFactory {
  address: string;
}

export interface GetOrderByMakerOutput {
  meta: Meta;
  items: ActiveOrdersOutput[];
}

export interface PublicSecret {
  idx: number;
  secret: string;
}

export interface Immutables {
  orderHash: string;
  hashlock: string;
  maker: string;
  taker: string;
  token: string;
  amount: string;
  safetyDeposit: string;
  timelocks: string;
}

export interface ResolverDataOutput {
  orderType: 'SingleFill' | 'MultipleFills';
  secrets: PublicSecret[];
  srcImmutables: Immutables;
  dstImmutables: Immutables;
  secretHashes: string[][];
}

export interface ReadyToAcceptSecretFill {
  idx: number;
  srcEscrowDeployTxHash: string;
  dstEscrowDeployTxHash: string;
}

export interface ReadyToAcceptSecretFills {
  fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForOrder {
  orderHash: string;
  makerAddress: string;
  fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForAllOrders {
  orders: ReadyToAcceptSecretFillsForOrder[];
}

export interface ReadyToExecutePublicAction {
  action: 'withdraw' | 'cancel';
  immutables: Immutables;
  chainId: number;
  escrow: string;
  secret?: string;
}

export interface ReadyToExecutePublicActionsOutput {
  actions: ReadyToExecutePublicAction[];
}

export interface FillOutputDto {
  status: 'pending' | 'executed' | 'refunding' | 'refunded';
  txHash: string;
  filledMakerAmount: string;
  filledAuctionTakerAmount: string;
}

export interface EscrowEventDataOutput {
  transactionHash: string;
  escrow: string;
  side: 'src' | 'dst';
  action: 'src_escrow_created' | 'dst_escrow_created' | 'withdrawn' | 'funds_rescued' | 'escrow_cancelled';
  blockTimestamp: number;
}

export interface AuctionPointOutput {
  delay: number;
  coefficient: number;
  approximateTakingAmount: string;
  positiveSurplus: string;
}

export interface LimitOrderV4StructOutput {
  salt: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
  extension: string;
  points: AuctionPointOutput;
}

export interface GetOrderFillsByHashOutput {
  orderHash: string;
  status: 'pending' | 'executed' | 'expired' | 'cancelled' | 'refunding' | 'refunded';
  validation: 'valid' | 'order-predicate-returned-false' | 'not-enough-balance' | 'not-enough-allowance' | 'invalid-permit-signature' | 'invalid-permit-spender' | 'invalid-permit-signer' | 'invalid-signature' | 'failed-to-parse-permit-details' | 'unknown-permit-version' | 'wrong-epoch-manager-and-bit-invalidator' | 'failed-to-decode-remaining' | 'unknown-failure';
  order: LimitOrderV4StructOutput;
  fills: FillOutputDto[];
  escrowEvents: EscrowEventDataOutput[];
  auctionStartDate: number;
  auctionDuration: number;
  initialRateBump: number;
  createdAt: number;
  srcTokenPriceUsd: any;
  dstTokenPriceUsd: any;
  cancelTx: any;
  srcChainId: number;
  dstChainId: number;
  cancelable: boolean;
  takerAsset: string;
  timeLocks: string;
}

// Quoter types
export interface AuctionPoint {
  delay: number;
  coefficient: number;
}

export interface GasCostConfig {
  gasBumpEstimate: number;
  gasPriceEstimate: string;
}

export interface Preset {
  auctionDuration: number;
  startAuctionIn: number;
  initialRateBump: number;
  auctionStartAmount: string;
  startAmount: string;
  auctionEndAmount: string;
  exclusiveResolver: any;
  costInDstToken: string;
  points: AuctionPoint[];
  allowPartialFills: boolean;
  allowMultipleFills: boolean;
  gasCost: GasCostConfig;
  gasBumpEstimate: number;
  gasPriceEstimate: string;
  secretsCount: number;
}

export interface QuotePresets {
  fast: Preset;
  medium: Preset;
  slow: Preset;
  custom?: Preset;
}

export interface TimeLocks {
  srcWithdrawal: number;
  srcPublicWithdrawal: number;
  srcCancellation: number;
  srcPublicCancellation: number;
  dstWithdrawal: number;
  dstPublicWithdrawal: number;
  dstCancellation: number;
}

export interface TokenPair {
  srcToken: string;
  dstToken: string;
}

export interface PairCurrency {
  usd: TokenPair;
}

export interface GetQuoteOutput {
  quoteId: any;
  srcTokenAmount: string;
  dstTokenAmount: string;
  presets: QuotePresets;
  srcEscrowFactory: string;
  dstEscrowFactory: string;
  whitelist: string[];
  timeLocks: TimeLocks;
  srcSafetyDeposit: string;
  dstSafetyDeposit: string;
  recommendedPreset: 'fast' | 'slow' | 'medium' | 'custom';
  prices: PairCurrency;
  volume: PairCurrency;
}

export interface CustomPresetParams {
  // Add custom preset parameters as needed
}

export interface BuildOrderBody {
  quote: GetQuoteOutput;
  secretsHashList: string[];
}

export interface BuildOrderOutput {
  typedData: any;
  orderHash: string;
  extension: string;
}

// Relayer types
export interface OrderInput {
  salt: string;
  makerAsset: string;
  takerAsset: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
}

export interface SignedOrderInput {
  order: OrderInput;
  srcChainId: number;
  signature: string;
  extension: string;
  quoteId: string;
  secretHashes: string[];
}

export interface SecretInput {
  secret: string;
  orderHash: string;
}

/**
 * Get cross chain swap active orders
 */
export async function getActiveOrders(params: {
  page?: number;
  limit?: number;
  srcChain?: number;
  dstChain?: number;
}): Promise<GetActiveOrdersOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.srcChain) queryParams.append('srcChain', params.srcChain.toString());
  if (params.dstChain) queryParams.append('dstChain', params.dstChain.toString());

  const url = `/fusion-plus/orders/v1.0/order/active${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return await fetcher.get<GetActiveOrdersOutput>(url);
}

/**
 * Get actual escrow factory contract address
 */
export async function getEscrowFactory(params: {
  chainId: number;
}): Promise<EscrowFactory> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const url = `/fusion-plus/orders/v1.0/order/escrow?chainId=${params.chainId}`;
  
  return await fetcher.get<EscrowFactory>(url);
}

/**
 * Get quote details based on input data
 */
export async function getQuote(params: {
  srcChain: number;
  dstChain: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: number;
  walletAddress: string;
  enableEstimate: boolean;
  fee?: number;
  isPermit2?: string;
  permit?: string;
}): Promise<GetQuoteOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  const queryParams = new URLSearchParams();
  
  queryParams.append('srcChain', params.srcChain.toString());
  queryParams.append('dstChain', params.dstChain.toString());
  queryParams.append('srcTokenAddress', params.srcTokenAddress);
  queryParams.append('dstTokenAddress', params.dstTokenAddress);
  queryParams.append('amount', params.amount.toString());
  queryParams.append('walletAddress', params.walletAddress);
  queryParams.append('enableEstimate', params.enableEstimate.toString());
  if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
  if (params.isPermit2) queryParams.append('isPermit2', params.isPermit2);
  if (params.permit) queryParams.append('permit', params.permit);

  const url = `/fusion-plus/quoter/v1.0/quote/receive?${queryParams.toString()}`;
  
  return await fetcher.get<GetQuoteOutput>(url);
}

/**
 * Main fusionPlusAPI function that handles all Fusion+ operations
 */
export async function fusionPlusAPI(params: {
  endpoint: 'getActiveOrders' | 'getEscrowFactory' | 'getQuote';
  // Parameters for different endpoints
  page?: number;
  limit?: number;
  srcChain?: number;
  dstChain?: number;
  chainId?: number;
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  amount?: number;
  walletAddress?: string;
  enableEstimate?: boolean;
  fee?: number;
  isPermit2?: string;
  permit?: string;
}): Promise<any> {
  try {
    // Validate endpoint parameter
    if (!params.endpoint) {
      throw new Error('Endpoint parameter is required. Please specify: getActiveOrders, getEscrowFactory, or getQuote');
    }

    switch (params.endpoint) {
      case 'getActiveOrders':
        return await getActiveOrders({
          page: params.page,
          limit: params.limit,
          srcChain: params.srcChain,
          dstChain: params.dstChain
        });

      case 'getEscrowFactory':
        if (!params.chainId) {
          throw new Error('chainId parameter is required for getEscrowFactory. Please specify a valid chain ID (e.g., 1 for Ethereum, 137 for Polygon, 42161 for Arbitrum)');
        }
        return await getEscrowFactory({ chainId: params.chainId });

      case 'getQuote':
        if (!params.srcChain) {
          throw new Error('srcChain parameter is required for getQuote. Please specify the source chain ID (e.g., 1 for Ethereum, 137 for Polygon, 42161 for Arbitrum)');
        }
        if (!params.dstChain) {
          throw new Error('dstChain parameter is required for getQuote. Please specify the destination chain ID (e.g., 1 for Ethereum, 137 for Polygon, 42161 for Arbitrum)');
        }
        if (!params.srcTokenAddress) {
          throw new Error('srcTokenAddress parameter is required for getQuote. Please specify the source token address (e.g., "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" for ETH)');
        }
        if (!params.dstTokenAddress) {
          throw new Error('dstTokenAddress parameter is required for getQuote. Please specify the destination token address (e.g., "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" for ETH)');
        }
        if (!params.amount) {
          throw new Error('amount parameter is required for getQuote. Please specify the amount in wei (e.g., 100000000000000000 for 0.1 ETH)');
        }
        if (!params.walletAddress) {
          throw new Error('walletAddress parameter is required for getQuote. Please specify the wallet address');
        }
        if (params.enableEstimate === undefined) {
          throw new Error('enableEstimate parameter is required for getQuote. Please specify true or false');
        }
        return await getQuote({
          srcChain: params.srcChain,
          dstChain: params.dstChain,
          srcTokenAddress: params.srcTokenAddress,
          dstTokenAddress: params.dstTokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress,
          enableEstimate: params.enableEstimate,
          fee: params.fee,
          isPermit2: params.isPermit2,
          permit: params.permit
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}. Valid endpoints are: getActiveOrders, getEscrowFactory, getQuote`);
    }
  } catch (error) {
    throw new Error(`Fusion+ API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 