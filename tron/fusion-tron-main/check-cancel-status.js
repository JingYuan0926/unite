const { ethers } = require("ethers");
require("dotenv").config();

async function checkCancelStatus() {
  console.log("🔍 Checking Escrow Cancel Status...");
  console.log("===================================");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const wallet = new ethers.Wallet(process.env.RESOLVER_PRIVATE_KEY, provider);

  // Load the contract
  const EscrowFactoryABI = require("./scripts/correct-abi.json");
  const contract = new ethers.Contract(
    process.env.ETH_ESCROW_FACTORY_ADDRESS,
    EscrowFactoryABI,
    wallet
  );

  // The escrow ID from our failed swap
  const escrowId =
    "0x2ef92d216fd7815e27323e032d99a6008f05f97dd5b5e109ca6374b0b7d37c84";

  try {
    console.log("📋 Escrow ID:", escrowId);
    console.log("");

    const escrow = await contract.escrows(escrowId);
    console.log("💰 Escrow Details:");
    console.log("  Initiator:", escrow.initiator);
    console.log("  Resolver:", escrow.resolver);
    console.log("  Amount:", ethers.formatEther(escrow.amount), "ETH");
    console.log(
      "  Safety Deposit:",
      ethers.formatEther(escrow.safetyDeposit),
      "ETH"
    );
    console.log(
      "  Total Locked:",
      ethers.formatEther(escrow.amount + escrow.safetyDeposit),
      "ETH"
    );
    console.log("  Completed:", escrow.completed);
    console.log("  Cancelled:", escrow.cancelled);
    console.log("");

    const createdAt = Number(escrow.createdAt);
    const cancelLock = Number(escrow.cancelLock);
    const now = Math.floor(Date.now() / 1000);

    console.log("⏰ Timing Information:");
    console.log("  Created At:", new Date(createdAt * 1000).toLocaleString());
    console.log(
      "  Can Cancel After:",
      new Date(cancelLock * 1000).toLocaleString()
    );
    console.log("  Current Time:", new Date().toLocaleString());
    console.log("");

    const timeUntilCancel = cancelLock - now;

    console.log("🚨 Cancel Status:");
    if (timeUntilCancel <= 0) {
      console.log("  ✅ CANCELLATION IS NOW AVAILABLE!");
      console.log("  💡 You can recover your funds by calling:");
      console.log("     npm run cancel-escrow");
      console.log("");
      console.log("  📝 This will return:");
      console.log("    - Amount:", ethers.formatEther(escrow.amount), "ETH");
      console.log(
        "    - Safety Deposit:",
        ethers.formatEther(escrow.safetyDeposit),
        "ETH"
      );
      console.log(
        "    - Total Recovery:",
        ethers.formatEther(escrow.amount + escrow.safetyDeposit),
        "ETH"
      );
    } else {
      const hours = Math.floor(timeUntilCancel / 3600);
      const minutes = Math.floor((timeUntilCancel % 3600) / 60);
      console.log(`  ⏰ Wait ${hours}h ${minutes}m more for cancellation`);
      console.log(
        "  💡 Cancellation will be available automatically after the delay"
      );
    }

    console.log("");
    console.log("📖 What Happened:");
    console.log("  1. ✅ ETH escrow was created successfully");
    console.log("  2. ✅ TRX escrow was created successfully");
    console.log("  3. ✅ Secret was committed on Ethereum");
    console.log("  4. ❌ TRX reveal failed (contract revert)");
    console.log("  5. ❌ ETH reveal failed (because TRX failed)");
    console.log("  6. 🔒 Funds are locked until cancellation or manual fix");
  } catch (error) {
    console.error("❌ Error checking escrow:", error.message);
  }
}

checkCancelStatus().catch(console.error);
