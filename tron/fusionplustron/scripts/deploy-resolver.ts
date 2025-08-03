import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying fresh DemoResolver and updating .env...");

  // Get contract addresses from environment
  const lopAddress =
    process.env.OFFICIAL_LOP_ADDRESS ||
    "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0";
  const escrowFactoryAddress =
    process.env.OFFICIAL_ESCROW_FACTORY_ADDRESS ||
    "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";

  console.log(`📍 LOP Address: ${lopAddress}`);
  console.log(`📍 EscrowFactory Address: ${escrowFactoryAddress}`);

  // Deploy the DemoResolver contract
  const DemoResolverFactory = await ethers.getContractFactory("DemoResolver");
  const demoResolver = await DemoResolverFactory.deploy(
    lopAddress, // Address of the 1inch LOP
    escrowFactoryAddress // Address of the EscrowFactory
  );
  await demoResolver.waitForDeployment();
  const resolverAddress = await demoResolver.getAddress();

  console.log(`✅ DemoResolver deployed to: ${resolverAddress}`);

  // Update the .env file
  const envFilePath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envFilePath)) {
    let envFileContent = fs.readFileSync(envFilePath, "utf-8");

    // Use a regular expression to find and replace the address
    const key = "DEMO_RESOLVER_ADDRESS";
    const regex = new RegExp(`^${key}=.*$`, "m");

    if (envFileContent.match(regex)) {
      envFileContent = envFileContent.replace(
        regex,
        `${key}=${resolverAddress}`
      );
    } else {
      envFileContent += `\n${key}=${resolverAddress}`;
    }

    fs.writeFileSync(envFilePath, envFileContent);
    console.log(`📝 .env file updated successfully!`);
    console.log(`🔄 DEMO_RESOLVER_ADDRESS=${resolverAddress}`);
  } else {
    console.warn("⚠️ .env file not found, skipping update.");
  }

  return resolverAddress;
}

// Export the function for use in other scripts
export { main as deployResolver };

// Run directly if this script is executed
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
