import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

import { MapaEpidemiologicoComponent } from './mapaEpidemiologico';
import { EchartsMapService } from '../../../../core/services/echarts-map.service';
import { MapaEstadoDto } from '../../../../core/services/dashboard.service';

describe('MapaEpidemiologicoComponent', () => {
  let component: MapaEpidemiologicoComponent;
  let fixture: ComponentFixture<MapaEpidemiologicoComponent>;
  let mockEchartsMap: jasmine.SpyObj<EchartsMapService>;

  const sampleData: MapaEstadoDto[] = [
    // use ids unlikely to be present in STATE_ID_TO_NAME to ensure geoName returns nombreEstado
    { idEstado: 999, nombreEstado: 'EstadoX', casos: 10, defunciones: 1, poblacion: 1000, tasaIncidencia: 1000, tasaMortalidad: 100 } as any,
    { idEstado: 1000, nombreEstado: 'EstadoY', casos: 5, defunciones: 0, poblacion: 500, tasaIncidencia: 1000, tasaMortalidad: 0 } as any,
  ];

  beforeEach(async () => {
    mockEchartsMap = jasmine.createSpyObj('EchartsMapService', ['ensureMexicoMapRegistered']);
    mockEchartsMap.ensureMexicoMapRegistered.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [MapaEpidemiologicoComponent],
      providers: [
        { provide: EchartsMapService, useValue: mockEchartsMap },
        { provide: NGX_ECHARTS_CONFIG, useValue: { echarts: () => Promise.resolve({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaEpidemiologicoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges should call buildMap when active and mapaData present', async () => {
    const spy = spyOn<any>(component, 'buildMap').and.callThrough();
    component.active = true;
    component.mapaData = sampleData;
    component.ngOnChanges({ mapaData: new SimpleChange(null, sampleData, true) } as any);
    expect(spy).toHaveBeenCalled();
  });

  it('setIndicator should change indicator and rebuild map', () => {
    const spy = spyOn<any>(component, 'buildMap');
    component.setIndicator('incidencia');
    expect(component.currentIndicator).toBe('incidencia');
    expect(spy).toHaveBeenCalled();
    component.setIndicator('mortalidad');
    expect(component.currentIndicator).toBe('mortalidad');
  });

  it('getValue returns proper value based on currentIndicator', () => {
    component.mapaData = sampleData;
    component.currentIndicator = 'casos';
    expect((component as any).getValue(sampleData[0])).toBe(10);
    component.currentIndicator = 'incidencia';
    expect((component as any).getValue(sampleData[0])).toBe(1000);
    component.currentIndicator = 'mortalidad';
    expect((component as any).getValue(sampleData[0])).toBe(100);
  });

  it('onChartClick sets selectedState when name matches', () => {
    component.mapaData = sampleData;
    component.onChartClick({ name: 'EstadoX' });
    expect(component.selectedState).toBeTruthy();
    expect(component.selectedState?.nombreEstado).toBe('EstadoX');
  });
});
