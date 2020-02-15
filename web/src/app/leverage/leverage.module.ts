import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeverageComponent} from './leverage/leverage.component';
import {Step1Component} from './leverage/step1/step1.component';
import {Step2Component} from './leverage/step2/step2.component';
import {LeverageRoutingModule} from './leverage-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ButtonsModule} from "ngx-bootstrap";
import { OiUiModule } from '../oi-ui/oi-ui.module';

@NgModule({
    declarations: [LeverageComponent, Step1Component, Step2Component],
    imports: [
        CommonModule,
        LeverageRoutingModule,
        FormsModule,
        ButtonsModule,
        OiUiModule,
        ReactiveFormsModule
    ]
})
export class LeverageModule {
}
