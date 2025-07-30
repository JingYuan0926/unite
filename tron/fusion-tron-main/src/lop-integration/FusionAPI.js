/**
 * @title FusionAPI (JavaScript Version)
 * @notice High-level API for creating and managing Fusion cross-chain swaps via LOP
 */

const { ethers } = require("ethers");

// Constants
const ETH_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TRON_ZERO_ADDRESS_ETH_FORMAT =
  "0x0000000000000000000000000000000000000001";
const DEFAULT_SAFETY_DEPOSIT = "100000000000000000"; // 0.1 ETH
const POST_INTERACTION_FLAG = 1n << 251n;
const DEFAULT_TIMELOCK = 3600;

/**
 * Fusion Order Builder (JavaScript)
 */
class FusionOrderBuilder {
  constructor(chainId, lopAddress) {
    this.chainId = chainId;
    this.lopAddress = lopAddress;

    // EIP-712 domain for LOP v4
    this.domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: chainId,
      verifyingContract: lopAddress,
    };

    // EIP-712 type definitions
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

  buildFusionOrder(params) {
    // Generate random salt
    const salt = ethers.hexlify(ethers.randomBytes(32));

    const order = {
      salt: BigInt(salt),
      maker: params.maker,
      receiver: ETH_ZERO_ADDRESS,
      makerAsset: params.srcToken,
      takerAsset: params.dstToken,
      makingAmount: params.srcAmount,
      takingAmount: params.dstAmount,
      makerTraits: this.buildMakerTraits(),
    };

    return {
      domain: this.domain,
      types: this.types,
      order: order,
    };
  }

  async signOrder(orderTypeData, signer) {
    const signature = await signer.signTypedData(
      orderTypeData.domain,
      orderTypeData.types,
      orderTypeData.order
    );
    return signature;
  }

  async buildAndSignOrder(params, signer) {
    const orderTypeData = this.buildFusionOrder(params);
    const signature = await this.signOrder(orderTypeData, signer);

    return {
      orderTypeData,
      signature,
    };
  }

  encodeFusionData(params) {
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

  buildMakerTraits() {
    return POST_INTERACTION_FLAG;
  }

  validateOrderParams(params) {
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
  }

  getOrderHash(orderTypeData) {
    return ethers.TypedDataEncoder.hash(
      orderTypeData.domain,
      orderTypeData.types,
      orderTypeData.order
    );
  }
}

/**
 * Main FusionAPI Class
 */
class FusionAPI {
  constructor(provider, signer, addresses, chainId) {
    this.provider = provider;
    this.signer = signer;
    this.addresses = addresses;
    this.chainId = chainId;

    // Ensure addresses is properly defined
    if (!addresses || !addresses.limitOrderProtocol) {
      throw new Error("FusionAPI requires addresses.limitOrderProtocol");
    }

    this.lopAddress = addresses.limitOrderProtocol;

    // Initialize order builder
    this.orderBuilder = new FusionOrderBuilder(
      chainId,
      addresses.limitOrderProtocol
    );

    // LOP ABI (correct LOP v4 signature with proper Order struct)
    this.lopABI = [
      "function fillOrder((uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits) external payable returns (uint256, uint256, bytes32)",
      "function hashOrder((uint256 salt, address maker, address receiver, address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, uint256 makerTraits) order) external view returns (bytes32)",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
      "function owner() external view returns (address)",
      "function bitInvalidatorForOrder(address maker, uint256 slot) external view returns (uint256)",
    ];

    // Initialize contract
    this.lopContract = new ethers.Contract(
      addresses.limitOrderProtocol,
      this.lopABI,
      signer
    );
  }

  async createETHToTRXOrder(params) {
    const makerAddress = await this.signer.getAddress();

    const orderParams = {
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

    // Create fusion data
    const fusionData = {
      srcToken: orderParams.srcToken,
      dstToken: orderParams.dstToken,
      srcChainId: 11155111,
      dstChainId: 3448148188,
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

  async fillFusionOrder(signedOrder, fillAmount) {
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

    // Calculate required ETH value
    const ethValue = amount + signedOrder.fusionData.safetyDeposit;

    console.log("🔄 Filling LOP order...");
    console.log("💰 Fill amount:", ethers.formatEther(amount), "ETH");
    console.log(
      "🔒 Safety deposit:",
      ethers.formatEther(signedOrder.fusionData.safetyDeposit),
      "ETH"
    );

    // Split signature into r and vs components for LOP v4
    const signature = signedOrder.signature;
    const r = signature.slice(0, 66); // First 32 bytes (0x + 64 chars)
    const s = signature.slice(66, 130); // Next 32 bytes (64 chars)
    const v = parseInt(signature.slice(130, 132), 16); // Last byte (2 chars)

    // Create vs by setting the recovery bit in s
    const sBytes = ethers.getBytes("0x" + s);
    const vBit = v >= 27 ? v - 27 : v; // Normalize v to 0 or 1
    if (vBit === 1) {
      sBytes[0] |= 0x80; // Set the most significant bit
    }
    const vs = ethers.hexlify(sBytes);

    // TakerTraits - use default for now (can be enhanced later)
    const takerTraits = 0;

    // Fill the order using correct LOP v4 signature with proper Order struct
    const orderStruct = {
      salt: signedOrder.order.salt,
      maker: signedOrder.order.maker,
      receiver: signedOrder.order.receiver,
      makerAsset: signedOrder.order.makerAsset,
      takerAsset: signedOrder.order.takerAsset,
      makingAmount: signedOrder.order.makingAmount,
      takingAmount: signedOrder.order.takingAmount,
      makerTraits: signedOrder.order.makerTraits || 0,
    };

    const tx = await this.lopContract.fillOrder(
      orderStruct,
      r,
      vs,
      amount,
      takerTraits,
      { value: ethValue }
    );

    console.log("📄 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Order filled successfully!");

    return tx.hash;
  }
}

module.exports = {
  FusionAPI,
  FusionOrderBuilder,
  ETH_ZERO_ADDRESS,
  TRON_ZERO_ADDRESS_ETH_FORMAT,
  DEFAULT_SAFETY_DEPOSIT,
  POST_INTERACTION_FLAG,
  DEFAULT_TIMELOCK,
};
