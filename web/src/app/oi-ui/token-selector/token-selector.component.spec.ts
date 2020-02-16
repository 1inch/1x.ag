import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSelectorComponent } from './token-selector.component';

describe('TokenSelectorComponent', () => {
  let component: TokenSelectorComponent;
  let fixture: ComponentFixture<TokenSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
