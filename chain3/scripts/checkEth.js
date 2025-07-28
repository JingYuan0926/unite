require("dotenv").config();
const { Wallet, JsonRpcProvider, formatEther } = require("ethers");

async function main() {
  const provider = new JsonRpcProvider(process.env.ETH_RPC);
  const wallet = new Wallet(process.env.ETH_PK, provider);

  console.log("Ethereum address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("ETH Balance:", formatEther(balance), "ETH");
}

main();
