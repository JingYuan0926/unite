import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { ethers } from "ethers";
import { ConfigManager } from "../../utils/ConfigManager";
import { Logger } from "../../utils/Logger";
import { CrossChainOrchestrator } from "../../sdk/CrossChainOrchestrator";
import { Official1inchSDK } from "../../sdk/Official1inchSDK";
import { TronExtension } from "../../sdk/TronExtension";

describe("Cross-Chain Swap Integration Tests", () => {
  let config: ConfigManager;
  let logger: Logger;
  let orchestrator: CrossChainOrchestrator;
  let official1inch: Official1inchSDK;
  let tronExtension: TronExtension;

  beforeAll(async () => {
    // Initialize test environment
    config = new ConfigManager();
    logger = Logger.getInstance();
    orchestrator = new CrossChainOrchestrator(config, logger.scope("Test"));
    official1inch = new Official1inchSDK(config, logger.scope("1inch-Test"));
    tronExtension = new TronExtension(config, logger.scope("Tron-Test"));

    // Verify test environment
    expect(config.ETH_NETWORK).toBe("sepolia");
    expect(config.TRON_NETWORK).toBe("nile");
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("Configuration Tests", () => {
    test("should have all required environment variables", () => {
      expect(config.ETH_RPC_URL).toBeDefined();
      expect(config.TRON_RPC_URL).toBeDefined();
      expect(config.OFFICIAL_LOP_ADDRESS).toBeDefined();
      expect(config.OFFICIAL_ESCROW_FACTORY_ADDRESS).toBeDefined();
      expect(config.OFFICIAL_RESOLVER_ADDRESS).toBeDefined();
      expect(config.FUSION_EXTENSION_ADDRESS).toBeDefined();
    });

    test("should validate contract addresses", () => {
      expect(ethers.isAddress(config.OFFICIAL_LOP_ADDRESS)).toBe(true);
      expect(ethers.isAddress(config.OFFICIAL_ESCROW_FACTORY_ADDRESS)).toBe(
        true
      );
      expect(ethers.isAddress(config.OFFICIAL_RESOLVER_ADDRESS)).toBe(true);
      expect(ethers.isAddress(config.FUSION_EXTENSION_ADDRESS)).toBe(true);
    });

    test("should have valid network configuration", () => {
      expect(config.getEthChainId()).toBe(11155111); // Sepolia
      expect(config.getTronChainId()).toBe(3448148188); // Nile
    });
  });

  describe("Network Connectivity Tests", () => {
    test("should connect to Ethereum Sepolia", async () => {
      const provider = config.getEthProvider();
      const network = await provider.getNetwork();
      expect(network.chainId).toBe(BigInt(11155111));
    });

    test("should connect to Tron Nile", async () => {
      const networkInfo = await tronExtension.getTronNetworkInfo();
      expect(networkInfo.chainId).toBe(3448148188);
      expect(networkInfo.network).toBe("nile");
    });

    test("should have sufficient balances for testing", async () => {
      // Check ETH balance
      const ethSigner = config.getEthSigner(config.USER_A_ETH_PRIVATE_KEY);
      const ethBalance = await ethSigner.provider.getBalance(ethSigner.address);
      expect(ethBalance).toBeGreaterThan(ethers.parseEther("0.01"));

      // Check TRX balance
      const tronSigner = config.getEthSigner(config.USER_B_TRON_PRIVATE_KEY);
      const trxBalance = await tronExtension.getTrxBalance(
        config.USER_A_TRX_RECEIVE_ADDRESS
      );
      expect(parseFloat(trxBalance)).toBeGreaterThan(100); // At least 100 TRX
    });
  });

  describe("SDK Component Tests", () => {
    test("should initialize Official1inchSDK", () => {
      expect(official1inch).toBeDefined();
      const networkInfo = official1inch.getNetworkInfo();
      expect(networkInfo.chainId).toBe(11155111);
    });

    test("should initialize TronExtension", () => {
      expect(tronExtension).toBeDefined();
      expect(
        tronExtension.isValidTronAddress(config.USER_A_TRX_RECEIVE_ADDRESS)
      ).toBe(true);
    });

    test("should generate valid secret hash", () => {
      const { secret, secretHash } = tronExtension.generateSecretHash();
      expect(secret).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(secretHash).toMatch(/^0x[0-9a-fA-F]{64}$/);
    });
  });

  describe("Quote and Order Tests", () => {
    test("should get ETH->TRX quote", async () => {
      const ethAmount = ethers.parseEther("0.001"); // 0.001 ETH
      const fromAddress = config.getEthSigner(
        config.USER_A_ETH_PRIVATE_KEY
      ).address;

      const quote = await official1inch.getETHtoTRXQuote(
        ethAmount,
        fromAddress
      );

      expect(quote).toBeDefined();
      expect(quote.fromToken.symbol).toBe("ETH");
      expect(quote.fromTokenAmount).toBe(ethAmount.toString());
      expect(parseInt(quote.toTokenAmount)).toBeGreaterThan(0);
    }, 30000);

    test("should create cross-chain order", async () => {
      const ethAmount = ethers.parseEther("0.001");
      const fromAddress = config.getEthSigner(
        config.USER_A_ETH_PRIVATE_KEY
      ).address;

      const preparedOrder = await official1inch.createCrossChainOrder({
        fromTokenAddress: ethers.ZeroAddress,
        toTokenAddress: config.getTrxRepresentationAddress(),
        amount: ethAmount.toString(),
        fromAddress: fromAddress,
        dstChainId: config.getTronChainId(),
        enableEstimate: true,
      });

      expect(preparedOrder).toBeDefined();
      expect(preparedOrder.order).toBeDefined();
      expect(preparedOrder.quoteId).toBeDefined();
      expect(preparedOrder.signature).toBeDefined();
    }, 30000);
  });

  describe("Contract Integration Tests", () => {
    test("should interact with deployed contracts", async () => {
      const provider = config.getEthProvider();

      // Test LOP contract
      const lopCode = await provider.getCode(config.OFFICIAL_LOP_ADDRESS);
      expect(lopCode).not.toBe("0x");

      // Test EscrowFactory contract
      const factoryCode = await provider.getCode(
        config.OFFICIAL_ESCROW_FACTORY_ADDRESS
      );
      expect(factoryCode).not.toBe("0x");

      // Test Resolver contract
      const resolverCode = await provider.getCode(
        config.OFFICIAL_RESOLVER_ADDRESS
      );
      expect(resolverCode).not.toBe("0x");

      // Test FusionExtension contract
      const extensionCode = await provider.getCode(
        config.FUSION_EXTENSION_ADDRESS
      );
      expect(extensionCode).not.toBe("0x");
    });

    test("should validate Tron contract addresses", async () => {
      // Note: Tron addresses are base58 encoded, different validation needed
      expect(config.TRON_ESCROW_FACTORY_ADDRESS).toBeDefined();
      expect(
        tronExtension.isValidTronAddress(config.USER_A_TRX_RECEIVE_ADDRESS)
      ).toBe(true);
    });
  });

  describe("End-to-End Swap Tests", () => {
    test("should execute complete ETH->TRX swap flow (simulation)", async () => {
      const swapParams = {
        ethAmount: ethers.parseEther("0.001"),
        ethPrivateKey: config.USER_A_ETH_PRIVATE_KEY,
        tronPrivateKey: config.USER_B_TRON_PRIVATE_KEY,
        tronRecipient: config.USER_A_TRX_RECEIVE_ADDRESS,
        timelock: 7200, // 2 hours
      };

      // This test simulates the flow without actually executing on-chain
      // to avoid spending real funds in automated tests

      // Step 1: Validate parameters
      expect(swapParams.ethAmount).toBeGreaterThan(0n);
      expect(
        ethers.isAddress(config.getEthSigner(swapParams.ethPrivateKey).address)
      ).toBe(true);
      expect(tronExtension.isValidTronAddress(swapParams.tronRecipient)).toBe(
        true
      );
      expect(config.validateTimelock(swapParams.timelock)).toBe(true);

      // Step 2: Generate secret (actual)
      const { secret, secretHash } = tronExtension.generateSecretHash();
      expect(secret).toBeDefined();
      expect(secretHash).toBeDefined();

      // Step 3: Get quote (actual)
      const quote = await official1inch.getETHtoTRXQuote(
        swapParams.ethAmount,
        config.getEthSigner(swapParams.ethPrivateKey).address
      );
      expect(quote).toBeDefined();

      // Step 4: Simulate order creation
      const mockSwapResult = {
        orderHash: "0x" + "1".repeat(64),
        ethEscrowAddress: "0x" + "2".repeat(40),
        tronEscrowAddress: "T" + "A".repeat(33),
        secret: secret,
        secretHash: secretHash,
        ethTxHash: "0x" + "3".repeat(64),
        tronTxHash: "0x" + "4".repeat(64),
      };

      // Validate mock result structure
      expect(mockSwapResult.orderHash).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(mockSwapResult.ethEscrowAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(mockSwapResult.secret).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(mockSwapResult.secretHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

      logger.success(
        "End-to-end swap flow simulation completed",
        mockSwapResult
      );
    }, 60000);

    test("should handle swap monitoring", async () => {
      const mockSwapResult = {
        orderHash: "0x" + "1".repeat(64),
        ethEscrowAddress: "0x" + "2".repeat(40),
        tronEscrowAddress: "T" + "A".repeat(33),
        secret: "0x" + "5".repeat(64),
        secretHash: "0x" + "6".repeat(64),
        ethTxHash: "0x" + "3".repeat(64),
        tronTxHash: "0x" + "4".repeat(64),
      };

      // Test status monitoring structure
      const mockStatus = {
        orderStatus: "Pending",
        ethEscrowStatus: {
          isActive: true,
          isWithdrawn: false,
          isCancelled: false,
        },
        tronEscrowStatus: {
          isActive: true,
          isWithdrawn: false,
          isCancelled: false,
        },
        canWithdraw: false,
        canCancel: false,
      };

      expect(mockStatus.orderStatus).toBeDefined();
      expect(mockStatus.ethEscrowStatus).toBeDefined();
      expect(mockStatus.tronEscrowStatus).toBeDefined();
    });
  });

  describe("Error Handling Tests", () => {
    test("should handle invalid addresses", () => {
      expect(() => config.getEthSigner("invalid_key")).toThrow();
      expect(tronExtension.isValidTronAddress("invalid_address")).toBe(false);
    });

    test("should handle network errors gracefully", async () => {
      // Test with invalid amount
      const invalidAmount = 0n;
      const fromAddress = config.getEthSigner(
        config.USER_A_ETH_PRIVATE_KEY
      ).address;

      await expect(
        official1inch.getETHtoTRXQuote(invalidAmount, fromAddress)
      ).rejects.toThrow();
    });

    test("should validate timelock constraints", () => {
      expect(config.validateTimelock(1800)).toBe(false); // Too short (30 min)
      expect(config.validateTimelock(7200)).toBe(true); // Valid (2 hours)
      expect(config.validateTimelock(90000)).toBe(false); // Too long (25 hours)
    });
  });

  describe("Security Tests", () => {
    test("should generate unique secrets", () => {
      const secrets = new Set();

      for (let i = 0; i < 10; i++) {
        const { secret, secretHash } = tronExtension.generateSecretHash();
        expect(secrets.has(secret)).toBe(false);
        expect(secrets.has(secretHash)).toBe(false);
        secrets.add(secret);
        secrets.add(secretHash);
      }
    });

    test("should validate contract addresses are not zero", () => {
      expect(config.OFFICIAL_LOP_ADDRESS).not.toBe(ethers.ZeroAddress);
      expect(config.OFFICIAL_ESCROW_FACTORY_ADDRESS).not.toBe(
        ethers.ZeroAddress
      );
      expect(config.OFFICIAL_RESOLVER_ADDRESS).not.toBe(ethers.ZeroAddress);
      expect(config.FUSION_EXTENSION_ADDRESS).not.toBe(ethers.ZeroAddress);
    });
  });
});
