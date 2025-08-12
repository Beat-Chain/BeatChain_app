import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hyperion: {
      url: "https://hyperion-testnet.metisdevops.link",
      chainId: 133717,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    lazai: {
      url: "https://lazai-testnet.metisdevops.link", 
      chainId: 133718,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      hyperion: "your-api-key-here", // Replace with actual API key if available
      lazai: "your-api-key-here", // Replace with actual API key if available
    },
    customChains: [
      {
        network: "hyperion",
        chainId: 133717,
        urls: {
          apiURL: "https://hyperion-testnet-explorer.metisdevops.link/api",
          browserURL: "https://hyperion-testnet-explorer.metisdevops.link"
        }
      },
      {
        network: "lazai", 
        chainId: 133718,
        urls: {
          apiURL: "https://lazai-testnet-explorer.metisdevops.link/api",
          browserURL: "https://lazai-testnet-explorer.metisdevops.link"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;