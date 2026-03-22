import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DashboardService,
  IndicadoresTotalesDto,
  MapaEstadoDto,
  TablaDatosFilaDto,
  CategoriaEnfermedadDto,
  SubcategoriaEnfermedadDto,
  EstadoActivoDto,
  RangoEdadFiltroDto,
  SexoFiltroDto,
  InstitucionFiltroDto,
} from '../../../core/services/dashboard.service';
import { ExportService } from '../../../core/services/export.services';
import { EchartsMapService } from '../../../core/services/echarts-map.service';
import { STATE_ID_TO_NAME } from '../../../core/constants/state-mapping';
import { AppliedFilters, toFilterParams } from '../models/panelesGeneralesModels';

export interface FilterCatalogs {
  categorias: CategoriaEnfermedadDto[];
  subcategorias: SubcategoriaEnfermedadDto[];
  estados: EstadoActivoDto[];
  rangosEdad: RangoEdadFiltroDto[];
  sexos: SexoFiltroDto[];
  instituciones: InstitucionFiltroDto[];
}

@Injectable()
export class PanelExportService {
  constructor(
    private dashboardService: DashboardService,
    private exportService: ExportService,
    private echartsMapService: EchartsMapService,
  ) {}

  async exportPDF(params: {
    filters: AppliedFilters;
    indicadores: IndicadoresTotalesDto | null;
    mapaData: MapaEstadoDto[];
    chartImages: { title: string; dataUrl: string }[];
    catalogs: FilterCatalogs;
  }): Promise<void> {
    const { filters, indicadores, mapaData, chartImages, catalogs } = params;

    const filterSummary = this.buildFilterSummary(filters, catalogs);
    const indicadoresSummary = this.buildIndicadoresSummary(indicadores);
    const mapImages = await this.renderMapImages(mapaData);

    const filterParams = toFilterParams(filters);
    let tableData: TablaDatosFilaDto[] = [];
    let totalRegistros = 0;
    try {
      const res = await firstValueFrom(
        this.dashboardService.getTabla(filterParams, 1, 1000),
      );
      tableData = res.datos ?? [];
      totalRegistros = res.totalRegistros ?? 0;
    } catch { /* table is optional */ }

    const tableColumns = [
      { key: 'idRegistro', label: 'ID' },
      { key: 'fechaIngreso', label: 'Fecha Ingreso' },
      { key: 'anio', label: 'Año' },
      { key: 'diasEstancia', label: 'Estancia' },
      { key: 'nombreEstado', label: 'Estado' },
      { key: 'nombreMunicipio', label: 'Municipio' },
      { key: 'edad', label: 'Edad' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'codigoGrupo', label: 'Grupo' },
      { key: 'codigoICD', label: 'CIE-10' },
      { key: 'nombreInstitucion', label: 'Institución' },
      { key: 'estratoUnidad', label: 'Estrato' },
      { key: 'idMotivoEgreso', label: 'Motivo Egreso' },
      { key: 'esDefuncion', label: 'Defunción' },
    ];

    const formattedTable = tableData.map(row => ({
      ...row,
      fechaIngreso: row.fechaIngreso
        ? new Date(row.fechaIngreso).toLocaleDateString('es-MX')
        : '',
      esDefuncion: row.esDefuncion === 1 ? 'Sí' : 'No',
    }));

    await this.exportService.exportDashboardPDF({
      filterSummary,
      indicadores: indicadoresSummary,
      chartImages,
      mapImages,
      tableData: formattedTable,
      tableColumns,
      totalRegistros,
    });
  }

  private buildFilterSummary(
    f: AppliedFilters,
    c: FilterCatalogs,
  ): { label: string; value: string }[] {
    const items: { label: string; value: string }[] = [];

    items.push({ label: 'Período', value: `${f.anioInicio} – ${f.anioFin}` });

    if (f.codigoGrupo) {
      const cat = c.categorias.find(x => x.codigoGrupo === f.codigoGrupo);
      items.push({
        label: 'Categoría',
        value: cat ? `${cat.codigoGrupo} – ${cat.nombreEnfermedad}` : f.codigoGrupo,
      });
    }

    if (f.codigoICD) {
      const sub = c.subcategorias.find(x => x.codigoICD === f.codigoICD);
      items.push({
        label: 'Subcategoría',
        value: sub ? `${sub.codigoICD} – ${sub.nombreEnfermedad}` : f.codigoICD,
      });
    }

    if (f.idEstado) {
      const est = c.estados.find(x => x.idEstado === f.idEstado);
      items.push({
        label: 'Estado',
        value: est ? (STATE_ID_TO_NAME[est.idEstado] ?? est.nombreEstado) : `ID ${f.idEstado}`,
      });
    }

    if (f.idRangoEdad) {
      const rango = c.rangosEdad.find(x => x.idRangoEdad === f.idRangoEdad);
      items.push({ label: 'Grupo Etario', value: rango?.etiquetaRango ?? `ID ${f.idRangoEdad}` });
    }

    if (f.idSexo) {
      const sexo = c.sexos.find(x => x.idSexo === f.idSexo);
      items.push({ label: 'Sexo', value: sexo?.descripcion ?? `ID ${f.idSexo}` });
    }

    if (f.claveInstitucion) {
      const inst = c.instituciones.find(x => x.claveInstitucion === f.claveInstitucion);
      items.push({ label: 'Institución', value: inst?.institucion ?? f.claveInstitucion });
    }

    if (f.estrato) {
      items.push({ label: 'Estrato', value: f.estrato });
    }

    if (f.panel) {
      items.push({ label: 'Panel', value: f.panel.nombrePanel });
    }

    return items;
  }

  private buildIndicadoresSummary(ind: IndicadoresTotalesDto | null): { label: string; value: string }[] {
    if (!ind) return [];
    return [
      { label: 'Total Casos', value: ind.totalCasos.toLocaleString() },
      { label: 'Defunciones', value: ind.totalDefunciones.toLocaleString() },
      { label: 'Población', value: ind.poblacionBase?.toLocaleString() ?? 'N/A' },
      { label: 'Tasa Incidencia', value: ind.tasaIncidencia?.toFixed(2) ?? 'N/A' },
      { label: 'Tasa Mortalidad', value: ind.tasaMortalidad?.toFixed(2) ?? 'N/A' },
    ];
  }

  async renderMapImages(mapaData: MapaEstadoDto[]): Promise<{ title: string; dataUrl: string }[]> {
    if (!mapaData.length) return [];

    await this.echartsMapService.ensureMexicoMapRegistered();
    const echarts = await import('echarts');

    const container = document.createElement('div');
    container.style.cssText =
      'width:900px;height:650px;position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(container);

    const chart = echarts.init(container);
    const images: { title: string; dataUrl: string }[] = [];

    const indicators = [
      { key: 'casos', title: 'Total de Casos', colors: ['#e0f2fe', '#0369a1', '#0A4DA6'] },
      { key: 'incidencia', title: 'Tasa de Incidencia', colors: ['#e0f2fe', '#0369a1', '#0A4DA6'] },
      { key: 'mortalidad', title: 'Tasa de Mortalidad', colors: ['#fee2e2', '#ef4444', '#991b1b'] },
    ];

    for (const ind of indicators) {
      const data = mapaData.map(item => ({
        name: STATE_ID_TO_NAME[item.idEstado] ?? item.nombreEstado,
        value:
          ind.key === 'incidencia'
            ? (item.tasaIncidencia ?? 0)
            : ind.key === 'mortalidad'
              ? (item.tasaMortalidad ?? 0)
              : item.casos,
      }));
      const max = Math.max(...data.map(d => d.value), 1);

      chart.setOption(
        {
          visualMap: {
            min: 0,
            max,
            text: ['Alto', 'Bajo'],
            realtime: false,
            calculable: false,
            inRange: { color: ind.colors },
            left: 'left',
            bottom: 20,
            textStyle: { fontSize: 11 },
          },
          series: [
            {
              type: 'map',
              map: 'Mexico',
              roam: false,
              label: { show: true, fontSize: 7 },
              emphasis: {
                label: { show: true, fontWeight: 'bold' },
                itemStyle: { areaColor: '#fbbf24' },
              },
              data,
            },
          ],
        },
        true,
      );

      await new Promise(resolve => setTimeout(resolve, 300));

      images.push({
        title: ind.title,
        dataUrl: chart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff',
        }),
      });
    }

    chart.dispose();
    document.body.removeChild(container);

    return images;
  }
}
