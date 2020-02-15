import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LeverageComponent} from './leverage/leverage.component';
import {Step1Component} from './leverage/step1/step1.component';
import {Step2Component} from './leverage/step2/step2.component';

const routes: Routes = [
    {
        path: '',
        component: LeverageComponent,
        children: [
            {path: '', redirectTo: 'step1', pathMatch: 'full'},
            {path: 'step1', component: Step1Component},
            {path: 'step2', component: Step2Component},
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeverageRoutingModule {
}
