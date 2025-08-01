import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Compare our EscrowFactory deployment with reference implementations
 * This helps identify differences that might cause addressOfEscrowSrc() to fail
 */

async function main() {
  console.log("🔍 REFERENCE IMPLEMENTATION COMPARISON");
  console.log("=====================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);

  // Our deployed contract
  const ourFactoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";

  // Reference addresses from official deployments (if available)
  // These would be from the cross-chain-swap deployments
  const referenceAddresses = {
    // Add known working EscrowFactory addresses here
    // Example: "arbitrum": "0x...",
    // "mainnet": "0x...",
  };

  console.log("1️⃣ BYTECODE COMPARISON");
  console.log("======================");

  try {
    const ourBytecode = await provider.getCode(ourFactoryAddress);
    console.log(`Our factory bytecode length: ${ourBytecode.length}`);
    console.log(`Our factory bytecode hash: ${ethers.keccak256(ourBytecode)}`);

    // If we had reference addresses, we'd compare bytecodes here
    // for (const [network, address] of Object.entries(referenceAddresses)) {
    //   const refBytecode = await refProvider.getCode(address);
    //   console.log(`${network} bytecode length: ${refBytecode.length}`);
    //   console.log(`Bytecode match: ${ourBytecode === refBytecode}`);
    // }
  } catch (error) {
    console.log(`❌ Bytecode comparison failed: ${error.message}`);
  }

  console.log("\n2️⃣ CONSTRUCTOR PARAMETERS ANALYSIS");
  console.log("==================================");

  // Analyze our deployment transaction to see constructor parameters
  try {
    // This would require finding our deployment transaction
    console.log("Analyzing constructor parameters from deployment...");

    // Expected constructor parameters for EscrowFactory:
    const expectedParams = {
      limitOrderProtocol: "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0", // Our LOP
      feeToken: ethers.ZeroAddress, // Zero for testnet
      accessToken: ethers.ZeroAddress, // Zero for testnet
      owner: process.env.ETH_WALLET_ADDRESS || "Unknown",
      rescueDelaySrc: 86400, // 24 hours
      rescueDelayDst: 86400, // 24 hours
    };

    console.log("Expected constructor parameters:");
    console.log(JSON.stringify(expectedParams, null, 2));
  } catch (error) {
    console.log(`❌ Constructor analysis failed: ${error.message}`);
  }

  console.log("\n3️⃣ DEPLOYMENT VERIFICATION");
  console.log("==========================");

  // Check if our deployment matches expected patterns
  try {
    const factory = new ethers.Contract(
      ourFactoryAddress,
      [
        "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
        "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
        "function limitOrderProtocol() view returns (address)",
        "function owner() view returns (address)",
      ],
      provider
    );

    const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
    const dstImpl = await factory.ESCROW_DST_IMPLEMENTATION();
    const lop = await factory.limitOrderProtocol();
    const owner = await factory.owner();

    console.log("Deployed contract state:");
    console.log(`- Source Implementation: ${srcImpl}`);
    console.log(`- Destination Implementation: ${dstImpl}`);
    console.log(`- LimitOrderProtocol: ${lop}`);
    console.log(`- Owner: ${owner}`);

    // Verify implementations exist
    const srcCode = await provider.getCode(srcImpl);
    const dstCode = await provider.getCode(dstImpl);
    const lopCode = await provider.getCode(lop);

    console.log("\nImplementation verification:");
    console.log(
      `- Source implementation exists: ${srcCode !== "0x"} (${srcCode.length} bytes)`
    );
    console.log(
      `- Destination implementation exists: ${dstCode !== "0x"} (${dstCode.length} bytes)`
    );
    console.log(`- LOP exists: ${lopCode !== "0x"} (${lopCode.length} bytes)`);
  } catch (error) {
    console.log(`❌ Deployment verification failed: ${error.message}`);
  }

  console.log("\n4️⃣ EXPECTED VS ACTUAL BEHAVIOR");
  console.log("===============================");

  // Test what should work vs what actually works
  const testCases = [
    {
      name: "Zero immutables",
      immutables: {
        orderHash: ethers.ZeroHash,
        hashlock: ethers.ZeroHash,
        maker: ethers.ZeroAddress,
        taker: ethers.ZeroAddress,
        token: ethers.ZeroAddress,
        amount: 0,
        safetyDeposit: 0,
        timelocks: {
          deployedAt: 0,
          srcWithdrawal: 0,
          srcCancellation: 0,
          dstWithdrawal: 0,
          dstCancellation: 0,
        },
      },
    },
    {
      name: "Valid test immutables",
      immutables: {
        orderHash: ethers.keccak256(ethers.toUtf8Bytes("test")),
        hashlock: ethers.keccak256(ethers.toUtf8Bytes("secret")),
        maker: "0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7",
        taker: "0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7",
        token: ethers.ZeroAddress,
        amount: ethers.parseEther("1"),
        safetyDeposit: ethers.parseEther("0.1"),
        timelocks: {
          deployedAt: Math.floor(Date.now() / 1000),
          srcWithdrawal: Math.floor(Date.now() / 1000) + 600,
          srcCancellation: Math.floor(Date.now() / 1000) + 3600,
          dstWithdrawal: Math.floor(Date.now() / 1000) + 300,
          dstCancellation: Math.floor(Date.now() / 1000) + 3300,
        },
      },
    },
  ];

  const factory = new ethers.Contract(
    ourFactoryAddress,
    [
      "function addressOfEscrowSrc((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) view returns (address)",
    ],
    provider
  );

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    try {
      const result = await factory.addressOfEscrowSrc.staticCall(
        testCase.immutables,
        {
          gasLimit: 1000000,
        }
      );
      console.log(`✅ SUCCESS: ${result}`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);

      // Try to get more specific error info
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
      }
      if (error.reason) {
        console.log(`   Reason: ${error.reason}`);
      }
    }
  }

  console.log("\n5️⃣ RECOMMENDED ACTIONS");
  console.log("======================");
  console.log("Based on the comparison above:");
  console.log(
    "1. If implementations don't exist → Redeploy with proper constructor"
  );
  console.log(
    "2. If bytecode differs significantly → Check compilation/linking"
  );
  console.log("3. If all tests fail → Likely constructor/initialization issue");
  console.log(
    "4. If only complex tests fail → Possible gas or computation issue"
  );
  console.log(
    "5. Check deployment transaction on Etherscan for constructor params"
  );
}

main().catch(console.error);
