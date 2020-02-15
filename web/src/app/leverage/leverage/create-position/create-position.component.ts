import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../../configuration.service';
import { Web3Service } from '../../../web3.service';
import { ethers } from 'ethers';
import { TokenService } from '../../../token.service';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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
    marginTokenList = [
        'ETH',
        'DAI',
        'WBTC',
        'ZRX',
        'MKR'
    ];
    _positionModel = localStorage.getItem('leveragePositionModel') ?
        localStorage.getItem('leveragePositionModel') :
        'long';
    loading = true;
    transactionHash = '';
    error = false;
    done = false;

    constructor(
        public configurationService: ConfigurationService,
        public tokenService: TokenService,
        public web3Service: Web3Service
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

    create() {

        this.loading = true;

        setTimeout(() => {

            this.loading = false;
            this.done = true;
            this.transactionHash = '0x5565dc0631e50b776ebef819cb334093b6f1f102772d084f95e580523825cdcd';
        }, 10000);
    }
}
