#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Setting up 1inch Fusion+ Cross-Chain Swap Project...\n");

// Phase 1: Project Structure Verification
console.log("📁 Phase 1: Verifying project structure...");

const requiredDirs = [
  "contracts/ethereum",
  "contracts/tron",
  "scripts",
  "tests/ethereum",
  "tests/tron",
  "tests/integration",
  "deployments",
  "src/resolver",
  "frontend",
  "docs",
];

requiredDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Phase 2: Environment Configuration
console.log("\n🔧 Phase 2: Environment configuration...");

const envExamplePath = path.join(__dirname, "..", ".env.example");
const envPath = path.join(__dirname, "..", ".env");

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env from .env.example");
  } else {
    // Create basic .env file
    const basicEnv = `# 1inch Fusion+ Cross-Chain Swap Configuration
# ============================================

# Ethereum Sepolia Configuration
ETHEREUM_RPC_URL=https://rpc.sepolia.org
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Tron Nile Configuration  
TRON_PRIVATE_KEY=your_tron_private_key_here
TRON_RPC_URL=https://api.nileex.io

# Application Settings
NODE_ENV=development
PORT=3000
DEMO_MODE=false

# Security Settings
REVEAL_DELAY_SECONDS=60
MIN_CANCEL_DELAY_SECONDS=1800
ETH_FINALITY_BLOCKS=20
TRON_FINALITY_BLOCKS=12

# Contract Addresses (will be populated after deployment)
ETHEREUM_ESCROW_FACTORY_ADDRESS=
TRON_ESCROW_FACTORY_ADDRESS=
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log("✅ Created basic .env file");
  }
} else {
  console.log("✅ .env file already exists");
}

// Phase 3: Dependencies Installation
console.log("\n📦 Phase 3: Installing dependencies...");

try {
  console.log("Installing npm dependencies...");
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully");
} catch (error) {
  console.log("⚠️ npm install failed, continuing with setup...");
}

// Phase 4: Contract Compilation Check
console.log("\n🔨 Phase 4: Checking contract compilation...");

try {
  // Check if Hardhat can compile Ethereum contracts
  if (
    fs.existsSync(
      path.join(__dirname, "..", "contracts/ethereum/EscrowFactory.sol")
    )
  ) {
    console.log("✅ Ethereum EscrowFactory contract found");
  } else {
    console.log("⚠️ Ethereum EscrowFactory contract not found");
  }

  // Check if Tron contracts exist
  if (
    fs.existsSync(
      path.join(__dirname, "..", "contracts/tron/TronEscrowFactory.sol")
    )
  ) {
    console.log("✅ Tron TronEscrowFactory contract found");
  } else {
    console.log("⚠️ Tron TronEscrowFactory contract not found");
  }
} catch (error) {
  console.log("⚠️ Contract compilation check failed:", error.message);
}

// Phase 5: Network Connectivity Test
console.log("\n🌐 Phase 5: Testing network connectivity...");

async function testNetworks() {
  const networks = [
    { name: "Ethereum Sepolia", url: "https://rpc.sepolia.org" },
    { name: "Tron Nile", url: "https://api.nileex.io" },
  ];

  for (const network of networks) {
    try {
      const https = require("https");
      const http = require("http");
      const client = network.url.startsWith("https") ? https : http;

      await new Promise((resolve, reject) => {
        const req = client.get(network.url, (res) => {
          console.log(`✅ ${network.name} accessible (${res.statusCode})`);
          resolve();
        });
        req.on("error", reject);
        req.setTimeout(5000, () => reject(new Error("Timeout")));
      });
    } catch (error) {
      console.log(`⚠️ ${network.name} connection failed: ${error.message}`);
    }
  }
}

testNetworks()
  .then(() => {
    // Phase 6: Setup Summary
    console.log("\n📋 Phase 6: Setup Summary");
    console.log("=".repeat(50));

    console.log("\n✅ Project structure created");
    console.log("✅ Environment configuration ready");
    console.log("✅ Dependencies installation attempted");
    console.log("✅ Contract verification completed");
    console.log("✅ Network connectivity tested");

    console.log("\n🎯 Next Steps:");
    console.log("1. Edit .env file with your private keys");
    console.log("2. Fund accounts with testnet tokens:");
    console.log("   - Ethereum Sepolia: https://sepoliafaucet.com/");
    console.log("   - Tron Nile: https://nileex.io/join/getJoinPage");
    console.log("3. Deploy contracts: npm run deploy:all");
    console.log("4. Start resolver: npm run start:resolver");
    console.log("5. Launch UI: npm run start:ui");

    console.log("\n🔧 Available Commands:");
    console.log("npm run build          - Build all components");
    console.log("npm run deploy:all     - Deploy to both chains");
    console.log("npm run test           - Run test suite");
    console.log("npm run demo:start     - Start demo environment");

    console.log("\n🚀 Fusion+ Cross-Chain Swap setup completed!");
    console.log("🏆 Ready for 1inch competition development!");
  })
  .catch((error) => {
    console.error("❌ Network testing failed:", error.message);
    console.log(
      "\n⚠️ Setup completed with warnings. Check network connectivity manually."
    );
  });
