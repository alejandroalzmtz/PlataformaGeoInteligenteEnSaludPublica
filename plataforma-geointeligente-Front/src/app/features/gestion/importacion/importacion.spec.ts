import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportacionComponent } from './importacion';

describe('ImportacionComponent', () => {
  let component: ImportacionComponent;
  let fixture: ComponentFixture<ImportacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
