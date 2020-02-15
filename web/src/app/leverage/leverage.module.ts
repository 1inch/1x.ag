import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeverageComponent} from './leverage/leverage.component';
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Step1Component} from './leverage/step1/step1.component';
import {Step2Component} from './leverage/step2/step2.component';
import {LeverageRoutingModule} from "./leverage-routing.module";

@NgModule({
  declarations: [LeverageComponent, Step1Component, Step2Component],
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    LeverageRoutingModule
  ]
})
export class LeverageModule {
}
