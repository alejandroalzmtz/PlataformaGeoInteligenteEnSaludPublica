import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { MapaEstadoDto } from '../../../../core/services/dashboard.service';
import { EchartsMapService } from '../../../../core/services/echarts-map.service';
import { AppliedFilters } from '../../models/panelesGeneralesModels';
import { STATE_ID_TO_NAME } from '../../../../core/constants/state-mapping';

@Component({
  selector: 'app-mapa-epidemiologico',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, NgxEchartsDirective],
  templateUrl: './mapaEpidemiologico.html',
  styleUrls: ['./mapaEpidemiologico.css'],
})
export class MapaEpidemiologicoComponent implements OnChanges {
  @Input() active = false;
  @Input() filters: AppliedFilters | null = null;
  @Input() mapaData: MapaEstadoDto[] = [];

  currentIndicator: 'incidencia' | 'mortalidad' | 'casos' = 'casos';
  mapOpts: EChartsOption = {};
  isLoading = false;

  // State detail panel
  selectedState: MapaEstadoDto | null = null;

  private echartsMap = inject(EchartsMapService);

  /** Devuelve el nombre del estado compatible con el GeoJSON (mx.json) */
  private geoName(item: MapaEstadoDto): string {
    return STATE_ID_TO_NAME[item.idEstado] ?? item.nombreEstado;
  }

  /** Busca un MapaEstadoDto por el nombre GeoJSON que devuelve echarts */
  private findByGeoName(name: string): MapaEstadoDto | undefined {
    return this.mapaData.find(i => this.geoName(i) === name);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapaData'] || changes['active']) {
      if (this.active && this.mapaData.length) {
        this.buildMap();
      }
    }
  }

  setIndicator(ind: 'incidencia' | 'mortalidad' | 'casos'): void {
    this.currentIndicator = ind;
    this.buildMap();
  }

  closeStateDetail(): void {
    this.selectedState = null;
  }

  private async buildMap(): Promise<void> {
    if (!this.mapaData.length) return;
    this.isLoading = true;

    await this.ensureMapRegistered();

    const d = this.mapaData;
    const values = d.map(i => this.getValue(i));
    const max = Math.max(...values, 1);

    const indicatorLabel =
      this.currentIndicator === 'casos' ? 'Casos' :
      this.currentIndicator === 'incidencia' ? 'Tasa Incidencia' : 'Tasa Mortalidad';

    this.mapOpts = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const row = this.findByGeoName(params.name);
          if (!row) return params.name;
          const displayName = this.geoName(row);
          return `<strong>${displayName}</strong><br/>
                  Casos: ${row.casos.toLocaleString()}<br/>
                  Defunciones: ${row.defunciones.toLocaleString()}<br/>
                  Tasa Incidencia: ${row.tasaIncidencia?.toFixed(2) ?? 'N/A'}<br/>
                  Tasa Mortalidad: ${row.tasaMortalidad?.toFixed(2) ?? 'N/A'}<br/>
                  Población: ${row.poblacion?.toLocaleString() ?? 'N/A'}`;
        },
      },
      visualMap: {
        min: 0,
        max: max,
        text: ['Alto', 'Bajo'],
        realtime: false,
        calculable: true,
        inRange: {
          color: this.currentIndicator === 'mortalidad'
            ? ['#fee2e2', '#ef4444', '#991b1b']
            : ['#e0f2fe', '#0369a1', '#0A4DA6'],
        },
        left: 'left',
        bottom: 20,
        textStyle: { fontSize: 12 },
      },
      series: [{
        type: 'map',
        map: 'Mexico',
        roam: true,
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 'bold' },
          itemStyle: { areaColor: '#fbbf24' },
        },
        label: { show: false },
        data: d.map(i => ({
          name: this.geoName(i),
          value: this.getValue(i),
        })),
        select: {
          itemStyle: { areaColor: '#fbbf24', borderColor: '#0A4DA6', borderWidth: 2 },
        },
      }],
    };

    this.isLoading = false;
  }

  onChartClick(event: any): void {
    if (event.name) {
      this.selectedState = this.findByGeoName(event.name) ?? null;
    }
  }

  private getValue(item: MapaEstadoDto): number {
    switch (this.currentIndicator) {
      case 'incidencia': return item.tasaIncidencia ?? 0;
      case 'mortalidad': return item.tasaMortalidad ?? 0;
      default: return item.casos;
    }
  }

  private ensureMapRegistered(): Promise<void> {
    return this.echartsMap.ensureMexicoMapRegistered();
  }
}
