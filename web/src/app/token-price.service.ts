import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { Web3Service } from './web3.service';
import { ConfigurationService } from './configuration.service';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers/utils';
import { HttpClient } from '@angular/common/http';
import { OneSplitService } from './one-split.service';

@Injectable({
    providedIn: 'root'
})
export class TokenPriceService {

    public ethPrice: BigNumber;
    public formatedEthPrice: string;
    public priceEndpoint;
    public tickers = [];

    constructor(
        private tokenService: TokenService,
        private web3Service: Web3Service,
        private configurationService: ConfigurationService,
        private oneSplitService: OneSplitService,
        private http: HttpClient
    ) {

        this.priceEndpoint = this.configurationService.CORS_PROXY_URL + 'https://api.coinpaprika.com/v1/';

        setInterval(() => {

            try {

                this.setEthPrice();
                this.updateTickers();
            } catch (e) {

            }
        }, 30000);

        this.setEthPrice();
        this.updateTickers();
    }

    async updateTickers() {

        try {

            this.tickers = (await this.http.get<any[]>(
                this.priceEndpoint +
                'tickers'
            )
                .toPromise())
                .filter(ticker => ticker.id.indexOf('knc-kingn-coin') === -1);
        } catch (e) {

        }
    }

    async setEthPrice() {

        this.ethPrice = await this.fetchTokenPrice('ETH');
        this.formatedEthPrice = this.tokenService.formatAsset('ETH', this.ethPrice);
    }

    async getEthPrice(): Promise<BigNumber> {

        // @ts-ignore
        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.ethPrice) {

                    resolve(this.ethPrice);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    async fetchTokenPrice(
        tokenSymbol: string
    ) {

        if (
            tokenSymbol === 'DAI' ||
            tokenSymbol === 'SAI'
        ) {

            return ethers.utils.bigNumberify(1e8).mul(1e8);
        }

        const { returnAmount } = await this.oneSplitService.getExpectedReturn(
            this.tokenService.getTokenBySymbol('DAI').address,
            this.tokenService.getTokenBySymbol(tokenSymbol).address,
            ethers.utils.bigNumberify(10).pow(16),
            ethers.utils.bigNumberify(20),
            ethers.utils.bigNumberify(0)
        );

        return returnAmount;
    }

    async getTickers(): Promise<any> {

        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.tickers.length) {

                    resolve(this.tickers);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    async getUSDPrice(tokenSymbols) {

        tokenSymbols = tokenSymbols.map(symbol => symbol.toLowerCase());

        return (await this.getTickers())
            .filter(ticker => {

                return tokenSymbols.indexOf(ticker.symbol.toLowerCase()) !== -1;
            })
            .map(ticker => {

                const result = {};
                result[ticker.symbol] = ticker.quotes.USD.price;

                return result;
            });
    }

    async getRateToEther(
        tokenSymbol: string
    ) {

        let rate;

        if (
            tokenSymbol === 'ETH' ||
            tokenSymbol === 'WETH'
        ) {

            rate = ethers.utils.bigNumberify(10).pow(14);
        } else {

            const { returnAmount } = await this.oneSplitService.getExpectedReturn(
                this.configurationService.ETH_ADDRESS,
                this.tokenService.getTokenBySymbol(tokenSymbol).address,
                ethers.utils.bigNumberify(10).pow(14),
                ethers.utils.bigNumberify(1),
                ethers.utils.bigNumberify(0)
            );

            rate = returnAmount.gt(0) ? returnAmount : ethers.utils.bigNumberify(1);
        }

        return rate;
    }

    async calculateToEther(
        tokenSymbol: string,
        amounts: BigNumber[][],
        txCosts: BigNumber[][],
        gasPrice: BigNumber
    ) {

        try {

            const rate = await this.getRateToEther(tokenSymbol);

            return amounts
                .map((dexAmounts, dexIndex) => dexAmounts
                    .map((amount, amountIndex) => {

                        if (!amountIndex) {

                            return ethers.utils.bigNumberify(0);
                        }

                        let txCost = ethers.utils.bigNumberify(0);

                        if (
                            txCosts[dexIndex] &&
                            txCosts[dexIndex][amountIndex]
                        ) {

                            txCost = txCosts[dexIndex][amountIndex];
                        }

                        const result = amount
                            .mul(
                                ethers.utils.bigNumberify(10).pow(14)
                            )
                            .div(rate)
                            .sub(
                                txCost.mul(gasPrice)
                            );

                        return result;
                    }));
        } catch (e) {

            console.error(e);
        }

        return ethers.utils.bigNumberify(0);
    }
}
