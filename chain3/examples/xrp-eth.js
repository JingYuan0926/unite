const { ethers } = require("ethers");
require("dotenv/config");
const crypto = require("crypto");
const axios = require("axios");

// Configuration for XRP-ETH cross-chain swap
const config = {
  ethereum: {
    chainId: 11155111,
    rpcUrl: process.env.ETH_RPC,
    privateKey: process.env.ETH_PK,
    limitOrderProtocol: "0x111111125421cA6dc452d289314280a0f8842A65",
    accessToken: "0xACCe550000159e70908C0499a1119D04e7039C28",
    feeToken: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    escrowFactory: process.env.ESCROW_FACTORY,
    customResolver: process.env.CUSTOM_RESOLVER,
    usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  xrpl: {
    network: process.env.XRPL_URL,
    xrplServerUrl: "http://localhost:3002",
  },
  swap: {
    srcAmount: "1000000",
    dstAmount: "0.001",
    safetyDeposit: "0.001",
    rescueDelay: 691200,
    enablePartialFill: true,
    partialFillPercentage: 50,
    minFillPercentage: 10,
    maxFillPercentage: 90,
  },
};

// [ABIs for ERC20, ESCROW_FACTORY_ABI, ESCROW_ABI, CUSTOM_RESOLVER_ABI, LIMIT_ORDER_PROTOCOL_ABI omitted for brevity]

function addressToUint256(address) {
  return BigInt(address);
}

class XRPLClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async createSourceEscrow(params) {
    try {
      const requestData = { ...params, type: "src" };
      const response = await axios.post(
        `${this.baseUrl}/escrow/create-dst`,
        requestData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `local xrpl server Error: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async fundEscrow(escrowId, fundingData) {
    const response = await axios.post(
      `${this.baseUrl}/escrow/${escrowId}/fund`,
      fundingData
    );
    return response.data;
  }

  async withdraw(escrowId, secret, callerAddress) {
    const response = await axios.post(
      `${this.baseUrl}/escrow/${escrowId}/withdraw`,
      {
        secret,
        callerAddress,
        isPublic: false,
      }
    );
    return response.data;
  }

  static generateSecret() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  static hashSecret(secret) {
    return ethers.keccak256(secret);
  }
}

class XrpEthCrossChainOrder {
  constructor() {
    if (
      !config.ethereum.escrowFactory ||
      config.ethereum.escrowFactory === "0x000..."
    ) {
      throw new Error("ESCROW_FACTORY not set.");
    }
    if (
      !config.ethereum.customResolver ||
      config.ethereum.customResolver === "0x000..."
    ) {
      throw new Error("CUSTOM_RESOLVER not set.");
    }

    this.activeOrders = new Map();
    this.config = config;

    this.ethProvider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);
    this.ethWallet = new ethers.Wallet(
      config.ethereum.privateKey,
      this.ethProvider
    );

    this.escrowFactory = new ethers.Contract(
      config.ethereum.escrowFactory,
      ESCROW_FACTORY_ABI,
      this.ethWallet
    );
    this.customResolver = new ethers.Contract(
      config.ethereum.customResolver,
      CUSTOM_RESOLVER_ABI,
      this.ethWallet
    );
    this.limitOrderProtocol = new ethers.Contract(
      config.ethereum.limitOrderProtocol,
      LIMIT_ORDER_PROTOCOL_ABI,
      this.ethWallet
    );
    this.xrplClient = new XRPLClient(config.xrpl.xrplServerUrl);
  }

  async initialize() {
    console.log("🔧 Initializing XRP-ETH Cross-Chain Order System...");

    try {
      const network = await this.ethProvider.getNetwork();
      console.log(
        `✅ Connected to Ethereum: ${network.name} (Chain ID: ${network.chainId})`
      );

      const ethBalance = await this.ethProvider.getBalance(
        this.ethWallet.address
      );
      console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

      const factoryCode = await this.ethProvider.getCode(
        config.ethereum.escrowFactory
      );
      if (factoryCode === "0x")
        throw new Error("EscrowFactory contract not found");

      const srcImpl = await this.escrowFactory.ESCROW_SRC_IMPLEMENTATION();
      const dstImpl = await this.escrowFactory.ESCROW_DST_IMPLEMENTATION();
      console.log(`✅ EscrowFactory verified`);
      console.log(`📋 Src Impl: ${srcImpl}, Dst Impl: ${dstImpl}`);

      const resolverCode = await this.ethProvider.getCode(
        config.ethereum.customResolver
      );
      if (resolverCode === "0x")
        throw new Error("CustomResolver contract not found");

      const resolverConfig = await this.customResolver.config();
      const lopAddress = await this.customResolver.limitOrderProtocol();
      const resolverOwner = await this.customResolver.owner();

      console.log(`✅ CustomResolver verified`);
      console.log(`📋 Owner: ${resolverOwner}`);
      console.log(`📋 LOP: ${lopAddress}`);
      console.log(
        `📋 Partial Fill Enabled: ${resolverConfig.partialFillEnabled}`
      );

      const xrplHealth = await axios.get(`${config.xrpl.xrplServerUrl}/health`);
      console.log(`✅ XRPL Server status: ${xrplHealth.data.status}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize:", error.message);
      throw error;
    }
  }
}
