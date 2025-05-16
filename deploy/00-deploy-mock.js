const {DECIMALS,INITI_ALANSWER,devlopmentsChains} = require("../helper-hardhat-config")
module.exports = async ({getNamedAccounts,deployments}) =>{
    //只有在本地环境才需要部署mock合约
    if(devlopmentsChains.includes(network.name)){
        //获取getNamedAccounts deployments
        const {firstAccount} = await getNamedAccounts()
        const {deploy} = deployments
        //部署合约
        await deploy("MockV3Aggregator",{
            from: firstAccount,
            args:[DECIMALS,INITI_ALANSWER],
            log: true
        })
    }else{
        console.log("environment is not local, mock contract depployment is skipped")
    }
}

module.exports.tags=["all","mock"]
