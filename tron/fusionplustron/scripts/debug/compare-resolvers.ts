import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Comparing DemoResolver vs DemoResolverV2...");

  // Read deployment addresses
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const demoResolverAddress = deployment.contracts.DemoResolver;
  const demoResolverV2Address = deployment.DemoResolverV2.address;

  console.log("📋 DemoResolver Address:", demoResolverAddress);
  console.log("📋 DemoResolverV2 Address:", demoResolverV2Address);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📋 Signer Address:", signer.address);

  // Test both contracts
  for (const [name, address] of [
    ["DemoResolver", demoResolverAddress],
    ["DemoResolverV2", demoResolverV2Address],
  ]) {
    console.log(`\n🔍 Testing ${name} at ${address}...`);

    try {
      // Get contract instances
      const DemoResolver = await ethers.getContractFactory(name);
      const resolver = DemoResolver.attach(address);

      // Test basic calls
      const lopAddress = await resolver.LOP();
      const escrowFactoryAddress = await resolver.ESCROW_FACTORY();

      console.log(`✅ ${name} LOP:`, lopAddress);
      console.log(`✅ ${name} EscrowFactory:`, escrowFactoryAddress);

      // Test executeAtomicSwap with minimal parameters
      const immutables = {
        orderHash: ethers.ZeroHash,
        hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
        maker: BigInt(signer.address),
        taker: BigInt(address),
        token: 0n,
        amount: ethers.parseEther("0.001"),
        safetyDeposit: ethers.parseEther("0.001"),
        timelocks: 0,
      };

      const order = {
        salt: 1,
        maker: signer.address,
        receiver: signer.address,
        makerAsset: ethers.ZeroAddress,
        takerAsset: ethers.ZeroAddress,
        makingAmount: ethers.parseEther("0.001"),
        takingAmount: ethers.parseEther("0.001"),
        makerTraits: 0,
      };

      // Generate signature
      const domain = {
        name: "1inch Limit Order Protocol",
        version: "4",
        chainId: 11155111,
        verifyingContract: "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0",
      };

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

      const signature = await signer.signTypedData(domain, types, order);
      const sig = ethers.Signature.from(signature);

      const totalValue = immutables.amount + immutables.safetyDeposit;

      try {
        const gasEstimate = await resolver.executeAtomicSwap.estimateGas(
          immutables,
          order,
          sig.r,
          sig.yParityAndS,
          immutables.amount,
          0,
          "0x",
          { value: totalValue }
        );

        console.log(`✅ ${name} Gas Estimate:`, gasEstimate.toString());
      } catch (error: any) {
        console.log(`❌ ${name} executeAtomicSwap failed:`);
        console.log("   Error:", error.message);
        if (error.data) {
          console.log("   Error Data:", error.data);
        }
      }
    } catch (error: any) {
      console.error(`❌ ${name} test failed:`, error.message);
    }
  }
}

main().catch(console.error);
