import { Component, OnInit } from '@angular/core';
import {faInfo, faInfoCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit {
  radioModel = '';
  info = faInfoCircle;
  constructor() { }
  ngOnInit() {
  }

}
