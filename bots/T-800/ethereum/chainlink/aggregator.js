const { Web3Ethereum, gaslessCall } = require("../ethereum");
const aggregatorAbi = require('./aggregator.abi');

class AggregatorContract {

    constructor(contractAddress, connectionString) {
        this.web3Ethereum = new Web3Ethereum(connectionString);
        this.instance = this.web3Ethereum.createInstance(aggregatorAbi, contractAddress);
    }

    getPriceByBlock(blockNumber) {
        return gaslessCall(
            this.instance, 'latestAnswer', [],
            '0x0000000000000000000000000000000000000000', blockNumber);
    }

}

module.exports = AggregatorContract;
