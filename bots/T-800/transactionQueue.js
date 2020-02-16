const Rx = require('rx');

class TransactionQueue {
    constructor() {
        this.transactions = new Rx.Subject();
        this.pendingAddresses = [];
    }

    consume() {
        this.transactions.subscribe(
            async ({ queryParams, executeTransaction }) => {
                this.pendingAddresses.push(queryParams.user);
                const tx = await executeTransaction(queryParams);
                console.log("closePositionFor: ", tx.transactionHash);
                this.pendingAddresses = deleteElem(this.pendingAddresses, queryParams.user);
            },
            (err) => {
                console.log("Failed to close position: ", err);
            }
        );
    }

    publish(executeTransaction, queryParams) {
        this.transactions.onNext({ queryParams, executeTransaction });
    }
}

function deleteElem(list, elem) {
    for (let i = list.length - 1; i--;) {
        if (list[i] === elem) {
            return list.splice(i, 1);
        }
    }
}

module.exports = TransactionQueue;
