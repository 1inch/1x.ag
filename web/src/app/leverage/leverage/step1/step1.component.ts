import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {of} from "rxjs";
import {delay, take, tap} from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {
  constructor(  ) {
  }

  ngOnInit() {
  }
}
