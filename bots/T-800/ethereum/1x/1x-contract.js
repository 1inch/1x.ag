const { getEvents, Web3Ethereum, getCallData } = require("../ethereum");
const onexAbi = require('./1x.abi');

class OneXContract {

    constructor(contractAddress, privateKey, connectionString = 'http://127.0.0.1:8545') {
        this.privateKey = privateKey;
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

    async closePositionFor({ user, newDelegator }) {
        const data = getCallData(this.instance, 'closePositionFor', [user, newDelegator]);
        const signedTransaction = await this.web3Ethereum.signTransaction(
            this.privateKey, this.instance._address, 0, data
        );
        return this.web3Ethereum.sendTransaction(signedTransaction);
    };

}

module.exports = OneXContract;
