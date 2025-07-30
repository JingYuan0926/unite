require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1_000_000,
          },
          evmVersion: "shanghai",
          viaIR: true,
        },
      },
    ],
  },

  networks: {
    // Ethereum Sepolia Testnet
    sepolia: {
      url:
        process.env.ETH_RPC_URL ||
        process.env.ETHEREUM_RPC_URL ||
        "https://rpc.sepolia.org",
      accounts: process.env.ETHEREUM_PRIVATE_KEY
        ? [process.env.ETHEREUM_PRIVATE_KEY]
        : [],
      chainId: 11155111,
      gas: 5000000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 60000,
    },

    // Local Hardhat Network for testing
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
      },
    },

    // Ethereum Mainnet (for reference/fork testing)
    mainnet: {
      url:
        process.env.ETH_MAINNET_RPC_URL ||
        process.env.ETHEREUM_MAINNET_RPC_URL ||
        "https://eth-mainnet.g.alchemy.com/v2/demo",
      accounts: process.env.ETHEREUM_PRIVATE_KEY
        ? [process.env.ETHEREUM_PRIVATE_KEY]
        : [],
      chainId: 1,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
  },

  mocha: {
    timeout: 40000,
  },

  paths: {
    sources: "./contracts",
    tests: "./tests/ethereum",
    cache: "./cache/ethereum",
    artifacts: "./artifacts/ethereum",
  },
};
