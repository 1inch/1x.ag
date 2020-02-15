import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeverageComponent} from './leverage/leverage.component';
import {Step1Component} from './leverage/step1/step1.component';
import {LeverageRoutingModule} from './leverage-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonsModule, TooltipModule} from 'ngx-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {OiUiModule} from '../oi-ui/oi-ui.module';


@NgModule({
    declarations: [LeverageComponent, Step1Component],
    imports: [
        CommonModule,
        LeverageRoutingModule,
        FormsModule,
        ButtonsModule,
        FontAwesomeModule,
        TooltipModule.forRoot(),
        OiUiModule,
        ReactiveFormsModule
    ]
})
export class LeverageModule {
}
