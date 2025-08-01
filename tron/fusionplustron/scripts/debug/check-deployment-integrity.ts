import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Check if our EscrowFactory deployment has integrity issues
 * and determine if redeployment is needed
 */

async function main() {
  console.log("🔍 DEPLOYMENT INTEGRITY CHECK");
  console.log("=============================\n");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  const addresses = {
    escrowFactory: "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA",
    lop: "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0",
    resolver: "0xEdC45bD18674BdD4A22D4904e6252A8DA9e29946",
  };

  console.log("1️⃣ DEPLOYMENT TRANSACTION ANALYSIS");
  console.log("==================================");

  try {
    // Get the deployment transaction for EscrowFactory
    // This requires knowing the transaction hash or block range
    console.log("Checking EscrowFactory deployment...");

    const factoryCode = await provider.getCode(addresses.escrowFactory);
    if (factoryCode === "0x") {
      console.log("❌ CRITICAL: EscrowFactory not deployed!");
      return;
    }

    console.log(`✅ EscrowFactory deployed with ${factoryCode.length} bytes`);

    // Check if the contract is properly initialized by testing basic functions
    const factory = new ethers.Contract(
      addresses.escrowFactory,
      [
        "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
        "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
        "function limitOrderProtocol() view returns (address)",
        "function owner() view returns (address)",
        "function rescueDelaySrc() view returns (uint32)",
        "function rescueDelayDst() view returns (uint32)",
      ],
      provider
    );

    const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
    const dstImpl = await factory.ESCROW_DST_IMPLEMENTATION();
    const lop = await factory.limitOrderProtocol();
    const owner = await factory.owner();
    const rescueDelaySrc = await factory.rescueDelaySrc();
    const rescueDelayDst = await factory.rescueDelayDst();

    console.log("\nDeployment state:");
    console.log(`- Source Implementation: ${srcImpl}`);
    console.log(`- Destination Implementation: ${dstImpl}`);
    console.log(`- LimitOrderProtocol: ${lop}`);
    console.log(`- Owner: ${owner}`);
    console.log(`- Rescue Delay Src: ${rescueDelaySrc}`);
    console.log(`- Rescue Delay Dst: ${rescueDelayDst}`);

    // Check if implementations are zero addresses (deployment failure)
    if (srcImpl === ethers.ZeroAddress) {
      console.log("❌ CRITICAL: Source implementation is zero address!");
    }
    if (dstImpl === ethers.ZeroAddress) {
      console.log("❌ CRITICAL: Destination implementation is zero address!");
    }

    // Verify implementations exist
    const srcCode = await provider.getCode(srcImpl);
    const dstCode = await provider.getCode(dstImpl);

    console.log(`\nImplementation verification:`);
    console.log(
      `- Source exists: ${srcCode !== "0x"} (${srcCode.length} bytes)`
    );
    console.log(
      `- Destination exists: ${dstCode !== "0x"} (${dstCode.length} bytes)`
    );

    if (srcCode === "0x" || dstCode === "0x") {
      console.log("❌ CRITICAL: Implementation contracts missing!");
    }
  } catch (error) {
    console.log(`❌ Deployment analysis failed: ${error.message}`);
  }

  console.log("\n2️⃣ CONSTRUCTOR VERIFICATION");
  console.log("===========================");

  try {
    // Try to find the deployment transaction
    console.log("Searching for deployment transaction...");

    // Get recent blocks to find deployment
    const currentBlock = await provider.getBlockNumber();
    console.log(`Current block: ${currentBlock}`);

    // Check last 1000 blocks for contract creation
    for (let i = 0; i < 1000; i++) {
      const blockNumber = currentBlock - i;
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) continue;

        for (const tx of block.transactions) {
          if (typeof tx === "string") continue;

          // Check if this transaction created our contract
          if (
            tx.to === null &&
            tx.creates?.toLowerCase() === addresses.escrowFactory.toLowerCase()
          ) {
            console.log(`✅ Found deployment transaction: ${tx.hash}`);
            console.log(`   Block: ${blockNumber}`);
            console.log(`   Gas used: ${tx.gasLimit}`);
            console.log(`   From: ${tx.from}`);

            // Get transaction receipt for more details
            const receipt = await provider.getTransactionReceipt(tx.hash);
            console.log(`   Gas actually used: ${receipt?.gasUsed}`);
            console.log(`   Status: ${receipt?.status}`);

            if (receipt?.status === 0) {
              console.log("❌ CRITICAL: Deployment transaction failed!");
            }

            return; // Found it
          }
        }
      } catch (blockError) {
        // Skip this block
        continue;
      }
    }

    console.log("⚠️  Could not find deployment transaction in recent blocks");
  } catch (error) {
    console.log(`❌ Constructor verification failed: ${error.message}`);
  }

  console.log("\n3️⃣ FUNCTIONAL TESTING");
  console.log("=====================");

  // Test the most basic function that should work
  try {
    const factory = new ethers.Contract(
      addresses.escrowFactory,
      [
        "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
        "function addressOfEscrowSrc((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) view returns (address)",
      ],
      provider
    );

    // Test 1: Basic state access
    console.log("Testing basic state access...");
    const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
    console.log(`✅ Basic state access works: ${srcImpl}`);

    // Test 2: Simple addressOfEscrowSrc call
    console.log("Testing addressOfEscrowSrc with zero immutables...");
    const zeroImmutables = {
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
    };

    try {
      const address = await factory.addressOfEscrowSrc.staticCall(
        zeroImmutables,
        {
          gasLimit: 1000000,
        }
      );
      console.log(`✅ addressOfEscrowSrc works: ${address}`);
    } catch (funcError) {
      console.log(`❌ addressOfEscrowSrc failed: ${funcError.message}`);
      console.log(`   This indicates the contract has initialization issues`);
    }
  } catch (error) {
    console.log(`❌ Functional testing failed: ${error.message}`);
  }

  console.log("\n4️⃣ REDEPLOYMENT RECOMMENDATION");
  console.log("==============================");

  // Analyze all the data we've collected
  console.log("Based on the analysis above:");

  const issues = [];

  try {
    const factory = new ethers.Contract(
      addresses.escrowFactory,
      [
        "function ESCROW_SRC_IMPLEMENTATION() view returns (address)",
        "function ESCROW_DST_IMPLEMENTATION() view returns (address)",
        "function addressOfEscrowSrc((bytes32,bytes32,address,address,address,uint256,uint256,(uint64,uint64,uint64,uint64,uint64))) view returns (address)",
      ],
      provider
    );

    const srcImpl = await factory.ESCROW_SRC_IMPLEMENTATION();
    const dstImpl = await factory.ESCROW_DST_IMPLEMENTATION();

    if (srcImpl === ethers.ZeroAddress) {
      issues.push("Source implementation is zero address");
    }
    if (dstImpl === ethers.ZeroAddress) {
      issues.push("Destination implementation is zero address");
    }

    const srcCode = await provider.getCode(srcImpl);
    const dstCode = await provider.getCode(dstImpl);

    if (srcCode === "0x") {
      issues.push("Source implementation contract doesn't exist");
    }
    if (dstCode === "0x") {
      issues.push("Destination implementation contract doesn't exist");
    }

    // Test addressOfEscrowSrc
    try {
      await factory.addressOfEscrowSrc.staticCall(
        {
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
        { gasLimit: 1000000 }
      );
    } catch (funcError) {
      issues.push("addressOfEscrowSrc function fails");
    }
  } catch (error) {
    issues.push("Cannot access contract functions");
  }

  if (issues.length === 0) {
    console.log("✅ Contract appears to be deployed correctly");
    console.log("   The issue might be with parameters or gas limits");
    console.log("   Try running the comprehensive diagnosis script");
  } else {
    console.log("❌ Contract has deployment issues:");
    issues.forEach((issue) => console.log(`   - ${issue}`));
    console.log("\n🔄 REDEPLOYMENT RECOMMENDED");
    console.log(
      "   Run: npm run deploy:ethereum -- scripts/deploy/02-deploy-official-escrow.ts"
    );
  }
}

main().catch(console.error);
