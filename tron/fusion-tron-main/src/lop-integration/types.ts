// SPDX-License-Identifier: MIT

/**
 * @title LOP Integration Types
 * @notice TypeScript interfaces for 1inch Limit Order Protocol integration
 */

export interface Address {
  get(): string;
}

export interface MakerTraits {
  // LOP MakerTraits structure
  value: bigint;
}

export interface Order {
  salt: bigint;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: bigint;
  takingAmount: bigint;
  makerTraits: bigint;
}

export interface FusionOrderData {
  srcToken: string; // Source token address (ETH = "0x0000000000000000000000000000000000000000")
  dstToken: string; // Destination token address (TRX representation)
  srcChainId: number; // Source chain ID (Ethereum Sepolia = 11155111)
  dstChainId: number; // Destination chain ID (Tron Nile = 3448148188)
  secretHash: string; // Hash of the atomic swap secret (0x prefixed)
  timelock: number; // Timelock duration in seconds
  safetyDeposit: bigint; // Required safety deposit amount in wei
  resolver: string; // Address that will resolve the swap
}

export interface FusionOrderParams {
  maker: string;
  srcToken: string;
  dstToken: string;
  srcAmount: bigint;
  dstAmount: bigint;
  secretHash: string;
  timelock: number;
  resolver: string;
  safetyDeposit: bigint;
}

export interface SignedOrder {
  order: Order;
  signature: string;
  fusionData: FusionOrderData;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface OrderTypeData {
  domain: EIP712Domain;
  types: Record<string, Array<{ name: string; type: string }>>;
  order: Order;
}

export interface LOPContractAddresses {
  limitOrderProtocol: string;
  fusionExtension: string;
  escrowFactory: string;
  weth: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  contracts: LOPContractAddresses;
}

// Constants
export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
export const TRON_NILE_CHAIN_ID = 3448148188;

export const SEPOLIA_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
export const ETH_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Tron address representation in Ethereum format (for demo purposes)
export const TRON_ZERO_ADDRESS_ETH_FORMAT =
  "0x0000000000000000000000000000000000000001";

// Order traits flags
export const POST_INTERACTION_FLAG = 1n << 251n;
export const PARTIAL_FILL_FLAG = 1n << 255n;

// Default values
export const DEFAULT_TIMELOCK = 3600; // 1 hour
export const DEFAULT_SAFETY_DEPOSIT = "100000000000000000"; // 0.1 ETH
