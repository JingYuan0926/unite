// SPDX-License-Identifier: MIT

import { ethers } from "ethers";
import {
  Order,
  FusionOrderParams,
  OrderTypeData,
  EIP712Domain,
  POST_INTERACTION_FLAG,
  ETH_ZERO_ADDRESS,
  DEFAULT_TIMELOCK,
} from "./types.js";

/**
 * @title FusionOrderBuilder
 * @notice Builds and signs LOP orders for Fusion cross-chain swaps
 */
export class FusionOrderBuilder {
  private domain: EIP712Domain;
  private types: Record<string, Array<{ name: string; type: string }>>;

  constructor(private chainId: number, private lopAddress: string) {
    // EIP-712 domain for LOP v4
    this.domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: chainId,
      verifyingContract: lopAddress,
    };

    // EIP-712 type definitions for LOP orders
    this.types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };
  }

  /**
   * Build a Fusion order for cross-chain swaps
   * @param params Order parameters
   * @returns Order type data ready for signing
   */
  buildFusionOrder(params: FusionOrderParams): OrderTypeData {
    // Generate random salt for uniqueness
    const salt = ethers.hexlify(ethers.randomBytes(32));

    // Build maker traits with postInteraction flag
    const makerTraits = this.buildMakerTraits();

    const order: Order = {
      salt: BigInt(salt),
      maker: params.maker,
      receiver: ETH_ZERO_ADDRESS, // No specific receiver (use maker)
      makerAsset: params.srcToken,
      takerAsset: params.dstToken,
      makingAmount: params.srcAmount,
      takingAmount: params.dstAmount,
      makerTraits: makerTraits,
    };

    return {
      domain: this.domain,
      types: this.types,
      order: order,
    };
  }

  /**
   * Sign an order using a wallet
   * @param orderTypeData Order data to sign
   * @param signer Ethers signer (wallet)
   * @returns Signature string
   */
  async signOrder(
    orderTypeData: OrderTypeData,
    signer: ethers.Signer
  ): Promise<string> {
    const signature = await signer.signTypedData(
      orderTypeData.domain,
      orderTypeData.types,
      orderTypeData.order
    );
    return signature;
  }

  /**
   * Build a complete signed order
   * @param params Order parameters
   * @param signer Ethers signer (wallet)
   * @returns Signed order with signature
   */
  async buildAndSignOrder(params: FusionOrderParams, signer: ethers.Signer) {
    const orderTypeData = this.buildFusionOrder(params);
    const signature = await this.signOrder(orderTypeData, signer);

    return {
      orderTypeData,
      signature,
    };
  }

  /**
   * Encode fusion order data for extraData parameter
   * @param params Order parameters
   * @returns ABI-encoded fusion data
   */
  encodeFusionData(params: FusionOrderParams): string {
    const fusionData = {
      srcToken: params.srcToken,
      dstToken: params.dstToken,
      srcChainId: 11155111, // Ethereum Sepolia
      dstChainId: 3448148188, // Tron Nile
      secretHash: params.secretHash,
      timelock: params.timelock || DEFAULT_TIMELOCK,
      safetyDeposit: params.safetyDeposit,
      resolver: params.resolver,
    };

    // ABI encode the fusion data struct
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address,address,uint256,uint256,bytes32,uint64,uint256,address)"],
      [
        [
          fusionData.srcToken,
          fusionData.dstToken,
          fusionData.srcChainId,
          fusionData.dstChainId,
          fusionData.secretHash,
          fusionData.timelock,
          fusionData.safetyDeposit,
          fusionData.resolver,
        ],
      ]
    );
  }

  /**
   * Build maker traits with postInteraction flag
   * @returns Maker traits value
   */
  private buildMakerTraits(): bigint {
    // Enable postInteraction hook for escrow creation
    let traits = POST_INTERACTION_FLAG;

    // Additional flags can be added here:
    // - PARTIAL_FILL_FLAG for partial fills
    // - Other LOP v4 flags as needed

    return traits;
  }

  /**
   * Validate order parameters
   * @param params Order parameters to validate
   */
  validateOrderParams(params: FusionOrderParams): void {
    if (!ethers.isAddress(params.maker)) {
      throw new Error("Invalid maker address");
    }
    if (!ethers.isAddress(params.srcToken)) {
      throw new Error("Invalid source token address");
    }
    if (!ethers.isAddress(params.dstToken)) {
      throw new Error("Invalid destination token address");
    }
    if (!ethers.isAddress(params.resolver)) {
      throw new Error("Invalid resolver address");
    }
    if (params.srcAmount <= 0n) {
      throw new Error("Source amount must be positive");
    }
    if (params.dstAmount <= 0n) {
      throw new Error("Destination amount must be positive");
    }
    if (params.timelock < 1800) {
      throw new Error("Timelock must be at least 30 minutes");
    }
    if (params.safetyDeposit < ethers.parseEther("0.001")) {
      throw new Error("Safety deposit too low (minimum 0.001 ETH)");
    }
    if (
      !params.secretHash.startsWith("0x") ||
      params.secretHash.length !== 66
    ) {
      throw new Error("Invalid secret hash format");
    }
  }

  /**
   * Get the order hash for a given order
   * @param orderTypeData Order type data
   * @returns Order hash
   */
  getOrderHash(orderTypeData: OrderTypeData): string {
    return ethers.TypedDataEncoder.hash(
      orderTypeData.domain,
      orderTypeData.types,
      orderTypeData.order
    );
  }

  /**
   * Recover signer address from order and signature
   * @param orderTypeData Order type data
   * @param signature Signature string
   * @returns Recovered address
   */
  recoverSigner(orderTypeData: OrderTypeData, signature: string): string {
    return ethers.TypedDataEncoder.recoverAddress(
      orderTypeData.domain,
      orderTypeData.types,
      orderTypeData.order,
      signature
    );
  }
}
