import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeverageComponent } from './leverage/leverage.component';
import { Step1Component } from './leverage/step1/step1.component';

const routes: Routes = [
    {
        path: '',
        component: LeverageComponent,
        children: [
            {
                path: '',
                component: Step1Component
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeverageRoutingModule {
}
