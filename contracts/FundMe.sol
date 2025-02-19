// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没有达到目标值，投资人在锁定期以后退款
contract FundMe{

    AggregatorV3Interface internal dataFeed;
    mapping(address => uint256) public fundersToAmount;
    //每次最小为100美元
    uint256 constant  MININUM_VALUE = 100 * 10 ** 18; //wei
    //总额为1000美元
    uint256 constant  TARGET = 1000 * 10 ** 18; //wei
    address public owner;
    bool public success;
    uint256 public deploymentTimestamp;
    uint256 public lockTime;

    //ERC-20
    address erc20Addr;

    //getFund结束标志
    bool public getFundSuccess =  false;

    constructor(uint256 _lockTime){
        owner = msg.sender;
        //sepolia testnet ETH/USD
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        deploymentTimestamp = block.timestamp;
        lockTime= _lockTime;

    } 
    function fund() external payable{
        require(convertEthToUsd(msg.value) >= MININUM_VALUE,"Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime,"window is closed");
        fundersToAmount[msg.sender] = msg.value; 
    }
    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }
    function getFund() external windowClosed onlyOwner{
        
        require(convertEthToUsd(address(this).balance) >= TARGET,"Target is not reached");
        //提款
        //1.transfer
        //payable(msg.sender).transfer(address(this).balance);
        //2.send
        //success = payable(msg.sender).send(address(this).balance);
        //require(success,"transfer failed");
        //3.call
        (success,) = payable(msg.sender).call{value:address(this).balance}("");
        require(success,"transfer failed");
        getFundSuccess = true;

    }
    function transferOwnership(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    function reFund() external windowClosed{
        //总金额没有达到要求
        require(convertEthToUsd(address(this).balance) < TARGET,"Target is reached");
        //请求退款的人必须是捐助者
        require(fundersToAmount[msg.sender] > 0,"There is no fund for you");
        bool reFundSuccess;
        (reFundSuccess,) = payable(msg.sender).call{value:fundersToAmount[msg.sender]}("");
        require(reFundSuccess,"transfer failed");
        fundersToAmount[msg.sender] = 0;
    }
    //修改funder对应的ETH数量
    function setFunderToAmount (address funder,uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr,"you do not have permission to call this function");
        fundersToAmount[funder]= amountToUpdate;
    }
    //设置ERC20合约地址
    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr =_erc20Addr;
    }

    modifier windowClosed(){
        require(block.timestamp > deploymentTimestamp + lockTime,"window is not closed");
        _;
    } 
    modifier onlyOwner(){
        require(msg.sender == owner,"this function can only be called by owner");
        _;
    }

}