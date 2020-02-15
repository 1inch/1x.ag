import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LeverageComponent} from "./leverage/leverage.component";

const routes: Routes = [
  {
    path: '',
    component: LeverageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeverageRoutingModule {
}
