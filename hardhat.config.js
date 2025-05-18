require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

module.exports = {
  solidity: "0.8.23",
  networks: {
    sepolia: {
      url: process.env.NEXT_PUBLIC_SEPOLIA_RPC,     
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./contracts/artifacts",
  },
};
