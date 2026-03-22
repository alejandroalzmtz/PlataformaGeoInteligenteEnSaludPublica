import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Catalogo } from './catalogo';
import { of } from 'rxjs';
import { CatalogoService } from '../../../core/services/CatalogoService';
import { MatDialog } from '@angular/material/dialog';
import { AlarmService } from '../../../core/components/Alarms/alarm.service';
import { ConfirmPasswordService } from '../../../core/services/confirm-password.service';
import { ChangeDetectorRef } from '@angular/core';

describe('Catalogo', () => {
  let component: Catalogo;
  let fixture: ComponentFixture<Catalogo>;

  const mockCatalogoSvc = {
    getEnfermedadesPaged: jasmine.createSpy('getEnfermedadesPaged').and.returnValue(of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 })),
    getRangosEdad: jasmine.createSpy('getRangosEdad').and.returnValue(of([])),
    getProcedencias: jasmine.createSpy('getProcedencias').and.returnValue(of([])),
    getServiciosMedicos: jasmine.createSpy('getServiciosMedicos').and.returnValue(of([])),
    getDerechosHabPaged: jasmine.createSpy('getDerechosHabPaged').and.returnValue(of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 })),
    getEstadosPaged: jasmine.createSpy('getEstadosPaged').and.returnValue(of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 })),
    getMotivosEgresoPaged: jasmine.createSpy('getMotivosEgresoPaged').and.returnValue(of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0 })),
    getMunicipiosPaged: jasmine.createSpy('getMunicipiosPaged').and.returnValue(of({ data: [], total: 0 })),
    getLocalidadesPaged: jasmine.createSpy('getLocalidadesPaged').and.returnValue(of({ data: [], total: 0 })),
    getPoblacionEstadoById: jasmine.createSpy('getPoblacionEstadoById').and.returnValue(of(null)),
  } as any as CatalogoService;

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(null) })
  } as unknown as MatDialog;

  const mockAlarms = { showError: jasmine.createSpy('showError'), showInfo: jasmine.createSpy('showInfo') } as Partial<AlarmService>;
  const mockConfirm = {} as Partial<ConfirmPasswordService>;
  const mockCdr = { markForCheck: () => {} } as Partial<ChangeDetectorRef> as ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        { provide: CatalogoService, useValue: mockCatalogoSvc },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AlarmService, useValue: mockAlarms },
        { provide: ConfirmPasswordService, useValue: mockConfirm },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Catalogo);
    component = fixture.componentInstance;
    // ensure component uses our mock dialog instance (avoid Angular Material overlay internals in unit tests)
    (component as any).dialog = mockDialog;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleMunicipios and toggleLocalidades flip state', () => {
    const beforeM = component.collapsedMunicipios;
    component.toggleMunicipios();
    expect(component.collapsedMunicipios).toBe(!beforeM);
    const beforeL = component.collapsedLocalidades;
    component.toggleLocalidades();
    expect(component.collapsedLocalidades).toBe(!beforeL);
  });

  it('onEstadoClick with valid id sets selectedEstado and calls loadMunicipiosForEstado', () => {
    spyOn(component, 'loadMunicipiosForEstado');
    const row = { idEstado: 5, nombreEstado: 'Edo' } as any;
    component.onEstadoClick(row);
    expect(component.selectedEstado).toEqual(row);
    expect(component.loadMunicipiosForEstado).toHaveBeenCalledWith(5, 1, component.searchMunicipios);
  });

  it('openEditItem opens dialog via MatDialog', fakeAsync(() => {
    const row = { idEnfermedad: 1, nombreEnfermedad: 'X' } as any;
    spyOn<any>(component, 'confirmAction').and.returnValue(Promise.resolve(true));
    component.activeTab = 0;
    component.openEditItem(row as any);
    tick();
    expect(mockDialog.open).toHaveBeenCalled();
  }));
});
