import { Component, Input, OnInit } from '@angular/core';
import {
    ChartDataSets,
    ChartOptions,
    ChartType,
} from 'chart.js';
import { Label } from 'ng2-charts';


// TODO: fix
function generateTimeSeries(): string[] {
  const result = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date();
    d.setHours(d.getHours() - i);
    result.push(`${d.getHours()}:00`);
  }
  return result;
}

const hours = generateTimeSeries();
const timeSeries = generateTimeSeries();
//

@Component({
  selector: 'app-leverage-chart-dialog',
  templateUrl: './leverage-chart-dialog.component.html',
  styleUrls: ['./leverage-chart-dialog.component.scss']
})
export class LeverageChartDialogComponent implements OnInit {

  assetAmount = 1;
  initialRates2Usd = 1;

  src2DstAssetRates = [];
  rates2Usd = [];

  stopLossUsd = 0;
  stopWinUsd = 0;

  leverage = 1;

  public lineChartData: ChartDataSets[] = [];

  public lineChartLabels: Label[] = [...hours];

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

    const initialAssetsRate = this.initialRates2Usd || 1;

    const rateGraph = this.rates2Usd.map((rate, idx) => {
        return this.assetAmount * rate;
    });

    const leverageGraph = this.src2DstAssetRates.map((x, idx) => {
            const diff = (initialAssetsRate - x);
            return this.assetAmount * (initialAssetsRate - (diff * this.leverage));
      //  const diff = (this.assetAmount * initialAssetsRate - this.assetAmount * x);
      //  return this.assetAmount * initialAssetsRate - this.assetAmount * (diff * this.leverage);
      // const rateDiff = (initialAssetsRate - x);
      // // const rateDiffLeverage = rateDiff * this.leverage;
      // const assetDiff = (this.assetAmount * rateDiff) * this.leverage;
      // //
      // return assetDiff;
    });

      // const leverageGraph2 = this.src2DstAssetRates.map(x => {
      //     const diff = (initialAssetsRate - x);
      //     return initialAssetsRate - (diff * this.leverage);
      // });

    const horizontalLines = [];

    if (this.stopLossUsd) {
      const line = this.generateHorizontalLine(this.stopLossUsd, '#9933CC', 'Stop Loss');
      horizontalLines.push(line);
    }

    if (this.stopWinUsd) {
      const line = this.generateHorizontalLine(this.stopWinUsd, '#ea262a', 'Stop Win');
      horizontalLines.push(line);
    }

    const initialPriceLine = this.generateHorizontalLine(this.assetAmount * initialAssetsRate, 'black', 'Initial(USD)');
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
        borderColor: 'blue',
        pointRadius: 1,
        label: `X1 (USD)`
      },
      {
        data: [...leverageGraph],
        fill: false,
        borderColor: 'blue',
        pointRadius: 0,
        label: `Leverage X${this.leverage} (USD)`,
        borderDash: [10, 5],
        pointHoverRadius: 0
      },
      ...horizontalLines
    ];
  }

}
