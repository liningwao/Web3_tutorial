require("@nomicfoundation/hardhat-toolbox");
//require("dotenv").config();
require("@chainlink/env-enc").config();
require('hardhat-deploy');

//require("./tasks/deploy-fundme")
//require("./tasks/interact-fundme")
require("./tasks")

require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

//const { hardhatArguments } = require("hardhat");
//验证合约报错解决开始
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);
//验证合约报错解决结束

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  mocha:{
    timeout:300000
  },
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      accounts:[PRIVATE_KEY,PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  namedAccounts:{
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    }
  },
  gasReporter: {
    enabled: false
  }
};

