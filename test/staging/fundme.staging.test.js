const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const {assert,expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {devlopmentsChains} = require("../../helper-hardhat-config")

devlopmentsChains.includes(network.name)
? describe.skip:
describe("test fundme contract",async function(){
    let fundMe
    let firstAccount
    beforeEach(async function(){
        //部署所有tags为all的合约
        await deployments.fixture(["all"])
        //获取firstAccount
        firstAccount = (await getNamedAccounts()).firstAccount
        //获取名为 "FundMe" 的合约部署信息，包括地址、ABI、交易哈希等
        const fundMeDeployment = await deployments.get("FundMe")
        //通过合约名称和地址，创建可交互的合约实例
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
    })
    // test fund and getFund successfully
    it("fund and getFund successfully", 
        async function() {
            // make sure target reached
            await fundMe.fund({value: ethers.parseEther("0.5")}) // 3000 * 0.5 = 1500
            //等待181秒开始 
            // make sure window closed
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            //等待181秒结束
            // make sure we can get receipt 
            const getFundTx = await fundMe.getFund()
            const getFundReceipt = await getFundTx.wait()
            expect(getFundReceipt)
                .to.be.emit(fundMe, "FundWithdrawByOwner")
                .withArgs(ethers.parseEther("0.5"))
        }
    )
    // test fund and refund successfully
    it("fund and refund successfully",
        async function() {
            // make sure target not reached
            await fundMe.fund({value: ethers.parseEther("0.1")}) // 3000 * 0.1 = 300
            // make sure window closed
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            // make sure we can get receipt 
            const refundTx = await fundMe.reFund()
            const refundReceipt = await refundTx.wait()
            expect(refundReceipt)
                .to.be.emit(fundMe, "ReFundByFunder")
                .withArgs(firstAccount, ethers.parseEther("0.1"))
        }
    )    
})
