const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const {assert,expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {devlopmentsChains} = require("../../helper-hardhat-config")

!devlopmentsChains.includes(network.name)
? describe.skip:
describe("test fundme contract",async function(){
    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator
    beforeEach(async function(){
        //部署所有tags为all的合约
        await deployments.fixture(["all"])
        //获取firstAccount
        firstAccount = (await getNamedAccounts()).firstAccount
        //获取secondAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        //获取名为 "FundMe" 的合约部署信息，包括地址、ABI、交易哈希等
        const fundMeDeployment = await deployments.get("FundMe")
        //获取Mock合约对象
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        //通过合约名称和地址，创建可交互的合约实例
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
        //直接通过合约名称和指定账户，创建合约实例
        //获的fundme对象,这个对象使用的是第二个合约的地址
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })
    //构造函数单元测试
    it("test if the owner is msg.sender",async function(){
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()),firstAccount)
    })
    it("test if the datafeed is assigned correctly",async function(){
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()),mockV3Aggregator.address)
    })
    //fund函数单元测试
    // window open, value greater then minimum value, funder balance
    it("window closed, value grater than minimum, fund failed", 
        async function() {
            //模拟时间过去200秒开始
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()
            //模拟时间过去200秒结束
            //value is greater minimum value
            await expect(fundMe.fund({value: ethers.parseEther("0.1")}))
                .to.be.revertedWith("window is closed")
        }
    )
    it("window open, value is less than minimum, fund failed", 
        async function() {
            await expect(fundMe.fund({value: ethers.parseEther("0.01")}))
                .to.be.revertedWith("Send more ETH")
        }
    )
    it("Window open, value is greater minimum, fund success", 
        async function() {
            // greater than minimum
            await fundMe.fund({value: ethers.parseEther("0.1")})
            const balance = await fundMe.fundersToAmount(firstAccount)
            await expect(balance).to.equal(ethers.parseEther("0.1"))
        }
    )
    //getFund函数单元测试
    // onlyOwner, windowClose, target reached
    it("not onwer, window closed, target reached, getFund failed", 
        async function() {
            // make sure the target is reached 
            await fundMe.fund({value: ethers.parseEther("1")})

            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()

            await expect(fundMeSecondAccount.getFund())
                .to.be.revertedWith("this function can only be called by owner")
        }
    )
    it("window open, target reached, getFund failed", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("1")})
            await expect(fundMe.getFund())
                .to.be.revertedWith("window is not closed")
        }
    )

    it("window closed, target not reached, getFund failed",
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()            
            await expect(fundMe.getFund())
                .to.be.revertedWith("Target is not reached")
        }
    )
    it("window closed, target reached, getFund success", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()   
            await expect(fundMe.getFund())
                .to.emit(fundMe, "FundWithdrawByOwner")
                .withArgs(ethers.parseEther("1"))
        }
    )
    // refund函数
    // windowClosed, target not reached, funder has balance
    it("window open, target not reached, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            await expect(fundMe.reFund())
                .to.be.revertedWith("window is not closed");
        }
    )

    it("window closed, target reach, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMe.reFund())
                .to.be.revertedWith("Target is reached");
        }
    )

    it("window closed, target not reach, funder does not has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMeSecondAccount.reFund())
                .to.be.revertedWith("There is no fund for you");
        }
    )

    it("window closed, target not reached, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMe.reFund())
                .to.emit(fundMe, "ReFundByFunder")
                .withArgs(firstAccount, ethers.parseEther("0.1"))
        }
    )
    
})
