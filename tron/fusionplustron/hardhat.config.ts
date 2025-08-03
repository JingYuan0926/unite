import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      // ETH Sepolia testnet
      url: process.env.ETH_RPC_URL!,
      accounts: [process.env.ETH_PRIVATE_KEY!],
      gasPrice: 20000000000, // 20 Gwei - higher gas for faster transactions
      gas: 3000000, // 3M gas limit
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
};

export default config;
