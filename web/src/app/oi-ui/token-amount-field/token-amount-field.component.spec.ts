import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAmountFieldComponent } from './token-amount-field.component';

describe('TokenAmountFieldComponent', () => {
  let component: TokenAmountFieldComponent;
  let fixture: ComponentFixture<TokenAmountFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenAmountFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenAmountFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
