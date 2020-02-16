import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenSelectorComponent } from './token-selector/token-selector.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenAmountFieldComponent } from './token-amount-field/token-amount-field.component';
import { OptionSelectorComponent } from './option-selector/option-selector.component';

@NgModule({
    declarations: [
        TokenSelectorComponent,
        TokenAmountFieldComponent,
        OptionSelectorComponent
    ],
    exports: [
        TokenSelectorComponent,
        TokenAmountFieldComponent,
        OptionSelectorComponent,
        OptionSelectorComponent
    ],
    imports: [
        CommonModule,
        NgbDropdownModule,
        ReactiveFormsModule
    ]
})
export class OiUiModule {
}
