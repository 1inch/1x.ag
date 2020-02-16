const Rx = require('rxjs');

class TransactionQueue {
    constructor() {
        this.transactions = new Rx.Subject();
        this.pendingAddress = '';
    }

    consume() {
        this.transactions.subscribe(
            async ({ queryParams, executeTransaction }) => {

                this.pendingAddresses = queryParams.user;
                const tx = await executeTransaction(queryParams);
                console.log("closePositionFor: ", tx.transactionHash);
                this.pendingAddresses = '';
            },
            (err) => {
                console.log("Failed to close position: ", err);
            }
        );
    }

    publish(executeTransaction, queryParams) {
        this.transactions.next({ queryParams, executeTransaction });
    }
}

module.exports = TransactionQueue;
