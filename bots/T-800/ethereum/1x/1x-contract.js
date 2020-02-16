const { getEvents, Web3Ethereum } = require("../ethereum");
const onexAbi = require('./1x.abi');

class OneXContract {

    constructor(contractAddress, privateKey, connectionString = 'http://127.0.0.1:8545') {
        this.web3Ethereum = new Web3Ethereum(connectionString);
        console.log(contractAddress)
        this.instance = this.web3Ethereum.createInstance(onexAbi, contractAddress);
    }

    async getOpenPositionEvents() {
        const events = await getEvents(this.instance, 'OpenPosition');
        return events.map(x => {
            const params = x.returnValues;
            return {
                params: {
                    owner: params['0'],
                    amount: params['1'],
                    stopLoss: params['2'],
                    takeProfit: params['3']
                },
                blockNumber: x.blockNumber,
                transactionHash: x.transactionHash,
            }
        });
    }

}

module.exports = OneXContract;
