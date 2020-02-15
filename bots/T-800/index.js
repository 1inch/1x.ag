const cron = require('node-cron');

const AVERAGE_BLOCK_TIME = 14;

function buildShedulerSecondsExpression(period) {
    const seconds = [];
    let secondPoint = 59;
    while (secondPoint > 0) {
        seconds.push(secondPoint);
        secondPoint -= period;
    }
    return seconds.join(",");
}

cron.schedule(`${buildShedulerSecondsExpression(AVERAGE_BLOCK_TIME)} * * * * *`, () => {
    /*
        1. Get open and closed position events. Find open without closed
        2. Fetch transactions
        3. Decode inputs
        4. Exclude repeated assets and fetch their prices
        5. Search for liquidation prices
        6. Close this positions
    */
}, {});
