import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    public GAS_PRICE_URL = 'http://gas-price.api.enterprise.1inch.exchange';
    public GAS_PRICE_URL2 = 'https://gasprice.poa.network';
    public CORS_PROXY_URL = 'https://corsproxy.1inch.exchange/';

    public fastGasPrice = new ethers.utils.BigNumber(Math.trunc(6 * 100)).mul(1e7);
    public standardGasPrice = new ethers.utils.BigNumber(Math.trunc(11 * 100)).mul(1e7);
    public instantGasPrice = new ethers.utils.BigNumber(Math.trunc(21 * 100)).mul(1e7);

    constructor(
        private http: HttpClient
    ) {

        setInterval(() => {

            try {

                this.setGasPrices();
            } catch (e) {

            }
        }, 30000);

        this.setGasPrices();
    }

    async setGasPrices() {

        try {

            let result;

            try {

                result = await this.http.get(this.CORS_PROXY_URL + this.GAS_PRICE_URL).toPromise();
            } catch (e) {

            }

            let fastGasPrice,
                standardGasPrice,
                instantGasPrice;

            if (!result || !result['health']) {

                result = await this.http.get(this.GAS_PRICE_URL2).toPromise();
            }

            fastGasPrice = result['fast'] * 110 * 1e9 / 100;
            standardGasPrice = result['standard'] * 110 * 1e9 / 100;
            instantGasPrice = result['instant'] * 110 * 1e9 / 100;

            this.fastGasPrice = ethers.utils.bigNumberify(Math.trunc(fastGasPrice));
            this.standardGasPrice = ethers.utils.bigNumberify(Math.trunc(standardGasPrice));
            this.instantGasPrice = ethers.utils.bigNumberify(Math.trunc(instantGasPrice));
        } catch (e) {

            // console.error(e);
        }
    }
}
