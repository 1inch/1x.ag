import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeverageComponent} from './leverage/leverage.component';
import {CreatePositionComponent} from './leverage/create-position/create-position.component';
import {LeverageRoutingModule} from './leverage-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonsModule, TooltipModule} from 'ngx-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {OiUiModule} from '../oi-ui/oi-ui.module';
import {MyPositionsComponent} from './leverage/my-positions/my-positions.component';
import { LoadingSpinnerModule } from '../loading-spinner/loading-spinner.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { LeverageChartDialogComponent } from './leverage/leverage-chart-dialog/leverage-chart-dialog.component';


@NgModule({
    declarations: [LeverageComponent, CreatePositionComponent, MyPositionsComponent, LeverageChartDialogComponent],
    imports: [
        CommonModule,
        LeverageRoutingModule,
        FormsModule,
        ButtonsModule,
        FontAwesomeModule,
        TooltipModule.forRoot(),
        OiUiModule,
        ReactiveFormsModule,
        LoadingSpinnerModule,
        NgbAlertModule,
        ChartsModule
    ],
    entryComponents: [
        LeverageChartDialogComponent
    ]
})
export class LeverageModule {
}
