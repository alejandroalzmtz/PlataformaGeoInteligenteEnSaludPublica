import { MetricasClaveComponent } from './metricasClave';
import { IndicadoresTotalesDto } from '../../../../core/services/dashboard.service';

describe('MetricasClaveComponent', () => {
  let component: MetricasClaveComponent;

  beforeEach(() => {
    component = new MetricasClaveComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept indicadores input', () => {
    const indicadores: IndicadoresTotalesDto = {
      totalCasos: 100,
      totalDefunciones: 5,
      poblacionBase: 5000,
      tasaIncidencia: 200,
      tasaMortalidad: 10,
    } as any;

    component.indicadores = indicadores;
    expect(component.indicadores).toBe(indicadores);
  });
});
