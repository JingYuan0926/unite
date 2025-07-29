const { ethers } = require("ethers");
const crypto = require("crypto");

/**
 * 1inch Escrow Factory ABI (simplified for the main functions we need)
 */
const ESCROW_FACTORY_ABI = [
  "function deployEscrow(bytes32 salt, bytes memory data) external returns (address)",
  "function predictEscrowAddress(bytes32 salt, bytes memory data) external view returns (address)",
  "function rescueFunds(address token, uint256 amount) external",
  "event EscrowDeployed(address indexed escrow, bytes32 indexed salt)",
];

/**
 * 1inch Escrow Contract ABI (simplified)
 */
const ESCROW_ABI = [
  "function fund() external payable",
  "function fundToken(address token, uint256 amount) external",
  "function withdraw(bytes32 secret, address to) external",
  "function cancel() external",
  "function rescueFunds(address token, uint256 amount) external",
  "function getStatus() external view returns (uint8)",
  "function hashlock() external view returns (bytes32)",
  "function timelock() external view returns (uint256)",
  "function maker() external view returns (address)",
  "function taker() external view returns (address)",
  "function token() external view returns (address)",
  "function amount() external view returns (uint256)",
  "event Funded(address indexed funder, uint256 amount)",
  "event Withdrawn(address indexed to, bytes32 secret, uint256 amount)",
  "event Cancelled(uint256 amount)",
];

/**
 * EVM Escrow Client for interacting with 1inch escrow contracts
 */
class EVMEscrowClient {
  constructor(config = {}) {
    this.provider =
      config.provider || new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = config.wallet;
    this.factoryAddress = config.factoryAddress;
    this.chainId = config.chainId || 1;

    if (!this.factoryAddress) {
      throw new Error("Factory address is required");
    }

    this.factoryContract = new ethers.Contract(
      this.factoryAddress,
      ESCROW_FACTORY_ABI,
      this.wallet || this.provider
    );

    // Gas settings
    this.gasSettings = {
      gasLimit: config.gasLimit || 500000,
      maxFeePerGas: config.maxFeePerGas,
      maxPriorityFeePerGas: config.maxPriorityFeePerGas,
    };
  }

  /**
   * Generate a cryptographically secure secret
   * @returns {string} 32-byte hex string
   */
  static generateSecret() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hash a secret using keccak256
   * @param {string} secret - 32-byte hex string
   * @returns {string} Hash of the secret
   */
  static hashSecret(secret) {
    return ethers.keccak256(secret);
  }

  /**
   * Generate salt for deterministic escrow deployment
   * @param {string} orderHash - Order hash
   * @param {string} chainId - Chain ID
   * @returns {string} Salt for deployment
   */
  static generateSalt(orderHash, chainId) {
    return ethers.keccak256(
      ethers.solidityPacked(["bytes32", "uint256"], [orderHash, chainId])
    );
  }

  /**
   * Encode escrow deployment data
   * @param {Object} params - Escrow parameters
   * @returns {string} Encoded data
   */
  encodeEscrowData(params) {
    const { hashlock, timelock, maker, taker, token, amount, safetyDeposit } =
      params;

    return ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "bytes32",
        "uint256",
        "address",
        "address",
        "address",
        "uint256",
        "uint256",
      ],
      [hashlock, timelock, maker, taker, token, amount, safetyDeposit]
    );
  }

  /**
   * Predict escrow address before deployment
   * @param {string} salt - Deployment salt
   * @param {Object} escrowParams - Escrow parameters
   * @returns {Promise<string>} Predicted escrow address
   */
  async predictEscrowAddress(salt, escrowParams) {
    const data = this.encodeEscrowData(escrowParams);
    return await this.factoryContract.predictEscrowAddress(salt, data);
  }

  /**
   * Deploy a new escrow contract
   * @param {Object} escrowParams - Escrow parameters
   * @param {string} orderHash - Order hash for salt generation
   * @returns {Promise<Object>} Deployment result
   */
  async deployEscrow(escrowParams, orderHash) {
    if (!this.wallet) {
      throw new Error("Wallet is required for deployment");
    }

    const salt = EVMEscrowClient.generateSalt(orderHash, this.chainId);
    const data = this.encodeEscrowData(escrowParams);

    // Predict address first
    const predictedAddress = await this.predictEscrowAddress(
      salt,
      escrowParams
    );

    try {
      const tx = await this.factoryContract.deployEscrow(salt, data, {
        ...this.gasSettings,
      });

      const receipt = await tx.wait();

      // Find deployment event
      const deployEvent = receipt.logs.find(
        (log) => log.fragment?.name === "EscrowDeployed"
      );

      return {
        escrowAddress: predictedAddress,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        salt,
        event: deployEvent,
      };
    } catch (error) {
      throw this.formatError("Failed to deploy escrow", error);
    }
  }

  /**
   * Fund an escrow contract
   * @param {string} escrowAddress - Escrow contract address
   * @param {string} token - Token address (0x0 for ETH)
   * @param {string} amount - Amount to fund
   * @returns {Promise<Object>} Funding result
   */
  async fundEscrow(escrowAddress, token, amount) {
    if (!this.wallet) {
      throw new Error("Wallet is required for funding");
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      ESCROW_ABI,
      this.wallet
    );

    try {
      let tx;

      if (
        token === "0x0000000000000000000000000000000000000000" ||
        token === ethers.ZeroAddress
      ) {
        // ETH funding
        tx = await escrowContract.fund({
          value: amount,
          ...this.gasSettings,
        });
      } else {
        // ERC20 funding - requires prior approval
        tx = await escrowContract.fundToken(token, amount, {
          ...this.gasSettings,
        });
      }

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      throw this.formatError("Failed to fund escrow", error);
    }
  }

  /**
   * Withdraw from escrow using secret
   * @param {string} escrowAddress - Escrow contract address
   * @param {string} secret - Secret that unlocks the escrow
   * @param {string} to - Recipient address
   * @returns {Promise<Object>} Withdrawal result
   */
  async withdrawFromEscrow(escrowAddress, secret, to) {
    if (!this.wallet) {
      throw new Error("Wallet is required for withdrawal");
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      ESCROW_ABI,
      this.wallet
    );

    try {
      const tx = await escrowContract.withdraw(secret, to, {
        ...this.gasSettings,
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        secret,
      };
    } catch (error) {
      throw this.formatError("Failed to withdraw from escrow", error);
    }
  }

  /**
   * Cancel an escrow and return funds
   * @param {string} escrowAddress - Escrow contract address
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelEscrow(escrowAddress) {
    if (!this.wallet) {
      throw new Error("Wallet is required for cancellation");
    }

    const escrowContract = new ethers.Contract(
      escrowAddress,
      ESCROW_ABI,
      this.wallet
    );

    try {
      const tx = await escrowContract.cancel({
        ...this.gasSettings,
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      throw this.formatError("Failed to cancel escrow", error);
    }
  }

  /**
   * Get escrow status and details
   * @param {string} escrowAddress - Escrow contract address
   * @returns {Promise<Object>} Escrow details
   */
  async getEscrowDetails(escrowAddress) {
    const escrowContract = new ethers.Contract(
      escrowAddress,
      ESCROW_ABI,
      this.provider
    );

    try {
      const [status, hashlock, timelock, maker, taker, token, amount] =
        await Promise.all([
          escrowContract.getStatus(),
          escrowContract.hashlock(),
          escrowContract.timelock(),
          escrowContract.maker(),
          escrowContract.taker(),
          escrowContract.token(),
          escrowContract.amount(),
        ]);

      return {
        status: Number(status),
        hashlock,
        timelock: Number(timelock),
        maker,
        taker,
        token,
        amount: amount.toString(),
      };
    } catch (error) {
      throw this.formatError("Failed to get escrow details", error);
    }
  }

  /**
   * Wait for escrow to reach a specific status
   * @param {string} escrowAddress - Escrow contract address
   * @param {number} targetStatus - Target status to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<Object>} Escrow details when target status is reached
   */
  async waitForStatus(
    escrowAddress,
    targetStatus,
    timeout = 300000,
    interval = 5000
  ) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const details = await this.getEscrowDetails(escrowAddress);
        if (details.status === targetStatus) {
          return details;
        }

        console.log(
          `Waiting for escrow ${escrowAddress} to reach status ${targetStatus}. Current: ${details.status}`
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        console.warn(`Error checking escrow status: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(
      `Timeout waiting for escrow ${escrowAddress} to reach status ${targetStatus}`
    );
  }

  /**
   * Approve ERC20 token for escrow funding
   * @param {string} tokenAddress - Token contract address
   * @param {string} escrowAddress - Escrow contract address
   * @param {string} amount - Amount to approve
   * @returns {Promise<Object>} Approval result
   */
  async approveToken(tokenAddress, escrowAddress, amount) {
    if (!this.wallet) {
      throw new Error("Wallet is required for token approval");
    }

    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ],
      this.wallet
    );

    try {
      const tx = await tokenContract.approve(escrowAddress, amount, {
        ...this.gasSettings,
      });

      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      throw this.formatError("Failed to approve token", error);
    }
  }

  /**
   * Format error with additional context
   * @param {string} message - Error message
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  formatError(message, error) {
    const err = new Error(message);
    err.originalError = error;
    err.code = error.code;
    err.reason = error.reason;
    return err;
  }
}

/**
 * Utility functions for EVM escrow operations
 */
class EVMEscrowUtils {
  /**
   * Calculate timelock timestamp
   * @param {number} delaySeconds - Delay in seconds from now
   * @returns {number} Unix timestamp
   */
  static calculateTimelock(delaySeconds) {
    return Math.floor(Date.now() / 1000) + delaySeconds;
  }

  /**
   * Validate EVM address format
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   */
  static isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Convert wei to ether
   * @param {string} wei - Wei amount
   * @returns {string} Ether amount
   */
  static weiToEther(wei) {
    return ethers.formatEther(wei);
  }

  /**
   * Convert ether to wei
   * @param {string} ether - Ether amount
   * @returns {string} Wei amount
   */
  static etherToWei(ether) {
    return ethers.parseEther(ether).toString();
  }

  /**
   * Validate escrow parameters
   * @param {Object} params - Escrow parameters
   * @throws {Error} If parameters are invalid
   */
  static validateEscrowParams(params) {
    const required = [
      "hashlock",
      "timelock",
      "maker",
      "taker",
      "token",
      "amount",
    ];

    for (const field of required) {
      if (!params[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }

    // Validate addresses
    if (!this.isValidAddress(params.maker)) {
      throw new Error("Invalid maker address");
    }

    if (!this.isValidAddress(params.taker)) {
      throw new Error("Invalid taker address");
    }

    if (!this.isValidAddress(params.token)) {
      throw new Error("Invalid token address");
    }

    // Validate amounts
    if (BigInt(params.amount) <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate timelock
    const now = Math.floor(Date.now() / 1000);
    if (params.timelock <= now) {
      throw new Error("Timelock must be in the future");
    }

    // Validate hashlock
    if (!params.hashlock.match(/^0x[0-9a-fA-F]{64}$/)) {
      throw new Error("Invalid hashlock format");
    }
  }
}

module.exports = {
  EVMEscrowClient,
  EVMEscrowUtils,
};
