import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeverageComponent} from './leverage/leverage.component';
import {Step1Component} from './leverage/step1/step1.component';
import {Step2Component} from './leverage/step2/step2.component';
import {LeverageRoutingModule} from './leverage-routing.module';
import {FormsModule} from '@angular/forms';
import {ButtonsModule, TooltipModule} from 'ngx-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [LeverageComponent, Step1Component, Step2Component],
    imports: [
        CommonModule,
        LeverageRoutingModule,
        FormsModule,
        ButtonsModule,
        FontAwesomeModule,
        TooltipModule.forRoot(),
    ],
})
export class LeverageModule {
}
