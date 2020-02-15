import {Component, OnInit} from '@angular/core';

interface Position {
    tokenName: string;
    profit: string;
    status: string;
    stopLoss: string;
    stopWin: string;
}

export const mockedPositions = [
    {tokenName: 'ETH', profit: '130%', status: 'healthy', stopLoss: '210$',  stopWin: '290$'},
    {tokenName: 'MKR', profit: '90%', status: 'healthy', stopLoss: '1110$',  stopWin: '2920$'},
    {tokenName: 'WBTC', profit: '1330%', status: 'healthy', stopLoss: '9110$',  stopWin: '14000$'},
    ];

@Component({
    selector: 'app-my-positions',
    templateUrl: './my-positions.component.html',
    styleUrls: ['./my-positions.component.scss']
})
export class MyPositionsComponent implements OnInit {
    positions = mockedPositions;
    constructor() {
    }

    ngOnInit() {
    }

    operate( position: any ) {
        console.log(position);
    }
}
