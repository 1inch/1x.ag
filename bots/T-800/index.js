const cron = require('node-cron');
const OneXContract = require('./ethereum/1x/1x-contract');
const AggregatorContract = require('./ethereum/chainlink/aggregator');
const { tbn } = require('./ethereum/ethereum');
const {
    privateKey,
    contractAddress,
    rpc,
    abstractContactRpc
} = require('./init-env');

const AVERAGE_BLOCK_TIME = 14;

const tokenAddresses = {
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
    "0x0000000000000000000000000000000000000000": "ETH"
};

const tradePairsAddresses = {
    "ETH": {
        "DAI": {
            "address": "0x037E8F2125bF532F3e228991e051c8A7253B642c",
            "decimals": 1e18,
            "flip": true
        }
    },
    "DAI": {
        "ETH": {
            "address": "0x037E8F2125bF532F3e228991e051c8A7253B642c",
            "decimals": 1e18,
            "flip": false
        }
    }
};

function buildShedulerSecondsExpression(period) {
    const seconds = [];
    let secondPoint = 59;
    while (secondPoint > 0) {
        seconds.push(secondPoint);
        secondPoint -= period;
    }
    return seconds.join(",");
}

const contract = new OneXContract(contractAddress, privateKey, rpc);

cron.schedule(`${buildShedulerSecondsExpression(AVERAGE_BLOCK_TIME)} * * * * *`, async () => {
    /*
        1. Get open and closed position events. Find open without closed
        2. Fetch transactions
        3. Decode inputs
        4. Exclude repeated assets and fetch their prices
        5. Search for liquidation prices
        6. Close this positions
    */

    const openPositionEvents = await contract.getOpenPositionEvents();
    for (let position of openPositionEvents) {
        const isReady = await isReadyToClosePosition(position);
        if (isReady) {
            const tx = await contract.web3Ethereum.getTransaction(position.transactionHash);
            closePosition(tx.from);
        }
    }
}, {});

async function isReadyToClosePosition(position) {
    const assetFrom = tokenAddresses[position.params.sellTokenAddress.toLowerCase()];
    const assetTo = tokenAddresses[position.params.buyTokenAddress.toLowerCase()];

    const aggregatorParams = tradePairsAddresses[assetFrom][assetTo];
    const aggregator = new AggregatorContract(
        aggregatorParams.address, abstractContactRpc
    );

    // todo: delete 9410159 -
    const openPositionPrice = await aggregator.getPriceByBlock(9410159 - position.blockNumber)
        .then(x => tbn(x).div(aggregatorParams.decimals));

    const currentPrice = await aggregator.getPriceByBlock('latest')
        .then(x => tbn(x).div(aggregatorParams.decimals));

    const lockSum = tbn(position.params.sellTokenAmount)
        .times(position.params.leverageRatio);

    const openPositionExchangeAmount = aggregatorParams.flip
        ? lockSum.times(1 / openPositionPrice)
        : lockSum.times(openPositionPrice);


    const liquidationSumMin = openPositionExchangeAmount
        .minus(
            openPositionExchangeAmount.times(position.params.minDelta)
                .div(10000)
        );

    const liquidationSumMax = openPositionExchangeAmount
        .plus(
            openPositionExchangeAmount.times(position.params.maxDelta)
                .div(10000)
        );

    const currentExchangeAmount = aggregatorParams.flip
        ? lockSum.times(1 / currentPrice)
        : lockSum.times(currentPrice);

    /*
        We can calculate like this
        or just find prices delta
        depends on contract realization
     */
    return !!(
        currentExchangeAmount.gte(liquidationSumMax) ||
        currentExchangeAmount.lte(liquidationSumMin)
    );

}

function closePosition(owner) {
    console.log(owner)
}
