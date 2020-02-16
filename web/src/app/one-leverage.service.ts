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

    async getHolderContract(leverageTokenSymbol: string) {

        switch (leverageTokenSymbol) {

            case '2xETHDAI':

                return this.holderOneAaveCompoundContract;
        }
    }

    async openPosition(
        leverageTokenSymbol: string,
        amount: BigNumber
    ) {

        return (await this.getTokenContract(leverageTokenSymbol)).methods.openPosition(
            amount,
            (await this.getHolderContract(leverageTokenSymbol)).address
        );
    }
}
