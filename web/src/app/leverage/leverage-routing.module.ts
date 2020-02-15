import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeverageComponent } from './leverage/leverage.component';
import { CreatePositionComponent } from './leverage/create-position/create-position.component';
import {MyPositionsComponent} from './leverage/my-positions/my-positions.component';

const routes: Routes = [
    {
        path: '',
        component: LeverageComponent,
        children: [
            {
                path: '',
                component: CreatePositionComponent
            },
            {
                path: 'positions',
                component: MyPositionsComponent
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeverageRoutingModule {
}
