import { OneInchFetcher } from "../../utils/fetcher";
import { walletManager } from "../../utils/wallet";
import { WalletUtils } from "../../utils/wallet";

// Types for Swap API
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  domainVersion?: string;
  eip2612?: boolean;
  isFoT?: boolean;
  tags?: string[];
}

export interface SelectedLiquiditySource {
  name: string;
  part: number;
  gas?: number;
}

export interface TokenHop {
  part: number;
  dst: string;
  fromTokenId: number;
  toTokenId: number;
  protocols: SelectedLiquiditySource[];
}

export interface TokenSwaps {
  token: string;
  hops: TokenHop[];
}

export interface QuoteResponse {
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  dstAmount: string;
  protocols: TokenSwaps[];
  gas?: string;
}

export interface TransactionData {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: number;
}

export interface SwapResponse {
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  dstAmount: string;
  protocols: TokenSwaps[];
  tx: TransactionData;
}

export interface SpenderResponse {
  address: string;
}

export interface ApproveCallDataResponse {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}

export interface AllowanceResponse {
  allowance: string;
}

export interface ProtocolImage {
  id: string;
  title: string;
  img: string;
  img_color: string;
}

export interface ProtocolsResponse {
  protocols: ProtocolImage[];
}

export interface TokensResponse {
  tokens: { [address: string]: TokenInfo };
}

// Individual endpoint functions
export async function getQuote(params: {
  chain: number;
  src: string;
  dst: string;
  amount: string;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: number;
  parts?: number;
  mainRouteParts?: number;
  gasLimit?: number;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
  connectorTokens?: string;
  excludedProtocols?: string;
}): Promise<QuoteResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('src', params.src);
  queryParams.append('dst', params.dst);
  queryParams.append('amount', params.amount);
  
  if (params.protocols) queryParams.append('protocols', params.protocols);
  if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
  if (params.gasPrice) queryParams.append('gasPrice', params.gasPrice);
  if (params.complexityLevel !== undefined) queryParams.append('complexityLevel', params.complexityLevel.toString());
  if (params.parts !== undefined) queryParams.append('parts', params.parts.toString());
  if (params.mainRouteParts !== undefined) queryParams.append('mainRouteParts', params.mainRouteParts.toString());
  if (params.gasLimit !== undefined) queryParams.append('gasLimit', params.gasLimit.toString());
  if (params.includeTokensInfo !== undefined) queryParams.append('includeTokensInfo', params.includeTokensInfo.toString());
  if (params.includeProtocols !== undefined) queryParams.append('includeProtocols', params.includeProtocols.toString());
  if (params.includeGas !== undefined) queryParams.append('includeGas', params.includeGas.toString());
  if (params.connectorTokens) queryParams.append('connectorTokens', params.connectorTokens);
  if (params.excludedProtocols) queryParams.append('excludedProtocols', params.excludedProtocols);

  const url = `/swap/v6.1/${params.chain}/quote?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as QuoteResponse;
}

export async function getSwap(params: {
  chain: number;
  src: string;
  dst: string;
  amount: string;
  from: string;
  origin: string;
  slippage: number;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: number;
  parts?: number;
  mainRouteParts?: number;
  gasLimit?: number;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
  connectorTokens?: string;
  excludedProtocols?: string;
  permit?: string;
  receiver?: string;
  referrer?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
  compatibility?: boolean;
  usePermit2?: boolean;
}): Promise<SwapResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('src', params.src);
  queryParams.append('dst', params.dst);
  queryParams.append('amount', params.amount);
  queryParams.append('from', params.from);
  queryParams.append('origin', params.origin);
  queryParams.append('slippage', params.slippage.toString());
  
  if (params.protocols) queryParams.append('protocols', params.protocols);
  if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
  if (params.gasPrice) queryParams.append('gasPrice', params.gasPrice);
  if (params.complexityLevel !== undefined) queryParams.append('complexityLevel', params.complexityLevel.toString());
  if (params.parts !== undefined) queryParams.append('parts', params.parts.toString());
  if (params.mainRouteParts !== undefined) queryParams.append('mainRouteParts', params.mainRouteParts.toString());
  if (params.gasLimit !== undefined) queryParams.append('gasLimit', params.gasLimit.toString());
  if (params.includeTokensInfo !== undefined) queryParams.append('includeTokensInfo', params.includeTokensInfo.toString());
  if (params.includeProtocols !== undefined) queryParams.append('includeProtocols', params.includeProtocols.toString());
  if (params.includeGas !== undefined) queryParams.append('includeGas', params.includeGas.toString());
  if (params.connectorTokens) queryParams.append('connectorTokens', params.connectorTokens);
  if (params.excludedProtocols) queryParams.append('excludedProtocols', params.excludedProtocols);
  if (params.permit) queryParams.append('permit', params.permit);
  if (params.receiver) queryParams.append('receiver', params.receiver);
  if (params.referrer) queryParams.append('referrer', params.referrer);
  if (params.allowPartialFill !== undefined) queryParams.append('allowPartialFill', params.allowPartialFill.toString());
  if (params.disableEstimate !== undefined) queryParams.append('disableEstimate', params.disableEstimate.toString());
  if (params.compatibility !== undefined) queryParams.append('compatibility', params.compatibility.toString());
  if (params.usePermit2 !== undefined) queryParams.append('usePermit2', params.usePermit2.toString());

  const url = `/swap/v6.1/${params.chain}/swap?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as SwapResponse;
}

export async function getSpender(params: {
  chain: number;
}): Promise<SpenderResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/swap/v6.1/${params.chain}/approve/spender`);
  return response as SpenderResponse;
}

export async function getApproveTransaction(params: {
  chain: number;
  tokenAddress: string;
  amount?: string;
}): Promise<ApproveCallDataResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('tokenAddress', params.tokenAddress);
  if (params.amount) queryParams.append('amount', params.amount);

  const url = `/swap/v6.1/${params.chain}/approve/transaction?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as ApproveCallDataResponse;
}

export async function getAllowance(params: {
  chain: number;
  tokenAddress: string;
  walletAddress: string;
}): Promise<AllowanceResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const queryParams = new URLSearchParams();
  
  queryParams.append('tokenAddress', params.tokenAddress);
  queryParams.append('walletAddress', params.walletAddress);

  const url = `/swap/v6.1/${params.chain}/approve/allowance?${queryParams.toString()}`;
  const response = await fetcher.get(url);
  return response as AllowanceResponse;
}

export async function getLiquiditySources(params: {
  chain: number;
}): Promise<ProtocolsResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/swap/v6.1/${params.chain}/liquidity-sources`);
  return response as ProtocolsResponse;
}

export async function getTokens(params: {
  chain: number;
}): Promise<TokensResponse> {
  const fetcher = new OneInchFetcher(process.env.ONEINCH_API_KEY || '');
  const response = await fetcher.get(`/swap/v6.1/${params.chain}/tokens`);
  return response as TokensResponse;
}

// Wallet integration functions
export async function executeSwap(params: {
  chain: number;
  src: string;
  dst: string;
  amount: string;
  slippage: number;
  walletAddress: string;
  privateKey: string;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  receiver?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
}): Promise<{ txHash: string; swapResponse: SwapResponse }> {
  try {
    // Get swap transaction data
    const swapResponse = await getSwap({
      chain: params.chain,
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.walletAddress,
      origin: params.walletAddress,
      slippage: params.slippage,
      protocols: params.protocols,
      fee: params.fee,
      gasPrice: params.gasPrice,
      receiver: params.receiver,
      allowPartialFill: params.allowPartialFill,
      disableEstimate: params.disableEstimate
    });

    // Create wallet and sign transaction
    const wallet = WalletUtils.createWallet(params.privateKey, params.chain);
    await walletManager.initialize(wallet);
    
    const txResult = await walletManager.signAndSendTransaction({
      to: swapResponse.tx.to,
      data: swapResponse.tx.data,
      value: BigInt(swapResponse.tx.value),
      gasPrice: BigInt(swapResponse.tx.gasPrice),
      gas: BigInt(swapResponse.tx.gas),
      chainId: params.chain
    });

    return { txHash: txResult.hash, swapResponse };
  } catch (error) {
    throw new Error(`Swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeApprove(params: {
  chain: number;
  tokenAddress: string;
  amount: string;
  walletAddress: string;
  privateKey: string;
}): Promise<{ txHash: string; approveResponse: ApproveCallDataResponse }> {
  try {
    // Get approve transaction data
    const approveResponse = await getApproveTransaction({
      chain: params.chain,
      tokenAddress: params.tokenAddress,
      amount: params.amount
    });

    // Create wallet and sign transaction
    const wallet = WalletUtils.createWallet(params.privateKey, params.chain);
    await walletManager.initialize(wallet);
    
    const txResult = await walletManager.signAndSendTransaction({
      to: approveResponse.to,
      data: approveResponse.data,
      value: BigInt(approveResponse.value),
      gasPrice: BigInt(approveResponse.gasPrice),
      chainId: params.chain
    });

    return { txHash: txResult.hash, approveResponse };
  } catch (error) {
    throw new Error(`Approve execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main swapAPI function that handles all Swap operations
 */
export async function swapAPI(params: {
  endpoint: 'getQuote' | 'getSwap' | 'getSpender' | 'getApproveTransaction' | 'getAllowance' | 'getLiquiditySources' | 'getTokens' | 'executeSwap' | 'executeApprove';
  chain: number;
  // getQuote params
  src?: string;
  dst?: string;
  amount?: string;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: number;
  parts?: number;
  mainRouteParts?: number;
  gasLimit?: number;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
  connectorTokens?: string;
  excludedProtocols?: string;
  // getSwap params
  from?: string;
  origin?: string;
  slippage?: number;
  permit?: string;
  receiver?: string;
  referrer?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
  compatibility?: boolean;
  usePermit2?: boolean;
  // getApproveTransaction params
  tokenAddress?: string;
  // getAllowance params
  walletAddress?: string;
  // executeSwap/executeApprove params
  privateKey?: string;
}): Promise<any> {
  try {
    switch (params.endpoint) {
      case 'getQuote':
        if (!params.src || !params.dst || !params.amount) {
          throw new Error('src, dst, and amount are required for getQuote');
        }
        return await getQuote({
          chain: params.chain,
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          protocols: params.protocols,
          fee: params.fee,
          gasPrice: params.gasPrice,
          complexityLevel: params.complexityLevel,
          parts: params.parts,
          mainRouteParts: params.mainRouteParts,
          gasLimit: params.gasLimit,
          includeTokensInfo: params.includeTokensInfo,
          includeProtocols: params.includeProtocols,
          includeGas: params.includeGas,
          connectorTokens: params.connectorTokens,
          excludedProtocols: params.excludedProtocols
        });

      case 'getSwap':
        if (!params.src || !params.dst || !params.amount || !params.from || !params.origin || params.slippage === undefined) {
          throw new Error('src, dst, amount, from, origin, and slippage are required for getSwap');
        }
        return await getSwap({
          chain: params.chain,
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          from: params.from,
          origin: params.origin,
          slippage: params.slippage,
          protocols: params.protocols,
          fee: params.fee,
          gasPrice: params.gasPrice,
          complexityLevel: params.complexityLevel,
          parts: params.parts,
          mainRouteParts: params.mainRouteParts,
          gasLimit: params.gasLimit,
          includeTokensInfo: params.includeTokensInfo,
          includeProtocols: params.includeProtocols,
          includeGas: params.includeGas,
          connectorTokens: params.connectorTokens,
          excludedProtocols: params.excludedProtocols,
          permit: params.permit,
          receiver: params.receiver,
          referrer: params.referrer,
          allowPartialFill: params.allowPartialFill,
          disableEstimate: params.disableEstimate,
          compatibility: params.compatibility,
          usePermit2: params.usePermit2
        });

      case 'getSpender':
        return await getSpender({
          chain: params.chain
        });

      case 'getApproveTransaction':
        if (!params.tokenAddress) {
          throw new Error('tokenAddress is required for getApproveTransaction');
        }
        return await getApproveTransaction({
          chain: params.chain,
          tokenAddress: params.tokenAddress,
          amount: params.amount
        });

      case 'getAllowance':
        if (!params.tokenAddress || !params.walletAddress) {
          throw new Error('tokenAddress and walletAddress are required for getAllowance');
        }
        return await getAllowance({
          chain: params.chain,
          tokenAddress: params.tokenAddress,
          walletAddress: params.walletAddress
        });

      case 'getLiquiditySources':
        return await getLiquiditySources({
          chain: params.chain
        });

      case 'getTokens':
        return await getTokens({
          chain: params.chain
        });

      case 'executeSwap':
        if (!params.src || !params.dst || !params.amount || params.slippage === undefined || !params.walletAddress || !params.privateKey) {
          throw new Error('src, dst, amount, slippage, walletAddress, and privateKey are required for executeSwap');
        }
        return await executeSwap({
          chain: params.chain,
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          slippage: params.slippage,
          walletAddress: params.walletAddress,
          privateKey: params.privateKey,
          protocols: params.protocols,
          fee: params.fee,
          gasPrice: params.gasPrice,
          receiver: params.receiver,
          allowPartialFill: params.allowPartialFill,
          disableEstimate: params.disableEstimate
        });

      case 'executeApprove':
        if (!params.tokenAddress || !params.amount || !params.walletAddress || !params.privateKey) {
          throw new Error('tokenAddress, amount, walletAddress, and privateKey are required for executeApprove');
        }
        return await executeApprove({
          chain: params.chain,
          tokenAddress: params.tokenAddress,
          amount: params.amount,
          walletAddress: params.walletAddress,
          privateKey: params.privateKey
        });

      default:
        throw new Error(`Unknown endpoint: ${params.endpoint}`);
    }
  } catch (error) {
    throw new Error(`Swap API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 