// SPDX-License-Identifier: MIT

import { ethers } from "ethers";
import { FusionOrderBuilder } from "./OrderBuilder.js";
import {
  FusionOrderParams,
  SignedOrder,
  LOPContractAddresses,
  ETH_ZERO_ADDRESS,
  TRON_ZERO_ADDRESS_ETH_FORMAT,
  DEFAULT_SAFETY_DEPOSIT,
} from "./types.js";

/**
 * @title FusionAPI
 * @notice High-level API for creating and managing Fusion cross-chain swaps via LOP
 */
export class FusionAPI {
  private orderBuilder: FusionOrderBuilder;
  private lopContract: ethers.Contract;
  private fusionExtensionContract: ethers.Contract;

  // LOP ABI (minimal required functions)
  private static readonly LOP_ABI = [
    "function fillOrder((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes signature, uint256 amount, bytes extension) external payable",
    "function hashOrder((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
    "function nonces(address) external view returns (uint256)",
  ];

  // FusionExtension ABI (minimal required functions)
  private static readonly FUSION_EXTENSION_ABI = [
    "function getEscrowForOrder(bytes32 orderHash) external view returns (bytes32)",
    "event FusionOrderCreated(bytes32 indexed orderHash, bytes32 indexed escrowId, address indexed maker, address taker, address resolver, uint256 amount)",
  ];

  constructor(
    private provider: ethers.Provider,
    private signer: ethers.Signer,
    private addresses: LOPContractAddresses,
    private chainId: number
  ) {
    // Initialize order builder
    this.orderBuilder = new FusionOrderBuilder(
      chainId,
      addresses.limitOrderProtocol
    );

    // Initialize contract instances
    this.lopContract = new ethers.Contract(
      addresses.limitOrderProtocol,
      FusionAPI.LOP_ABI,
      signer
    );

    this.fusionExtensionContract = new ethers.Contract(
      addresses.fusionExtension,
      FusionAPI.FUSION_EXTENSION_ABI,
      provider
    );
  }

  /**
   * Create a new Fusion order for ETH → TRX swap
   * @param params Swap parameters
   * @returns Signed order ready for filling
   */
  async createETHToTRXOrder(params: {
    ethAmount: bigint;
    trxAmount: bigint;
    secretHash: string;
    resolver: string;
    timelock?: number;
    safetyDeposit?: bigint;
  }): Promise<SignedOrder> {
    const makerAddress = await this.signer.getAddress();

    const orderParams: FusionOrderParams = {
      maker: makerAddress,
      srcToken: ETH_ZERO_ADDRESS, // ETH
      dstToken: TRON_ZERO_ADDRESS_ETH_FORMAT, // TRX representation
      srcAmount: params.ethAmount,
      dstAmount: params.trxAmount,
      secretHash: params.secretHash,
      timelock: params.timelock || 3600,
      resolver: params.resolver,
      safetyDeposit: params.safetyDeposit || BigInt(DEFAULT_SAFETY_DEPOSIT),
    };

    // Validate parameters
    this.orderBuilder.validateOrderParams(orderParams);

    // Build and sign the order
    const { orderTypeData, signature } =
      await this.orderBuilder.buildAndSignOrder(orderParams, this.signer);

    // Encode fusion data
    const fusionData = {
      srcToken: orderParams.srcToken,
      dstToken: orderParams.dstToken,
      srcChainId: 11155111, // Ethereum Sepolia
      dstChainId: 3448148188, // Tron Nile
      secretHash: orderParams.secretHash,
      timelock: orderParams.timelock,
      safetyDeposit: orderParams.safetyDeposit,
      resolver: orderParams.resolver,
    };

    return {
      order: orderTypeData.order,
      signature,
      fusionData,
    };
  }

  /**
   * Fill a Fusion order and create escrows
   * @param signedOrder The signed order to fill
   * @param fillAmount Amount to fill (can be partial)
   * @returns Transaction hash
   */
  async fillFusionOrder(
    signedOrder: SignedOrder,
    fillAmount?: bigint
  ): Promise<string> {
    const amount = fillAmount || signedOrder.order.makingAmount;

    // Encode extraData with fusion parameters
    const extraData = this.orderBuilder.encodeFusionData({
      maker: signedOrder.order.maker,
      srcToken: signedOrder.fusionData.srcToken,
      dstToken: signedOrder.fusionData.dstToken,
      srcAmount: amount,
      dstAmount: signedOrder.order.takingAmount,
      secretHash: signedOrder.fusionData.secretHash,
      timelock: signedOrder.fusionData.timelock,
      resolver: signedOrder.fusionData.resolver,
      safetyDeposit: signedOrder.fusionData.safetyDeposit,
    });

    // Calculate required ETH value (amount + safety deposit)
    const ethValue = amount + signedOrder.fusionData.safetyDeposit;

    console.log("🔄 Filling LOP order...");
    console.log(
      "📋 Order hash:",
      this.orderBuilder.getOrderHash({
        domain: this.orderBuilder["domain"],
        types: this.orderBuilder["types"],
        order: signedOrder.order,
      })
    );
    console.log("💰 Fill amount:", ethers.formatEther(amount), "ETH");
    console.log(
      "🔒 Safety deposit:",
      ethers.formatEther(signedOrder.fusionData.safetyDeposit),
      "ETH"
    );

    // Fill the order
    const tx = await this.lopContract.fillOrder(
      [
        signedOrder.order.salt,
        signedOrder.order.maker,
        signedOrder.order.receiver,
        signedOrder.order.makerAsset,
        signedOrder.order.takerAsset,
        signedOrder.order.makingAmount,
        signedOrder.order.takingAmount,
        signedOrder.order.makerTraits,
      ],
      signedOrder.signature,
      amount,
      extraData,
      { value: ethValue }
    );

    console.log("📄 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Order filled successfully!");

    return tx.hash;
  }

  /**
   * Get escrow ID for a filled order
   * @param orderHash Hash of the order
   * @returns Escrow ID if found
   */
  async getEscrowForOrder(orderHash: string): Promise<string | null> {
    try {
      const escrowId = await this.fusionExtensionContract.getEscrowForOrder(
        orderHash
      );
      return escrowId ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
        ? null
        : escrowId;
    } catch (error) {
      console.error("Error getting escrow for order:", error);
      return null;
    }
  }

  /**
   * Listen for FusionOrderCreated events
   * @param callback Function to call when event is received
   */
  onFusionOrderCreated(
    callback: (
      orderHash: string,
      escrowId: string,
      maker: string,
      taker: string,
      resolver: string,
      amount: bigint
    ) => void
  ): void {
    this.fusionExtensionContract.on(
      "FusionOrderCreated",
      (orderHash, escrowId, maker, taker, resolver, amount) => {
        callback(orderHash, escrowId, maker, taker, resolver, amount);
      }
    );
  }

  /**
   * Create a complete ETH → TRX swap flow
   * @param params Swap parameters
   * @returns Swap execution details
   */
  async executeETHToTRXSwap(params: {
    ethAmount: bigint;
    trxAmount: bigint;
    secretHash: string;
    resolver: string;
    timelock?: number;
    safetyDeposit?: bigint;
  }) {
    console.log("🚀 Starting Fusion ETH → TRX swap...");

    // Step 1: Create order
    console.log("1️⃣ Creating Fusion order...");
    const signedOrder = await this.createETHToTRXOrder(params);
    console.log("✅ Order created and signed");

    // Step 2: Fill order (creates escrow automatically)
    console.log("2️⃣ Filling order...");
    const txHash = await this.fillFusionOrder(signedOrder);
    console.log("✅ Order filled, escrow created");

    // Step 3: Get escrow ID
    const orderHash = this.orderBuilder.getOrderHash({
      domain: this.orderBuilder["domain"],
      types: this.orderBuilder["types"],
      order: signedOrder.order,
    });
    const escrowId = await this.getEscrowForOrder(orderHash);

    console.log("🎯 Fusion swap initiated!");
    console.log("📋 Order hash:", orderHash);
    console.log("🔐 Escrow ID:", escrowId);
    console.log("📄 Transaction:", txHash);

    return {
      orderHash,
      escrowId,
      txHash,
      signedOrder,
    };
  }

  /**
   * Get the maker's nonce (for order uniqueness)
   * @param maker Maker address
   * @returns Current nonce
   */
  async getMakerNonce(maker: string): Promise<bigint> {
    return await this.lopContract.nonces(maker);
  }

  /**
   * Get order hash from LOP contract
   * @param order Order to hash
   * @returns Order hash from contract
   */
  async getContractOrderHash(order: any): Promise<string> {
    return await this.lopContract.hashOrder([
      order.salt,
      order.maker,
      order.receiver,
      order.makerAsset,
      order.takerAsset,
      order.makingAmount,
      order.takingAmount,
      order.makerTraits,
    ]);
  }

  /**
   * Validate that a signature is correct for an order
   * @param signedOrder Signed order to validate
   * @returns True if signature is valid
   */
  validateOrderSignature(signedOrder: SignedOrder): boolean {
    try {
      const recovered = this.orderBuilder.recoverSigner(
        {
          domain: this.orderBuilder["domain"],
          types: this.orderBuilder["types"],
          order: signedOrder.order,
        },
        signedOrder.signature
      );
      return recovered.toLowerCase() === signedOrder.order.maker.toLowerCase();
    } catch (error) {
      console.error("Signature validation error:", error);
      return false;
    }
  }
}
