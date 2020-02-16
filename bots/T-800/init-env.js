require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error('PRIVATE_KEY env not defined');
}

const rpc = process.env.RPC || "http://127.0.0.1:8545";

module.exports = {
    privateKey,
    rpc
};
