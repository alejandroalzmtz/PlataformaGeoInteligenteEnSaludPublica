// src/app/core/services/RegistroMedicoservice.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment.development';

export interface RegistroMedico {
  idRegistro: number;
  fechaIngreso: Date;
  fechaEgreso: Date;
  diasEstancia: number;
  idEstado: number;
  idMunicipio: number;
  idLoc: number;
  edad: number;
  idSexo: number;
  idDerechoHab: number;
  idServicioIngreso: number;
  idServicioEgreso: number;
  idProcedencia: number;
  idMotivoEgreso: number;
  idEnfermedad?: string | null;
  CLUES: string;

  // develop ya manejaba estos para soft-delete:
  Habilitado?: boolean | number | null;
  FechaEliminacion?: string | Date | null;
}

// DTOs
export type CreateRegistroMedico = Omit<RegistroMedico, 'idRegistro' | 'diasEstancia'>;
export type UpdateRegistroMedico = CreateRegistroMedico;

// Respuesta paginada del backend
export interface PaginatedResponse<T = any> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  filteredRecords: number;
  hasPrevious: boolean;
  hasNext: boolean;
  query: string | null;
  registros: T[];
}

// tipos para años (compat con lo que ya usaba develop)
type YearItemApi = {
  year: number;
  startId: number | null;
  endId: number | null;
  ids: number[];
  total: number;
};
type YearItemLegacy = {
  year: number;
  startId: number; // coercion a number para no romper código viejo
  endId: number;
  ids: number[];
  total: number;
};
type YearIds = {
  year: number;
  startId: number | null;
  endId: number | null;
  ids: number[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class RegistroMedicoService {
  private base = `${environment.apiUrl}/api/RegistroMed`;

  constructor(private http: HttpClient) {}

  // ============== EXISTENTE (develop) ==============

  getRegistros(): Observable<RegistroMedico[]> {
    return this.http.get<RegistroMedico[]>(`${this.base}/GetRegistros`);
  }

  /** Años; devolvemos startId/endId como number para no romper vistas viejas */
  getRegistroMedicoYears(includeIds = false): Observable<YearItemLegacy[]> {
    return this.http
      .get<YearItemApi[]>(`${this.base}/GetRegistroMedicoYears?includeIds=${includeIds}`)
      .pipe(
        map((arr) =>
          arr.map(
            (x) =>
              ({
                ...x,
                startId: x.startId ?? 0,
                endId: x.endId ?? 0,
              }) as YearItemLegacy,
          ),
        ),
      );
  }

  /** develop: rango optimizado (solo habilitados) */
  getRegistrosByRange(startId: number, endId: number): Observable<RegistroMedico[]> {
    return this.http.get<RegistroMedico[]>(
      `${this.base}/GetRegistrosByRange?startId=${startId}&endId=${endId}`,
    );
  }

  // Endpoint paginado genérico: /Paged?page=1&pageSize=50
  getPaged(page: number = 1, pageSize: number = 50): Observable<PaginatedResponse<RegistroMedico>> {
    return this.http.get<PaginatedResponse<RegistroMedico>>(
      `${this.base}/Paged?page=${page}&pageSize=${pageSize}`,
    );
  }

  // Endpoint búsqueda paginada: /Search?query=a&page=1&pageSize=50
  search(
    query: string | null = null,
    page: number = 1,
    pageSize: number = 50,
  ): Observable<PaginatedResponse<RegistroMedico>> {
    const q = query == null ? '' : encodeURIComponent(query);
    return this.http.get<PaginatedResponse<RegistroMedico>>(
      `${this.base}/Search?query=${q}&page=${page}&pageSize=${pageSize}`,
    );
  }

  registerRegistroMedico(registro: CreateRegistroMedico): Observable<RegistroMedico> {
    return this.http.post<RegistroMedico>(`${this.base}/RegisterRegistroMedico`, registro);
  }

  updateRegistro(id: number, registro: UpdateRegistroMedico): Observable<RegistroMedico> {
    return this.http.put<RegistroMedico>(`${this.base}/Update/${id}`, registro);
  }

  deleteRegistro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/Delete/${id}`);
  }

  /** develop: obtener deshabilitados (soft deleted) */
  getRegistrosDeshabilitados(): Observable<RegistroMedico[]> {
    return this.http.get<RegistroMedico[]>(`${this.base}/GetDeshabilitados`);
  }

  /** develop: revertir soft delete */
  revertirEliminacion(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/Revertir/${id}`, {});
  }

  // ============== NUEVO (C50 – tu rama) ==============

  /** IDs del año filtrados por diagnóstico (C50 por default). Backend: GetRegistroMedicoYear?year=YYYY&enfermedadCode=C50 */
  getRegistroMedicoYear(year: number, enfermedadCode: string = 'C50'): Observable<YearIds> {
    let params = new HttpParams().set('year', String(year));
    if (enfermedadCode) params = params.set('enfermedadCode', enfermedadCode);
    return this.http.get<YearIds>(`${this.base}/GetRegistroMedicoYear`, { params });
  }

  /** Detalle por lista de IDs (en slices de 30). Backend: GET /GetByIds?ids=1,2,3 */
  /** Detalle por lista de IDs (en slices de 30). Backend: GET /GetByIds?ids=1,2,3 */
  getRegistrosByIds(ids: number[]): Observable<RegistroMedico[]> {
    const params = new HttpParams().set('ids', ids.join(','));

    // Pedimos como any[] para poder normalizar y luego casteamos al tipo correcto
    return this.http.get<any[]>(`${this.base}/GetByIds`, { params }).pipe(
      map(
        (rows) =>
          rows.map((r) => ({
            ...r,
            // Si vienen como string, conviértelas; si ya son Date, se quedan.
            // Importante: NO devolvemos null para no romper el tipo `Date`.
            fechaIngreso: r.fechaIngreso ? new Date(r.fechaIngreso) : r.fechaIngreso,
            fechaEgreso: r.fechaEgreso ? new Date(r.fechaEgreso) : r.fechaEgreso,
          })) as RegistroMedico[],
      ),
    );
  }
  /** Elimina temporalmente (soft-delete) un registro médico */
  eliminacionTemporal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/Delete/${id}`);
  }

  // ============== MASIVO (Recuperación Temporal) ==============

  /** Recuperar varios (soft delete -> habilitado) */
  revertirMasivo(ids: number[]): Observable<{
    success: boolean;
    requested: number;
    updated: number;
    notFound: number[];
  }> {
    return this.http.put<{
      success: boolean;
      requested: number;
      updated: number;
      notFound: number[];
    }>(`${this.base}/RevertirMasivo`, { ids });
  }

  /** Eliminar definitivamente varios */
  deleteMasivo(ids: number[]): Observable<{
    success: boolean;
    requested: number;
    deleted: number;
    notFound: number[];
  }> {
    return this.http.post<{
      success: boolean;
      requested: number;
      deleted: number;
      notFound: number[];
    }>(`${this.base}/DeleteMasivo`, { ids });
  }
}
