import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import { LeverageChartDialogComponent } from '../leverage-chart-dialog/leverage-chart-dialog.component';
import { mockedPositions } from './mocked-positions';


export interface IPosition {
    tokenName: string;
    profit: string;
    status: string;
    stopLossUsd: number;
    stopWinUsd: number;
    leverage: number;
    ratesHistory: Array<{rate: number, t: string}>;
}

@Component({
    selector: 'app-my-positions',
    templateUrl: './my-positions.component.html',
    styleUrls: ['./my-positions.component.scss']
})
export class MyPositionsComponent implements OnInit {
    positions = mockedPositions;
    modalRef: BsModalRef;
    message: string;

    constructor(private modalService: BsModalService) {
        //
    }

    ngOnInit() {
        // ---
    }

    operate(position: any, template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template , {class: 'modal-sm'});
    }

    confirm(): void {
        this.message = 'Confirmed!';
        this.modalRef.hide();
    }

    decline(): void {
        this.message = 'Declined!';
        this.modalRef.hide();
    }

    showChartDialog(position: IPosition) {
        const initialState = {
            assetAmount: 2,
            initialRates2Usd: 267.67,
            stopWinUsd: position.stopWinUsd,
            stopLossUsd: position.stopLossUsd,
            leverage: position.leverage,
            src2DstAssetRates: position.ratesHistory.map( (x) => x.rate),
            rates2Usd: position.ratesHistory.map( (x) => x.rate)
        };
        this.modalRef = this.modalService.show(LeverageChartDialogComponent, {class: 'modal-lg', initialState});
    }
}
