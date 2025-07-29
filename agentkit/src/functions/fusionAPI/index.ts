import { OneInchFetcher } from "../../utils/fetcher";
import { Wallet } from "../../utils/wallet";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

// Common types
export interface FusionOrder {
  salt: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
}

export interface FusionOrderV4 extends FusionOrder {
  version: "2.0" | "2.1" | "2.2";
}

export interface ActiveOrdersOutput {
  orderHash: string;
  signature: string;
  deadline: string;
  auctionStartDate: string;
  auctionEndDate: string;
  quoteId: string;
  remainingMakerAmount: string;
  extension: string;
  order: FusionOrderV4;
}

export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface GetActiveOrdersOutput {
  meta: Meta;
  items: ActiveOrdersOutput[];
}

export interface SettlementAddressOutput {
  address: string;
}

export interface OrdersByHashesInput {
  orderHashes: string[];
}

export interface AuctionPointOutput {
  delay: number;
  coefficient: number;
}

export interface FillsOutput {
  txHash: object;
  filledMakerAmount: object;
  filledAuctionTakerAmount: object;
  takerFeeAmount: object;
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
}

export interface GetOrderFillsByHashOutput {
  orderHash: string;
  status: "pending" | "filled" | "false-predicate" | "not-enough-balance-or-allowance" | "expired" | "partially-filled" | "wrong-permit" | "cancelled" | "invalid-signature" | "invalid-maker-traits" | "awaiting-signatures";
  order: LimitOrderV4StructOutput;
  extension: string;
  points: AuctionPointOutput[];
  approximateTakingAmount: string;
  fills: FillsOutput[];
  auctionStartDate: number;
  auctionDuration: number;
  initialRateBump: number;
  positiveSurplus: string;
  isNativeCurrency: boolean;
  version: "2.0" | "2.1" | "2.2";
}

export interface FillOutputDto {
  txHash: object;
  filledMakerAmount: object;
  filledAuctionTakerAmount: object;
  takerFeeAmount: object;
}

export interface OrderFillsByMakerOutput {
  receiver: string;
  orderHash: string;
  status: "pending" | "filled" | "false-predicate" | "not-enough-balance-or-allowance" | "expired" | "partially-filled" | "wrong-permit" | "cancelled" | "invalid-signature" | "invalid-maker-traits" | "awaiting-signatures";
  makerAsset: string;
  makerAmount: string;
  minTakerAmount: string;
  approximateTakingAmount: string;
  positiveSurplus: string;
  takerAsset: string;
  cancelTx: object;
  fills: FillOutputDto[];
  points: AuctionPointOutput[];
  auctionStartDate: number;
  auctionDuration: number;
  initialRateBump: number;
  isNativeCurrency: boolean;
  version: "2.0" | "2.1" | "2.2";
  makerTraits: string;
}

// Quoter types
export interface ResolverFee {
  receiver: string;
  bps: number;
  whitelistDiscountPercent: number;
  integratorFee: number;
}

export interface AuctionPointClass {
  delay: number;
  coefficient: number;
}

export interface GasCostConfigClass {
  gasBumpEstimate: number;
  gasPriceEstimate: string;
}

export interface PresetClass {
  bankFee: string;
  auctionDuration: number;
  startAuctionIn: number;
  initialRateBump: number;
  auctionStartAmount: string;
  startAmount: string;
  auctionEndAmount: string;
  exclusiveResolver: object;
  tokenFee: string;
  estP: number;
  points: AuctionPointClass[];
  allowPartialFills: boolean;
  allowMultipleFills: boolean;
  gasCost: GasCostConfigClass;
}

export interface QuotePresetsClass {
  fast: PresetClass;
  medium: PresetClass;
  slow: PresetClass;
  custom?: PresetClass;
}

export interface PairCurrencyValue {
  fromToken: string;
  toToken: string;
}

export interface TokenPairValue {
  usd: PairCurrencyValue;
}

export interface GetQuoteOutput {
  quoteId: object;
  fromTokenAmount: string;
  toTokenAmount: string;
  feeToken: string;
  fee: ResolverFee;
  presets: QuotePresetsClass;
  settlementAddress: string;
  whitelist: string[];
  recommended_preset: "fast" | "medium" | "slow" | "custom";
  suggested: boolean;
  prices: TokenPairValue;
  volume: TokenPairValue;
  surplusFee: number;
}

export interface CustomPresetInput {
  auctionDuration: number;
  auctionStartAmount: number;
  auctionEndAmount: number;
  points?: string[];
}

// Relayer types
export interface OrderInput {
  salt: string;
  makerAsset: string;
  takerAsset: string;
  maker: string;
  receiver?: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits?: string;
}

export interface SignedOrderInput {
  order: OrderInput;
  signature: string;
  extension?: string;
  quoteId: string;
}

// ============================================================================
// PARAMETER INTERFACES
// ============================================================================

// Orders API parameters
export interface GetActiveOrdersParams {
  chain: number;
  page?: number;
  limit?: number;
  version?: "2.0" | "2.1";
  wallet?: Wallet;
}

export interface GetSettlementAddressParams {
  chain: number;
  wallet?: Wallet;
}

export interface GetOrderByHashParams {
  chain: number;
  orderHash: string;
  wallet?: Wallet;
}

export interface GetOrdersByHashesParams {
  chain: number;
  orderHashes: string[];
  wallet?: Wallet;
}

export interface GetOrdersByMakerParams {
  chain: number;
  address: string;
  page?: number;
  limit?: number;
  timestampFrom?: number;
  timestampTo?: number;
  makerToken?: string;
  takerToken?: string;
  withToken?: string;
  version?: "2.0" | "2.1";
  wallet?: Wallet;
}

// Quoter API parameters
export interface GetQuoteParams {
  chain: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  walletAddress: string;
  enableEstimate?: boolean;
  fee?: number;
  showDestAmountMinusFee?: object;
  isPermit2?: string;
  surplus?: boolean;
  permit?: string;
  slippage?: object;
  source?: object;
  wallet?: Wallet;
}

export interface GetQuoteWithCustomPresetParams extends GetQuoteParams {
  customPreset: CustomPresetInput;
}

// Relayer API parameters
export interface SubmitOrderParams {
  chain: number;
  order: SignedOrderInput;
  wallet?: Wallet;
}

export interface SubmitMultipleOrdersParams {
  chain: number;
  orders: SignedOrderInput[];
  wallet?: Wallet;
}

// ============================================================================
// ORDERS API FUNCTIONS
// ============================================================================

/**
 * Get gasless swap active orders
 */
export async function getActiveOrders(params: GetActiveOrdersParams): Promise<GetActiveOrdersOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.version !== undefined) queryParams.version = params.version;

  return await fetcher.get<GetActiveOrdersOutput>(
    `/fusion/orders/v2.0/${params.chain}/order/active`,
    queryParams
  );
}

/**
 * Get actual settlement contract address
 */
export async function getSettlementAddress(params: GetSettlementAddressParams): Promise<SettlementAddressOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  return await fetcher.get<SettlementAddressOutput>(
    `/fusion/orders/v2.0/${params.chain}/order/settlement`
  );
}

/**
 * Get order status by order hash
 */
export async function getOrderByHash(params: GetOrderByHashParams): Promise<GetOrderFillsByHashOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  return await fetcher.get<GetOrderFillsByHashOutput>(
    `/fusion/orders/v2.0/${params.chain}/order/status/${params.orderHash}`
  );
}

/**
 * Get orders by hashes
 */
export async function getOrdersByHashes(params: GetOrdersByHashesParams): Promise<GetOrderFillsByHashOutput[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  const requestBody: OrdersByHashesInput = {
    orderHashes: params.orderHashes
  };

  return await fetcher.post<GetOrderFillsByHashOutput[]>(
    `/fusion/orders/v2.0/${params.chain}/order/status`,
    requestBody
  );
}

/**
 * Get orders by maker address
 */
export async function getOrdersByMaker(params: GetOrdersByMakerParams): Promise<OrderFillsByMakerOutput[]> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.timestampFrom !== undefined) queryParams.timestampFrom = params.timestampFrom;
  if (params.timestampTo !== undefined) queryParams.timestampTo = params.timestampTo;
  if (params.makerToken !== undefined) queryParams.makerToken = params.makerToken;
  if (params.takerToken !== undefined) queryParams.takerToken = params.takerToken;
  if (params.withToken !== undefined) queryParams.withToken = params.withToken;
  if (params.version !== undefined) queryParams.version = params.version;

  return await fetcher.get<OrderFillsByMakerOutput[]>(
    `/fusion/orders/v2.0/${params.chain}/order/maker/${params.address}`,
    queryParams
  );
}

// ============================================================================
// QUOTER API FUNCTIONS
// ============================================================================

/**
 * Get quote details based on input data
 */
export async function getQuote(params: GetQuoteParams): Promise<GetQuoteOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  const queryParams: Record<string, any> = {
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    walletAddress: params.walletAddress
  };

  if (params.enableEstimate !== undefined) queryParams.enableEstimate = params.enableEstimate;
  if (params.fee !== undefined) queryParams.fee = params.fee;
  if (params.showDestAmountMinusFee !== undefined) queryParams.showDestAmountMinusFee = params.showDestAmountMinusFee;
  if (params.isPermit2 !== undefined) queryParams.isPermit2 = params.isPermit2;
  if (params.surplus !== undefined) queryParams.surplus = params.surplus;
  if (params.permit !== undefined) queryParams.permit = params.permit;
  if (params.slippage !== undefined) queryParams.slippage = params.slippage;
  if (params.source !== undefined) queryParams.source = params.source;

  return await fetcher.get<GetQuoteOutput>(
    `/fusion/quoter/v2.0/${params.chain}/quote/receive`,
    queryParams
  );
}

/**
 * Get quote with custom preset details
 */
export async function getQuoteWithCustomPreset(params: GetQuoteWithCustomPresetParams): Promise<GetQuoteOutput> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  const queryParams: Record<string, any> = {
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    walletAddress: params.walletAddress
  };

  if (params.enableEstimate !== undefined) queryParams.enableEstimate = params.enableEstimate;
  if (params.fee !== undefined) queryParams.fee = params.fee;
  if (params.showDestAmountMinusFee !== undefined) queryParams.showDestAmountMinusFee = params.showDestAmountMinusFee;
  if (params.isPermit2 !== undefined) queryParams.isPermit2 = params.isPermit2;
  if (params.surplus !== undefined) queryParams.surplus = params.surplus;
  if (params.permit !== undefined) queryParams.permit = params.permit;
  if (params.source !== undefined) queryParams.source = params.source;

  return await fetcher.post<GetQuoteOutput>(
    `/fusion/quoter/v2.0/${params.chain}/quote/receive?${new URLSearchParams(queryParams)}`,
    params.customPreset
  );
}

// ============================================================================
// RELAYER API FUNCTIONS
// ============================================================================

/**
 * Submit a limit order that resolvers will be able to fill
 */
export async function submitOrder(params: SubmitOrderParams): Promise<void> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  await fetcher.post<void>(
    `/fusion/relayer/v2.0/${params.chain}/order/submit`,
    params.order
  );
}

/**
 * Submit a list of limit orders which resolvers will be able to fill
 */
export async function submitMultipleOrders(params: SubmitMultipleOrdersParams): Promise<void> {
  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    throw new Error("1inch API key is required.");
  }

  const fetcher = new OneInchFetcher(apiKey);
  
  await fetcher.post<void>(
    `/fusion/relayer/v2.0/${params.chain}/order/submit/many`,
    params.orders
  );
}

// ============================================================================
// MAIN FUSION API FUNCTION
// ============================================================================

export interface FusionAPIParams {
  action: "getActiveOrders" | "getSettlementAddress" | "getOrderByHash" | "getOrdersByHashes" | "getOrdersByMaker" | "getQuote" | "getQuoteWithCustomPreset" | "submitOrder" | "submitMultipleOrders";
  chain: number;
  
  // Orders API specific params
  page?: number;
  limit?: number;
  version?: "2.0" | "2.1";
  orderHash?: string;
  orderHashes?: string[];
  address?: string;
  timestampFrom?: number;
  timestampTo?: number;
  makerToken?: string;
  takerToken?: string;
  withToken?: string;
  
  // Quoter API specific params
  fromTokenAddress?: string;
  toTokenAddress?: string;
  amount?: string;
  walletAddress?: string;
  enableEstimate?: boolean;
  fee?: number;
  showDestAmountMinusFee?: object;
  isPermit2?: string;
  surplus?: boolean;
  permit?: string;
  slippage?: object;
  source?: object;
  customPreset?: CustomPresetInput;
  
  // Relayer API specific params
  order?: SignedOrderInput;
  orders?: SignedOrderInput[];
  
  wallet?: Wallet;
}

/**
 * Main Fusion API function that routes to specific endpoints based on action
 */
export async function fusionAPI(params: FusionAPIParams): Promise<any> {
  switch (params.action) {
    case "getActiveOrders":
      return await getActiveOrders({
        chain: params.chain,
        page: params.page,
        limit: params.limit,
        version: params.version,
        wallet: params.wallet
      });
      
    case "getSettlementAddress":
      return await getSettlementAddress({
        chain: params.chain,
        wallet: params.wallet
      });
      
    case "getOrderByHash":
      if (!params.orderHash) {
        throw new Error("orderHash is required for getOrderByHash action");
      }
      return await getOrderByHash({
        chain: params.chain,
        orderHash: params.orderHash,
        wallet: params.wallet
      });
      
    case "getOrdersByHashes":
      if (!params.orderHashes || params.orderHashes.length === 0) {
        throw new Error("orderHashes array is required for getOrdersByHashes action");
      }
      return await getOrdersByHashes({
        chain: params.chain,
        orderHashes: params.orderHashes,
        wallet: params.wallet
      });
      
    case "getOrdersByMaker":
      if (!params.address) {
        throw new Error("address is required for getOrdersByMaker action");
      }
      return await getOrdersByMaker({
        chain: params.chain,
        address: params.address,
        page: params.page,
        limit: params.limit,
        timestampFrom: params.timestampFrom,
        timestampTo: params.timestampTo,
        makerToken: params.makerToken,
        takerToken: params.takerToken,
        withToken: params.withToken,
        version: params.version,
        wallet: params.wallet
      });
      
    case "getQuote":
      if (!params.fromTokenAddress || !params.toTokenAddress || !params.amount || !params.walletAddress) {
        throw new Error("fromTokenAddress, toTokenAddress, amount, and walletAddress are required for getQuote action");
      }
      return await getQuote({
        chain: params.chain,
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        walletAddress: params.walletAddress,
        enableEstimate: params.enableEstimate,
        fee: params.fee,
        showDestAmountMinusFee: params.showDestAmountMinusFee,
        isPermit2: params.isPermit2,
        surplus: params.surplus,
        permit: params.permit,
        slippage: params.slippage,
        source: params.source,
        wallet: params.wallet
      });
      
    case "getQuoteWithCustomPreset":
      if (!params.fromTokenAddress || !params.toTokenAddress || !params.amount || !params.walletAddress || !params.customPreset) {
        throw new Error("fromTokenAddress, toTokenAddress, amount, walletAddress, and customPreset are required for getQuoteWithCustomPreset action");
      }
      return await getQuoteWithCustomPreset({
        chain: params.chain,
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        walletAddress: params.walletAddress,
        customPreset: params.customPreset,
        enableEstimate: params.enableEstimate,
        fee: params.fee,
        showDestAmountMinusFee: params.showDestAmountMinusFee,
        isPermit2: params.isPermit2,
        surplus: params.surplus,
        permit: params.permit,
        slippage: params.slippage,
        source: params.source,
        wallet: params.wallet
      });
      
    case "submitOrder":
      if (!params.order) {
        throw new Error("order is required for submitOrder action");
      }
      return await submitOrder({
        chain: params.chain,
        order: params.order,
        wallet: params.wallet
      });
      
    case "submitMultipleOrders":
      if (!params.orders || params.orders.length === 0) {
        throw new Error("orders array is required for submitMultipleOrders action");
      }
      return await submitMultipleOrders({
        chain: params.chain,
        orders: params.orders,
        wallet: params.wallet
      });
      
    default:
      throw new Error(`Unknown action: ${params.action}`);
  }
}