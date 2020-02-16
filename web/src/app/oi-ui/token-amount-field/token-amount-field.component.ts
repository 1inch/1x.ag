import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ethers} from 'ethers';
import {TokenPriceService} from '../../token-price.service';
import {TokenService} from '../../token.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Web3Service} from '../../web3.service';
import {BigNumber} from 'ethers/utils/bignumber';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oi-token-amount-field',
    templateUrl: './token-amount-field.component.html',
    styleUrls: ['./token-amount-field.component.scss']
})
export class TokenAmountFieldComponent implements OnInit {

    tokenAmountControl = new FormControl('');
    maxTokenBalance = '0.0';

    tokenAmount;

    @Output()
    tokenAmountBNChange = new EventEmitter<BigNumber>();

    tokenBalance = '0.0';
    tokenBalanceBN = ethers.utils.bigNumberify(0);
    tokenUsdCost;
    tokenUsdPrice;
    tokenUsdCostView = '';
    @Input()
    name;
    @Input()
    id;
    @Input()
    gasPrice;
    usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    constructor(
        protected tokenService: TokenService,
        protected tokenPriceService: TokenPriceService,
        protected web3Service: Web3Service
    ) {
    }

    _token;

    @Input()
    get token() {

        return this._token;
    }

    set token(value) {

        this._token = value;

        this.reset();
        this.runBackgroundJobs();
    }

    _tokenAmountBN = ethers.utils.bigNumberify(0);

    @Input()
    get tokenAmountBN() {

        return this._tokenAmountBN;
    }

    set tokenAmountBN(value) {

        this._tokenAmountBN = value;
        this.tokenAmountControl.setValue(
            this.tokenService.formatAsset(
                this.token,
                value
            )
        );
    }

    async ngOnInit() {

        this.tokenAmountControl.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged(),
        )
            .subscribe((value) => {

                if (value !== '' && this.isNumeric(value) && value !== 0 && !value.match(/^([0\.]+)$/)) {

                    this.tokenAmount = value;

                    const tokenAmountBN = this.tokenService.parseAsset(
                        this.token,
                        value
                    );

                    if (
                        !tokenAmountBN.eq(this._tokenAmountBN)
                    ) {

                        this._tokenAmountBN = tokenAmountBN;

                        this.tokenAmountBNChange.emit(
                            this._tokenAmountBN
                        );
                    }

                    this.updateTokenUSDCosts();
                }
            });

        this.web3Service.connectEvent.subscribe(() => {

            this.loadTokenBalance();
        });

        this.web3Service.disconnectEvent.subscribe(() => {

            this.reset();
        });

        setTimeout(() => {

            this.runBackgroundJobs();
        }, 5000);
    }

    reset() {

        this.maxTokenBalance = '0.0';
        this.tokenBalance = '0.0';
        this.tokenBalanceBN = ethers.utils.bigNumberify(0);
        this.tokenUsdCost = ethers.utils.bigNumberify(0);
        this.tokenUsdCostView = '';
    }

    isNumeric(str) {
        return /^\d*\.{0,1}\d*$/.test(str);
    }

    async loadTokenBalance() {

        if (
            this.web3Service.walletAddress
        ) {

            if (this.token === 'ETH') {

                this.tokenBalanceBN = ethers.utils.bigNumberify(
                    await (await this.web3Service.getWeb3Provider()).eth.getBalance(
                        this.web3Service.walletAddress
                    )
                )
                    .sub(
                        this.gasPrice.mul(5000000)
                    );

                if (this.tokenBalanceBN.lte(0)) {

                    this.tokenBalanceBN = ethers.utils.bigNumberify(
                        await this.web3Service.web3Provider.eth.getBalance(
                            this.web3Service.walletAddress
                        )
                    );
                }

                this.tokenBalance = ethers.utils.formatEther(
                    this.tokenBalanceBN
                );

            } else {

                this.tokenBalanceBN = await this.tokenService.getTokenBalance(
                    this.token,
                    await this.web3Service.walletAddress
                );

                this.tokenBalance = this.tokenService.formatAsset(
                    this.token,
                    this.tokenBalanceBN
                );
            }

            this.tokenBalance = this.tokenService.toFixed(this.tokenBalance, 18);

            if (this.tokenBalance === '0') {
                this.tokenBalance = '0.0';
                this.tokenBalanceBN = ethers.utils.bigNumberify(0);
            }

            this.maxTokenBalance = this.tokenService.toFixed(this.tokenBalance, 12);
        }
    }

    async setTokenAmount() {

        this.tokenAmountControl.setValue(this.tokenBalance);
    }

    async updateTokenUSDCosts() {

        try {

            if (!this.tokenUsdPrice) {

                this.tokenUsdPrice = await this.tokenPriceService.fetchTokenPrice(this.token);
            }

            if (
                this.tokenUsdPrice.gt(0)
            ) {

                this.tokenUsdCost =
                    this.tokenAmountBN.div(this.tokenUsdPrice);

                this.tokenUsdCostView = this.usdFormatter.format(this.tokenUsdCost.toString() / 100);
            }

        } catch (e) {

            console.error(e);
        }
    }

    async loadUSDPrice() {

        try {

            this.tokenUsdPrice = await this.tokenPriceService.fetchTokenPrice(this.token);
            this.updateTokenUSDCosts();
        } catch (e) {

        }
    }

    async runBackgroundJobs() {

        const startTime = (new Date()).getTime();

        try {

            const promises = [];

            promises.push(
                this.loadUSDPrice()
            );

            promises.push(
                this.loadTokenBalance()
            );

            await Promise.all(promises);
        } catch (e) {

            console.error(e);
        }

        try {

            if (
                (new Date()).getTime() - startTime > 10000
            ) {

                this.runBackgroundJobs();
            } else {

                setTimeout(() => {

                    this.runBackgroundJobs();
                }, 10000 - ((new Date()).getTime() - startTime));
            }
        } catch (e) {

            console.error(e);
        }
    }
}
