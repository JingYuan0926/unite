import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing LOP Contract Integration...");

  // Read deployment addresses
  const deployment = require("../../contracts/deployments/ethereum-sepolia.json");
  const lopAddress = deployment.contracts.LimitOrderProtocol;

  console.log("📋 LOP Address:", lopAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("📋 Signer Address:", signer.address);

  // Test LOP contract directly
  try {
    console.log("\n🔍 Step 1: Testing basic LOP contract calls...");

    // Use minimal LOP ABI for testing
    const lopABI = [
      "function DOMAIN_SEPARATOR() external view returns (bytes32)",
      "function invalidator(address,uint256) external view returns (uint256)",
      "function name() external view returns (string)",
      "function fillOrderArgs(tuple(uint256,address,address,address,address,uint256,uint256,uint256), bytes32, bytes32, uint256, uint256, bytes) external",
    ];

    const lopContract = new ethers.Contract(lopAddress, lopABI, signer);

    // Test basic calls
    const domainSeparator = await lopContract.DOMAIN_SEPARATOR();
    console.log("✅ DOMAIN_SEPARATOR:", domainSeparator);

    // Check if this matches our expected domain
    const expectedDomain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: lopAddress,
    };

    const calculatedDomainSeparator =
      ethers.TypedDataEncoder.hashDomain(expectedDomain);
    console.log("📋 Calculated Domain Separator:", calculatedDomainSeparator);

    if (domainSeparator === calculatedDomainSeparator) {
      console.log("✅ Domain separator matches our calculation");
    } else {
      console.log("❌ Domain separator mismatch!");
      console.log("   Contract:", domainSeparator);
      console.log("   Expected:", calculatedDomainSeparator);
    }

    // Try to get the name
    try {
      const contractName = await lopContract.name();
      console.log("✅ Contract Name:", contractName);
    } catch (e) {
      console.log("⚠️ Could not get contract name");
    }
  } catch (error: any) {
    console.error("❌ LOP contract test failed:", error.message);
  }

  // Test with a real order signature (but don't execute)
  try {
    console.log("\n🔍 Step 2: Testing order signature generation...");

    const order = {
      salt: 1,
      maker: signer.address,
      receiver: signer.address,
      makerAsset: ethers.ZeroAddress, // ETH
      takerAsset: ethers.ZeroAddress, // Mock
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.001"),
      makerTraits: 0,
    };

    const domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: 11155111, // Sepolia
      verifyingContract: lopAddress,
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

    console.log("✅ Generated signature:");
    console.log("   r:", sig.r);
    console.log("   vs:", sig.yParityAndS);
    console.log("   Valid signature format:", true);

    // Calculate order hash
    const orderHash = ethers.TypedDataEncoder.hash(domain, types, order);
    console.log("✅ Order Hash:", orderHash);
  } catch (error: any) {
    console.error("❌ Signature generation failed:", error.message);
  }
}

main().catch(console.error);
