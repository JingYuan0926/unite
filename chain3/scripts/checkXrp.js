require("dotenv").config();
const xrpl = require("xrpl");

async function main() {
  const client = new xrpl.Client(process.env.XRPL_URL);
  await client.connect();

  const wallet = xrpl.Wallet.fromSeed(process.env.XRPL_SEED);
  const balance = await client.getXrpBalance(wallet.address);
  console.log(`XRP Balance: ${balance} XRP`);

  await client.disconnect();
}
main();
