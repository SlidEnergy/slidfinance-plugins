import { TestBed } from '@angular/core/testing';

import { BankDetectorService } from './bank-detector.service';

describe('BankDetectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BankDetectorService = TestBed.get(BankDetectorService);
    expect(service).toBeTruthy();
  });
});
