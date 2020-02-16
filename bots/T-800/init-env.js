require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error('PRIVATE_KEY env not defined');
}

const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS env not defined');
}

const rpc = process.env.RPC || "https://rinkeby.infura.io/";

const abstractContactRpc = process.env.ABSTRACT_RPC;
if (!abstractContactRpc) {
    throw new Error('ABSTRACT_RPC env not defined');
}

module.exports = {
    privateKey,
    contractAddress,
    rpc,
    abstractContactRpc
};
