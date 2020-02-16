const cron = require('node-cron');
const OneXContract = require('./ethereum/1x/1x-contract');
const AggregatorContract = require('./ethereum/chainlink/aggregator');
const { tbn } = require('./ethereum/ethereum');
const {
    privateKey,
    rpc,
} = require('./init-env');

const AVERAGE_BLOCK_TIME = 14;

const tokenAddresses = {
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
    "0x0000000000000000000000000000000000000000": "ETH"
};

const tradePairsAddresses = {
    "ETH": {
        "DAI": {
            "2xAddress": "0xC9A4AEF09fD9ae835A0c60A0757C8dd748116781",
            "aggregator": "0x037E8F2125bF532F3e228991e051c8A7253B642c",
            "decimals": 1e18,
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


function run() {
    runSheduler({
        collateralToken: "DAI",
        debtToken: "ETH",
        leverage: 2
    });
}

run();

function runSheduler({ collateralToken, debtToken, leverage }) {
    const contractAddress = tradePairsAddresses[debtToken][collateralToken][`${leverage}xAddress`];
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
        for (let i = 0; i < openPositionEvents.length; i++) {
            console.log(openPositionEvents[i]);
            const isReady = await isReadyToClosePosition(openPositionEvents[i], collateralToken, debtToken);
            if (isReady) {
                const tx = await contract.web3Ethereum.getTransaction(openPositionEvents[i].transactionHash);
                closePosition(tx.from);
            }
        }
    }, {});
}


async function isReadyToClosePosition(
    position,
    collateralToken,
    debtToken
) {
    const aggregatorParams = tradePairsAddresses[debtToken][collateralToken];
    const aggregator = new AggregatorContract(
        aggregatorParams.aggregator, rpc
    );

    const openPositionPrice = await aggregator.getPriceByBlock(position.blockNumber)
        .then(x => tbn(x).div(aggregatorParams.decimals));

    const currentPrice = await aggregator.getPriceByBlock('latest')
        .then(x => tbn(x).div(aggregatorParams.decimals));

    const stopLossPrice = openPositionPrice
        .times(position.params.stopLoss)
        .div(1e18);

    const takeProfitPrice = openPositionPrice
        .times(position.params.takeProfit)
        .div(1e18);

    return !!(
        currentPrice.gte(takeProfitPrice) ||
        currentPrice.lte(stopLossPrice)
    );

}

function closePosition(owner) {
    console.log(owner)
}
