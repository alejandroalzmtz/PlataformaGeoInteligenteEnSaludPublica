import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment.development';
import { Panel } from '../../../features/panelesGenerales/models/panelesGeneralesModels';

@Injectable({
  providedIn: 'root',
})
export class GraficasService {
  private baseUrl = environment.apiUrl || 'https://localhost:7011';

  constructor(private http: HttpClient) {}

  // Panels
  getPanels(): Observable<Panel[]> {
    return this.http.get<Panel[]>(`${this.baseUrl}/api/Panel`);
  }

  getPanelById(id: number): Observable<Panel> {
    return this.http.get<Panel>(`${this.baseUrl}/api/Panel/${id}`);
  }

  createPanel(dto: { nombrePanel: string; configuracion: string; usuarioCreador: number }): Observable<Panel> {
    return this.http.post<Panel>(`${this.baseUrl}/api/Panel`, dto);
  }

  updatePanel(id: number, dto: { idPanel: number; nombrePanel?: string; configuracion: string }): Observable<Panel> {
    return this.http.put<Panel>(`${this.baseUrl}/api/Panel/${id}`, dto);
  }

  deletePanel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Panel/${id}`);
  }

  validatePassword(idUsuario: number, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/api/User/ValidatePassword`, { idUsuario, password });
  }
}
