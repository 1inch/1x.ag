import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';

import OneLeverageABI from './abi/OneLeverageABI.json';
import HolderOneABI from './abi/HolderOneABI.json';
import { ConfigurationService } from './configuration.service';
import { BigNumber } from 'ethers/utils/bignumber';
import { ethers } from 'ethers';

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

    async getHolderContract(leverageProvider: string) {

        switch (leverageProvider) {

            case 'Compound':

                return this.holderOneAaveCompoundContract;
        }
    }

    async openPosition(
        collateralTokenSymbol: string,
        debtTokenSymbol: string,
        leverageRatio: number,
        leverageProvider: string,
        amount: BigNumber,
        stopLoss: number,
        takeProfit: number
    ): Promise<string> {

        const leverageSymbol = leverageRatio + 'x' + collateralTokenSymbol + debtTokenSymbol;
        const leverageContract = await this.getTokenContract(leverageSymbol);

        const callData = leverageContract.methods.openPosition(
            amount,
            (await this.getHolderContract(leverageProvider)).address,
            ethers.utils.bigNumberify(1e9).sub(
                ethers.utils.bigNumberify(stopLoss * 10000).mul(1e9).div(1e2).div(10000)
            ).mul(1e9),
            ethers.utils.bigNumberify(1e9).add(
                ethers.utils.bigNumberify(takeProfit * 10000).mul(1e9).div(1e2).div(10000)
            ).mul(1e9)
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

            tx
                .once('transactionHash', async (hash) => {

                    resolve(hash);
                })
                .on('error', (err) => {

                    reject(err);
                });
        });
    }
}
