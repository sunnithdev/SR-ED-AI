import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetReports } from './get-reports';

describe('GetReports', () => {
  let component: GetReports;
  let fixture: ComponentFixture<GetReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
