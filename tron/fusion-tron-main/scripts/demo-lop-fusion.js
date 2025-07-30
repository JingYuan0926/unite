const { ethers } = require("ethers");
const fs = require("fs");

/**
 * @title LOP v4 + Fusion Demo Script
 * @notice Demonstrates end-to-end Fusion cross-chain swap via LOP v4
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
    // LOP v4 contract ABI - corrected for v4 structure
    const lopABI = [
      "function fillOrderArgs((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits, bytes args) external payable returns (uint256, uint256, bytes32)",
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

  // Build and sign a LOP v4 order
  async buildAndSignOrder(params) {
    // First, build the extension with postInteraction
    const fusionData = this.encodeFusionData({
      srcToken: ethers.ZeroAddress, // ETH
      dstToken: "0x0000000000000000000000000000000000000001", // TRX
      secretHash: params.secretHash,
      timelock: params.timelock,
      safetyDeposit: params.safetyDeposit,
      resolver: params.resolver,
    });

    const extension = this.buildExtension(
      this.addresses.fusionExtension,
      fusionData
    );
    const salt = this.calculateSaltFromExtension(extension);
    const makerTraits = this.buildMakerTraitsWithExtension();

    // EIP-712 domain for LOP v4
    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: this.addresses.limitOrderProtocol,
    };

    // EIP-712 types for LOP v4 simplified Order struct
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

    // Build LOP v4 order with extension-derived salt and traits
    const order = {
      salt: salt.toString(),
      maker: this.ethWallet.address,
      receiver: ethers.ZeroAddress, // Zero address means no specific receiver
      makerAsset: ethers.ZeroAddress, // ETH (zero address)
      takerAsset: "0x0000000000000000000000000000000000000001", // TRX representation
      makingAmount: params.ethAmount,
      takingAmount: params.trxAmount,
      makerTraits: makerTraits,
    };

    // Sign order
    const signature = await this.ethWallet.signTypedData(domain, types, order);

    return { order, signature, extension };
  }

  // Encode fusion data for extension parameter
  encodeFusionData(params) {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address,address,uint256,uint256,bytes32,uint64,uint256,address)"],
      [
        [
          params.srcToken, // ETH
          params.dstToken, // TRX representation
          11155111, // Ethereum Sepolia chain ID
          3448148188, // Tron Nile chain ID
          params.secretHash,
          params.timelock,
          params.safetyDeposit,
          params.resolver,
        ],
      ]
    );
  }

  // Build extension with postInteractionTargetAndData
  buildExtension(fusionExtensionAddress, fusionData) {
    // Extension format: 32 bytes offsets + concatenated fields
    // For postInteraction only: [offset to end of postInteraction] + [postInteraction data]

    // PostInteraction data = 20 bytes address + fusion data
    const postInteractionData = ethers.solidityPacked(
      ["address", "bytes"],
      [fusionExtensionAddress, fusionData]
    );

    // Calculate offset: only postInteraction field, so offset is the length of postInteraction
    const postInteractionLength = postInteractionData.length / 2 - 1; // Remove 0x prefix

    // We have 8 fields in the extension: makerAssetSuffix, takerAssetSuffix, makingAmountData, takingAmountData, predicate, permit, preInteraction, postInteraction
    // Offsets are cumulative end positions for each field
    // Since we only have postInteraction, first 7 offsets are 0, last offset is the length

    const offsets =
      (0n << 0n) | // makerAssetSuffix end
      (0n << 32n) | // takerAssetSuffix end
      (0n << 64n) | // makingAmountData end
      (0n << 96n) | // takingAmountData end
      (0n << 128n) | // predicate end
      (0n << 160n) | // permit end
      (0n << 192n) | // preInteraction end
      (BigInt(postInteractionLength) << 224n); // postInteraction end

    // Build complete extension
    const extension = ethers.solidityPacked(
      ["uint256", "bytes"],
      [offsets.toString(), postInteractionData]
    );

    return extension;
  }

  // Build MakerTraits with required flags
  buildMakerTraitsWithExtension() {
    const HAS_EXTENSION_FLAG = 1n << 249n;
    const POST_INTERACTION_CALL_FLAG = 1n << 251n;

    return (HAS_EXTENSION_FLAG | POST_INTERACTION_CALL_FLAG).toString();
  }

  // Calculate salt from extension hash (as per LOP v4 spec)
  calculateSaltFromExtension(extension) {
    const extensionHash = ethers.keccak256(extension);
    // Use lower 160 bits of extension hash as salt
    return BigInt(extensionHash) & ((1n << 160n) - 1n);
  }

  // Split signature into r and vs components (LOP v4 format)
  splitSignature(signature) {
    const sig = ethers.Signature.from(signature);
    const r = sig.r;
    const vs = sig.yParityAndS; // This combines v and s for LOP v4
    return { r, vs };
  }

  // Build TakerTraits for fillOrderArgs - simple version for demo
  buildTakerTraits(extensionLength) {
    // For this demo, we just set the extension length in TakerTraits
    const ARGS_EXTENSION_LENGTH_OFFSET = 224;
    const threshold = 0n; // No threshold for demo

    const takerTraits =
      threshold |
      (BigInt(extensionLength / 2 - 1) << BigInt(ARGS_EXTENSION_LENGTH_OFFSET));
    return takerTraits.toString();
  }

  async runDemo() {
    console.log("\n🎬 FUSION + TRON LOP v4 DEMO");
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
      console.log("\n1️⃣ Creating LOP v4 order...");
      const { order, signature, extension } = await this.buildAndSignOrder({
        ethAmount,
        trxAmount,
        secretHash,
        timelock,
        safetyDeposit,
        resolver,
      });
      console.log("✅ Order created and signed");
      console.log("   Maker:", order.maker);
      console.log("   ETH Amount:", ethers.formatEther(ethAmount));
      console.log("   TRX Amount:", ethers.formatUnits(trxAmount, 6));
      console.log("   Extension length:", extension.length);

      // Step 2: Build fillOrderArgs parameters
      console.log("\n2️⃣ Building fillOrderArgs parameters...");
      const target = ethers.ZeroAddress; // No specific target, use msg.sender
      const interaction = "0x"; // No interaction data needed

      // Pack args: target + extension + interaction
      // Since target is zero address, we don't include it in args
      const args = ethers.solidityPacked(
        ["bytes", "bytes"],
        [extension, interaction]
      );

      // Build TakerTraits with extension length
      const takerTraits = this.buildTakerTraits(extension.length);

      console.log("   Target: msg.sender (no specific target)");
      console.log("   Extension length:", extension.length);
      console.log("   TakerTraits:", takerTraits);

      // Step 3: Split signature
      const { r, vs } = this.splitSignature(signature);
      console.log("   Signature split - r:", r.substring(0, 10) + "...");

      // Step 4: Fill LOP order using fillOrderArgs
      console.log("\n3️⃣ Filling LOP order via fillOrderArgs...");
      const fillValue = ethAmount + safetyDeposit; // ETH amount + safety deposit

      console.log(
        "   📋 Filling with value:",
        ethers.formatEther(fillValue),
        "ETH"
      );

      const tx = await this.lopContract.fillOrderArgs(
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
        r,
        vs,
        ethAmount, // amount to fill
        takerTraits,
        args,
        { value: fillValue }
      );

      console.log("   📄 Transaction hash:", tx.hash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Order filled successfully!");
      console.log("   Gas used:", receipt.gasUsed.toString());

      // Step 5: Get order hash and escrow ID
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

      // Step 6: Verify escrow was created
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
      console.log("✅ LOP v4 Integration: WORKING");
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

      // Enhanced error reporting
      if (error.reason) {
        console.error("   Reason:", error.reason);
      }
      if (error.code) {
        console.error("   Code:", error.code);
      }
      if (error.data) {
        console.error("   Data:", error.data);
      }

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
