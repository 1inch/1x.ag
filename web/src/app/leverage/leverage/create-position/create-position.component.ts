import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../../configuration.service';
import { Web3Service } from '../../../web3.service';
import { ethers } from 'ethers';
import { TokenService } from '../../../token.service';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { OneLeverageService } from '../../../one-leverage.service';

@Component({
    selector: 'app-step1',
    templateUrl: './create-position.component.html',
    styleUrls: ['./create-position.component.scss']
})
export class CreatePositionComponent implements OnInit {

    formGroup = new FormGroup({});
    marked = false;
    tokenSpender = '0x0000000000000000000000000000000000000000';
    marginToken = localStorage.getItem('leverageMarginToken') ?
        localStorage.getItem('leverageMarginToken') :
        'ETH';

    payToken = localStorage.getItem('leveragePayToken') ?
        localStorage.getItem('leveragePayToken') :
        'DAI';

    info = faInfoCircle;
    gasPrice;
    tokenBlackList = [];

    leverageProviders = [
        {
            name: 'Compound',
            icon: 'assets/compound-v2.svg'
        },
        {
            name: 'Aave',
            icon: 'assets/aave.png'
        },
        {
            name: 'MakerDAO',
            icon: 'assets/makerdao.svg'
        },
        {
            name: '(bZx) Fulcrum',
            icon: 'assets/fulcrum.png'
        }
    ];

    marginTokenList = [
        'ETH',
        'DAI',
        'WBTC',
        'ZRX',
        'MKR',
        'tBTC'
    ];

    loading = true;
    transactionHash = '';
    error = false;
    done = false;

    leverageProvider = localStorage.getItem('leverageProvider') ?
        this.leverageProviders.filter(provider => provider.name ===
            localStorage.getItem('leverageProvider'))[0] :
        this.leverageProviders.filter(provider => provider.name === 'Compound')[0];

    constructor(
        public configurationService: ConfigurationService,
        public tokenService: TokenService,
        public web3Service: Web3Service,
        public oneLeverageService: OneLeverageService
    ) {
    }

    _stopLossLimit = localStorage.getItem('leverageStopLossLimit') ?
        localStorage.getItem('leverageStopLossLimit') :
        '';

    get stopLossLimit() {

        return this._stopLossLimit;
    }

    set stopLossLimit(value) {

        this._stopLossLimit = value;
        localStorage.setItem('leverageStopLossLimit', value);
    }

    _takeProfitLimit = localStorage.getItem('leverageTakeProfitLimit') ?
        localStorage.getItem('leverageTakeProfitLimit') :
        '';

    get takeProfitLimit() {

        return this._takeProfitLimit;
    }

    set takeProfitLimit(value) {

        this._takeProfitLimit = value;
        localStorage.setItem('leverageTakeProfitLimit', value);
    }

    _useT800SaveBot = localStorage.getItem('leverageUseT800SaveBot') === '1' || !localStorage.getItem('leverageUseT800SaveBot');

    get useT800SaveBot() {

        return this._useT800SaveBot;
    }

    set useT800SaveBot(value) {

        this._useT800SaveBot = value;
        localStorage.setItem('leverageUseT800SaveBot', value ? '1' : '0');
    }

    _amountBN = localStorage.getItem('leverageAmountBN') ?
        ethers.utils.bigNumberify(localStorage.getItem('leverageAmountBN')) :
        ethers.utils.bigNumberify(1e9).mul(1e9).mul(1000);

    get amountBN() {

        return this._amountBN;
    }

    set amountBN(value) {

        this._amountBN = value;
        localStorage.setItem('leverageAmountBN', this._amountBN.toString());
    }

    _leverageModel = localStorage.getItem('leverageLeverageModel') ?
        localStorage.getItem('leverageLeverageModel') :
        '3';

    get leverageModel() {

        return this._leverageModel;
    }

    set leverageModel(value) {

        this._leverageModel = value;
        localStorage.setItem('leverageLeverageModel', value);
    }

    ngOnInit() {

        this.tokenBlackList = Object.keys(this.tokenService.tokens)
            .filter(tokenSymbol => this.marginTokenList.indexOf(tokenSymbol) === -1);
        this.gasPrice = this.configurationService.fastGasPrice;

        this.loading = false;
    }

    async onMarginTokenSelect(token) {

        this.marginToken = token.symbol;
        localStorage.setItem('leverageMarginToken', this.marginToken);
    }

    async onPayTokenSelect(token) {

        this.payToken = token.symbol;
        localStorage.setItem('leveragePayToken', this.payToken);
    }

    toggleVisibility(e) {
        this.marked = e.target.checked;
    }

    async create() {

        this.loading = true;

        try {

            const leverageTokenSymbol = this.oneLeverageService.getLeveregaTokenSymbol(
                this.marginToken,
                this.payToken,
                Number(this.leverageModel)
            );

            const leverageTokenAddress = (await this.oneLeverageService.getTokenContract(
                leverageTokenSymbol
            )).address;

            if (
                !(await this.tokenService.isApproved(
                    this.payToken,
                    leverageTokenAddress,
                    this._amountBN
                ))
            ) {

                await this.tokenService.approve(
                    this.payToken,
                    leverageTokenAddress,
                    this._amountBN
                );
            }

            const transactionHash = await this.oneLeverageService.openPosition(
                this.marginToken,
                this.payToken,
                Number(this.leverageModel),
                this.leverageProvider.name,
                this._amountBN,
                Math.abs(Number(this.stopLossLimit)),
                Math.abs(Number(this.takeProfitLimit))
            );

            this.transactionHash = transactionHash;
            this.done = true;
        } catch (e) {

            console.error(e);
        }

        this.loading = false;
    }

    onLeverageProviderSelect($event: any) {

        this.leverageProvider = $event;
        localStorage.setItem('leverageProvider', $event.name);
    }
}
