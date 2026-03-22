import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment.development';
import { PrevalenceResponse, PrevalenceMapData, ColorClassification } from '../models/prevalence.interface';

@Injectable({ providedIn: 'root' })
export class PrevalenceService {
  private baseUrl = environment.apiUrl + '/api/Prevalence';

  constructor(private http: HttpClient) {}

  // Obtener datos de prevalencia por estado
  getPrevalenceByState(year?: number, period?: string): Observable<PrevalenceResponse> {
    let params = '';
    if (year) params += `?year=${year}`;
    if (period) params += params ? `&period=${period}` : `?period=${period}`;
    
    return this.http.get<PrevalenceResponse>(`${this.baseUrl}/by-state${params}`);
  }

  // Mock temporal mientras implementas el backend
  getMockPrevalenceData(): Observable<PrevalenceResponse> {
    const mockData: PrevalenceResponse = {
      indicator: 'prevalencia_mock',
      year: 2024,
      multiplier: 10000, // por cada 10,000 habitantes
      data: [
        { idEstado: 1, nombreEstado: 'Aguascalientes', casosExistentes: 150, poblacionTotal: 1425607, prevalencia: 10.52 },
        { idEstado: 2, nombreEstado: 'Baja California', casosExistentes: 450, poblacionTotal: 3769020, prevalencia: 11.94 },
        { idEstado: 3, nombreEstado: 'Baja California Sur', casosExistentes: 85, poblacionTotal: 798447, prevalencia: 10.64 },
        { idEstado: 5, nombreEstado: 'Coahuila', casosExistentes: 320, poblacionTotal: 3146771, prevalencia: 10.17 },
        { idEstado: 8, nombreEstado: 'Chihuahua', casosExistentes: 520, poblacionTotal: 3741869, prevalencia: 13.90 },
        { idEstado: 15, nombreEstado: 'México', casosExistentes: 1850, poblacionTotal: 16992418, prevalencia: 10.89 },
        { idEstado: 19, nombreEstado: 'Nuevo León', casosExistentes: 680, poblacionTotal: 5784442, prevalencia: 11.75 },
        { idEstado: 21, nombreEstado: 'Puebla', casosExistentes: 720, poblacionTotal: 6583278, prevalencia: 10.94 },
        { idEstado: 24, nombreEstado: 'San Luis Potosí', casosExistentes: 890, poblacionTotal: 2822255, prevalencia: 31.54 }, // Valor alto para prueba
        { idEstado: 26, nombreEstado: 'Sonora', casosExistentes: 280, poblacionTotal: 2944840, prevalencia: 9.51 },
        { idEstado: 31, nombreEstado: 'Yucatán', casosExistentes: 95, poblacionTotal: 2320898, prevalencia: 4.09 }, // Valor bajo para prueba
      ],
      generatedAt: new Date().toISOString(),
      summary: {
        totalStates: 11,
        minPrevalence: 4.09,
        maxPrevalence: 31.54,
        avgPrevalence: 12.35
      }
    };

    return of(mockData);
  }

  // Clasificar datos en rangos de color
  classifyPrevalenceData(data: PrevalenceResponse, classes: number = 5): Observable<PrevalenceMapData[]> {
    return of(data).pipe(
      map(response => {
        const values = response.data.map(d => d.prevalencia).sort((a, b) => a - b);
        
        // Generar breaks usando quantiles simples
        const breaks: number[] = [];
        const colors = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15']; // ColorBrewer Reds
        
        for (let i = 1; i < classes; i++) {
          const index = Math.floor((i / classes) * values.length);
          breaks.push(values[index]);
        }
        breaks.push(values[values.length - 1]); // Máximo

        // Asignar color a cada estado
        const classifiedData: PrevalenceMapData[] = response.data.map(state => {
          let colorClass = 0;
          for (let i = 0; i < breaks.length; i++) {
            if (state.prevalencia <= breaks[i]) {
              colorClass = i;
              break;
            }
          }

          return {
            ...state,
            colorClass,
            color: colors[colorClass] || colors[colors.length - 1]
          };
        });

        return classifiedData;
      })
    );
  }
}