import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Web3Service } from '../../web3.service';
import { ConfigurationService } from '../../configuration.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oi-option-selector',
    templateUrl: './option-selector.component.html',
    styleUrls: ['./option-selector.component.scss']
})
export class OptionSelectorComponent implements OnInit {

    @ViewChild('optionDropDown')
    optionDropDown: NgbDropdown;

    optionSearchResults: Observable<{}>;
    optionSearchControl = new FormControl('');

    @Input()
    options = [];

    @Input()
    @Output()
    option: any;

    approved = false;
    loading = false;

    // tslint:disable-next-line:no-output-on-prefix no-output-rename
    @Output('onOptionSelect')
    onOptionSelectEmitter = new EventEmitter<any>();

    constructor(
        protected configurationService: ConfigurationService,
        protected web3Service: Web3Service
    ) {
    }

    async ngOnInit() {

        this.initOptionSearchResults();
    }

    async initOptionSearchResults() {

        this.optionSearchResults = this.optionSearchControl.valueChanges.pipe(
            startWith(''),
            map(term => {

                const result = Object.values(this.options);

                if (term !== '') {

                    return result
                        .filter(v => {

                            return (v['name']
                                .toLowerCase()
                                .indexOf(term.toLowerCase()) > -1);

                        })
                        .slice(0, 10);
                }

                return result;
            })
        );
    }

    setOption(option) {

        this.option = option;
        this.optionDropDown.close();

        this.onOptionSelectEmitter.emit(option);
    }
}
