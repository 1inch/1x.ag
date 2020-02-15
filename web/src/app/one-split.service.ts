import {Injectable} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {Web3Service} from './web3.service';
import {BigNumber} from 'ethers/utils/bignumber';

import OneSplitABI from './abi/OneSplitABI.json';

@Injectable({
    providedIn: 'root'
})
export class OneSplitService {

    contract;
    userGasPrice;

    constructor(
        protected configurationService: ConfigurationService,
        protected web3Service: Web3Service
    ) {

        this.init();
    }

    async init() {

        this.contract = new (await this.web3Service.getWeb3Provider()).eth.Contract(
            // @ts-ignore
            OneSplitABI,
            this.configurationService.ONE_SPLIT_CONTRACT_ADDRESS
        );
    }

    async calculateZrxOrderFees(ordersAmount) {

        return this.userGasPrice.mul(150000).mul(ordersAmount);
    }

    async getContract(): Promise<any> {

        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.contract) {

                    resolve(this.contract);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    async getExpectedReturn(
        fromToken: string,
        toToken: string,
        amount: BigNumber,
        parts: BigNumber,
        disableFlags: BigNumber
    ) {

        return (await this.getContract()).methods.getExpectedReturn(
            fromToken,
            toToken,
            amount,
            parts,
            disableFlags
        ).call();
    }

    async getAllRatesForDEX(
        fromToken: string,
        toToken: string,
        amount: BigNumber,
        parts: BigNumber,
        disableFlags: BigNumber
    ) {

        return (await this.getContract()).methods.getAllRatesForDEX(
            fromToken,
            toToken,
            amount,
            parts,
            disableFlags
        ).call();
    }

    encodeSwap(
        fromToken: string,
        toToken: string,
        amount: BigNumber,
        minReturn: BigNumber,
        distribution: BigNumber[],
        disableFlags: BigNumber
    ) {

        return this.getSwapMethod(
            fromToken,
            toToken,
            amount,
            minReturn,
            distribution,
            disableFlags
        )
            .encodeABI();
    }

    getSwapMethod(
        fromToken: string,
        toToken: string,
        amount: BigNumber,
        minReturn: BigNumber,
        distribution: BigNumber[],
        disableFlags: BigNumber
    ) {

        return this.contract.methods.swap(
            fromToken,
            toToken,
            amount,
            minReturn,
            distribution,
            disableFlags
        );
    }
}
