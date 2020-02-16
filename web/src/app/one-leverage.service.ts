import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';

import OneLeverageABI from './abi/OneLeverageABI.json';
import HolderOneABI from './abi/HolderOneABI.json';
import { ConfigurationService } from './configuration.service';
import { BigNumber } from 'ethers/utils/bignumber';

@Injectable({
    providedIn: 'root'
})
export class OneLeverageService {

    holderOneAaveCompoundContract;

    constructor(
        protected web3Service: Web3Service,
        protected configurationService: ConfigurationService
    ) {

        this.init();
    }

    async init() {

        this.holderOneAaveCompoundContract = new (await this.web3Service.getWeb3Provider()).eth.Contract(
            // @ts-ignore
            HolderOneABI,
            this.configurationService.HOLDER_ONE_AAVE_COMPOUND
        );
    }

    async getTokenContract(leverageTokenSymbol: string) {

        switch (leverageTokenSymbol) {

            case '2xETHDAI':

                return new (await this.web3Service.getWeb3Provider()).eth.Contract(
                    // @ts-ignore
                    OneLeverageABI,
                    this.configurationService.ETHDAI2x
                );
        }
    }

    getLeveregaTokenSymbol(
        collateralTokenSymbol: string,
        debtTokenSymbol: string,
        leverageRatio: number
    ) {

        return leverageRatio + 'x' + collateralTokenSymbol + debtTokenSymbol;
    }

    async getHolderContract(leverageTokenSymbol: string) {

        switch (leverageTokenSymbol) {

            case '2xETHDAI':

                return this.holderOneAaveCompoundContract;
        }
    }

    async openPosition(
        collateralTokenSymbol: string,
        debtTokenSymbol: string,
        leverageRatio: number,
        amount: BigNumber
    ): Promise<string> {

        const leverageSymbol = leverageRatio + 'x' + collateralTokenSymbol + debtTokenSymbol;
        const leverageContract = await this.getTokenContract(leverageSymbol);
        const callData = leverageContract.methods.openPosition(
            amount,
            (await this.getHolderContract(leverageSymbol)).address
        )
            .encodeABI();

        const tx = this.web3Service.txProvider.eth.sendTransaction({
            from: this.web3Service.walletAddress,
            to: leverageContract.address,
            value: debtTokenSymbol === 'ETH' ? amount : 0,
            gasPrice: this.configurationService.fastGasPrice,
            data: callData
        });

        return new Promise((resolve, reject) => {

            let txHash;

            tx
                .once('transactionHash', async (hash) => {

                    txHash = hash;
                })
                .once('receipt', async (receipt) => {

                    resolve(txHash);
                })
                .on('confirmation', async (confirmation) => {

                    resolve(txHash);
                })
                .on('error', (err) => {

                    reject(err);
                });
        });
    }
}
