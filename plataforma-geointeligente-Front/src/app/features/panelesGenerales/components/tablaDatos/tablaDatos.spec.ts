import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';

import { TablaDatosComponent } from './tablaDatos';
import { DashboardService, TablaDatosFilaDto } from '../../../../core/services/dashboard.service';

describe('TablaDatosComponent', () => {
  let component: TablaDatosComponent;
  let fixture: ComponentFixture<TablaDatosComponent>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;

  const sampleRows: TablaDatosFilaDto[] = [
    { idRegistro: 1, nombreEstado: 'EstadoA', nombreMunicipio: 'MunA', codigoICD: 'A01', nombreInstitucion: 'InstA', esDefuncion: 0 } as any,
    { idRegistro: 2, nombreEstado: 'EstadoB', nombreMunicipio: 'MunB', codigoICD: 'B02', nombreInstitucion: 'InstB', esDefuncion: 1 } as any,
  ];

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', ['getTabla']);
    mockDashboardService.getTabla.and.returnValue(of({ datos: sampleRows, totalRegistros: 2 }));

    await TestBed.configureTestingModule({
      imports: [TablaDatosComponent],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaDatosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadPage should call dashboardService.getTabla and populate registros', () => {
    component.filters = {} as any;
    component.loadPage();
    expect(mockDashboardService.getTabla).toHaveBeenCalled();
    expect(component.registros).toEqual(sampleRows);
    expect(component.totalRegistros).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('ngOnChanges with filtersKey should reset page and load', () => {
    component.filters = {} as any;
    component.page = 5;
    component.ngOnChanges({
      filtersKey: new SimpleChange(0, 1, false),
    } as any);
    expect(component.page).toBe(1);
    expect(mockDashboardService.getTabla).toHaveBeenCalled();
  });

  it('filtrados should filter by search', () => {
    component.registros = sampleRows;
    component.search = 'estadoa';
    let result = component.filtrados;
    expect(result.length).toBe(1);
    expect(result[0].idRegistro).toBe(1);

    component.search = 'B02';
    result = component.filtrados;
    expect(result.length).toBe(1);
    expect(result[0].idRegistro).toBe(2);
  });

  it('pagination next/prev should change page and call loadPage', () => {
    component.filters = {} as any;
    component.pageSize = 1;
    component.totalRegistros = 3;
    mockDashboardService.getTabla.calls.reset();
    component.page = 1;
    component.next();
    expect(component.page).toBe(2);
    expect(mockDashboardService.getTabla).toHaveBeenCalledTimes(1);
    component.prev();
    expect(component.page).toBe(1);
    expect(mockDashboardService.getTabla).toHaveBeenCalledTimes(2);
  });
});
