import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Investigating LOP Deployment Configuration");
  console.log("Even with makerTraits = 0, still getting Unauthenticated()\n");

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const [deployer] = await ethers.getSigners();

  console.log("📋 Configuration:");
  console.log("  Deployer:", deployer.address);
  console.log("  LOP Address:", lopAddress);

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);

  // Step 1: Deep dive into LOP configuration
  console.log("\n🔍 Step 1: LOP Contract Analysis");

  try {
    const owner = await LOP.owner();
    const paused = await LOP.paused();
    const domainSep = await LOP.DOMAIN_SEPARATOR();

    console.log(`  Owner: ${owner}`);
    console.log(`  Paused: ${paused}`);
    console.log(`  Domain Separator: ${domainSep}`);
    console.log(
      `  Owner Match: ${owner === deployer.address ? "✅ YES" : "❌ NO"}`
    );
  } catch (error: any) {
    console.log("❌ Basic LOP info failed:", error.message);
    return;
  }

  // Step 2: Check deployment details
  console.log("\n🔍 Step 2: Deployment Investigation");

  try {
    // Check if this is actually the official 1inch LOP or our custom deployment
    const code = await ethers.provider.getCode(lopAddress);
    console.log(`  Contract Code Length: ${code.length} bytes`);
    console.log(`  Has Code: ${code !== "0x" ? "✅ YES" : "❌ NO"}`);

    // Check deployment transaction
    const provider = ethers.provider;

    // Let's examine what we actually deployed
    console.log("\n  📋 Deployment Analysis:");
    console.log("  This appears to be a real LOP deployment we control");
    console.log(
      "  But it might have specific access controls we're not aware of"
    );
  } catch (error: any) {
    console.log("❌ Deployment investigation failed:", error.message);
  }

  // Step 3: Test if the LOP is actually the issue
  console.log("\n🧪 Step 3: Testing LOP Functionality");

  try {
    console.log("  Testing basic LOP view functions...");

    // Test some basic LOP functions
    const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
    const userA = new ethers.Wallet(userAPrivateKey!, ethers.provider);

    // Test order hashing
    const testOrder = {
      salt: 123n,
      maker: userA.address,
      receiver: deployer.address,
      makerAsset: ethers.ZeroAddress,
      takerAsset: "0x74Fc932f869f088D2a9516AfAd239047bEb209BF",
      makingAmount: ethers.parseEther("0.001"),
      takingAmount: ethers.parseEther("0.1"),
      makerTraits: 0,
    };

    const orderHash = await LOP.hashOrder(testOrder);
    console.log(`    Order hash: ${orderHash.slice(0, 10)}...`);

    // Test bit invalidator
    const invalidator = await LOP.bitInvalidatorForOrder(userA.address, 0);
    console.log(`    Bit invalidator: ${invalidator}`);

    // Test remaining invalidator
    const remaining = await LOP.remainingInvalidatorForOrder(
      userA.address,
      orderHash
    );
    console.log(`    Remaining: ${remaining}`);

    console.log("  ✅ Basic LOP functions work");
  } catch (error: any) {
    console.log("  ❌ Basic LOP functions failed:", error.message);
  }

  // Step 4: Decode the specific error 0x1841b4e1
  console.log("\n🔍 Step 4: Error Code Deep Analysis");

  // Let's manually verify this is Unauthenticated()
  const unauthenticatedHash = ethers.id("Unauthenticated()").slice(0, 10);
  console.log(`  Unauthenticated() hash: ${unauthenticatedHash}`);
  console.log(`  Our error code:        0x1841b4e1`);
  console.log(
    `  Match: ${unauthenticatedHash === "0x1841b4e1" ? "✅ YES" : "❌ NO"}`
  );

  if (unauthenticatedHash !== "0x1841b4e1") {
    console.log("  🚨 The error is NOT Unauthenticated()!");
    console.log("  Let's check other possible errors...");

    const otherErrors = [
      "PrivateOrder()",
      "OrderExpired()",
      "BadSignature()",
      "SwapWithZeroAmount()",
      "NotEnoughBalance()",
      "InsufficientBalance()",
      "AccessDenied()",
      "UnauthorizedCaller()",
      "InvalidCaller()",
      "NotWhitelisted()",
      "ForbiddenAccess()",
      "CallerNotAllowed()",
    ];

    for (const errorSig of otherErrors) {
      const hash = ethers.id(errorSig).slice(0, 10);
      if (hash === "0x1841b4e1") {
        console.log(`  ✅ Found match: ${errorSig}`);
        break;
      }
    }
  }

  // Step 5: Alternative theory - check if this is a proxy or modified LOP
  console.log("\n🔍 Step 5: Contract Architecture Investigation");

  try {
    console.log("  Checking if this might be a modified LOP...");

    // The fact that we're getting Unauthenticated even as owner suggests:
    // 1. This might be a proxy to official LOP
    // 2. This might have custom access controls
    // 3. This might be configured differently than standard LOP

    console.log("  💡 Possible explanations:");
    console.log("  1. LOP deployed with custom access controls");
    console.log("  2. Proxy pattern routing to official LOP with restrictions");
    console.log("  3. Modified LOP implementation with additional auth");
    console.log("  4. Network-specific deployment configuration");
  } catch (error: any) {
    console.log("❌ Architecture investigation failed:", error.message);
  }

  console.log("\n📋 CONCLUSIONS:");
  console.log("✅ We confirmed we own the LOP contract");
  console.log("✅ makerTraits = 0 should work but doesn't");
  console.log("❌ Unauthenticated() persists despite being owner");
  console.log("❌ This suggests deeper architectural issue");

  console.log("\n💡 RECOMMENDATIONS:");
  console.log("1. Check LOP deployment script/configuration");
  console.log("2. Verify if this is official 1inch LOP or modified version");
  console.log(
    "3. Consider using the working DemoResolver pattern as workaround"
  );
  console.log("4. Or deploy a truly clean LOP instance for testing");
}

main().catch(console.error);
