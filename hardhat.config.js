// hardhat.config.js — ESM config for Hardhat v3
import "@nomicfoundation/hardhat-ethers";

const config = {
  solidity: "0.8.28",
  networks: {
    // Local in-process chain
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },

    // Example: public RPC (uncomment when ready)
    // sepolia: {
    //   type: "http",
    //   url: process.env.SEPOLIA_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
};

export default config;
