const DECIMALS = 8
const INITI_ALANSWER = 300000000000
//锁定期
const LOCK_TIME = 180
//部署合约的时候等待5个区块
const CONFIRMATIONS = 5
//本地开发环境 名字
const devlopmentsChains = ["hardhat","local"]
//测试环境 chainId
const networkConfig = {
    //eth测试网sepolia
    11155111: {
        ethUsdDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    //bnb测试网
    97: {
        ethUsdDataFeed:"0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}
//导出
module.exports = {
    DECIMALS,
    INITI_ALANSWER,
    LOCK_TIME,
    CONFIRMATIONS,
    devlopmentsChains,
    networkConfig
}