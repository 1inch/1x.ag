import { Component, Input, OnInit } from '@angular/core';
import {
    ChartDataSets,
    ChartOptions,
    ChartType,
} from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
    selector: 'app-leverage-chart-dialog',
    templateUrl: './leverage-chart-dialog.component.html',
    styleUrls: ['./leverage-chart-dialog.component.scss']
})
export class LeverageChartDialogComponent implements OnInit {

    assetAmount = 1;
    initialRates2Usd = 1;

    src2DstAssetRates = [];
    rates2Usd: Array<{ rate: number, t: string }> = [];

    stopLossUsd = 0;
    stopWinUsd = 0;

    leverage = 1;

    public lineChartData: ChartDataSets[] = [];

    public lineChartLabels: Label[] = [];

    public lineChartOptions: ChartOptions = {};

    public lineChartLegend = true;
    public lineChartType: ChartType = 'line';
    public lineChartPlugins = [];


    constructor() {
    }

    generateHorizontalLine(value: number, color: string, label: string): ChartDataSets {
        const line = this.rates2Usd.map(x => value);
        return {
            data: [...line],
            fill: false,
            borderColor: color,
            borderWidth: 1,
            pointRadius: 0,
            label,
            pointHoverRadius: 0
        };
    }

    ngOnInit() {
        this.lineChartLabels = this.rates2Usd.map(x => x.t);

        const initialAssetsRate = this.initialRates2Usd || 1;
        const rateGraph = this.rates2Usd
            .map(x => x.rate)
            .map((rate, idx) => {
                return this.assetAmount * rate;
            })
            .map((result) => {
                return result.toFixed(2);
            });

        const leverageGraph = this.src2DstAssetRates.map((x, idx) => {
            const diff = (initialAssetsRate - x);
            const result = this.assetAmount * (initialAssetsRate - (diff * this.leverage));
            return result.toFixed(2);
        });

        const horizontalLines = [];

        if (this.stopLossUsd) {
            const line = this.generateHorizontalLine(this.stopLossUsd, '#afafaf', 'Stop Loss');
            horizontalLines.push(line);
        }

        if (this.stopWinUsd) {
            const line = this.generateHorizontalLine(this.stopWinUsd, '#afafaf', 'Stop Win');
            horizontalLines.push(line);
        }

        const initialPriceLine = this.generateHorizontalLine(this.assetAmount * initialAssetsRate, '#afafaf', 'Initial(USD)');
        initialPriceLine.borderDash = [10, 5];
        initialPriceLine.borderWidth = 0.5;
        horizontalLines.push(initialPriceLine);

        this.lineChartOptions = {
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: this.stopLossUsd ? this.stopLossUsd - 50 : 0,
                        suggestedMax: this.stopWinUsd ? this.stopWinUsd + 50 : undefined,
                    }
                }]
            }
        };

        this.lineChartData = [
            {
                data: [...rateGraph],
                fill: false,
                borderColor: '#1cb0ff',
                pointBorderColor: '#1cb0ff',
                pointBackgroundColor: '#1cb0ff',
                pointRadius: 5,
                pointBorderWidth: 0,
                label: `X1 (USD)`
            },
            {
                data: [...leverageGraph],
                fill: false,
                borderColor: '#ff114c',
                pointBorderColor: '#ff114c',
                pointBackgroundColor: '#ff114c',
                pointRadius: 5,
                pointBorderWidth: 0,
                label: `Leverage X${this.leverage} (USD)`,
                borderDash: [10, 5],
            },
            ...horizontalLines
        ];
    }

}
