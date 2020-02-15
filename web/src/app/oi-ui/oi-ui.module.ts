import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenSelectorComponent } from './token-selector/token-selector.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenAmountFieldComponent } from './token-amount-field/token-amount-field.component';

@NgModule({
    declarations: [
        TokenSelectorComponent,
        TokenAmountFieldComponent
    ],
    exports: [
        TokenSelectorComponent,
        TokenAmountFieldComponent
    ],
    imports: [
        CommonModule,
        NgbDropdownModule,
        ReactiveFormsModule
    ]
})
export class OiUiModule {
}
