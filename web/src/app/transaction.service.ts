import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { ConfigurationService } from './configuration.service';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    transactions = {};
    transactionsForView = [];

    constructor(
        protected web3Service: Web3Service,
        protected configurationService: ConfigurationService
    ) {

        if (localStorage.getItem('transactions')) {

            try {

                const transactions = JSON.parse(localStorage.getItem('transactions'));

                if (transactions === []) {

                    localStorage.removeItem('transactions');
                    this.transactions = {};
                } else {

                    this.transactions = transactions;
                }

                this.processTransactionsForView();
            } catch (e) {

                // console.error(e);
                this.transactions = {};
            }
        }

        this.web3Service.connectEvent.subscribe(async () => {

            if (!this.transactions[this.web3Service.walletAddress]) {

                this.transactions[this.web3Service.walletAddress] = {};
            }

            this.processTransactionsForView();

            // this.getApproves(
            //     await this.aggregatedTokenSwapService.getSpender()
            // )
            //     .then(approveTransactions => {
            //
            //         for (let i = 0; i < approveTransactions.length; i++) {
            //
            //             this.addTransaction(approveTransactions[i]);
            //         }
            //
            //         this.processTransactionsForView();
            //     });
            //
            // this.getSwaps()
            //     .then(swapTransactions => {
            //
            //         for (let i = 0; i < swapTransactions.length; i++) {
            //
            //             this.addTransaction(swapTransactions[i]);
            //         }
            //
            //         this.processTransactionsForView();
            //     });
        });

        this.web3Service.disconnectEvent.subscribe(() => {

            this.transactionsForView = [];
        });
    }

    processTransactionsForView() {

        if (this.transactions[this.web3Service.walletAddress]) {

            this.transactionsForView = Object.keys(this.transactions[this.web3Service.walletAddress])
                .map((key) => {

                    const receipt = this.transactions[this.web3Service.walletAddress][key];

                    const result = {
                        hash: key,
                        receipt: null,
                        time: null
                    };

                    const initReceipt = async (_receipt) => {

                        if (_receipt && !_receipt.timestamp) {

                            (await this.web3Service.getWeb3Provider()).eth.getBlock(_receipt.blockNumber).then((block) => {
                                _receipt.timestamp = block.timestamp;
                                result.time = (new Date(_receipt.timestamp * 1000)).toLocaleString();

                                this.resort();
                            });
                        } else {

                            result.time = (new Date(_receipt.timestamp * 1000)).toLocaleString();
                            this.resort();
                        }
                    };

                    if (receipt) {

                        result.receipt = receipt;
                        initReceipt(receipt);
                    } else {

                        try {

                            this.waitForTransaction(key).then((_receipt) => {

                                result.receipt = _receipt;
                                initReceipt(_receipt);
                            });
                        } catch (e) {

                            delete this.transactions[this.web3Service.walletAddress][key];
                        }
                    }

                    return result;
                })
                .sort(this.sort);
        } else {

            this.transactionsForView = [];
        }
    }

    resort() {

        this.transactionsForView = this.transactionsForView.sort(this.sort);
    }

    sort(a, b) {

        let valuea, valueb;

        if (!a.receipt || !a.receipt.blockNumber) {

            return -1;
        } else {

            valuea = a.receipt.blockNumber;
        }

        if (!b.receipt || !b.receipt.blockNumber) {

            return -1;
        } else {

            valueb = b.receipt.blockNumber;
        }

        return valueb > valuea ? 1 : -1;
    }

    hasTransactions() {

        return this.transactionsForView.length || false;
    }

    getTransactionsForView() {

        return this.transactionsForView;
    }

    addTransaction(hash) {

        if (typeof this.transactions[this.web3Service.walletAddress][hash] === 'undefined') {

            this.transactions[this.web3Service.walletAddress][hash] = null;
            this.save();
            this.processTransactionsForView();
        }
    }

    async save() {

        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    waitForTransaction(hash) {

        return new Promise((resolve, reject) => {

            setTimeout(() => {

                reject();
            }, 300000); // 5 min

            const check = async () => {

                try {

                    const receipt = await (await this.web3Service.getWeb3Provider()).eth.getTransactionReceipt(hash);

                    if (receipt) {

                        this.transactions[this.web3Service.walletAddress][hash] = receipt;
                        this.save();

                        try {

                            const block = await (await this.web3Service.getWeb3Provider()).eth.getBlock(receipt.blockNumber);
                            receipt['timestamp'] = block.timestamp;

                            resolve(receipt);
                        } catch (e) {

                            // console.error(e);

                            setTimeout(() => {

                                check();
                            }, 4000);
                        }

                    } else {

                        setTimeout(() => {

                            check();
                        }, 4000);
                    }
                } catch (e) {

                    // console.error(e);
                    setTimeout(() => {

                        check();
                    }, 4000);
                }
            };

            check();
        });
    }

    clear() {

        this.transactions[this.web3Service.walletAddress] = {};
        this.save();
        this.processTransactionsForView();
    }
}
