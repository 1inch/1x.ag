import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import { LeverageChartDialogComponent } from '../leverage-chart-dialog/leverage-chart-dialog.component';
import { mockedPositions } from './mocked-positions';

export interface IPosition {
    assetAmount: number;
    initialRates2Usd: number;
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
    // TODO: make mocks more stupid, add parameters calculation
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
        const initialState: any = {
            ...position,
            src2DstAssetRates: position.ratesHistory.map( (x) => x.rate),
            rates2Usd: position.ratesHistory
        };
        //
        this.modalRef = this.modalService.show(LeverageChartDialogComponent, {class: 'modal-lg', initialState});
    }
}
