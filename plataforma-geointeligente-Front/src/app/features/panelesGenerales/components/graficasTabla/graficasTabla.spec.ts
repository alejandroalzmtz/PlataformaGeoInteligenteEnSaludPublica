import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

import { GraficasTabComponent } from './graficasTabla';
import { EchartsMapService } from '../../../../core/services/echarts-map.service';
import {
  TendenciaAnualDto,
  GraficaEdadDto,
  GraficaInstitucionDto,
  GraficaEstratoDto,
  GraficaSubgrupoDto,
  GraficaDiasEstanciaDto,
  MapaEstadoDto,
} from '../../../../core/services/dashboard.service';

describe('GraficasTabComponent', () => {
  let component: GraficasTabComponent;
  let fixture: ComponentFixture<GraficasTabComponent>;
  let mockEchartsMap: jasmine.SpyObj<EchartsMapService>;

  const tendenciaData: TendenciaAnualDto[] = [
    { anio: 2020, totalCasos: 10, totalDefunciones: 1, tasaIncidencia: 5 } as any,
    { anio: 2021, totalCasos: 20, totalDefunciones: 2, tasaIncidencia: 10 } as any,
  ];

  const edadesData: GraficaEdadDto[] = [ { rangoEdad: '0-9', totalCasos: 5, totalDefunciones: 0 } as any ];
  const institucionesData: GraficaInstitucionDto[] = [ { nombreInstitucion: 'InstA', totalCasos: 7 } as any ];
  const estratosData: GraficaEstratoDto[] = [ { estratoUnidad: 'E1', totalCasos: 3, totalDefunciones: 0 } as any ];
  const subgruposData: GraficaSubgrupoDto[] = [ { codigoICD: 'A01', nombreEnfermedad: 'EnfA', totalCasos: 4 } as any ];
  const diasEstanciaData: GraficaDiasEstanciaDto[] = [ { rangoEdad: '0-9', promedioDiasEstancia: 2.5, totalCasos: 5 } as any ];
  const mapaData: MapaEstadoDto[] = [ { idEstado: 999, nombreEstado: 'EstadoX', casos: 12, defunciones: 1, tasaIncidencia: 120 } as any ];

  beforeEach(async () => {
    mockEchartsMap = jasmine.createSpyObj('EchartsMapService', ['ensureMexicoMapRegistered']);
    mockEchartsMap.ensureMexicoMapRegistered.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [GraficasTabComponent],
      providers: [
        { provide: EchartsMapService, useValue: mockEchartsMap },
        { provide: NGX_ECHARTS_CONFIG, useValue: { echarts: () => Promise.resolve({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficasTabComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges triggers build methods for incoming data', () => {
    component.tendenciaData = tendenciaData;
    component.edadesData = edadesData;
    component.institucionesData = institucionesData;
    component.estratosData = estratosData;
    component.subgruposData = subgruposData;
    component.diasEstanciaData = diasEstanciaData;
    component.mapaData = mapaData;

    // call ngOnChanges with changes
    component.ngOnChanges({
      tendenciaData: new SimpleChange(null, tendenciaData, true),
      edadesData: new SimpleChange(null, edadesData, true),
      institucionesData: new SimpleChange(null, institucionesData, true),
      estratosData: new SimpleChange(null, estratosData, true),
      subgruposData: new SimpleChange(null, subgruposData, true),
      diasEstanciaData: new SimpleChange(null, diasEstanciaData, true),
      mapaData: new SimpleChange(null, mapaData, true),
    } as any);

    // basic assertions that options were built
    expect((component.tendenciaOpts as any).xAxis?.data).toEqual(['2020', '2021']);
    expect((component.edadesOpts as any).yAxis?.data).toEqual(['0-9']);
    expect((component.institucionesOpts as any).xAxis?.data).toEqual(['InstA']);
    expect((component.estratosOpts as any).yAxis?.data).toEqual(['E1']);
    expect(((component.subgruposOpts as any).series?.[0]?.data?.[0]?.name)).toContain('A01');
    expect((component.diasEstanciaOpts as any).xAxis?.data).toEqual(['0-9']);
  });

  it('toggleMapView toggles view and rebuilds mapaBar', async () => {
    component.mapaData = mapaData;
    component.mapView = 'map';
    const spy = spyOn<any>(component, 'buildMapaBar').and.callThrough();
    component.toggleMapView();
    expect(component.mapView).toBe('bar');
    expect(spy).toHaveBeenCalled();
    component.toggleMapView();
    expect(component.mapView).toBe('map');
  });

  it('onChartInit stores chart instances and getChartImages returns their data URLs', () => {
    const fakeInstance = { getDataURL: () => 'data:image/png;base64,FAKE' } as any;
    component.onChartInit('tendencia', fakeInstance);
    const images = component.getChartImages();
    expect(images.length).toBeGreaterThan(0);
    expect(images.find(i => i.title === 'Tendencia Anual')?.dataUrl).toContain('data:image');
  });

  it('ensureMapRegistered is called when building map view', async () => {
    component.mapView = 'map';
    component.mapaData = mapaData;
    // call the private buildMapaBar via ngOnChanges
    await component.ngOnChanges({ mapaData: new SimpleChange(null, mapaData, true) } as any);
    expect(mockEchartsMap.ensureMexicoMapRegistered).toHaveBeenCalled();
  });
});
