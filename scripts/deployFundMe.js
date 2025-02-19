// import ethers.js
// create main function
// execute main function

const {ethers} = require("hardhat");

async function main(){
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

     //与合约交互
     // init 2 accounts
     const [firstAccount,secondAccount] = await ethers.getSigners();
     // fund contract with first account
     const fundTx = await fundMe.fund({value:ethers.parseEther("0.5")});
     await fundTx.wait()
     // check balance of contract
     const balanceOfAccount = await ethers.provider.getBalance(fundMe.target);
     console.log(`Balance of the contract is ${balanceOfAccount}`)
     // fund contract with second account
     const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value:ethers.parseEther("0.5")});
     await fundTxWithSecondAccount.wait()
     // check balance of contract
     const balanceOfAccountAfterSecondConnect = await ethers.provider.getBalance(fundMe.target);
     console.log(`Balance of the contract is ${balanceOfAccountAfterSecondConnect}`)
     // check mapping 
     const firstAccountbalanceInFundMe =await fundMe.fundersToAmount(firstAccount.address);
     const secondAccountbalanceInFundMe =await fundMe.fundersToAmount(secondAccount.address);
     console.log(`Balance of first account ${firstAccount.address} is  ${firstAccountbalanceInFundMe}`)
     console.log(`Balance of second account ${secondAccount.address} is  ${secondAccountbalanceInFundMe}`)
}

//合约验证函数
async function verifyFundMe(fundMeAddr,args){
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})
