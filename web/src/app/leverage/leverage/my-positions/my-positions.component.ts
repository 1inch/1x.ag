import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import { LeverageChartDialogComponent } from '../leverage-chart-dialog/leverage-chart-dialog.component';

interface IPosition {
    tokenName: string;
    profit: string;
    status: string;
    stopLoss: string;
    stopWin: string;
    leverageModel: string;
}

export const mockedPositions: Array<IPosition> = [
    {
        tokenName: 'ETH',
        profit: '130%',
        status: 'healthy',
        stopLoss: '$210',
        stopWin: '$290',
        leverageModel: '2'
    },
    {
        tokenName: 'MKR',
        profit: '90%',
        status: 'healthy',
        stopLoss: '$1110',
        stopWin: '$2920',
        leverageModel: '5'
    },
    {
        tokenName: 'WBTC',
        profit: '1330%',
        status: 'healthy',
        stopLoss: '$9110',
        stopWin: '$14000',
        leverageModel: '3'
    }
];

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
            ratesHistory: [
                267.67,
                280.67,
                290.67,
                264.03,
                236.79,
                224.15,
                228.29,
                223.30,
                223.28,
                212.73,
                203.86,
                188.84,
                189.86,
                188.55,
                183.34,
                179.23,
                184.73,
                173.71,
                175.19,
                169.74,
                167.65,
                160.67,
                162.41,
                162.52,
                167.83,
                169.28,
            ],
            stopLoss: 50,
            stopWin: 450,
            leverage: 2,
        };
        this.modalRef = this.modalService.show(LeverageChartDialogComponent, {class: 'modal-lg', initialState});
    }
}
