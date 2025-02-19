const {task} = require("hardhat/config")

task("deploy-fundme","deploy and verify fundme conract").setAction(async(taskArgs,hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract deploying");
    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(`contract has been deployed successfully,contract address is ${fundMe.target}`);

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        //部署成功后等待5个区块
        console.log("Wainting for 5 confirmations");
        await fundMe.deploymentTransaction().wait(5) 
        await verifyFundMe(fundMe.target,[300]);
    }else{
        console.log("verification skipped..")
    }
})

//合约验证函数
async function verifyFundMe(fundMeAddr,args){
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

module.exports = {}