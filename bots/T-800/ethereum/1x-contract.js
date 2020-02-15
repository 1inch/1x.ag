const {
  getCallData, getEvents,
  tbn, keccak256, Web3Ethereum,
  gaslessCall
} = require("./ethereum");
const zeropool_abi = require('./1x.abi').abi;

class OneXContract {

    constructor(contractAddress, privateKey, connectionString = 'http://127.0.0.1:8545') {
        this.contractAddress = contractAddress;
        this.privateKey = privateKey;
        this.web3Ethereum = new Web3Ethereum(connectionString);
        this.instance = this.web3Ethereum.createInstance(zeropool_abi, contractAddress);
    }

}

function toHex(num) {
  return "0x" + tbn(num).toString(16)
}

module.exports = OneXContract;
