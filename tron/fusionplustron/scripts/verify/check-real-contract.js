const TronWeb = require("tronweb");
require("dotenv").config();

async function checkContractOnChain() {
  console.log("🔍 CHECKING IF CONTRACT ACTUALLY EXISTS ON TRON BLOCKCHAIN");
  console.log("=".repeat(60));

  const tronWeb = new TronWeb(
    "https://nile.trongrid.io",
    "https://nile.trongrid.io",
    "https://nile.trongrid.io",
    process.env.TRON_PRIVATE_KEY
  );

  const contractAddressHex = "411554e015d8d2406fb2e85ee7a0cb6c1760daf68f";
  const contractAddressBase58 = tronWeb.address.fromHex(contractAddressHex);

  console.log(`📋 Contract Address (hex): ${contractAddressHex}`);
  console.log(`📋 Contract Address (base58): ${contractAddressBase58}`);
  console.log(
    `🔗 Tronscan Link: https://nile.tronscan.org/#/contract/${contractAddressBase58}`
  );

  try {
    console.log("\n🔍 Step 1: Checking if contract exists...");
    const contractInfo = await tronWeb.trx.getContract(contractAddressBase58);

    if (contractInfo && contractInfo.bytecode) {
      console.log("✅ CONTRACT EXISTS ON BLOCKCHAIN!");
      console.log(
        `📋 Contract Type: ${contractInfo.contract_type || "SmartContract"}`
      );
      console.log(
        `📋 Bytecode Length: ${contractInfo.bytecode.length} characters`
      );
      console.log(`📋 Origin Address: ${contractInfo.origin_address}`);

      // Check account info
      console.log("\n🔍 Step 2: Getting account information...");
      const accountInfo = await tronWeb.trx.getAccount(contractAddressBase58);
      console.log(`📋 Account Type: ${accountInfo.type || "Contract"}`);
      console.log(`📋 Balance: ${(accountInfo.balance || 0) / 1000000} TRX`);
      console.log(
        `📋 Create Time: ${new Date(accountInfo.create_time || 0).toISOString()}`
      );

      // Try to call contract functions
      console.log("\n🔍 Step 3: Testing contract functions...");

      // Minimal ABI for our test functions
      const abi = [
        {
          inputs: [],
          name: "getTronChainId",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "isTronFactory",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
      ];

      try {
        const contract = await tronWeb.contract(abi, contractAddressBase58);

        console.log("🔍 Testing getTronChainId()...");
        const chainId = await contract.getTronChainId().call();
        console.log(`✅ Chain ID: ${chainId} (Nile = 3448148188)`);

        console.log("🔍 Testing isTronFactory()...");
        const isTronFactory = await contract.isTronFactory().call();
        console.log(`✅ Is Tron Factory: ${isTronFactory}`);

        if (chainId.toString() === "3448148188" && isTronFactory) {
          console.log("\n🎊 CONTRACT IS REAL AND FUNCTIONAL!");
          console.log("✅ This proves the deployment was genuinely successful");
          console.log("✅ CREATE2 fixes are working on actual Tron blockchain");
        } else {
          console.log(
            "\n❌ Contract exists but functions don't return expected values"
          );
        }
      } catch (callError) {
        console.log(`❌ Contract function calls failed: ${callError.message}`);
        console.log("Contract exists but may not be the expected contract");
      }
    } else {
      console.log("❌ CONTRACT DOES NOT EXIST ON BLOCKCHAIN");
      console.log(
        "The deployment may have failed silently or the address is incorrect"
      );
    }
  } catch (error) {
    console.log("❌ ERROR CHECKING CONTRACT:");
    console.log(`   ${error.message}`);
    console.log("\nThis could mean:");
    console.log("1. Contract doesn't exist");
    console.log("2. Network connectivity issues");
    console.log("3. Invalid contract address");
  }

  // Also check recent transactions for our account
  console.log("\n🔍 Step 4: Checking recent account transactions...");
  try {
    const transactions = await tronWeb.trx.getTransactionsFromAddress(
      tronWeb.defaultAddress.base58,
      5, // last 5 transactions
      0
    );

    console.log(`📋 Found ${transactions.length} recent transactions:`);
    transactions.forEach((tx, index) => {
      console.log(
        `   ${index + 1}. ${tx.txID} - ${tx.raw_data.contract[0].type}`
      );
      console.log(
        `      Time: ${new Date(tx.raw_data.timestamp).toISOString()}`
      );
      console.log(
        `      Tronscan: https://nile.tronscan.org/#/transaction/${tx.txID}`
      );
    });
  } catch (txError) {
    console.log("⚠️ Could not fetch account transactions");
  }
}

checkContractOnChain();
