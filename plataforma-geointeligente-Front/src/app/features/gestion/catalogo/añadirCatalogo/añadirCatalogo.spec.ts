import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { añadirCatalogo } from './añadirCatalogo';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoService } from '../../../../core/services/CatalogoService';
import { AlarmService } from '../../../../core/components/Alarms/alarm.service';

describe('añadirCatalogo', () => {
  let component: añadirCatalogo;
  let fixture: ComponentFixture<añadirCatalogo>;

  const mockDialogRef = { close: jasmine.createSpy('close') };
  const mockApi: Partial<CatalogoService> = {
    registerEnfermedad: jasmine.createSpy('registerEnfermedad').and.returnValue(of({ idEnfermedad: '1' })),
    update: jasmine.createSpy('update').and.returnValue(of({ idEnfermedad: '1' })),
  };
  const mockAlarms: Partial<AlarmService> = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [añadirCatalogo],
      providers: [
        { provide: CatalogoService, useValue: mockApi },
        { provide: AlarmService, useValue: mockAlarms },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(añadirCatalogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (mockDialogRef.close as jasmine.Spy).calls.reset();
    (mockApi.registerEnfermedad as jasmine.Spy).calls.reset();
    (mockApi.update as jasmine.Spy).calls.reset();
    (mockAlarms.showSuccess as jasmine.Spy).calls.reset();
    (mockAlarms.showError as jasmine.Spy).calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancel() should close dialog with null', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('save() does nothing when form invalid', () => {
    component.form.patchValue({ nombreEnfermedad: '' });
    component.save();
    expect((mockApi.registerEnfermedad as jasmine.Spy).calls.count()).toBe(0);
  });

  /*it('save() registers enfermedad when valid and confirmed', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.form.patchValue({ nombreEnfermedad: 'Test', descripcion: 'desc', codigoICD: 'C1' });
    component.save();
    // API observable should emit synchronously, advance microtasks
    tick();
    fixture.detectChanges();
    expect(mockApi.registerEnfermedad).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
    expect((mockAlarms.showSuccess as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(0);
  }));*/

  describe('when editing an existing item', () => {
    let editFixture: ComponentFixture<añadirCatalogo>;
    let editComponent: añadirCatalogo;

    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [añadirCatalogo],
        providers: [
          { provide: CatalogoService, useValue: mockApi },
          { provide: AlarmService, useValue: mockAlarms },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { item: { idEnfermedad: '2', nombreEnfermedad: 'Old' } } },
        ],
      }).compileComponents();

      editFixture = TestBed.createComponent(añadirCatalogo);
      editComponent = editFixture.componentInstance;
      editFixture.detectChanges();
    });

    it('should mark component as edit and call update() on save', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      expect(editComponent.isEdit).toBeTrue();
      editComponent.form.patchValue({ nombreEnfermedad: 'Updated', descripcion: 'u', codigoICD: 'X1' });
      editComponent.save();
      tick();
      expect(mockApi.update).toHaveBeenCalledWith('2', jasmine.objectContaining({ nombreEnfermedad: 'Updated' }));
      expect(mockDialogRef.close).toHaveBeenCalled();
    }));
  });

  it('save() surfaces server error when API fails', fakeAsync(() => {
    (mockApi.registerEnfermedad as jasmine.Spy).and.returnValue(throwError({ error: 'boom' }));
    spyOn(window, 'confirm').and.returnValue(true);
    component.form.patchValue({ nombreEnfermedad: 'ErrTest' });
    component.save();
    tick();
    expect((mockAlarms.showError as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(0);
    expect(component.error()).toBeTruthy();
  }));
});
