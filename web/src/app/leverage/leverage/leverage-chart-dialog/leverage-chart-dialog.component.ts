import { Component, Input, OnInit } from '@angular/core';
import {
  ChartDataSets,
  ChartOptions,
  ChartType,
} from 'chart.js';
import { Color, Label } from 'ng2-charts';


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

  ratesHistory: number[] = [];
  stopLoss = 0;
  stopWin = 0;
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
    const line = this.ratesHistory.map(x => value);
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
    const initialAssetsRate = (this.ratesHistory && this.ratesHistory.length > 0 && this.ratesHistory[0]) || 1;

    const leverageGraph = this.ratesHistory.map(x => {
      const diff = (initialAssetsRate - x);
      return initialAssetsRate - (diff * this.leverage);
    });

    const horizontalLines = [];

    if (this.stopLoss !== 0) {
      const line = this.generateHorizontalLine(this.stopLoss, '#9933CC', 'Stop Loss');
      horizontalLines.push(line);
    }

    if (this.stopWin !== 0) {
      const line = this.generateHorizontalLine(this.stopWin, '#ea262a', 'Stop Win');
      horizontalLines.push(line);
    }

    const initialPriceLine = this.generateHorizontalLine(initialAssetsRate, 'black', 'Intial');
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
            suggestedMin: this.stopLoss - 50,
            suggestedMax: this.stopWin + 50,
          }
        }]
      }
    };

    this.lineChartData = [
      {
        data: [...this.ratesHistory],
        fill: false,
        borderColor: 'blue',
        pointRadius: 1,
        label: 'Eth / DAI'
      },
      {
        data: [...leverageGraph],
        fill: false,
        borderColor: 'blue',
        pointRadius: 0,
        label: 'Leverage',
        borderDash: [10, 5],
        pointHoverRadius: 0
      },
      ...horizontalLines
    ];
  }

}
