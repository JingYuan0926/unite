require("dotenv").config();

module.exports = {
  networks: {
    // Tron Nile Testnet
    nile: {
      privateKey: process.env.TRON_PRIVATE_KEY || "",
      consume_user_resource_percent: 30,
      fee_limit: 1000000000, // 1000 TRX
      fullHost: "https://api.nileex.io",
      network_id: "3",
      solidityNode: "https://api.nileex.io",
      eventServer: "https://api.nileex.io",
      fullNode: "https://api.nileex.io",
    },

    // Tron Mainnet (for reference)
    mainnet: {
      privateKey: process.env.TRON_MAINNET_PRIVATE_KEY || "",
      consume_user_resource_percent: 30,
      fee_limit: 1000000000,
      fullHost: "https://api.trongrid.io",
      network_id: "1",
      solidityNode: "https://api.trongrid.io",
      eventServer: "https://api.trongrid.io",
      fullNode: "https://api.trongrid.io",
    },

    // Local development network (if using TronBox development node)
    development: {
      privateKey:
        "da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0",
      consume_user_resource_percent: 30,
      fee_limit: 1000000000,
      fullHost: "http://127.0.0.1:9090",
      network_id: "9",
    },

    // Shasta Testnet (alternative testnet)
    shasta: {
      privateKey: process.env.TRON_SHASTA_PRIVATE_KEY || "",
      consume_user_resource_percent: 30,
      fee_limit: 1000000000,
      fullHost: "https://api.shasta.trongrid.io",
      network_id: "2",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",
      fullNode: "https://api.shasta.trongrid.io",
    },
  },

  compilers: {
    solc: {
      version: "0.8.24",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "constantinople",
      },
    },
  },

  // Solidity compiler settings
  solc: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // Paths configuration
  contracts_directory: "./contracts/tron",
  contracts_build_directory: "./build/tron",
  migrations_directory: "./migrations/tron",

  // Mocha testing configuration
  mocha: {
    timeout: 100000,
    useColors: true,
  },

  // TronLink integration for browser testing
  tronlinkAddress: {
    nile: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    mainnet: "",
  },
};
