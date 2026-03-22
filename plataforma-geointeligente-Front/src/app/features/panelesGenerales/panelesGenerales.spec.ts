import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

import { PanelesGeneralesComponent } from './panelesGenerales';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlarmService } from '../../core/components/Alarms';
import { PanelExportService } from './services/panel-export.service';
import { AuthService } from '../../core/services/auth.service';
import { ExportService } from '../../core/services/export.services';
import * as echartsMapModule from '../../core/services/echarts-map.service';
import { GraficasService } from '../../core/services/Graficas/graficas.service';

describe('PanelesGeneralesComponent', () => {
  let component: PanelesGeneralesComponent;
  let fixture: ComponentFixture<PanelesGeneralesComponent>;
  let mockDashboard: jasmine.SpyObj<DashboardService>;
  let mockAlarm: jasmine.SpyObj<AlarmService>;
  let mockPanelExport: jasmine.SpyObj<PanelExportService>;
  let mockEchartsMap: jasmine.SpyObj<any>;
  let mockGraficas: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockDashboard = jasmine.createSpyObj('DashboardService', [
      'getAniosDisponibles', 'getIndicadores', 'getTendencia', 'getMapaEstados',
      'getGraficaEdades', 'getGraficaInstituciones', 'getGraficaEstratos', 'getGraficaSubgrupos', 'getGraficaDiasEstancia'
    ]);

    mockAlarm = jasmine.createSpyObj('AlarmService', ['showWarn', 'showSuccess', 'showError']);
    mockPanelExport = jasmine.createSpyObj('PanelExportService', ['exportPDF']);
    mockEchartsMap = jasmine.createSpyObj('EchartsMapService', ['ensureMexicoMapRegistered']);
    mockGraficas = jasmine.createSpyObj('GraficasService', ['getPanels']);

    // Default mock implementations
    mockDashboard.getAniosDisponibles.and.returnValue(of([{ anio: 2020 }] as any));
    mockDashboard.getIndicadores.and.returnValue(of({} as any));
    mockDashboard.getTendencia.and.returnValue(of([] as any));
    mockDashboard.getMapaEstados.and.returnValue(of([] as any));
    mockDashboard.getGraficaEdades.and.returnValue(of([] as any));
    mockDashboard.getGraficaInstituciones.and.returnValue(of([] as any));
    mockDashboard.getGraficaEstratos.and.returnValue(of([] as any));
    mockDashboard.getGraficaSubgrupos.and.returnValue(of([] as any));
    mockDashboard.getGraficaDiasEstancia.and.returnValue(of([] as any));

    mockPanelExport.exportPDF.and.returnValue(Promise.resolve());
    mockEchartsMap.ensureMexicoMapRegistered.and.returnValue(Promise.resolve());
    mockGraficas.getPanels.and.returnValue(of([] as any));

    await TestBed.configureTestingModule({
      imports: [PanelesGeneralesComponent],
      providers: [
        { provide: DashboardService, useValue: mockDashboard },
        { provide: AlarmService, useValue: mockAlarm },
        { provide: PanelExportService, useValue: mockPanelExport },
        // Prevent real ExportService -> LogoService -> _HttpClient chain from being created
        { provide: ExportService, useValue: { exportDashboardPDF: async () => Promise.resolve() } },
        { provide: (echartsMapModule as any).EchartsMapService, useValue: mockEchartsMap },
        { provide: GraficasService, useValue: mockGraficas },
        { provide: AuthService, useValue: { getCurrentUserId: () => 0 } },
        { provide: NGX_ECHARTS_CONFIG, useValue: { echarts: () => Promise.resolve({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelesGeneralesComponent);
    component = fixture.componentInstance;
    // Ensure component's injected PanelExportService (component-level provider) uses our mock
    (component as any).panelExport = mockPanelExport;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets backendConnected true when dashboard responds', () => {
    // ngOnInit is called by Angular when detectChanges runs; call explicitly
    component.ngOnInit();
    expect(mockDashboard.getAniosDisponibles).toHaveBeenCalled();
    // Because mock returns a value, backendConnected should be true
    expect(component.backendConnected).toBeTrue();
  });

  it('setActiveTab updates tab and dispatches resize event', (done) => {
    spyOn(window, 'dispatchEvent').and.callFake(() => {
      done();
      return true;
    });

    component.setActiveTab('mapa');
    expect(component.activeSubTab).toBe('mapa');
  });

  it('onFiltersApplied loads data and increments tableFiltersKey', () => {
    const filters = {} as any;
    const before = component.tableFiltersKey;
    component.onFiltersApplied(filters);
    expect(mockDashboard.getIndicadores).toHaveBeenCalled();
    expect(component.indicadores).toBeDefined();
    expect(component.tableFiltersKey).toBe(before + 1);
    expect(component.loading).toBeFalse();
  });

  it('onExportPDF warns when filters not applied or loading', async () => {
    component.currentFilters = null;
    component.loading = false;
    await component.onExportPDF();
    expect(mockAlarm.showWarn).toHaveBeenCalled();
  });

  it('onExportPDF calls panelExport when ready', async () => {
    component.currentFilters = {} as any;
    component.loading = false;
    // stub child references used in export
    (component as any).graficasTab = { getChartImages: () => [] };
    (component as any).filtrosPanel = { categorias: [], subcategorias: [], estados: [], rangosEdad: [], sexos: [], instituciones: [] };

    await component.onExportPDF();

    expect(mockPanelExport.exportPDF).toHaveBeenCalled();
    expect(mockAlarm.showSuccess).toHaveBeenCalled();
  });
});
