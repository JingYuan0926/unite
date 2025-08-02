const TronWeb = require("tronweb");
require("dotenv").config();

// Simple test contract bytecode (just returns true)
const SIMPLE_CONTRACT_BYTECODE =
  "0x608060405234801561001057600080fd5b5060b18061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063b5b4f2a014602d575b600080fd5b60336047565b604051603e91906065565b60405180910390f35b60006001905090565b605f8160849565b82525050565b6000602082019050607860008301846058565b92915050565b6000819050919050565b608d81607e565b811460975760008081fd5b5056fea2646970667358221220c1efb8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b864736f6c63430008130033";

const SIMPLE_CONTRACT_ABI = [
  {
    inputs: [],
    name: "test",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "pure",
    type: "function",
  },
];

async function testMinimalDeployment() {
  console.log("🔍 MINIMAL DEPLOYMENT TEST");
  console.log("=".repeat(50));

  const tronWeb = new TronWeb({
    fullHost: "https://nile.trongrid.io",
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
    privateKey: process.env.TRON_PRIVATE_KEY,
  });

  try {
    console.log(`Deployer: ${tronWeb.defaultAddress.base58}`);
    console.log(
      `Balance: ${tronWeb.fromSun(await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58))} TRX`
    );

    // Method 1: Try TronWeb contract deployment
    console.log("\n🔍 Method 1: TronWeb Contract Deployment");
    try {
      const options = {
        abi: SIMPLE_CONTRACT_ABI,
        bytecode: SIMPLE_CONTRACT_BYTECODE,
        feeLimit: 100000000,
        callValue: 0,
        userFeePercentage: 100,
        originEnergyLimit: 1000000,
      };

      console.log("   Attempting deployment...");
      const contract = await tronWeb.contract().new(options);

      if (contract && contract.address) {
        console.log(`✅ Method 1 SUCCESS: ${contract.address}`);
        return contract.address;
      } else {
        console.log("❌ Method 1: No address returned");
      }
    } catch (error) {
      console.log(`❌ Method 1 failed: ${error.message}`);
    }

    // Method 2: Try manual transaction creation
    console.log("\n🔍 Method 2: Manual Transaction Creation");
    try {
      const transaction = await tronWeb.transactionBuilder.createSmartContract(
        {
          abi: SIMPLE_CONTRACT_ABI,
          bytecode: SIMPLE_CONTRACT_BYTECODE,
          feeLimit: 100000000,
          callValue: 0,
          userFeePercentage: 100,
          originEnergyLimit: 1000000,
        },
        tronWeb.defaultAddress.hex
      );

      console.log("   Transaction created, signing...");
      const signedTransaction = await tronWeb.trx.sign(transaction);

      console.log("   Broadcasting transaction...");
      const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

      if (result && result.result) {
        console.log(`✅ Method 2 SUCCESS: TX = ${result.txid || "unknown"}`);

        // Wait and get contract address
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (result.txid) {
          const txInfo = await tronWeb.trx.getTransactionInfo(result.txid);
          if (txInfo.contract_address) {
            const contractAddress = tronWeb.address.fromHex(
              "41" + txInfo.contract_address
            );
            console.log(`   Contract Address: ${contractAddress}`);
            return contractAddress;
          }
        }
      } else {
        console.log(`❌ Method 2 failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ Method 2 failed: ${error.message}`);
    }

    // Method 3: Check if we can at least send TRX
    console.log("\n🔍 Method 3: Basic TRX Transfer Test");
    try {
      const result = await tronWeb.trx.sendTransaction(
        tronWeb.defaultAddress.base58,
        1000, // 0.001 TRX
        tronWeb.defaultAddress.private
      );

      if (result && result.result) {
        console.log(`✅ Method 3 SUCCESS: Basic transactions work`);
        console.log(`   TX: ${result.txid || "unknown"}`);
      } else {
        console.log(`❌ Method 3 failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ Method 3 failed: ${error.message}`);
    }

    return null;
  } catch (error) {
    console.error("❌ Minimal deployment test failed:", error.message);
    return null;
  }
}

testMinimalDeployment()
  .then((address) => {
    if (address) {
      console.log("\n✅ DEPLOYMENT SYSTEM WORKING");
      console.log(`   Test contract deployed at: ${address}`);
    } else {
      console.log("\n❌ DEPLOYMENT SYSTEM ISSUE");
      console.log("   Need to investigate TronWeb deployment methods");
    }
  })
  .catch(console.error);
