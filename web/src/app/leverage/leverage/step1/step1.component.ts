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

  hide = true;
  hideRepeat = true;
  public passwordForm: FormGroup;
  passwordsAreValid: boolean;
  display = false;
  deactivateForms = false;


  constructor( private fb: FormBuilder, private location: Location, private router: Router ) {
    this.createForm();
    this.checkValid();

  }


  get password() {
    return this.passwordForm.get('password');
  }

  get repeatPass() {
    return this.passwordForm.get('passwordRepeat');
  }

  createForm() {
    this.passwordForm = this.fb.group({
      username: ['BW Account'],
      password: ['', Validators.required],
      passwordRepeat: ['', [Validators.required]]
    });
  }

  checkValid() {
    this.passwordsAreValid = this.repeatPass.value === this.password.value && this.repeatPass.value !== '';
  }

  onPasswordInput() {
    if (this.passwordForm.hasError('passwordMismatch')) {
      this.repeatPass.setErrors([{passwordMismatch: true}]);
    } else {
      this.repeatPass.setErrors(null);
    }
  }

  ngOnInit() {
  }

  onKeydown( event ) {
    if (event.key === 'Enter' && this.passwordsAreValid) {
      this.generate();
    }
  }

  back() {
    this.location.back();
  }

  displayLoader() {
    this.display = !this.display;
  }


  generate() {
    of('').pipe(
      tap(() => this.displayLoader()),
      tap(() => this.passwordsAreValid = !this.passwordsAreValid),
      tap(() => this.passwordForm.disable()),
      delay(5000),
      tap(() => this.displayLoader()),
      tap(() => this.passwordsAreValid = !this.passwordsAreValid),
      tap(() => this.passwordForm.enable()),
      tap(() => this.router.navigate(['/success/created'])),
      take(1)
    ).subscribe();
  }

}
