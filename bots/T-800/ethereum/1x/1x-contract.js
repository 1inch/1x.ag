const { getEvents, Web3Ethereum } = require("../ethereum");
const onexAbi = require('./1x.abi');

class OneXContract {

    constructor(contractAddress, privateKey, connectionString = 'http://127.0.0.1:8545') {
        this.web3Ethereum = new Web3Ethereum(connectionString);
        this.instance = this.web3Ethereum.createInstance(onexAbi, contractAddress);
    }

    async getOpenPositionEvents() {
        const events = await getEvents(this.instance, 'OpenPosition');
        return events.map(x => {
            const params = x.returnValues;
            return {
                params: {
                    sellTokenAddress: params.sellTokenAddress,
                    sellTokenAmount: params.sellTokenAmount,
                    buyTokenAddress: params.buyTokenAddress,
                    leverageRatio: params.leverageRatio,
                    minDelta: params.minSum,
                    maxDelta: params.maxSum
                },
                blockNumber: x.blockNumber,
                transactionHash: x.transactionHash,
            }
        });
    }

}

module.exports = OneXContract;
