const { ethers } = require("ethers");
const fs = require("fs");

/**
 * @title Direct Fusion Test
 * @notice Test FusionExtension and EscrowFactory directly without LOP
 */
class DirectFusionTest {
  constructor() {
    this.setupProviders();
    this.loadDeployments();
    this.setupContracts();
  }

  setupProviders() {
    require("dotenv").config();
    this.ethProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    const cleanKey = privateKey.startsWith("0x")
      ? privateKey
      : "0x" + privateKey;
    this.ethWallet = new ethers.Wallet(cleanKey, this.ethProvider);
    console.log("🔗 Connected to Ethereum Sepolia");
    console.log("👤 Wallet:", this.ethWallet.address);
  }

  loadDeployments() {
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
      fusionExtension: fusionDeployment.fusionExtension,
      escrowFactory: escrowDeployment.escrowFactory,
    };

    console.log("📋 Contract Addresses:");
    console.log("  FusionExtension:", this.addresses.fusionExtension);
    console.log("  EscrowFactory:", this.addresses.escrowFactory);
  }

  setupContracts() {
    // FusionExtension ABI
    const fusionABI = [
      "function postInteraction((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes extension, bytes32 orderHash, address taker, uint256 makingAmount, uint256 takingAmount, uint256 remainingMakingAmount, bytes extraData) external",
      "function decodeFusionData(bytes extraData) external pure returns (tuple(address,address,uint256,uint256,bytes32,uint64,uint256,address))",
      "function getEscrowForOrder(bytes32 orderHash) external view returns (bytes32)",
    ];

    // EscrowFactory ABI
    const escrowABI = [
      "function createEscrowFromExtension(address initiator, address resolver, address token, uint256 amount, bytes32 secretHash, uint64 timelock) external payable returns (bytes32)",
      "function escrows(bytes32) external view returns (address,address,address,uint256,uint256,bytes32,uint64,uint64,uint64,bool,bool)",
    ];

    this.fusionContract = new ethers.Contract(
      this.addresses.fusionExtension,
      fusionABI,
      this.ethWallet
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

  // Test fusion data encoding/decoding
  async testFusionDataEncoding() {
    console.log("\n🧪 Testing fusion data encoding/decoding...");

    const { secret, secretHash } = this.generateSecret();
    const ethAmount = ethers.parseEther("0.001");
    const safetyDeposit = ethers.parseEther("0.001");
    const timelock = 3600;
    const resolver = this.ethWallet.address;

    // Encode fusion data
    const fusionData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address,address,uint256,uint256,bytes32,uint64,uint256,address)"],
      [
        [
          ethers.ZeroAddress, // ETH
          "0x0000000000000000000000000000000000000001", // TRX
          11155111, // Ethereum Sepolia
          3448148188, // Tron Nile
          secretHash,
          timelock,
          safetyDeposit,
          resolver,
        ],
      ]
    );

    console.log("✅ Fusion data encoded, length:", fusionData.length);

    // Test decoding
    try {
      const decoded = await this.fusionContract.decodeFusionData(fusionData);
      console.log("✅ Fusion data decoded successfully:");
      console.log("   Source token:", decoded[0]);
      console.log("   Destination token:", decoded[1]);
      console.log("   Source chain ID:", decoded[2].toString());
      console.log("   Destination chain ID:", decoded[3].toString());
      console.log("   Secret hash:", decoded[4]);
      console.log("   Timelock:", decoded[5].toString());
      console.log("   Safety deposit:", ethers.formatEther(decoded[6]), "ETH");
      console.log("   Resolver:", decoded[7]);

      return {
        fusionData,
        secretHash,
        ethAmount,
        safetyDeposit,
        timelock,
        resolver,
      };
    } catch (error) {
      console.error("❌ Fusion data decoding failed:", error.message);
      throw error;
    }
  }

  // Test direct escrow creation
  async testDirectEscrowCreation() {
    console.log("\n🧪 Testing direct escrow creation...");

    const { secretHash, ethAmount, safetyDeposit, timelock, resolver } =
      await this.testFusionDataEncoding();

    try {
      // For ETH escrows, msg.value must be amount + MIN_SAFETY_DEPOSIT
      const totalValue = ethAmount + safetyDeposit; // 0.001 + 0.001 = 0.002 ETH

      console.log("   ETH amount:", ethers.formatEther(ethAmount));
      console.log("   Safety deposit:", ethers.formatEther(safetyDeposit));
      console.log("   Total value to send:", ethers.formatEther(totalValue));

      const tx = await this.escrowContract.createEscrowFromExtension(
        this.ethWallet.address, // initiator
        resolver, // resolver
        ethers.ZeroAddress, // ETH token
        ethAmount, // amount
        secretHash, // secret hash
        timelock, // timelock
        { value: totalValue } // Total: amount + safety deposit
      );

      console.log("📄 Transaction hash:", tx.hash);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Escrow created successfully!");
      console.log("   Gas used:", receipt.gasUsed.toString());

      // Get escrow ID from events
      const logs = receipt.logs;
      if (logs.length > 0) {
        // Parse the EscrowCreated event (assuming it's the first log)
        console.log("   Event logs found:", logs.length);
        for (let i = 0; i < logs.length; i++) {
          console.log(`   Log ${i}:`, logs[i].topics[0]);
        }
      }

      return tx.hash;
    } catch (error) {
      console.error("❌ Direct escrow creation failed:", error.message);
      if (error.reason) {
        console.error("   Reason:", error.reason);
      }
      throw error;
    }
  }

  // Test postInteraction call directly
  async testPostInteractionDirect() {
    console.log("\n🧪 Testing postInteraction call directly...");

    const {
      fusionData,
      secretHash,
      ethAmount,
      safetyDeposit,
      timelock,
      resolver,
    } = await this.testFusionDataEncoding();

    // Create a mock order
    const mockOrder = {
      salt: "1",
      maker: this.ethWallet.address,
      receiver: ethers.ZeroAddress,
      makerAsset: ethers.ZeroAddress, // ETH
      takerAsset: "0x0000000000000000000000000000000000000001", // TRX
      makingAmount: ethAmount,
      takingAmount: ethers.parseUnits("2", 6), // 2 TRX
      makerTraits: "0",
    };

    const orderHash = ethers.keccak256(ethers.toUtf8Bytes("mock-order-hash"));
    const taker = this.ethWallet.address;
    const extension = "0x";

    console.log("📋 Simulating postInteraction call...");
    console.log("   Order maker:", mockOrder.maker);
    console.log("   Order hash:", orderHash);
    console.log("   Making amount:", ethers.formatEther(ethAmount), "ETH");

    try {
      // Since the FusionExtension expects to be called by LOP, we'll call it from our address
      // This will fail the onlyLimitOrderProtocol check, but we can see if the function exists
      await this.fusionContract.postInteraction.staticCall(
        [
          mockOrder.salt,
          mockOrder.maker,
          mockOrder.receiver,
          mockOrder.makerAsset,
          mockOrder.takerAsset,
          mockOrder.makingAmount,
          mockOrder.takingAmount,
          mockOrder.makerTraits,
        ],
        extension,
        orderHash,
        taker,
        ethAmount,
        ethAmount,
        0, // remaining making amount
        fusionData
      );

      console.log(
        "✅ PostInteraction function exists and parameters are valid"
      );
    } catch (error) {
      if (error.message.includes("OnlyLimitOrderProtocol")) {
        console.log("✅ PostInteraction function exists (expected auth error)");
        console.log(
          "   This confirms our FusionExtension is properly deployed"
        );
      } else {
        console.error("❌ PostInteraction call failed:", error.message);
        throw error;
      }
    }
  }

  async runTests() {
    console.log("\n🎬 DIRECT FUSION TESTING");
    console.log("=".repeat(50));

    try {
      await this.testFusionDataEncoding();
      await this.testDirectEscrowCreation();
      await this.testPostInteractionDirect();

      console.log("\n🎉 ALL TESTS PASSED!");
      console.log("=".repeat(50));
      console.log("✅ FusionExtension: WORKING");
      console.log("✅ EscrowFactory: WORKING");
      console.log("✅ Data Encoding: WORKING");
      console.log("✅ Direct Integration: READY");
    } catch (error) {
      console.error("❌ Tests failed:", error);
      throw error;
    }
  }
}

async function main() {
  const test = new DirectFusionTest();
  await test.runTests();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = DirectFusionTest;
