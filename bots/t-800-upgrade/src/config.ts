const isProduction = process.env.NODE_ENV === 'production';

require('dotenv').config({
    path: isProduction ? './.env' : './.env-dev'
});

type Config = {
    PRIVATE_KEY: string,
    RPC: string
}

if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY env not defined');
}

const config: Config = {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    RPC: process.env.RPC || 'http://127.0.0.1:8545'
};

export default config;
