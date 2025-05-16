//function deployFunction(){
//    console.log("this is a deploy function")
//}
//module.exports.default=deployFunction

//module.exports = async (hre) =>{
//    const getNamedAccounts =hre.getNamedAccounts
//    const deployments = hre.deployments
//    console.log("this is a deploy function")
//}

const { network } = require("hardhat")
const {devlopmentsChains,networkConfig,LOCK_TIME,CONFIRMATIONS} = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts,deployments}) =>{
    //获取getNamedAccounts deployments
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments
    let dataFeedAddr
    let confirmations
    //根据不同环境获取不同的合约地址
    //network.name 网络名字
    //network.config.chainId 网络chainId
    if(devlopmentsChains.includes(network.name)){
        //如果是本地环境hardhat或者local
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
        confirmations = 0
    }else{
        //如果是测试网sepolia或者bnb测试网
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }

    //部署合约
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args:[LOCK_TIME,dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    })

    //根据不同环境判断是否需要验证合约
    //只有sepolia验证合约 本地环境和bnb测试网不验证合约
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME,dataFeedAddr]
        });
    }else{
        console.log("Network is not sepolia, verification skipped..");
    }
}

module.exports.tags=["all","fundme"]

