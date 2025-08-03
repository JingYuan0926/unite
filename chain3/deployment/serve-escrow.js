const xrpl = require("xrpl");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { keccak256 } = require("ethers");

class XRPLEscrowTEE {
  constructor(config = {}) {
    this.client = null;
    this.config = {
      network: config.network || "wss://s.altnet.rippletest.net:51233",
      port: config.port || 3000,
      rescueDelay: config.rescueDelay || 86400 * 7,
      ...config,
    };

    this.escrows = new Map();
    this.walletSeeds = new Map();

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes(); // routes added in commit 2
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  async initialize() {
    try {
      this.client = new xrpl.Client(this.config.network);
      await this.client.connect();
      console.log(`Connected to XRPL ${this.config.network}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to XRPL:", error);
      return false;
    }
  }

  async generateEscrowWallet() {
    const staticSeed = Buffer.from("ripple-escrow-wallet", "utf8");
    const wallet = xrpl.Wallet.fromEntropy(staticSeed);
    await this.refuelWalletFromFaucet(wallet);
    return {
      address: wallet.address,
      seed: wallet.seed,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
    };
  }

  mykeccak256(data) {
    return keccak256(data);
  }

  TimeStages = {
    SrcWithdrawal: 0,
    SrcPublicWithdrawal: 1,
    SrcCancellation: 2,
    SrcPublicCancellation: 3,
    DstWithdrawal: 4,
    DstPublicWithdrawal: 5,
    DstCancellation: 6,
  };

  parseTimelocks(packedTimelocks, deployedAt) {
    const data = BigInt(packedTimelocks);
    const stages = {};
    for (let stage = 0; stage < 7; stage++) {
      const bitShift = BigInt(stage * 32);
      const stageOffset = Number((data >> bitShift) & 0xffffffffn);
      stages[stage] = deployedAt + stageOffset;
    }
    return stages;
  }

  validateTimeWindow(escrow, stage, requireBefore = null, offset = 0) {
    const now = Math.floor(Date.now() / 1000) + offset;
    const stageTime = escrow.timelocks[stage];

    if (now < stageTime) {
      throw new Error(
        `Action not allowed yet. Wait until ${new Date(stageTime * 1000)}`
      );
    }

    if (requireBefore !== null) {
      const beforeTime = escrow.timelocks[requireBefore];
      if (now >= beforeTime) {
        throw new Error(
          `Action window expired at ${new Date(beforeTime * 1000)}`
        );
      }
    }
  }

  validateSecret(secret, hashlock) {
    const secretHash = this.mykeccak256(secret);
    if (secretHash.toLowerCase() !== hashlock.toLowerCase()) {
      throw new Error("Invalid secret provided");
    }
  }

  async refuelWalletFromFaucet(wallet, client, minBalance = 5) {
    let xrplClient = client;
    let shouldDisconnect = false;

    try {
      if (!xrplClient) {
        xrplClient = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await xrplClient.connect();
        shouldDisconnect = true;
      }

      try {
        const response = await xrplClient.request({
          command: "account_info",
          account: wallet.address,
          ledger_index: "validated",
        });

        const currentBalance = Number(
          xrpl.dropsToXrp(response.result.account_data.Balance)
        );

        if (currentBalance >= minBalance) return;
      } catch (error) {
        console.log(
          `Wallet ${wallet.address} account not found, proceeding with funding`
        );
      }

      await xrplClient.fundWallet(wallet);
      console.log(`Successfully funded wallet ${wallet.address}`);
    } catch (error) {
      throw new Error(`Failed to fund wallet ${wallet.address}: ${error}`);
    } finally {
      if (shouldDisconnect && xrplClient) {
        await xrplClient.disconnect();
      }
    }
  }
}

module.exports = XRPLEscrowTEE;
