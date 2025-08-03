import { ethers } from "hardhat";

async function main() {
  console.log("🎯 FIXING InvalidMsgValue Error (0x1841b4e1)");
  console.log("Testing different value calculations for LOP.fillOrderArgs\n");

  require("dotenv").config();

  const lopAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const mockTrxAddress = "0x74Fc932f869f088D2a9516AfAd239047bEb209BF";

  // Use working accounts
  const userAPrivateKey = process.env.USER_A_ETH_PRIVATE_KEY;
  const provider = ethers.provider;
  const userA = new ethers.Wallet(userAPrivateKey!, provider);
  const [deployer] = await ethers.getSigners();

  console.log("📋 Configuration:");
  console.log("  User A (Maker - offers ETH):", userA.address);
  console.log("  Deployer (Taker - provides MockTRX):", deployer.address);

  const LOP = await ethers.getContractAt("LimitOrderProtocol", lopAddress);
  const MockTRX = await ethers.getContractAt("MockTRX", mockTrxAddress);

  // Ensure deployer has MockTRX and allowance
  console.log("\n🔧 Setup: Ensuring MockTRX allowance for deployer");

  const deployerTrxBalance = await MockTRX.balanceOf(deployer.address);
  const deployerAllowance = await MockTRX.allowance(
    deployer.address,
    lopAddress
  );

  console.log(
    `  Deployer MockTRX: ${ethers.formatEther(deployerTrxBalance)} TRX`
  );
  console.log(`  LOP Allowance: ${ethers.formatEther(deployerAllowance)} TRX`);

  if (deployerAllowance < ethers.parseEther("1")) {
    console.log("  Approving MockTRX...");
    const approveTx = await MockTRX.approve(lopAddress, ethers.MaxUint256);
    await approveTx.wait();
    console.log("  ✅ MockTRX approved");
  }

  // Create the order
  console.log("\n📝 Creating Order: User A offers ETH for MockTRX");

  const order = {
    salt: ethers.getBigInt(Date.now()),
    maker: userA.address, // User A offers ETH
    receiver: deployer.address, // Deployer receives ETH
    makerAsset: ethers.ZeroAddress, // ETH (what User A offers)
    takerAsset: mockTrxAddress, // MockTRX (what User A wants)
    makingAmount: ethers.parseEther("0.001"), // User A offers 0.001 ETH
    takingAmount: ethers.parseEther("0.1"), // User A wants 0.1 MockTRX
    makerTraits: 0,
  };

  console.log("  Order Details:");
  console.log(
    `    Maker Asset: ETH (${ethers.formatEther(order.makingAmount)} ETH)`
  );
  console.log(
    `    Taker Asset: MockTRX (${ethers.formatEther(order.takingAmount)} TRX)`
  );
  console.log(`    Direction: User A gives ETH → gets MockTRX`);

  // Create signature
  const domain = {
    name: "1inch Limit Order Protocol",
    version: "4",
    chainId: 11155111,
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

  const signature = await userA.signTypedData(domain, types, order);
  const sig = ethers.Signature.from(signature);
  console.log("  ✅ Order signed by User A");

  // Test different value scenarios
  console.log("\n🧪 Testing Different Value Scenarios");

  const scenarios = [
    {
      name: "No ETH value (value: 0)",
      value: 0n,
      description: "Taker sends no ETH - only provides MockTRX",
    },
    {
      name: "Making amount (value: makingAmount)",
      value: order.makingAmount,
      description: "Send the amount User A is offering",
    },
    {
      name: "Taking amount (value: takingAmount)",
      value: order.takingAmount,
      description: "Send the amount User A wants (wrong - different asset)",
    },
    {
      name: "Half making amount",
      value: order.makingAmount / 2n,
      description: "Partial fill test",
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n  🧪 ${scenario.name}`);
    console.log(`     ${scenario.description}`);
    console.log(`     Value: ${ethers.formatEther(scenario.value)} ETH`);

    try {
      const gasEstimate = await LOP.fillOrderArgs.estimateGas(
        order,
        sig.r,
        sig.yParityAndS,
        order.makingAmount,
        0, // takerTraits
        "0x", // args
        { value: scenario.value }
      );

      console.log(`     ✅ SUCCESS! Gas: ${gasEstimate.toString()}`);
      console.log(`     🎉 SOLUTION FOUND: ${scenario.name}`);

      // If successful, test actual execution
      console.log(`     Testing actual execution...`);

      try {
        const fillTx = await LOP.fillOrderArgs(
          order,
          sig.r,
          sig.yParityAndS,
          order.makingAmount,
          0,
          "0x",
          {
            value: scenario.value,
            gasLimit: gasEstimate + 50000n, // Add buffer
          }
        );

        console.log(`     Transaction: ${fillTx.hash}`);
        const receipt = await fillTx.wait();
        console.log(`     ✅ EXECUTION SUCCESS! Block: ${receipt.blockNumber}`);

        // Check balances
        const userAEthAfter = await provider.getBalance(userA.address);
        const deployerTrxAfter = await MockTRX.balanceOf(deployer.address);

        console.log(`     📊 Results:`);
        console.log(
          `       User A ETH: ${ethers.formatEther(userAEthAfter)} ETH`
        );
        console.log(
          `       Deployer MockTRX: ${ethers.formatEther(deployerTrxAfter)} TRX`
        );

        break; // Stop after first success
      } catch (execError: any) {
        console.log(`     ❌ Execution failed: ${execError.message}`);
        if (execError.data) {
          console.log(`     Error data: ${execError.data}`);
        }
      }
    } catch (error: any) {
      console.log(`     ❌ Failed: ${error.message}`);

      if (error.data === "0x1841b4e1") {
        console.log(`     Still InvalidMsgValue - trying next scenario`);
      } else if (error.data) {
        console.log(`     Error data: ${error.data}`);
        if (error.data !== "0x1841b4e1") {
          console.log(`     🎯 Different error - progress made!`);
        }
      }
    }
  }

  console.log("\n📋 VALUE CALCULATION ANALYSIS:");
  console.log("For ETH → Token orders in LOP:");
  console.log("1. Maker (User A) offers ETH via order signature");
  console.log("2. Taker (Deployer) provides tokens via allowance");
  console.log("3. ETH value sent should match what's needed by LOP");
  console.log("4. InvalidMsgValue means our calculation is wrong");

  console.log("\n🎯 NEXT STEPS:");
  console.log("- Identify correct value calculation");
  console.log("- Update DemoResolver.executeAtomicSwap with correct value");
  console.log("- Test complete LOP integration");
  console.log("- Implement atomic swap flow");
}

main().catch(console.error);
