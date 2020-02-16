const cron = require('node-cron');
const OneXContract = require('./ethereum/1x/1x-contract');
const AggregatorContract = require('./ethereum/chainlink/aggregator');
const TransactionQueue = require('./transactionQueue');
const { tbn } = require('./ethereum/ethereum');
const {
    privateKey,
    rpc,
} = require('./init-env');

const AVERAGE_BLOCK_TIME = 14;
const WAIT_BLOCKS = 2;

const transactionQueue = new TransactionQueue();

const holderOneAddress = "0xb818e074b6a91d8eabf1001343dd49b2b103ddf4";

const tradePairsAddresses = {
    "ETH": {
        "DAI": {
            "2xAddress": "0x7778d1011e19c0091c930d4befa2b0e47441562a",
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
    transactionQueue.consume();

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

    cron.schedule(`${buildShedulerSecondsExpression(AVERAGE_BLOCK_TIME * WAIT_BLOCKS)} * * * * *`, async () => {

        const openPositionEvents = await getOpenPositions(contract);
        for (let i = 0; i < openPositionEvents.length; i++) {
            if (
                openPositionEvents[i].params.takeProfit === '0' &&
                openPositionEvents[i].params.stopLoss === '0'
            ) {
                continue;
            }

            const isReady = await isReadyToClosePosition(openPositionEvents[i], collateralToken, debtToken);
            if (isReady) {
                const tx = await contract.web3Ethereum.getTransaction(openPositionEvents[i].transactionHash);
                transactionQueue.publish(
                    contract.closePositionFor,
                    {
                        user: tx.from,
                        newDelegate: holderOneAddress
                    }
                );
            }
        }
    }, {});
}

async function getOpenPositions(contract) {
    const openPositionEvents = await contract.getOpenPositionEvents();
    const closePositionEvents = await contract.getClosePositionEvents();

    const closePositionOwners = closePositionEvents.map(x => x.params.owner);
    const openPositionOwners = openPositionEvents.map(x => x.params.owner);

    const notClosedPositions = [];
    for (let i = 0; i < openPositionEvents.length; i++) {

        const owner = openPositionEvents[i].params.owner;

        const numOfOpenPositionsByUser = openPositionOwners.filter(x => x === owner).length;
        const numOfClosePositionsByUser = closePositionOwners.filter(x => x === owner).length;

        if (
            numOfOpenPositionsByUser !== numOfClosePositionsByUser &&
            transactionQueue.pendingAddress !== owner

        ) {
            notClosedPositions.push(openPositionEvents[i]);
        }
    }

    return notClosedPositions;
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
