import { TestBed } from '@angular/core/testing';

import { OneLeverageService } from './one-leverage.service';

describe('OneLeverageService', () => {
  let service: OneLeverageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneLeverageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
