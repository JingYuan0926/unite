import { OneInchFetcher } from "../../utils/fetcher";
import { logger } from "../../utils/logger";
import { walletManager } from "../../utils/wallet";

// Import the official 1inch Fusion+ SDK
const { SDK, NetworkEnum, PresetEnum, HashLock } = require("@1inch/cross-chain-sdk");
const { PrivateKeyProviderConnector } = require("@1inch/fusion-sdk");
const { randomBytes } = require("crypto");

// Initialize the SDK
let sdk: any = null;

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  
  return obj;
}

// Custom blockchain provider that can work with both local and frontend wallets
class HybridBlockchainProvider {
  private walletContext: any;

  constructor() {
    this.walletContext = walletManager.getWalletContext();
  }

  async signTypedData(typedData: any): Promise<string> {
    const connectedWallet = this.walletContext.wallet;
    
    if (!connectedWallet) {
      throw new Error("No wallet connected. Please connect your wallet first.");
    }

    if (connectedWallet.privateKey) {
      // Local wallet with private key - use ethers to sign
      const { ethers } = require("ethers");
      const wallet = new ethers.Wallet(connectedWallet.privateKey);
      return await wallet.signTypedData(
        typedData.domain,
        { [typedData.primaryType]: typedData.types[typedData.primaryType] },
        typedData.message
      );
    } else {
      // Frontend wallet (like MetaMask) - throw error to trigger frontend signing
      throw new Error("FRONTEND_SIGNING_REQUIRED: Typed data needs to be signed by frontend wallet");
    }
  }

  async getAddress(): Promise<string> {
    const connectedWallet = this.walletContext.wallet;
    if (!connectedWallet) {
      throw new Error("No wallet connected. Please connect your wallet first.");
    }
    return connectedWallet.address;
  }
}

function initializeSDK() {
  if (!sdk) {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      throw new Error("1inch API key is required. Set ONEINCH_API_KEY environment variable.");
    }

    const connectedWallet = walletManager.getWalletContext().wallet;
    
    if (!connectedWallet) {
      throw new Error("No wallet connected. Please connect your wallet first.");
    }

    let blockchainProvider: any;
    
    if (connectedWallet.privateKey) {
      // Local wallet with private key - use the SDK's PrivateKeyProviderConnector
      blockchainProvider = new PrivateKeyProviderConnector(connectedWallet.privateKey, null);
      logger.info('Using local wallet with private key for SDK');
    } else {
      // Frontend wallet - use our custom provider
      blockchainProvider = new HybridBlockchainProvider();
      logger.info('Using frontend wallet with custom provider for SDK');
    }
    
    try {
      sdk = new SDK({
        url: "https://api.1inch.dev/fusion-plus",
        authKey: apiKey,
        blockchainProvider,
      });
      logger.info('SDK initialized successfully');
    } catch (error) {
      logger.error('SDK initialization error:', error);
      throw error;
    }
  }
  return sdk;
}

// Helper function to generate secrets
function generateSecrets(count: number): string[] {
  return Array.from({ length: count }, () => "0x" + randomBytes(32).toString("hex"));
}

// Helper function to create hash lock
function createHashLock(secrets: string[]) {
  if (secrets.length === 1) {
    return HashLock.forSingleFill(secrets[0]);
  } else {
    return HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));
  }
}

// Helper function to get secret hashes
function getSecretHashes(secrets: string[]): string[] {
  return secrets.map((s) => HashLock.hashSecret(s));
}

// Network enum mapping
const NETWORK_MAP: { [key: number]: any } = {
  1: NetworkEnum.ETHEREUM,
  10: NetworkEnum.OPTIMISM,
  137: NetworkEnum.POLYGON,
  42161: NetworkEnum.ARBITRUM,
  56: NetworkEnum.BSC,
};

// Preset enum mapping
const PRESET_MAP: { [key: string]: any } = {
  fast: PresetEnum.fast,
  medium: PresetEnum.medium,
  slow: PresetEnum.slow,
};

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
  secrets: string[];
  secretHashes: string[];
  quoteId: string;
}

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
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY!);
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
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY!);
  const url = `/fusion-plus/orders/v1.0/order/escrow?chainId=${params.chainId}`;
  
  return await fetcher.get<EscrowFactory>(url);
}

/**
 * Get quote details based on input data using SDK
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
  const sdk = initializeSDK();
  
  const srcChainId = NETWORK_MAP[params.srcChain];
  const dstChainId = NETWORK_MAP[params.dstChain];
  
  if (!srcChainId || !dstChainId) {
    throw new Error(`Unsupported chain: ${params.srcChain} or ${params.dstChain}`);
  }

  logger.info('Getting quote with SDK:', {
    amount: params.amount,
    srcChainId,
    dstChainId,
    srcTokenAddress: params.srcTokenAddress,
    dstTokenAddress: params.dstTokenAddress,
    walletAddress: params.walletAddress
  });

  try {
    const quote = await sdk.getQuote({
      amount: params.amount,
      srcChainId,
      dstChainId,
      enableEstimate: params.enableEstimate,
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      walletAddress: params.walletAddress,
    });

    logger.info('Quote received:', {
      srcTokenAmount: quote.srcTokenAmount,
      dstTokenAmount: quote.dstTokenAmount,
      presets: Object.keys(quote.presets)
    });

    return serializeBigInt(quote);
  } catch (error) {
    logger.error('SDK getQuote error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params: {
        amount: params.amount,
        srcChainId,
        dstChainId,
        srcTokenAddress: params.srcTokenAddress,
        dstTokenAddress: params.dstTokenAddress,
        walletAddress: params.walletAddress
      }
    });
    throw error;
  }
}

/**
 * Build order using SDK
 */
export async function buildOrder(params: {
  srcChain: number;
  dstChain: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: number;
  walletAddress: string;
  quote: GetQuoteOutput;
  secretsHashList: string[];
  fee?: number;
  source?: string;
  isPermit2?: string;
  isMobile?: string;
  feeReceiver?: string;
  permit?: string;
  preset?: string;
}): Promise<BuildOrderOutput> {
  const sdk = initializeSDK();
  
  const srcChainId = NETWORK_MAP[params.srcChain];
  const dstChainId = NETWORK_MAP[params.dstChain];
  
  if (!srcChainId || !dstChainId) {
    throw new Error(`Unsupported chain: ${params.srcChain} or ${params.dstChain}`);
  }

  const preset = params.preset ? PRESET_MAP[params.preset] : PresetEnum.fast;
  
  logger.info('Building order with SDK:', {
    srcChainId,
    dstChainId,
    preset,
    walletAddress: params.walletAddress
  });

  // Generate secrets based on the preset
  const secretsCount = params.quote.presets[preset as keyof QuotePresets]?.secretsCount || 1;
  const secrets = generateSecrets(secretsCount);
  const hashLock = createHashLock(secrets);
  const secretHashes = getSecretHashes(secrets);

  logger.info('Generated secrets and hash lock:', {
    secretsCount,
    secretHashesCount: secretHashes.length
  });

  // Create order using SDK
  const { hash, quoteId, order } = await sdk.createOrder(params.quote, {
    walletAddress: params.walletAddress,
    hashLock,
    preset,
    source: params.source || "1inch-agent-kit",
    secretHashes,
  });

  logger.info('Order created successfully:', { hash, quoteId });

  return serializeBigInt({
    typedData: order, // The SDK returns the order directly
    orderHash: hash,
    extension: "0x", // SDK handles this internally
    secrets,
    secretHashes,
    quoteId
  });
}

/**
 * Submit order using SDK
 */
export async function submitOrder(params: {
  order: any; // Change from OrderInput to any since the SDK order object is complex
  srcChainId: number;
  signature: string;
  extension: string;
  quoteId: string;
  secretHashes?: string[];
}): Promise<any> {
  const sdk = initializeSDK();
  
  const srcChainId = NETWORK_MAP[params.srcChainId];
  
  if (!srcChainId) {
    throw new Error(`Unsupported chain: ${params.srcChainId}`);
  }

  logger.info('Submitting order with SDK:', {
    srcChainId,
    quoteId: params.quoteId,
    secretHashesCount: params.secretHashes?.length || 0
  });

  try {
    // Check if the order has a build method (SDK order object)
    if (params.order && typeof params.order.build === 'function') {
      // This is a proper SDK order object with build method
      const orderInfo = await sdk.submitOrder(
        srcChainId,
        params.order,
        params.quoteId,
        params.secretHashes || []
      );
      logger.info('Order submitted successfully:', orderInfo);
      return serializeBigInt(orderInfo);
    } else {
      // This is likely a plain order object, we need to handle it differently
      logger.info('Order object does not have build method, attempting alternative submission');
      
      // For orders without build method, we need to use the signature-based submission
      if (!params.signature || params.signature === "0x") {
        throw new Error('FRONTEND_SIGNING_REQUIRED: Order needs to be signed by frontend wallet');
      }
      
      // Extract the actual order data - SDK order objects have nested structures
      let orderData = params.order;
      
      // Navigate through the nested structure to find the actual order data
      if (params.order && params.order.inner) {
        logger.info('Extracting order data from inner property');
        orderData = params.order.inner;
        
        // If inner still has nested structure, go deeper
        if (orderData && orderData.inner) {
          logger.info('Extracting order data from inner.inner property');
          orderData = orderData.inner;
        }
      }
      
      // Now map the SDK order structure to the API-expected OrderInput format
      const mappedOrderData: OrderInput = {
        salt: orderData._salt?.toString() || orderData.salt?.toString() || '0',
        makerAsset: orderData.makerAsset || '0x0000000000000000000000000000000000000000',
        takerAsset: orderData.takerAsset || '0x0000000000000000000000000000000000000000', 
        maker: orderData.maker || '0x0000000000000000000000000000000000000000',
        receiver: orderData.receiver || '0x0000000000000000000000000000000000000000',
        makingAmount: orderData.makingAmount?.toString() || '0',
        takingAmount: orderData.takingAmount?.toString() || '0',
        makerTraits: orderData.makerTraits?.toString() || '0'
      };
      
      logger.info('Mapped order data to API format:', {
        originalStructure: {
          keys: Object.keys(orderData),
          _salt: orderData._salt?.toString(),
          makerAsset: orderData.makerAsset,
          takerAsset: orderData.takerAsset
        },
        mappedStructure: mappedOrderData
      });
      
      logger.info('Order data structure:', {
        originalKeys: Object.keys(params.order),
        extractedKeys: Object.keys(orderData),
        mappedKeys: Object.keys(mappedOrderData),
        hasInner: !!params.order.inner
      });
      
      // Use the fetcher for direct API submission with signature
      const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY!);
      const url = `/fusion-plus/relayer/v1.0/submit`;
      
      // Format the data according to SignedOrderInput interface
      const submitData: SignedOrderInput = {
        order: mappedOrderData, // Use the properly mapped order data
        srcChainId: params.srcChainId,
        signature: params.signature,
        extension: params.extension,
        quoteId: params.quoteId,
        secretHashes: params.secretHashes || []
      };
      
      logger.info('Submitting order data:', {
        orderKeys: Object.keys(mappedOrderData),
        orderValues: mappedOrderData,
        srcChainId: params.srcChainId,
        signatureLength: params.signature.length,
        quoteId: params.quoteId,
        secretHashesCount: (params.secretHashes || []).length
      });
      
      const result = await fetcher.post<any>(url, submitData);
      logger.info('Order submitted successfully via API:', result);
      return serializeBigInt(result);
    }
  } catch (error) {
    // Check if this is a frontend signing request
    if (error instanceof Error && error.message.includes('FRONTEND_SIGNING_REQUIRED')) {
      logger.info('Frontend signing required for order submission');
      
      // Return the data needed for frontend signing
      return {
        requiresFrontendSigning: true,
        order: params.order,
        srcChainId: params.srcChainId,
        quoteId: params.quoteId,
        secretHashes: params.secretHashes || [],
        extension: params.extension,
        error: 'FRONTEND_SIGNING_REQUIRED: Order needs to be signed by frontend wallet'
      };
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Submit many cross chain orders that resolvers will be able to fill
 */
export async function submitManyOrders(params: {
  orderHashes: string[];
}): Promise<any> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY!);
  const url = `/fusion-plus/relayer/v1.0/submit/many`;
  
  return await fetcher.post<any>(url, params.orderHashes);
}

/**
 * Submit a secret for order fill after SrcEscrow and DstEscrow deployed and DstChain finality lock passed
 */
export async function submitSecret(params: {
  secret: string;
  orderHash: string;
}): Promise<any> {
  const sdk = initializeSDK();
  
  logger.info('Submitting secret with SDK:', {
    orderHash: params.orderHash
  });

  await sdk.submitSecret(params.orderHash, params.secret);
  
  logger.info('Secret submitted successfully');
  
  return serializeBigInt({ success: true });
}

/**
 * Execute a complete cross-chain swap using Fusion+ (combines quote and place order)
 */
export async function executeCrossChainSwap(params: {
  srcChain: number;
  dstChain: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: number;
  walletAddress: string;
  preset?: string;
  source?: string;
}): Promise<any> {
  const sdk = initializeSDK();
  
  const srcChainId = NETWORK_MAP[params.srcChain];
  const dstChainId = NETWORK_MAP[params.dstChain];
  
  if (!srcChainId || !dstChainId) {
    throw new Error(`Unsupported chain: ${params.srcChain} or ${params.dstChain}`);
  }

  const preset = params.preset ? PRESET_MAP[params.preset] : PresetEnum.fast;
  
  logger.info('Executing cross-chain swap:', {
    srcChainId,
    dstChainId,
    preset,
    walletAddress: params.walletAddress,
    amount: params.amount
  });

  try {
    // Step 1: Get Quote
    logger.info('Step 1: Getting quote...');
    const quote = await sdk.getQuote({
      amount: params.amount,
      srcChainId,
      dstChainId,
      enableEstimate: true,
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      walletAddress: params.walletAddress,
    });

    logger.info('Quote received:', {
      srcTokenAmount: quote.srcTokenAmount,
      dstTokenAmount: quote.dstTokenAmount,
      presets: Object.keys(quote.presets)
    });

    // Step 2: Generate secrets and hash lock (based on documentation)
    logger.info('Step 2: Generating secrets and hash lock...');
    const secretsCount = quote.getPreset().secretsCount;
    const secrets = Array.from({ length: secretsCount }).map(() => "0x" + randomBytes(32).toString("hex"));
    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

    logger.info('Generated secrets and hash lock:', {
      secretsCount,
      secretHashesCount: secretHashes.length
    });

    // Create HashLock based on documentation
    const hashLock = secretsCount === 1
      ? HashLock.forSingleFill(secrets[0])
      : HashLock.forMultipleFills(
          secretHashes.map((secretHash, i) => {
            const { solidityPackedKeccak256 } = require("ethers");
            return solidityPackedKeccak256(
              ["uint64", "bytes32"],
              [i, secretHash.toString()]
            );
          })
        );

    // Step 3: Place Order (using the correct SDK method from documentation)
    logger.info('Step 3: Placing order using SDK placeOrder method...');
    try {
      const orderResponse = await sdk.placeOrder(quote, {
        walletAddress: params.walletAddress,
        hashLock,
        secretHashes,
        preset,
        source: params.source || "1inch-agent-kit"
      });

      logger.info('Order placed successfully:', orderResponse);

      // Return the complete result
      return serializeBigInt({
        success: true,
        quote: serializeBigInt(quote),
        orderHash: orderResponse.orderHash,
        quoteId: orderResponse.quoteId || quote.quoteId,
        secrets: secrets,
        secretHashes: secretHashes,
        orderResponse: serializeBigInt(orderResponse)
      });

    } catch (error) {
      // Check if this is a frontend signing request
      if (error instanceof Error && error.message.includes('FRONTEND_SIGNING_REQUIRED')) {
        logger.info('Frontend signing required for order placement');
        
        // Return the data needed for frontend signing
        return {
          requiresFrontendSigning: true,
          success: false,
          error: 'FRONTEND_SIGNING_REQUIRED: Order needs to be signed by frontend wallet',
          quote: serializeBigInt(quote),
          secrets: secrets,
          secretHashes: secretHashes,
          hashLock: serializeBigInt(hashLock),
          preset,
          walletAddress: params.walletAddress,
          source: params.source || "1inch-agent-kit",
          srcChainId: params.srcChain,
          dstChainId: params.dstChain,
          // Add the orderInput structure that the frontend expects
          orderInput: {
            salt: '0',
            makerAsset: params.srcTokenAddress,
            takerAsset: params.dstTokenAddress,
            maker: params.walletAddress,
            receiver: params.walletAddress,
            makingAmount: params.amount.toString(),
            takingAmount: '0',
            makerTraits: '0'
          },
          typedData: {
            domain: {
              name: '1inch Fusion',
              version: '1',
              chainId: params.srcChain,
              verifyingContract: '0x1111111254fb6c44bAC0beD2854e76F90643097d'
            },
            types: {
              Order: [
                { name: 'salt', type: 'uint256' },
                { name: 'makerAsset', type: 'address' },
                { name: 'takerAsset', type: 'address' },
                { name: 'maker', type: 'address' },
                { name: 'receiver', type: 'address' },
                { name: 'makingAmount', type: 'uint256' },
                { name: 'takingAmount', type: 'uint256' },
                { name: 'makerTraits', type: 'uint256' }
              ]
            },
            primaryType: 'Order',
            message: {
              salt: '0',
              makerAsset: params.srcTokenAddress,
              takerAsset: params.dstTokenAddress,
              maker: params.walletAddress,
              receiver: params.walletAddress,
              makingAmount: params.amount.toString(),
              takingAmount: '0',
              makerTraits: '0'
            }
          }
        };
      }
      
      // Re-throw other errors
      throw error;
    }

  } catch (error) {
    logger.error('Cross-chain swap execution error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params: {
        srcChain: params.srcChain,
        dstChain: params.dstChain,
        srcTokenAddress: params.srcTokenAddress,
        dstTokenAddress: params.dstTokenAddress,
        amount: params.amount,
        walletAddress: params.walletAddress
      }
    });
    throw error;
  }
}

/**
 * Main fusionPlusAPI function that handles all Fusion+ operations
 */
export async function fusionPlusAPI(params: {
  endpoint: 'getActiveOrders' | 'getEscrowFactory' | 'getQuote' | 'buildOrder' | 'submitOrder' | 'submitManyOrders' | 'submitSecret' | 'executeCrossChainSwap';
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
  // Build order parameters
  quote?: GetQuoteOutput;
  secretsHashList?: string[];
  source?: string;
  isMobile?: string;
  feeReceiver?: string;
  preset?: string;
  // Submit order parameters
  order?: OrderInput;
  srcChainId?: number; // Separate parameter for submitOrder
  signature?: string;
  extension?: string;
  quoteId?: string;
  secretHashes?: string[];
  // Submit many orders parameters
  orderHashes?: string[];
  // Submit secret parameters
  secret?: string;
  orderHash?: string;
}): Promise<any> {
  try {
    // Validate endpoint parameter
    if (!params.endpoint) {
      throw new Error('endpoint parameter is required');
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
          throw new Error('chainId parameter is required for getEscrowFactory');
        }
        return await getEscrowFactory({
          chainId: params.chainId
        });

      case 'getQuote':
        if (!params.srcChain) {
          throw new Error('srcChain parameter is required for getQuote');
        }
        if (!params.dstChain) {
          throw new Error('dstChain parameter is required for getQuote');
        }
        if (!params.srcTokenAddress) {
          throw new Error('srcTokenAddress parameter is required for getQuote');
        }
        if (!params.dstTokenAddress) {
          throw new Error('dstTokenAddress parameter is required for getQuote');
        }
        if (!params.amount) {
          throw new Error('amount parameter is required for getQuote');
        }
        if (!params.walletAddress) {
          throw new Error('walletAddress parameter is required for getQuote');
        }
        if (params.enableEstimate === undefined) {
          throw new Error('enableEstimate parameter is required for getQuote');
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

      case 'buildOrder':
        if (!params.srcChain) {
          throw new Error('srcChain parameter is required for buildOrder');
        }
        if (!params.dstChain) {
          throw new Error('dstChain parameter is required for buildOrder');
        }
        if (!params.srcTokenAddress) {
          throw new Error('srcTokenAddress parameter is required for buildOrder');
        }
        if (!params.dstTokenAddress) {
          throw new Error('dstTokenAddress parameter is required for buildOrder');
        }
        if (!params.amount) {
          throw new Error('amount parameter is required for buildOrder');
        }
        if (!params.walletAddress) {
          throw new Error('walletAddress parameter is required for buildOrder');
        }
        if (!params.quote) {
          throw new Error('quote parameter is required for buildOrder');
        }
        return await buildOrder({
          srcChain: params.srcChain,
          dstChain: params.dstChain,
          srcTokenAddress: params.srcTokenAddress,
          dstTokenAddress: params.dstTokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress,
          quote: params.quote,
          secretsHashList: params.secretsHashList || [],
          fee: params.fee,
          source: params.source,
          isPermit2: params.isPermit2,
          isMobile: params.isMobile,
          feeReceiver: params.feeReceiver,
          permit: params.permit,
          preset: params.preset
        });

      case 'submitOrder':
        if (!params.order) {
          throw new Error('order parameter is required for submitOrder');
        }
        if (!params.srcChainId) {
          throw new Error('srcChainId parameter is required for submitOrder');
        }
        if (!params.quoteId) {
          throw new Error('quoteId parameter is required for submitOrder');
        }
        
        return await submitOrder({
          order: params.order, // This should be the complex order object from createOrder
          srcChainId: params.srcChainId,
          signature: params.signature || "0x", // SDK handles signing internally
          extension: params.extension || "0x",
          quoteId: params.quoteId,
          secretHashes: params.secretHashes
        });

      case 'submitManyOrders':
        if (!params.orderHashes) {
          throw new Error('orderHashes parameter is required for submitManyOrders');
        }
        return await submitManyOrders({
          orderHashes: params.orderHashes
        });

      case 'submitSecret':
        if (!params.secret) {
          throw new Error('secret parameter is required for submitSecret');
        }
        if (!params.orderHash) {
          throw new Error('orderHash parameter is required for submitSecret');
        }
        return await submitSecret({
          secret: params.secret,
          orderHash: params.orderHash
        });

      case 'executeCrossChainSwap':
        if (!params.srcChain) {
          throw new Error('srcChain parameter is required for executeCrossChainSwap');
        }
        if (!params.dstChain) {
          throw new Error('dstChain parameter is required for executeCrossChainSwap');
        }
        if (!params.srcTokenAddress) {
          throw new Error('srcTokenAddress parameter is required for executeCrossChainSwap');
        }
        if (!params.dstTokenAddress) {
          throw new Error('dstTokenAddress parameter is required for executeCrossChainSwap');
        }
        if (!params.amount) {
          throw new Error('amount parameter is required for executeCrossChainSwap');
        }
        if (!params.walletAddress) {
          throw new Error('walletAddress parameter is required for executeCrossChainSwap');
        }
        if (params.preset === undefined) {
          throw new Error('preset parameter is required for executeCrossChainSwap');
        }
        return await executeCrossChainSwap({
          srcChain: params.srcChain,
          dstChain: params.dstChain,
          srcTokenAddress: params.srcTokenAddress,
          dstTokenAddress: params.dstTokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress,
          preset: params.preset,
          source: params.source
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Fusion+ API error: ${error instanceof Error ? error.message : String(error)}`);
  }
} 