import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {TokenService} from '../../token.service';
import {ethers} from 'ethers';
import {Observable} from 'rxjs';
import {Web3Service} from '../../web3.service';
import {ConfigurationService} from '../../configuration.service';
import {TokenPriceService} from '../../token-price.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oi-token-selector',
    templateUrl: './token-selector.component.html',
    styleUrls: ['./token-selector.component.scss'],
})
export class TokenSelectorComponent implements OnInit {

    @ViewChild('tokenDropDown', {static: false})
    tokenDropDown: NgbDropdown;

    tokenSearchResults: Observable<{}>;
    tokenSearchControl = new FormControl('');

    @Input()
    tokenAmountBN = ethers.utils.bigNumberify(0);

    tokenBalanceBN = ethers.utils.bigNumberify(0);
    maxTokenBalanceBN = ethers.utils.bigNumberify(0);

    usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    @Input()
    tokenBlackList = [];

    tokens = [];

    balancesOfTokens = [];
    pricesOfTokens = [];

    @Input()
    @Output()
    token: string;

    @Input()
    tokenSpender: string;

    approved = false;
    loading = false;
    tokenDropDownOpened = false;

    // tslint:disable-next-line:no-output-on-prefix no-output-rename
    @Output('onTokenSelect')
    onTokenSelectEmitter = new EventEmitter<any>();

    constructor(
        protected tokenService: TokenService,
        protected configurationService: ConfigurationService,
        protected web3Service: Web3Service,
        protected tokenPriceService: TokenPriceService,
    ) {
    }

    async ngOnInit() {

        this.tokens = Object.assign({}, (await this.tokenService.getTokens()));
        this.tokenBlackList.forEach(tokenSymbol => delete this.tokens[tokenSymbol]);

        this.initTokenSearchResults();

        this.web3Service.connectEvent.subscribe(() => {

            this.loadBalancesOfTokens();
        });

        this.web3Service.disconnectEvent.subscribe(() => {

            this.clearTokenBalances();
        });

        this.runBackgroundJobs();
    }

    clearTokenBalances() {

        const tokens = Object.values(this.tokens);

        for (let i = 0; i < tokens.length; i++) {

            this.tokens[tokens[i]['symbol']].balance = 0;
        }
    }

    async initTokenSearchResults() {

        this.tokenSearchResults = this.tokenSearchControl.valueChanges.pipe(
            startWith(''),
            map(term => {

                let result = Object.values(this.tokens);

                if (term === '') {

                    result = result
                        .map(token => this.addBalancesToSearchResults(token))
                        .sort((firstEl, secondEl) => this.sortSearchResults(term, firstEl, secondEl));

                } else {

                    return result
                        .filter(v => {

                            return (v['symbol']
                                .toLowerCase()
                                .indexOf(term.toLowerCase()) > -1);

                        })
                        .slice(0, 10)
                        .map(token => this.addBalancesToSearchResults(token))
                        .sort((firstEl, secondEl) => this.sortSearchResults(term, firstEl, secondEl));
                }

                return result;
            })
        );
    }

    addBalancesToSearchResults(token) {

        if (token['balance']) {

            try {

                token['formatedTokenBalance'] = this.tokenService.toFixed(
                    this.tokenService.formatAsset(
                        token['symbol'],
                        token['balance']
                    ),
                    18
                );
            } catch (e) {

                console.log('token', token);
                console.error(e);
            }
        }

        return token;
    }

    setToken(token) {

        this.token = token.symbol;
        this.tokenDropDown.close();

        this.onTokenSelectEmitter.emit(token);
    }

    sortSearchResults(term, firstEl, secondEl) {

        if (!firstEl['usd']) {
            firstEl['usd'] = 0;
        }

        if (!secondEl['usd']) {
            secondEl['usd'] = 0;
        }

        if (!firstEl['balance']) {
            firstEl['balance'] = ethers.utils.bigNumberify(0);
        }

        if (!secondEl['balance']) {
            secondEl['balance'] = ethers.utils.bigNumberify(0);
        }

        if (firstEl['symbol'].toLowerCase() === term.toLowerCase()) {

            return -1;
        }

        if (firstEl['usd'] > secondEl['usd']) {

            return -1;
        }

        if (firstEl['usd'] < secondEl['usd']) {

            return 1;
        }

        return 0;
    }

    async runBackgroundJobs() {

        const startTime = (new Date()).getTime();

        try {

            const promises = [];

            if (
                this.web3Service.walletAddress
            ) {

                promises.push(
                    this.loadBalancesOfTokens()
                );
            }

            this.checkAllowance();

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

    async checkAllowance() {

        if (this.token === 'ETH') {

            this.approved = true;

        } else if (
            this.web3Service.walletAddress
        ) {

            this.approved = await this.tokenService.isApproved(
                this.token,
                this.tokenSpender,
                this.tokenAmountBN
            );
        } else {

            this.approved = false;
        }
    }

    async loadBalancesOfTokens() {

        try {

            if (
                this.web3Service.walletAddress
            ) {

                const tokens = Object.values(this.tokens);

                const {balances, prices} = await this.tokenService.getTokenBalancesAndPricesForTokens(
                    this.web3Service.walletAddress,
                    tokens
                );

                this.balancesOfTokens = balances;
                this.pricesOfTokens = prices;

                for (let i = 0; i < this.balancesOfTokens.length; i++) {

                    if (this.tokens[tokens[i]['symbol']]) {

                        this.tokens[tokens[i]['symbol']].balance = this.balancesOfTokens[i];

                        if (
                            this.pricesOfTokens[i].gt(0) &&
                            tokens[i]['symbol'] !== 'ETH'
                        ) {

                            this.tokens[tokens[i]['symbol']].price = this.balancesOfTokens[i]
                                .mul(1e9)
                                .div(this.pricesOfTokens[i]);

                            this.tokens[tokens[i]['symbol']].usd = this.tokens[tokens[i]['symbol']].price.toNumber() /
                                100 / 1e9;

                            this.tokens[tokens[i]['symbol']].formatedUSD = this.usdFormatter
                                .format(
                                    this.tokens[tokens[i]['symbol']].usd
                                );
                        } else {

                            this.tokens[tokens[i]['symbol']].usd = 0;
                            this.tokens[tokens[i]['symbol']].formatedUSD = 0;
                        }
                    } else {

                        console.log(tokens[i]['symbol']);
                    }
                }

                if (this.tokens['ETH']) {

                    this.tokens['ETH'].balance = await this.web3Service.web3Provider.eth
                        .getBalance(
                            this.web3Service.walletAddress
                        );

                    this.tokens['ETH'].usd = ethers.utils.bigNumberify(this.tokens['ETH'].balance)
                        .mul(1e9)
                        .div(await this.tokenPriceService.getEthPrice())
                        .toNumber() / 100 / 1e9;

                    this.tokens['ETH'].formatedUSD = this.usdFormatter
                        .format(
                            this.tokens['ETH'].usd
                        );
                }
            }
        } catch (e) {

            console.error(e);
        }

        if (!this.tokenDropDownOpened) {

            this.tokenSearchControl.setValue(
                this.tokenSearchControl.value
            );
        }
    }
}
