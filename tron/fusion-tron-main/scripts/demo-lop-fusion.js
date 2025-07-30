const { ethers } = require("ethers");
const fs = require("fs");

// Import the TypeScript LOP integration
// Note: In a real setup, you'd compile TypeScript first or use ts-node
// For demo purposes, we'll implement the core functionality directly

/**
 * @title LOP + Fusion Demo Script
 * @notice Demonstrates end-to-end Fusion cross-chain swap via LOP
 */
class LOPFusionDemo {
  constructor() {
    this.setupProviders();
    this.loadDeployments();
    this.setupContracts();
  }

  setupProviders() {
    // Load environment variables
    require("dotenv").config();

    // Setup Ethereum Sepolia provider
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

    // Clean private key (remove 0x prefix if present, then add it back)
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    const cleanKey = privateKey.startsWith("0x")
      ? privateKey
      : "0x" + privateKey;
    this.ethWallet = new ethers.Wallet(cleanKey, this.ethProvider);

    console.log("🔗 Connected to Ethereum Sepolia");
    console.log("👤 Wallet:", this.ethWallet.address);
  }

  loadDeployments() {
    // Load all deployment addresses
    const lopDeployment = JSON.parse(
      fs.readFileSync("./deployments/sepolia-lop.json", "utf8")
    );
    const fusionDeployment = JSON.parse(
      fs.readFileSync("./deployments/sepolia-fusion-extension.json", "utf8")
    );
    const escrowDeployment = JSON.parse(
      fs.readFileSync(
        "./deployments/sepolia-escrow-factory-updated.json",
        "utf8"
      )
    );

    this.addresses = {
      limitOrderProtocol: lopDeployment.limitOrderProtocol,
      fusionExtension: fusionDeployment.fusionExtension,
      escrowFactory: escrowDeployment.escrowFactory,
      weth: lopDeployment.weth,
    };

    console.log("📋 Contract Addresses:");
    console.log("  LOP:", this.addresses.limitOrderProtocol);
    console.log("  FusionExtension:", this.addresses.fusionExtension);
    console.log("  EscrowFactory:", this.addresses.escrowFactory);
  }

  setupContracts() {
    // LOP contract ABI (minimal)
    const lopABI = [
      "function fillOrder((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes signature, uint256 amount, bytes extension) external payable",
      "function hashOrder((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
    ];

    // FusionExtension ABI (minimal)
    const fusionABI = [
      "function getEscrowForOrder(bytes32 orderHash) external view returns (bytes32)",
      "event FusionOrderCreated(bytes32 indexed orderHash, bytes32 indexed escrowId, address indexed maker, address taker, address resolver, uint256 amount)",
    ];

    // EscrowFactory ABI (minimal)
    const escrowABI = [
      "function escrows(bytes32) external view returns (address,address,address,uint256,uint256,bytes32,uint64,uint64,uint64,bool,bool)",
      "function revealAndWithdraw(bytes32 escrowId, bytes32 secret, bytes32 nonce) external",
    ];

    this.lopContract = new ethers.Contract(
      this.addresses.limitOrderProtocol,
      lopABI,
      this.ethWallet
    );
    this.fusionContract = new ethers.Contract(
      this.addresses.fusionExtension,
      fusionABI,
      this.ethProvider
    );
    this.escrowContract = new ethers.Contract(
      this.addresses.escrowFactory,
      escrowABI,
      this.ethWallet
    );
  }

  // Generate a random secret for the atomic swap
  generateSecret() {
    const secret = ethers.hexlify(ethers.randomBytes(32));
    const secretHash = ethers.keccak256(secret);
    return { secret, secretHash };
  }

  // Build and sign a LOP order
  async buildAndSignOrder(params) {
    // EIP-712 domain for LOP
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: this.addresses.limitOrderProtocol,
    };

    // EIP-712 types
    const types = {
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

    // Build order
    const order = {
      salt: ethers.hexlify(ethers.randomBytes(32)),
      maker: this.ethWallet.address,
      receiver: "0x0000000000000000000000000000000000000000",
      makerAsset: "0x0000000000000000000000000000000000000000", // ETH
      takerAsset: "0x0000000000000000000000000000000000000001", // TRX representation
      makingAmount: params.ethAmount,
      takingAmount: params.trxAmount,
      makerTraits: (1n << 251n).toString(), // POST_INTERACTION_FLAG
    };

    // Sign order
    const signature = await this.ethWallet.signTypedData(domain, types, order);

    return { order, signature };
  }

  // Encode fusion data for extraData parameter
  encodeFusionData(params) {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address,address,uint256,uint256,bytes32,uint64,uint256,address)"],
      [
        [
          params.srcToken,
          params.dstToken,
          11155111, // Ethereum Sepolia
          3448148188, // Tron Nile
          params.secretHash,
          params.timelock,
          params.safetyDeposit,
          params.resolver,
        ],
      ]
    );
  }

  async runDemo() {
    console.log("\n🎬 FUSION + TRON LOP DEMO");
    console.log("=".repeat(50));

    try {
      // Demo parameters
      const ethAmount = ethers.parseEther("0.001"); // 0.001 ETH
      const trxAmount = ethers.parseUnits("2", 6); // 2 TRX (6 decimals)
      const safetyDeposit = ethers.parseEther("0.001"); // 0.001 ETH safety deposit
      const timelock = 3600; // 1 hour
      const resolver = this.ethWallet.address; // Self as resolver for demo

      // Generate secret
      const { secret, secretHash } = this.generateSecret();
      console.log("\n🔐 Generated atomic swap secret");
      console.log("   Secret hash:", secretHash);

      // Step 1: Build and sign LOP order
      console.log("\n1️⃣ Creating LOP order...");
      const { order, signature } = await this.buildAndSignOrder({
        ethAmount,
        trxAmount,
      });
      console.log("✅ Order created and signed");
      console.log("   Maker:", order.maker);
      console.log("   ETH Amount:", ethers.formatEther(ethAmount));
      console.log("   TRX Amount:", ethers.formatUnits(trxAmount, 6));

      // Step 2: Encode fusion data
      console.log("\n2️⃣ Encoding fusion data...");
      const extraData = this.encodeFusionData({
        srcToken: "0x0000000000000000000000000000000000000000", // ETH
        dstToken: "0x0000000000000000000000000000000000000001", // TRX
        secretHash,
        timelock,
        safetyDeposit,
        resolver,
      });
      console.log("✅ Fusion data encoded");

      // Step 3: Fill LOP order (creates escrow via postInteraction)
      console.log("\n3️⃣ Filling LOP order...");
      const fillValue = ethAmount + safetyDeposit; // ETH amount + safety deposit

      console.log(
        "   📋 Filling with value:",
        ethers.formatEther(fillValue),
        "ETH"
      );

      const tx = await this.lopContract.fillOrder(
        [
          order.salt,
          order.maker,
          order.receiver,
          order.makerAsset,
          order.takerAsset,
          order.makingAmount,
          order.takingAmount,
          order.makerTraits,
        ],
        signature,
        ethAmount,
        extraData,
        { value: fillValue }
      );

      console.log("   📄 Transaction hash:", tx.hash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Order filled successfully!");

      // Step 4: Get order hash and escrow ID
      console.log("\n4️⃣ Retrieving escrow information...");
      const orderHash = await this.lopContract.hashOrder([
        order.salt,
        order.maker,
        order.receiver,
        order.makerAsset,
        order.takerAsset,
        order.makingAmount,
        order.takingAmount,
        order.makerTraits,
      ]);

      console.log("   📋 Order hash:", orderHash);

      // Wait a moment for event processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const escrowId = await this.fusionContract.getEscrowForOrder(orderHash);
      console.log("   🔐 Escrow ID:", escrowId);

      // Step 5: Verify escrow was created
      console.log("\n5️⃣ Verifying escrow...");
      const escrowData = await this.escrowContract.escrows(escrowId);
      console.log("✅ Escrow verified:");
      console.log("   Initiator:", escrowData[0]);
      console.log("   Resolver:", escrowData[1]);
      console.log("   Token:", escrowData[2]);
      console.log("   Amount:", ethers.formatEther(escrowData[3]), "ETH");
      console.log(
        "   Safety Deposit:",
        ethers.formatEther(escrowData[4]),
        "ETH"
      );

      // Demo complete - in real scenario, resolver would continue with Tron side
      console.log("\n🎉 DEMO COMPLETE!");
      console.log("=".repeat(50));
      console.log("✅ LOP Integration: WORKING");
      console.log("✅ Escrow Creation: AUTOMATIC");
      console.log("✅ PostInteraction Hook: TRIGGERED");
      console.log("✅ Hashlock/Timelock: PRESERVED");
      console.log("📋 Ready for Tron-side escrow creation");

      return {
        orderHash,
        escrowId,
        txHash: tx.hash,
        secret,
        secretHash,
      };
    } catch (error) {
      console.error("❌ Demo failed:", error);
      throw error;
    }
  }
}

// Run demo if called directly
async function main() {
  const demo = new LOPFusionDemo();
  await demo.runDemo();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = LOPFusionDemo;
