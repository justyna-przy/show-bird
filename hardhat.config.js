/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.23",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,     
      accounts: [process.env.PRIVATE_KEY], // Private key of the wallet
    },
  },
  paths: {
    artifacts: "./contracts/artifacts",  // ABI will be copied from here
  },
};
