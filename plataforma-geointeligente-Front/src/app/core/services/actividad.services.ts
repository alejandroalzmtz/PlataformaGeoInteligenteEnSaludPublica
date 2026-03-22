import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

// Modelo de actividad
export interface Actividad {
  idActividad?: number;
  idUsuario: number;
  fechaInicio: string;    // coincide con DTO
  fechaFin: string;       // coincide con DTO
  fechaActividad: string;
  hora: string;
  descripcionAccion?: string;
}


@Injectable({ providedIn: 'root' })
export class ActividadService {
  private baseUrl = `${environment.apiUrl}/api/ActividadUsuario`;

  constructor(private http: HttpClient) {}

  // Obtener todas las actividades
  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.baseUrl}/GetActividades`);
  }

  // Obtener actividades por usuario
  getActividadesPorUsuario(idUsuario?: number): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.baseUrl}/GetActividadesUsuario/${idUsuario}`);
  }
  // Registrar nueva actividad
  addActividad(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(`${this.baseUrl}/RegisterActividadUsuario`, actividad);
  }
}
