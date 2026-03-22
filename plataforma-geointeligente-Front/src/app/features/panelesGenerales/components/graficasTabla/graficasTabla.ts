import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import {
  TendenciaAnualDto,
  GraficaEdadDto,
  GraficaInstitucionDto,
  GraficaEstratoDto,
  GraficaSubgrupoDto,
  GraficaDiasEstanciaDto,
  MapaEstadoDto,
} from '../../../../core/services/dashboard.service';
import { EchartsMapService } from '../../../../core/services/echarts-map.service';
import { OMS_CHART_PALETTE } from '../../../../core/constants/chart-palette';
import { STATE_ID_TO_NAME } from '../../../../core/constants/state-mapping';

@Component({
  selector: 'app-graficas-tab',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './graficasTabla.html',
  styleUrl: './graficasTabla.css',
})
export class GraficasTabComponent implements OnChanges {
  @Input() tendenciaData: TendenciaAnualDto[] = [];
  @Input() edadesData: GraficaEdadDto[] = [];
  @Input() institucionesData: GraficaInstitucionDto[] = [];
  @Input() estratosData: GraficaEstratoDto[] = [];
  @Input() subgruposData: GraficaSubgrupoDto[] = [];
  @Input() diasEstanciaData: GraficaDiasEstanciaDto[] = [];
  @Input() mapaData: MapaEstadoDto[] = [];
  @Input() loading = false;

  // ECharts options
  tendenciaOpts: EChartsOption = {};
  edadesOpts: EChartsOption = {};
  institucionesOpts: EChartsOption = {};
  estratosOpts: EChartsOption = {};
  subgruposOpts: EChartsOption = {};
  diasEstanciaOpts: EChartsOption = {};
  mapaBarOpts: EChartsOption = {};

  // Map/Bar toggle state
  mapView: 'map' | 'bar' = 'map';

  // Chart instances for PDF export
  private chartInstances = new Map<string, any>();

  private readonly palette = OMS_CHART_PALETTE;
  private echartsMap = inject(EchartsMapService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tendenciaData']) this.buildTendencia();
    if (changes['edadesData']) this.buildEdades();
    if (changes['institucionesData']) this.buildInstituciones();
    if (changes['estratosData']) this.buildEstratos();
    if (changes['subgruposData']) this.buildSubgrupos();
    if (changes['diasEstanciaData']) this.buildDiasEstancia();
    if (changes['mapaData']) this.buildMapaBar();
  }

  toggleMapView(): void {
    this.mapView = this.mapView === 'map' ? 'bar' : 'map';
    this.buildMapaBar();
  }

  onChartInit(name: string, ec: any): void {
    this.chartInstances.set(name, ec);
  }

  /** Returns data URLs of all rendered charts for PDF export */
  getChartImages(): { title: string; dataUrl: string }[] {
    const titles: Record<string, string> = {
      tendencia: 'Tendencia Anual',
      edades: 'Distribución por Edad',
      subgrupos: 'Subgrupos de Enfermedad',
      instituciones: 'Casos por Institución',
      estratos: 'Distribución por Estrato',
      diasEstancia: 'Días de Estancia Promedio',
      mapaBar: 'Casos por Entidad Federativa',
    };
    const images: { title: string; dataUrl: string }[] = [];
    for (const [name, instance] of this.chartInstances) {
      if (instance && typeof instance.getDataURL === 'function') {
        try {
          images.push({
            title: titles[name] ?? name,
            dataUrl: instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' }),
          });
        } catch { /* skip broken instance */ }
      }
    }
    return images;
  }

  // ──────── Tendencia Anual (Line + Bar) ────────

  private buildTendencia(): void {
    const d = this.tendenciaData;
    this.tendenciaOpts = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Casos', 'Defunciones', 'Tasa Incidencia'], bottom: 0 },
      grid: { left: 60, right: 60, top: 40, bottom: 60 },
      xAxis: { type: 'category', data: d.map(i => String(i.anio)) },
      yAxis: [
        { type: 'value', name: 'Conteo' },
        { type: 'value', name: 'Tasa x 100k', splitLine: { show: false } },
      ],
      series: [
        {
          name: 'Casos', type: 'bar', data: d.map(i => i.totalCasos),
          itemStyle: { color: this.palette[0] },
        },
        {
          name: 'Defunciones', type: 'bar', data: d.map(i => i.totalDefunciones),
          itemStyle: { color: this.palette[5] },
        },
        {
          name: 'Tasa Incidencia', type: 'line', yAxisIndex: 1,
          data: d.map(i => i.tasaIncidencia ?? 0),
          itemStyle: { color: this.palette[3] },
          smooth: true,
        },
      ],
    };
  }

  // ──────── Distribución por Edad (Horizontal Bar) ────────

  private buildEdades(): void {
    const d = this.edadesData;
    this.edadesOpts = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Casos', 'Defunciones'], bottom: 0 },
      grid: { left: 120, right: 40, top: 20, bottom: 50 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: d.map(i => i.rangoEdad), inverse: true },
      series: [
        {
          name: 'Casos', type: 'bar', data: d.map(i => i.totalCasos),
          itemStyle: { color: this.palette[0] },
        },
        {
          name: 'Defunciones', type: 'bar', data: d.map(i => i.totalDefunciones),
          itemStyle: { color: this.palette[5] },
        },
      ],
    };
  }

  // ──────── Instituciones (Bar) ────────

  private buildInstituciones(): void {
    const d = this.institucionesData;
    this.institucionesOpts = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 60, right: 40, top: 20, bottom: 80 },
      xAxis: {
        type: 'category',
        data: d.map(i => i.nombreInstitucion),
        axisLabel: { rotate: 30, fontSize: 10 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar', data: d.map((i, idx) => ({
            value: i.totalCasos,
            itemStyle: { color: this.palette[idx % this.palette.length] },
          })),
          label: { show: true, position: 'top', fontSize: 10 },
        },
      ],
    };
  }

  // ──────── Estratos (Strip / Stacked Bar) ────────

  private buildEstratos(): void {
    const d = this.estratosData;
    this.estratosOpts = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Casos', 'Defunciones'], bottom: 0 },
      grid: { left: 80, right: 40, top: 20, bottom: 50 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: d.map(i => i.estratoUnidad), inverse: true },
      series: [
        {
          name: 'Casos', type: 'bar', stack: 'total',
          data: d.map(i => i.totalCasos),
          itemStyle: { color: this.palette[0] },
        },
        {
          name: 'Defunciones', type: 'bar', stack: 'total',
          data: d.map(i => i.totalDefunciones),
          itemStyle: { color: this.palette[5] },
        },
      ],
    };
  }

  // ──────── Subgrupos (Pie) ────────

  private buildSubgrupos(): void {
    const d = this.subgruposData;
    this.subgruposOpts = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 10 } },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['50%', '45%'],
          data: d.map((i, idx) => ({
            name: `${i.codigoICD} - ${i.nombreEnfermedad}`,
            value: i.totalCasos,
            itemStyle: { color: this.palette[idx % this.palette.length] },
          })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
          },
          label: { show: false },
          labelLine: { show: false },
        },
      ],
    };
  }

  // ──────── Días Estancia (Scatter) ────────

  private buildDiasEstancia(): void {
    const d = this.diasEstanciaData;
    this.diasEstanciaOpts = {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const dt = d[p.dataIndex];
          return `${dt?.rangoEdad}<br/>Promedio: ${dt?.promedioDiasEstancia?.toFixed(1)} días<br/>Casos: ${dt?.totalCasos}`;
        },
      },
      grid: { left: 60, right: 40, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: d.map(i => i.rangoEdad), name: 'Rango Edad' },
      yAxis: { type: 'value', name: 'Días Promedio' },
      series: [
        {
          type: 'scatter',
          data: d.map(i => i.promedioDiasEstancia),
          symbolSize: (val: number) => Math.max(10, Math.min(val * 3, 50)),
          itemStyle: { color: this.palette[4] },
        },
      ],
    };
  }

  // ──────── Mapa/Bar (México map ↔ bar chart toggle) ────────

  private buildMapaBar(): void {
    const d = this.mapaData;
    if (!d.length) return;

    if (this.mapView === 'bar') {
      const sorted = [...d].sort((a, b) => b.casos - a.casos).slice(0, 15);
      this.mapaBarOpts = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            const item = sorted[p.dataIndex];
            const displayName = item ? (STATE_ID_TO_NAME[item.idEstado] ?? item.nombreEstado) : '';
            return `<strong>${displayName}</strong><br/>
                    Casos: ${item?.casos}<br/>
                    Defunciones: ${item?.defunciones}<br/>
                    Tasa: ${item?.tasaIncidencia?.toFixed(2) ?? 'N/A'}`;
          },
        },
        grid: { left: 140, right: 40, top: 20, bottom: 20 },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: sorted.map(i => STATE_ID_TO_NAME[i.idEstado] ?? i.nombreEstado),
          inverse: true,
          axisLabel: { fontSize: 11 },
        },
        series: [{
          type: 'bar',
          data: sorted.map((i, idx) => ({
            value: i.casos,
            itemStyle: { color: this.palette[idx % this.palette.length] },
          })),
          label: { show: true, position: 'right', fontSize: 10 },
        }],
      };
    } else {
      // Map view — lazy register
      this.ensureMapRegistered().then(() => {
        const max = Math.max(...d.map(i => i.casos), 1);
        this.mapaBarOpts = {
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              const row = d.find(i => (STATE_ID_TO_NAME[i.idEstado] ?? i.nombreEstado) === params.name);
              if (!row) return params.name;
              const displayName = STATE_ID_TO_NAME[row.idEstado] ?? row.nombreEstado;
              return `<strong>${displayName}</strong><br/>
                      Casos: ${row.casos}<br/>
                      Defunciones: ${row.defunciones}<br/>
                      Tasa Incidencia: ${row.tasaIncidencia?.toFixed(2) ?? 'N/A'}<br/>
                      Tasa Mortalidad: ${row.tasaMortalidad?.toFixed(2) ?? 'N/A'}`;
            },
          },
          visualMap: {
            min: 0,
            max: max,
            text: ['Alto', 'Bajo'],
            realtime: false,
            calculable: true,
            inRange: { color: ['#e0f2fe', '#0369a1', '#0A4DA6'] },
            left: 'left',
            bottom: 20,
          },
          series: [{
            type: 'map',
            map: 'Mexico',
            roam: true,
            emphasis: {
              label: { show: true, fontSize: 12 },
              itemStyle: { areaColor: '#fbbf24' },
            },
            data: d.map(i => ({ name: STATE_ID_TO_NAME[i.idEstado] ?? i.nombreEstado, value: i.casos })),
          }],
        };
      });
    }
  }

  private ensureMapRegistered(): Promise<void> {
    return this.echartsMap.ensureMexicoMapRegistered();
  }
}
