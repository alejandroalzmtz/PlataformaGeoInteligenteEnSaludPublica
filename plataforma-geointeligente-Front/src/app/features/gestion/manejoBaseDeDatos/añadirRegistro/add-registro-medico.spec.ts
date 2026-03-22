import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRegistroMedicoModal } from './add-registro-medico';

describe('AddRegistroMedicoModal', () => {
  let component: AddRegistroMedicoModal;
  let fixture: ComponentFixture<AddRegistroMedicoModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRegistroMedicoModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRegistroMedicoModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
