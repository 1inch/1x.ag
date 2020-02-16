require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error('PRIVATE_KEY env not defined');
}

const rpc = process.env.RPC || "https://rinkeby.infura.io/";

module.exports = {
    privateKey,
    rpc,
};
