import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../../configuration.service';
import { Web3Service } from '../../../web3.service';
import { ethers } from 'ethers';
import { TokenService } from '../../../token.service';
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-step1',
    templateUrl: './create-position.component.html',
    styleUrls: ['./create-position.component.scss']
})
export class CreatePositionComponent implements OnInit {

    formGroup = new FormGroup({});
    marked = false;
    theCheckbox = false;
    tokenSpender = '0x0000000000000000000000000000000000000000';

    marginToken = localStorage.getItem('leverageMarginToken') ?
        localStorage.getItem('leverageMarginToken') :
        'ETH';

    payToken = localStorage.getItem('leveragePayToken') ?
        localStorage.getItem('leveragePayToken') :
        'DAI';

    positionModel = '';
    leverageModel = '';
    info = faInfoCircle;
    gasPrice;
    tokenBlackList = [];
    marginTokenList = [
        'ETH',
        'DAI',
        'WBTC',
        'ZRX',
        'MKR',
    ];

    amountBN = localStorage.getItem('leverageTokenAmount') ?
        ethers.utils.bigNumberify(localStorage.getItem('leverageTokenAmount')) :
        ethers.utils.bigNumberify(1e9).mul(1e9);

    constructor(
        public configurationService: ConfigurationService,
        public tokenService: TokenService,
        public web3Service: Web3Service
    ) {
    }

    ngOnInit() {

        this.tokenBlackList = Object.keys(this.tokenService.tokens)
            .filter(tokenSymbol => this.marginTokenList.indexOf(tokenSymbol) === -1);
        this.gasPrice = this.configurationService.fastGasPrice;
    }

    async onMarginTokenSelect(token) {

        this.marginToken = token.symbol;
        localStorage.setItem('leverageMarginToken', this.marginToken);
    }

    async onPayTokenSelect(token) {

        this.payToken = token.symbol;
        localStorage.setItem('leveragePayToken', this.payToken);
    }

    toggleVisibility(e){
        this.marked= e.target.checked;
    }
}
