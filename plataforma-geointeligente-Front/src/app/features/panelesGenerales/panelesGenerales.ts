import { Component, inject, OnInit, Provider, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

import {
  DashboardService,
  IndicadoresTotalesDto,
  TendenciaAnualDto,
  MapaEstadoDto,
  GraficaEdadDto,
  GraficaInstitucionDto,
  GraficaEstratoDto,
  GraficaSubgrupoDto,
  GraficaDiasEstanciaDto,
} from '../../core/services/dashboard.service';
import { AlarmService } from '../../core/components/Alarms';

import { AppliedFilters, toFilterParams } from './models/panelesGeneralesModels';
import { PanelExportService } from './services/panel-export.service';

// Sub-components
import { FiltrosPanelComponent } from './components/filtrosPanel/filtrosPanel';
import { MetricasClaveComponent } from './components/metricasClave/metricasClave';
import { GraficasTabComponent } from './components/graficasTabla/graficasTabla';
import { MapaEpidemiologicoComponent } from './components/mapaEpidemiologico/mapaEpidemiologico';
import { TablaDatosComponent } from './components/tablaDatos/tablaDatos';

const echartsConfigProvider: Provider = {
  provide: NGX_ECHARTS_CONFIG,
  useValue: {
    echarts: () => import('echarts'),
  },
};

@Component({
  selector: 'app-paneles-generales',
  standalone: true,
  imports: [
    MatIconModule,
    FiltrosPanelComponent,
    MetricasClaveComponent,
    GraficasTabComponent,
    MapaEpidemiologicoComponent,
    TablaDatosComponent,
  ],
  providers: [echartsConfigProvider, PanelExportService],
  templateUrl: './panelesGenerales.html',
  styleUrl: './panelesGenerales.css',
})
export class PanelesGeneralesComponent implements OnInit {
  private alarms = inject(AlarmService);
  private dashboardService = inject(DashboardService);
  private panelExport = inject(PanelExportService);

  @ViewChild(FiltrosPanelComponent) filtrosPanel!: FiltrosPanelComponent;
  @ViewChild(GraficasTabComponent) graficasTab!: GraficasTabComponent;

  // ========== TAB STATE ==========
  activeSubTab: 'graficas' | 'mapa' | 'tabla' = 'graficas';

  // ========== LOADING ==========
  loading = false;

  // ========== FILTERS (received from child) ==========
  currentFilters: AppliedFilters | null = null;

  // ========== CHART DATA (new Dashboard endpoints) ==========
  indicadores: IndicadoresTotalesDto | null = null;
  tendenciaData: TendenciaAnualDto[] = [];
  mapaData: MapaEstadoDto[] = [];
  edadesData: GraficaEdadDto[] = [];
  institucionesData: GraficaInstitucionDto[] = [];
  estratosData: GraficaEstratoDto[] = [];
  subgruposData: GraficaSubgrupoDto[] = [];
  diasEstanciaData: GraficaDiasEstanciaDto[] = [];

  // ========== TABLE ==========
  tableFiltersKey = 0;

  // ========== FOOTER ==========
  lastUpdate = new Date().toLocaleString('es-MX');
  backendConnected = false;

  ngOnInit(): void {
    // Quick connectivity check
    this.dashboardService.getAniosDisponibles().subscribe({
      next: () => (this.backendConnected = true),
      error: () => (this.backendConnected = false),
    });
  }

  // ========== TAB MANAGEMENT ==========

  setActiveTab(tab: 'graficas' | 'mapa' | 'tabla'): void {
    this.activeSubTab = tab;
    setTimeout(() => {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch {}
    }, 200);
  }

  // ========== FILTERS APPLIED ==========

  onFiltersApplied(filters: AppliedFilters): void {
    this.currentFilters = filters;
    this.loadAllData(filters);
    this.tableFiltersKey++;
  }

  // ========== DATA LOADING (Dashboard API) ==========

  private loadAllData(f: AppliedFilters): void {
    const params = toFilterParams(f);

    this.loading = true;

    forkJoin({
      indicadores: this.dashboardService.getIndicadores(params),
      tendencia: this.dashboardService.getTendencia(params),
      mapa: this.dashboardService.getMapaEstados(params),
      edades: this.dashboardService.getGraficaEdades(params),
      instituciones: this.dashboardService.getGraficaInstituciones(params),
      estratos: this.dashboardService.getGraficaEstratos(params),
      subgrupos: this.dashboardService.getGraficaSubgrupos(params),
      diasEstancia: this.dashboardService.getGraficaDiasEstancia(params),
    }).subscribe({
      next: (res) => {
        this.indicadores = res.indicadores ?? null;
        this.tendenciaData = res.tendencia ?? [];
        this.mapaData = res.mapa ?? [];
        this.edadesData = res.edades ?? [];
        this.institucionesData = res.instituciones ?? [];
        this.estratosData = res.estratos ?? [];
        this.subgruposData = res.subgrupos ?? [];
        this.diasEstanciaData = res.diasEstancia ?? [];
      },
      error: (err) => {
        console.error('Error cargando datos del dashboard:', err);
        this.indicadores = null;
        this.tendenciaData = [];
        this.mapaData = [];
        this.edadesData = [];
        this.institucionesData = [];
        this.estratosData = [];
        this.subgruposData = [];
        this.diasEstanciaData = [];
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // ========== EXPORT ==========

  async onExportPDF(): Promise<void> {
    if (!this.currentFilters || this.loading) {
      this.alarms.showWarn('Aplica filtros y espera a que carguen los datos antes de exportar.');
      return;
    }

    this.alarms.showSuccess('Preparando exportación a PDF...');

    try {
      const chartImages = this.graficasTab?.getChartImages() ?? [];
      const catalogs = {
        categorias: this.filtrosPanel?.categorias ?? [],
        subcategorias: this.filtrosPanel?.subcategorias ?? [],
        estados: this.filtrosPanel?.estados ?? [],
        rangosEdad: this.filtrosPanel?.rangosEdad ?? [],
        sexos: this.filtrosPanel?.sexos ?? [],
        instituciones: this.filtrosPanel?.instituciones ?? [],
      };

      await this.panelExport.exportPDF({
        filters: this.currentFilters,
        indicadores: this.indicadores,
        mapaData: this.mapaData,
        chartImages,
        catalogs,
      });

      this.alarms.showSuccess('PDF generado correctamente.');
    } catch (err) {
      console.error('Error al generar el PDF:', err);
      this.alarms.showError('Error al generar el PDF.');
    }
  }
}
