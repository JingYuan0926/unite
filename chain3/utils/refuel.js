const xrpl = require("xrpl");

/**
 * Refuel a wallet from XRPL testnet faucet
 * @param {Object} wallet - XRPL wallet object
 * @param {Object} client - Optional XRPL client instance
 * @param {number} minBalance - Minimum balance required (default: 5 XRP)
 */
async function refuelWalletFromFaucet(wallet, client = null, minBalance = 5) {
  let xrplClient = client;
  let shouldDisconnect = false;

  try {
    // Create client if not provided
    if (!xrplClient) {
      // Try multiple testnet servers for funding
      const testnetServers = [
        "wss://s.altnet.rippletest.net:51233",
        "wss://testnet.xrpl-labs.com",
        "wss://s1.ripple.com:51233",
      ];

      for (const server of testnetServers) {
        try {
          xrplClient = new xrpl.Client(server, {
            connectionTimeout: 15000,
            timeout: 15000,
          });
          await xrplClient.connect();
          shouldDisconnect = true;
          break;
        } catch (error) {
          console.log(
            `Failed to connect to ${server} for funding: ${error.message}`
          );
          if (xrplClient) {
            try {
              await xrplClient.disconnect();
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      if (!xrplClient || !xrplClient.isConnected()) {
        throw new Error("Could not connect to any XRPL server for funding");
      }
    }

    // Check current balance
    try {
      const response = await xrplClient.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated",
      });

      const currentBalance = Number(
        xrpl.dropsToXrp(response.result.account_data.Balance)
      );
      console.log(
        `Wallet ${wallet.address} current balance: ${currentBalance} XRP`
      );

      if (currentBalance >= minBalance) {
        console.log(
          `Wallet ${wallet.address} has sufficient balance, skipping funding`
        );
        return;
      }
    } catch (error) {
      // Account might not exist yet, proceed with funding
      console.log(
        `Wallet ${wallet.address} account not found, proceeding with funding`
      );
    }

    // Fund the wallet using testnet faucet
    console.log(`Funding wallet ${wallet.address} from testnet faucet...`);
    await xrplClient.fundWallet(wallet);
    console.log(`✅ Successfully funded wallet ${wallet.address}`);
  } catch (error) {
    throw new Error(
      `Failed to fund wallet ${wallet.address}: ${error.message}`
    );
  } finally {
    // Disconnect if we created the client
    if (shouldDisconnect && xrplClient) {
      try {
        await xrplClient.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
}

module.exports = {
  refuelWalletFromFaucet,
};
