import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoContentComponent } from './no-content/no-content.component';
import { BaseComponent } from './base/base.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';

const routes: Routes = [
    {
        path: '',
        component: BaseComponent,
        children: [
            {
                path: '',
                loadChildren: './leverage/leverage.module#LeverageModule'
            },
            {
                path: 'how-it-works',
                component: HowItWorksComponent
            },
        ]
    },
    {
        path: '**',
        component: NoContentComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
