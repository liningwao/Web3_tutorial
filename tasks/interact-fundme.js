const {task} = require("hardhat/config")

task("interact-fundme","interact with fundme contract")
    .addParam("addr","fundme contract address")
    .setAction(async(taskArgs,hre) => {
        const fundMeFactory = await ethers.getContractFactory("FundMe");
        const fundMe = fundMeFactory.attach(taskArgs.addr);

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

})

module.exports = {}