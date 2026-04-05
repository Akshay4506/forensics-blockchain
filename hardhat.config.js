require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris"
    }
  },
  networks: {
    hardhat: {
      chainId: 1336,
    },
    localhost: {
      url: "http://127.0.0.1:8546",
      chainId: 1336,
    },
  },
};
