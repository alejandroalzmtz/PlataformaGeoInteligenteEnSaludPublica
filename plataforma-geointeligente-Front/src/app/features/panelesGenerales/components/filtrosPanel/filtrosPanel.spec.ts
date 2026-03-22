import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FiltrosPanelComponent } from './filtrosPanel';
import { AlarmService } from '../../../../core/components/Alarms/alarm.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { GraficasService } from '../../../../core/services/Graficas/graficas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

describe('FiltrosPanelComponent', () => {
  let component: FiltrosPanelComponent;
  let fixture: ComponentFixture<FiltrosPanelComponent>;

  const mockAlarm = jasmine.createSpyObj('AlarmService', ['showWarn', 'showSuccess', 'showError']);
  const mockDashboard = jasmine.createSpyObj('DashboardService', ['getAniosDisponibles', 'getCategoriasEnfermedad', 'getEstados', 'getRangosEdad', 'getSexos', 'getInstituciones', 'getEstratos', 'getSubcategoriasEnfermedad']);
  const mockGraficas = jasmine.createSpyObj('GraficasService', ['getPanels']);
  const mockAuth = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

  beforeEach(async () => {
    mockAuth.getCurrentUserId.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [],
      providers: [
        { provide: AlarmService, useValue: mockAlarm },
        { provide: DashboardService, useValue: mockDashboard },
        { provide: GraficasService, useValue: mockGraficas },
        { provide: AuthService, useValue: mockAuth },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('geoStateName returns nombreEstado when mapping absent', () => {
    const estado = { idEstado: 9999, nombreEstado: 'X' } as any;
    // STATE_ID_TO_NAME likely has no 9999 mapping; function should return nombreEstado
    expect(component.geoStateName(estado)).toBe('X');
  });

  it('clearFilters resets selected filters and sets default years when available', () => {
    component.aniosDisponibles = [2000, 2001, 2002];
    component.selectedAnioInicio = 2001;
    component.selectedAnioFin = 2002;
    component.selectedCodigoGrupo = 'A';
    component.selectedCodigoICD = 'A01';

    component.clearFilters();

    expect(component.selectedCodigoGrupo).toBeNull();
    expect(component.selectedCodigoICD).toBeNull();
    expect(component.selectedAnioInicio).toBe(2000);
    expect(component.selectedAnioFin).toBe(2002);
  });

  it('applyFilters warns when years are missing', () => {
    component.selectedAnioInicio = null;
    component.selectedAnioFin = null;
    component.applyFilters();
    expect(mockAlarm.showWarn).toHaveBeenCalled();
  });

  it('applyFilters warns when categoria typed but not selected', () => {
    component.selectedAnioInicio = 2000;
    component.selectedAnioFin = 2001;
    component.categoriaCtrl.setValue('typed');
    component.selectedCodigoGrupo = null;
    const emitted: any[] = [];
    component.filtersApplied.subscribe(f => emitted.push(f));
    component.applyFilters();
    expect(component.categoriaInvalid).toBeTrue();
    expect(mockAlarm.showWarn).toHaveBeenCalled();
    expect(emitted.length).toBe(0);
  });

  it('applyFilters emits filters when valid', () => {
    component.selectedAnioInicio = 2000;
    component.selectedAnioFin = 2001;
    component.selectedCodigoGrupo = 'G1';
    component.categoriaCtrl.setValue({ codigoGrupo: 'G1', nombreEnfermedad: 'X' } as any);

    const emitted: any[] = [];
    component.filtersApplied.subscribe(f => emitted.push(f));

    component.applyFilters();

    expect(emitted.length).toBe(1);
    const f = emitted[0];
    expect(f.anioInicio).toBe(2000);
    expect(f.anioFin).toBe(2001);
    expect(mockAlarm.showSuccess).toHaveBeenCalled();
  });
});
