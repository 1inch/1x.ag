import {Component, OnInit, TemplateRef} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap";

interface Position {
    tokenName: string;
    profit: string;
    status: string;
    stopLoss: string;
    stopWin: string;
}

export const mockedPositions = [
    {
        tokenName: 'ETH',
        profit: '130%',
        status: 'healthy',
        stopLoss: '210$',
        stopWin: '290$',
        positionModel: 'short',
        leverageModel: '2x'
    },
    {
        tokenName: 'MKR',
        profit: '90%',
        status: 'healthy',
        stopLoss: '1110$',
        stopWin: '2920$',
        positionModel: 'long',
        leverageModel: '5x'
    },
    {
        tokenName: 'WBTC',
        profit: '1330%',
        status: 'healthy',
        stopLoss: '9110$',
        stopWin: '14000$',
        positionModel: 'long',
        leverageModel: '3x'
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
    }

    ngOnInit() {
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
}
