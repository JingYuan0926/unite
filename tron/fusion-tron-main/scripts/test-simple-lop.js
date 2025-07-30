const { ethers } = require("ethers");
const fs = require("fs");

/**
 * @title Simple LOP Test
 * @notice Test basic LOP v4 functionality without extensions
 */
class SimpleLOPTest {
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
    const lopDeployment = JSON.parse(
      fs.readFileSync("./deployments/sepolia-lop.json", "utf8")
    );
    this.addresses = {
      limitOrderProtocol: lopDeployment.limitOrderProtocol,
      weth: lopDeployment.weth,
    };
    console.log("📋 LOP Address:", this.addresses.limitOrderProtocol);
  }

  setupContracts() {
    const lopABI = [
      "function fillOrder((uint256,address,address,address,address,uint256,uint256,uint256) order, bytes32 r, bytes32 vs, uint256 amount, uint256 takerTraits) external payable returns (uint256, uint256, bytes32)",
      "function hashOrder((uint256,address,address,address,address,uint256,uint256,uint256) order) external view returns (bytes32)",
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
    ];

    this.lopContract = new ethers.Contract(
      this.addresses.limitOrderProtocol,
      lopABI,
      this.ethWallet
    );
  }

  async testBasicOrder() {
    console.log("\n🧪 Testing basic LOP order...");

    try {
      // Check domain separator first
      const domainSeparator = await this.lopContract.DOMAIN_SEPARATOR();
      console.log("✅ Domain separator:", domainSeparator);

      // Create simple order
      const ethAmount = ethers.parseEther("0.001");
      const order = {
        salt: "1",
        maker: this.ethWallet.address,
        receiver: ethers.ZeroAddress,
        makerAsset: ethers.ZeroAddress, // ETH
        takerAsset: this.addresses.weth, // WETH as taker asset for simple test
        makingAmount: ethAmount,
        takingAmount: ethAmount, // 1:1 ratio for test
        makerTraits: "0", // No special traits
      };

      // Test hash order first
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
      console.log("✅ Order hash calculated:", orderHash);

      // Try to estimate gas for the call
      const takerTraits = "0"; // No special traits
      const amount = ethAmount;

      console.log("📋 Testing gas estimation...");
      try {
        const gasEstimate = await this.lopContract.fillOrder.estimateGas(
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
          "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy r
          "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy vs
          amount,
          takerTraits,
          { value: ethAmount }
        );
        console.log("✅ Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.log("❌ Gas estimation failed:", gasError.message);

        // Try to call statically to get better error
        try {
          await this.lopContract.fillOrder.staticCall(
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
            "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy r
            "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy vs
            amount,
            takerTraits,
            { value: ethAmount }
          );
        } catch (staticError) {
          console.log("❌ Static call failed:", staticError.message);
          if (staticError.data) {
            console.log("   Error data:", staticError.data);
          }
        }
      }
    } catch (error) {
      console.error("❌ Test failed:", error.message);
      throw error;
    }
  }
}

async function main() {
  const test = new SimpleLOPTest();
  await test.testBasicOrder();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = SimpleLOPTest;
