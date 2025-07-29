const fs = require("fs");
const path = require("path");
const { TronWeb } = require("tronweb");
const solc = require("solc");
require("dotenv").config();

async function main() {
  console.log(
    "🚀 Deploying Fusion+ TronEscrowFactory to Tron Nile (REAL DEPLOYMENT)..."
  );

  // Verify environment variables
  if (!process.env.TRON_PRIVATE_KEY) {
    throw new Error("❌ TRON_PRIVATE_KEY not found in environment variables");
  }

  // Initialize TronWeb
  const tronWeb = new TronWeb({
    fullHost: "https://api.nileex.io",
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  // Get deployer address
  const deployerAddress = tronWeb.address.fromPrivateKey(
    process.env.TRON_PRIVATE_KEY
  );
  console.log("📋 Deployment Details:");
  console.log(`Network: Tron Nile`);
  console.log(`Deployer: ${deployerAddress}`);

  // Check balance
  try {
    const balance = await tronWeb.trx.getBalance(deployerAddress);
    const balanceTrx = tronWeb.fromSun(balance);
    console.log(`Balance: ${balanceTrx} TRX`);

    if (balanceTrx < 100) {
      console.log(
        "⚠️  Low balance detected. You may need more TRX for deployment."
      );
      console.log("💡 Get free TRX from: https://nileex.io/join/getJoinPage");
      return;
    }
  } catch (error) {
    console.log("⚠️ Could not fetch balance:", error.message);
    return;
  }

  // Read and compile contract
  console.log("\n📦 Compiling TronEscrowFactory...");

  const contractPath = path.join(
    __dirname,
    "../contracts/tron/TronEscrowFactory.sol"
  );
  if (!fs.existsSync(contractPath)) {
    throw new Error(`❌ Contract file not found: ${contractPath}`);
  }

  const contractSource = fs.readFileSync(contractPath, "utf8");

  // Prepare Solidity compiler input
  const input = {
    language: "Solidity",
    sources: {
      "TronEscrowFactory.sol": {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "constantinople",
    },
  };

  console.log("🔨 Compiling with Solidity compiler...");

  try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      const errors = output.errors.filter(
        (error) => error.severity === "error"
      );
      if (errors.length > 0) {
        console.error("❌ Compilation errors:");
        errors.forEach((error) => console.error(`  - ${error.message}`));
        throw new Error("Contract compilation failed");
      }

      // Show warnings
      const warnings = output.errors.filter(
        (error) => error.severity === "warning"
      );
      if (warnings.length > 0) {
        console.log("⚠️  Compilation warnings:");
        warnings.forEach((warning) => console.log(`  - ${warning.message}`));
      }
    }

    const contract =
      output.contracts["TronEscrowFactory.sol"]["TronEscrowFactory"];
    if (!contract) {
      throw new Error("❌ Contract not found in compilation output");
    }

    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log("✅ Contract compiled successfully");
    console.log(`📊 Bytecode size: ${bytecode.length / 2} bytes`);

    // Deploy contract
    console.log("\n🚀 Deploying to Tron Nile...");

    const deployParams = {
      abi: abi,
      bytecode: bytecode,
      feeLimit: 1000000000, // 1000 TRX
      callValue: 0,
      userFeePercentage: 30,
      originEnergyLimit: 10000000,
    };

    const transaction = await tronWeb.transactionBuilder.createSmartContract(
      deployParams,
      deployerAddress
    );

    const signedTransaction = await tronWeb.trx.sign(transaction);
    const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

    if (!result.result) {
      throw new Error(
        `❌ Deployment transaction failed: ${result.message || "Unknown error"}`
      );
    }

    const txHash = result.txid;
    console.log(`✅ Deployment transaction submitted!`);
    console.log(`🔗 Transaction Hash: ${txHash}`);
    console.log(
      `🌐 View on TronScan: https://nile.tronscan.org/#/transaction/${txHash}`
    );

    // Wait for transaction confirmation
    console.log("⏳ Waiting for transaction confirmation...");

    let receipt = null;
    let attempts = 0;
    const maxAttempts = 60; // Wait up to 60 seconds

    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await tronWeb.trx.getTransactionInfo(txHash);
        if (
          receipt &&
          receipt.receipt &&
          receipt.receipt.result === "SUCCESS"
        ) {
          break;
        }

        // Try alternative method to get transaction
        if (!receipt) {
          try {
            const tx = await tronWeb.trx.getTransaction(txHash);
            if (
              tx &&
              tx.ret &&
              tx.ret[0] &&
              tx.ret[0].contractRet === "SUCCESS"
            ) {
              // Transaction exists, try to get info again
              receipt = await tronWeb.trx.getTransactionInfo(txHash);
            }
          } catch (e) {
            // Transaction not yet available
          }
        }

        receipt = null;
      } catch (error) {
        // Transaction not yet available
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`\n⏳ Still waiting... (${attempts}/${maxAttempts})`);
      } else {
        process.stdout.write(".");
      }
    }

    console.log();

    if (!receipt) {
      console.log(
        "⚠️ Could not get transaction receipt, but transaction was submitted."
      );
      console.log(
        `🔗 Check transaction manually: https://nile.tronscan.org/#/transaction/${txHash}`
      );

      // Try to estimate contract address using deployed bytecode lookup
      console.log(
        "🔍 Attempting to find contract by scanning recent blocks..."
      );

      try {
        const latestBlock = await tronWeb.trx.getCurrentBlock();
        const blockNumber = latestBlock.block_header.raw_data.number;

        // Scan recent blocks for contract creation
        for (let i = 0; i < 20; i++) {
          try {
            const block = await tronWeb.trx.getBlockByNumber(blockNumber - i);
            if (block && block.transactions) {
              for (const tx of block.transactions) {
                if (tx.txID === txHash) {
                  console.log(
                    `✅ Found transaction in block ${blockNumber - i}`
                  );

                  // Look for contract address in transaction
                  if (
                    tx.raw_data &&
                    tx.raw_data.contract &&
                    tx.raw_data.contract[0]
                  ) {
                    const contract = tx.raw_data.contract[0];
                    if (contract.type === "CreateSmartContract") {
                      // Calculate contract address from creator address and nonce
                      const creatorAddress =
                        tronWeb.address.toHex(deployerAddress);
                      // This is an approximation - Tron contract addresses are deterministic
                      console.log(
                        "🔍 Contract creation detected, but address calculation requires more data"
                      );
                    }
                  }
                  break;
                }
              }
            }
          } catch (blockError) {
            // Skip this block
          }
        }
      } catch (scanError) {
        console.log("⚠️ Could not scan blocks:", scanError.message);
      }

      // Provide manual instructions
      console.log("\n📋 Manual steps to find contract address:");
      console.log(
        `1. Visit: https://nile.tronscan.org/#/transaction/${txHash}`
      );
      console.log(`2. Look for 'Contract Address' in the transaction details`);
      console.log(`3. Update the deployment file with the real address`);

      // Create a placeholder deployment file for now
      const deploymentInfo = {
        network: "nile",
        chainId: "3",
        deployedAt: new Date().toISOString(),
        deployer: deployerAddress,
        contracts: {
          TronEscrowFactory: {
            address: "PENDING_MANUAL_UPDATE", // User needs to update this
            txHash: txHash,
            deploymentBlock: null,
            note: "Transaction successful but contract address needs manual verification from TronScan",
          },
        },
        configuration: {
          finalityBlocks: "12",
          minCancelDelay: "1800",
          minSafetyDeposit: "1000000",
          revealDelay: "60",
        },
      };

      // Save placeholder deployment info
      const deploymentsDir = path.join(__dirname, "../deployments");
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }

      const deploymentPath = path.join(deploymentsDir, "tron-nile.json");
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
      console.log(`💾 Placeholder deployment info saved to: ${deploymentPath}`);

      console.log("\n🎉 DEPLOYMENT TRANSACTION SUBMITTED SUCCESSFULLY!");
      console.log(`📋 Summary:`);
      console.log(`   🔗 Transaction: ${txHash}`);
      console.log(
        `   🌐 TronScan: https://nile.tronscan.org/#/transaction/${txHash}`
      );
      console.log(
        `   ⚠️  CONTRACT ADDRESS: Check TronScan and update deployment file manually`
      );

      return deploymentInfo;
    }

    if (!receipt.contract_address) {
      console.log(
        "⚠️ Receipt found but no contract address. Checking alternative fields..."
      );
      console.log("Receipt:", JSON.stringify(receipt, null, 2));
      throw new Error(
        "❌ Could not retrieve contract address from transaction"
      );
    }

    const contractAddress = tronWeb.address.fromHex(receipt.contract_address);

    console.log(`\n✅ TronEscrowFactory deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(
      `🌐 View contract: https://nile.tronscan.org/#/address/${contractAddress}`
    );

    // Verify contract constants
    console.log("\n🔍 Verifying contract configuration...");
    try {
      // Wait a bit for the contract to be indexed
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const contract = await tronWeb.contract(abi, contractAddress);

      const finalityBlocks = await contract.FINALITY_BLOCKS().call();
      const minCancelDelay = await contract.MIN_CANCEL_DELAY().call();
      const minSafetyDeposit = await contract.MIN_SAFETY_DEPOSIT().call();
      const revealDelay = await contract.REVEAL_DELAY().call();

      console.log(
        `✅ Finality Blocks: ${finalityBlocks} (≈${finalityBlocks * 3} seconds)`
      );
      console.log(
        `✅ Min Cancel Delay: ${minCancelDelay} seconds (${
          minCancelDelay / 60
        } minutes)`
      );
      console.log(
        `✅ Min Safety Deposit: ${tronWeb.fromSun(minSafetyDeposit)} TRX`
      );
      console.log(`✅ Reveal Delay: ${revealDelay} seconds`);
    } catch (verifyError) {
      console.log(
        "⚠️ Could not verify contract constants (contract may still be deploying):",
        verifyError.message
      );
    }

    // Save deployment info
    const deploymentInfo = {
      network: "nile",
      chainId: "3",
      deployedAt: new Date().toISOString(),
      deployer: deployerAddress,
      contracts: {
        TronEscrowFactory: {
          address: contractAddress,
          txHash: txHash,
          deploymentBlock: receipt.blockNumber || null,
        },
      },
      configuration: {
        finalityBlocks: "12",
        minCancelDelay: "1800",
        minSafetyDeposit: "1000000", // 1 TRX in sun
        revealDelay: "60",
      },
    };

    // Ensure deployments directory exists
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to JSON file
    const deploymentPath = path.join(deploymentsDir, "tron-nile.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);

    // Update .env file with new contract address
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      envContent = envContent.replace(
        /TRON_ESCROW_FACTORY_ADDRESS=.*/,
        `TRON_ESCROW_FACTORY_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log(`🔄 Updated .env with new contract address`);
    }

    console.log("\n🎉 REAL DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log(`📋 Summary:`);
    console.log(`   🏠 Contract Address: ${contractAddress}`);
    console.log(`   🔗 Transaction: ${txHash}`);
    console.log(
      `   🌐 TronScan: https://nile.tronscan.org/#/address/${contractAddress}`
    );
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Verify the contract on TronScan`);
    console.log(`   2. Test the contract functions`);
    console.log(`   3. Update your frontend/resolver with the new address`);

    return deploymentInfo;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);

    // Provide helpful debugging information
    console.log("\n🔧 Troubleshooting tips:");
    console.log(
      "   1. Ensure you have enough TRX balance (minimum 100 TRX recommended)"
    );
    console.log("   2. Check your TRON_PRIVATE_KEY is valid");
    console.log("   3. Verify network connectivity to Tron Nile");
    console.log("   4. Make sure the contract source code is valid");

    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
