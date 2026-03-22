import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

export interface Enfermedad {
  codigoICD?: string;
  idEnfermedad?: string;
  nombreEnfermedad?: string;
  descripcion?: string;
}

export interface DerechoHab {
  idDerechoHab: number;
  descripcion: string;
}

export interface Estado {
  idEstado: number;
  nombreEstado: string;
}

export interface Localidad {
  idLoc: number;
  idLocalidad: number;
  idMpo: number;
  idEdo: number;
  nombreLocalidad: string;
}

export interface Municipio {
  idMunicipio: number;
  idMpo: number;
  nombreMunicipio: string;
  idEstado: number;
}

export interface MotivoEgreso {
  idMotivoEgreso: number;
  descripcion: string;
}

export interface ServicioMedico {
  idServicio: number;
  nombreServicio: string;
  descripcion: string;
}

// Backwards-compatible alias expected by some modules
export type Servicio = ServicioMedico;

export interface RangoEdad {
  id?: number;
  rangoInicial?: number;
  rangoFinal?: number;
  // backwards-compatible aliases
  descripcion?: string;
  desde?: number;
  hasta?: number;
}

export interface Procedencia {
  idProcedencia?: number;
  descripcion?: string;
}

export interface PoblacionEstado {
  id: number;
  estado: number;
  anio2000: number;
  anio2005: number;
  anio2010: number;
  anio2020: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private baseEnfermedad = `${environment.apiUrl}/api/Enfermedad`;
  private baseDerechoHab = `${environment.apiUrl}/api/DerechoHab`;
  private baseEstado = `${environment.apiUrl}/api/Estado`;
  private baseLocalidad = `${environment.apiUrl}/api/Localidad`;
  private baseMunicipio = `${environment.apiUrl}/api/Municipio`;
  private baseServicioMedico = `${environment.apiUrl}/api/ServicioMedico`;
  private baseMotivosE = `${environment.apiUrl}/api/MotivosE`;
  private baseRangoEdad = `${environment.apiUrl}/api/RangoEdad`;
  private baseProcedencia = `${environment.apiUrl}/api/Procedencia`;
  private basePoblacionEstado = `${environment.apiUrl}/api/PoblacionEstado`;

  private headers = new HttpHeaders({ Accept: 'application/json' });

  constructor(private http: HttpClient) {}

  /**
   * GET paginado: /api/Enfermedad/GetEnfermedades?pageNumber=1&pageSize=50
   */
  getEnfermedadesPaged(pageNumber: number = 1, pageSize: number = 50, search?: string | null): Observable<PagedResult<Enfermedad>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<Enfermedad>>(`${this.baseEnfermedad}/GetEnfermedades`, { headers: this.headers, params });
  }

  // Compatibility methods (previously in EnfermedadService)
  getAll(): Observable<Enfermedad[]> {
    return this.http.get<Enfermedad[]>(`${this.baseEnfermedad}/GetEnfermedades`, { headers: this.headers });
  }

  getPaged(pageNumber: number = 1, pageSize: number = 10, search?: string | null, prefix?: string | null) {
    // If prefix is provided, use it as a query parameter named 'prefix' (legacy callers)
    if (prefix != null && String(prefix).trim() !== '') {
      let params = new HttpParams()
        .set('pageNumber', String(pageNumber))
        .set('pageSize', String(pageSize))
        .set('prefix', String(prefix));
      if (search != null && String(search).trim() !== '') params = params.set('search', String(search));
      return this.http.get<PagedResult<Enfermedad>>(`${this.baseEnfermedad}/GetEnfermedades`, { headers: this.headers, params });
    }
    return this.getEnfermedadesPaged(pageNumber, pageSize, search);
  }

  getById(id: string): Observable<Enfermedad> {
    return this.http.get<Enfermedad>(`${this.baseEnfermedad}/GetEnfermedad/${encodeURIComponent(id)}`, { headers: this.headers });
  }

  create(payload: Partial<Enfermedad>): Observable<Enfermedad> {
    return this.http.post<Enfermedad>(`${this.baseEnfermedad}`, payload, { headers: this.headers });
  }

  update(id: string, payload: Partial<Enfermedad>): Observable<Enfermedad> {
    // Backend expects PUT /api/Enfermedad/UpdateEnfermedad/{id}
    return this.http.put<Enfermedad>(`${this.baseEnfermedad}/UpdateEnfermedad/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  deleteEnfermedad(id: string): Observable<void> {
    // Backend DELETE endpoint expects: /api/Enfermedad/DeleteEnfermedad/{id}
    return this.http.delete<void>(`${this.baseEnfermedad}/DeleteEnfermedad/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * Compatibility: getMunicipios without pagination (returns array)
   */
  getMunicipios(estadoId?: number): Observable<Municipio[]> {
    if (estadoId == null) {
      return new Observable<Municipio[]>((subscriber) => { subscriber.next([]); subscriber.complete(); });
    }
    const params = new HttpParams().set('idEstado', String(estadoId));
    return this.http.get<Municipio[]>(`${this.baseMunicipio}/GetMunicipios`, { headers: this.headers, params });
  }

  /**
   * Compatibility: getLocalidades alias (delegates to paged)
   */
  getLocalidades(pageNumber: number = 1, pageSize: number = 5, idEdo?: number | null, idMpo?: number | null) {
    return this.getLocalidadesPaged(pageNumber, pageSize, idEdo, idMpo);
  }

  /**
   * POST RegisterEnfermedad
   */
  registerEnfermedad(payload: Partial<Enfermedad>): Observable<Enfermedad> {
    return this.http.post<Enfermedad>(`${this.baseEnfermedad}/RegisterEnfermedad`, payload, { headers: this.headers });
  }



  deleteEnfermedadByCodigo(codigoICD: string): Observable<void> {
    return this.http.delete<void>(`${this.baseEnfermedad}/DeleteEnfermedad/${encodeURIComponent(String(codigoICD))}`, { headers: this.headers });
  }

  /**
   * GET paginado: /api/DerechoHab/GetDerechosHabPaged?pageNumber=1&pageSize=50
   */
  getDerechosHabPaged(pageNumber: number = 1, pageSize: number = 50, search?: string | null): Observable<PagedResult<DerechoHab>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<DerechoHab>>(`${this.baseDerechoHab}/GetDerechosHabPaged`, { headers: this.headers, params });
  }

  /**
   * Convenience: obtener derechos de habitación (no paginado)
   */
  getDerechoHabitacion(): Observable<DerechoHab[]> {
    return this.http.get<DerechoHab[]>(`${this.baseDerechoHab}`, { headers: this.headers });
  }

  /**
   * POST RegisterDerechoHab
   * payload example: { descripcion: '...' }
   */
  registerDerechoHab(payload: Partial<DerechoHab>): Observable<DerechoHab> {
    return this.http.post<DerechoHab>(`${this.baseDerechoHab}/RegisterDerechoHab`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateDerechoHab/{id}
   */
  updateDerechoHab(id: number, payload: Partial<DerechoHab>): Observable<DerechoHab> {
    return this.http.put<DerechoHab>(`${this.baseDerechoHab}/UpdateDerechoHab/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteDerechoHab/{id}
   */
  deleteDerechoHab(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseDerechoHab}/DeleteDerechoHab/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET paginado: /api/Estado/GetEstadosPaged?pageNumber=1&pageSize=50
   */
  getEstadosPaged(pageNumber: number = 1, pageSize: number = 50, search?: string | null): Observable<PagedResult<Estado>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<Estado>>(`${this.baseEstado}/GetEstadosPaged`, { headers: this.headers, params });
  }

  /**
   * Convenience: obtener todos los estados (no paginado)
   */
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseEstado}`, { headers: this.headers });
  }

  /**
   * POST RegisterEstado
   * payload example: { nombreEstado: '...' }
   */
  registerEstado(payload: Partial<Estado>): Observable<Estado> {
    return this.http.post<Estado>(`${this.baseEstado}/RegisterEstado`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateEstado/{id}
   */
  updateEstado(id: number, payload: Partial<Estado>): Observable<Estado> {
    return this.http.put<Estado>(`${this.baseEstado}/UpdateEstado/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteEstado/{id}
   */
  deleteEstado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseEstado}/DeleteEstado/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET paginado: /api/Localidad/GetLocalidadesPaged?pageNumber=1&pageSize=50&idEdo=...&idMpo=...
   */
  getLocalidadesPaged(pageNumber: number = 1, pageSize: number = 50, idEdo?: number | null, idMpo?: number | null, search?: string | null): Observable<PagedResult<Localidad>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (idEdo != null) params = params.set('idEdo', String(idEdo));
    if (idMpo != null) params = params.set('idMpo', String(idMpo));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<Localidad>>(`${this.baseLocalidad}/GetLocalidadesPaged`, { headers: this.headers, params });
  }

  /**
   * POST RegisterLocalidad
   * payload example: { idEdo, idMpo, nombreLocalidad }
   */
  registerLocalidad(payload: Partial<Localidad>): Observable<Localidad> {
    return this.http.post<Localidad>(`${this.baseLocalidad}/RegisterLocalidad`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateLocalidad/{id}
   */
  updateLocalidad(id: number, payload: Partial<Localidad>): Observable<Localidad> {
    return this.http.put<Localidad>(`${this.baseLocalidad}/UpdateLocalidad/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteLocalidad/{id}
   */
  deleteLocalidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseLocalidad}/DeleteLocalidad/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET paginado: /api/Municipio/GetMunicipiosPaged?pageNumber=1&pageSize=50&idEstado=0
   */
  getMunicipiosPaged(pageNumber: number = 1, pageSize: number = 50, idEstado?: number | null, search?: string | null): Observable<PagedResult<Municipio>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (idEstado != null) params = params.set('idEstado', String(idEstado));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<Municipio>>(`${this.baseMunicipio}/GetMunicipiosPaged`, { headers: this.headers, params });
  }

  /**
   * POST RegisterMunicipio
   * payload example: { idEdo, nombreMunicipio }
   */
  registerMunicipio(payload: Partial<Municipio>): Observable<Municipio> {
    return this.http.post<Municipio>(`${this.baseMunicipio}/RegisterMunicipio`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateMunicipio/{id}
   */
  updateMunicipio(id: number, payload: Partial<Municipio>): Observable<Municipio> {
    return this.http.put<Municipio>(`${this.baseMunicipio}/UpdateMunicipio/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteMunicipio/{id}
   */
  deleteMunicipio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseMunicipio}/DeleteMunicipio/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET paginado: /api/MotivosE/GetMotivosEgresoPaged?pageNumber=1&pageSize=50
   */
  getMotivosEgresoPaged(pageNumber: number = 1, pageSize: number = 50, search?: string | null): Observable<PagedResult<MotivoEgreso>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (search != null && String(search).trim() !== '') params = params.set('search', String(search));

    return this.http.get<PagedResult<MotivoEgreso>>(`${this.baseMotivosE}/GetMotivosEgresoPaged`, { headers: this.headers, params });
  }

  /**
   * Convenience: obtener motivos de egreso (no paginado)
   */
  getMotivosEgreso(): Observable<MotivoEgreso[]> {
    return this.http.get<MotivoEgreso[]>(`${this.baseMotivosE}`, { headers: this.headers });
  }

  /**
   * POST RegisterMotivoEgreso
   * payload example: { descripcion: '...' }
   */
  registerMotivoEgreso(payload: Partial<MotivoEgreso>): Observable<MotivoEgreso> {
    return this.http.post<MotivoEgreso>(`${this.baseMotivosE}/RegisterMotivoEgreso`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateMotivoEgreso/{id}
   */
  updateMotivoEgreso(id: number, payload: Partial<MotivoEgreso>): Observable<MotivoEgreso> {
    return this.http.put<MotivoEgreso>(`${this.baseMotivosE}/UpdateMotivoEgreso/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteMotivoEgreso/{id}
   */
  deleteMotivoEgreso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseMotivosE}/DeleteMotivoEgreso/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET: /api/ServicioMedico
   */
  getServiciosMedicos(search?: string | null): Observable<ServicioMedico[] | PagedResult<ServicioMedico>> {
    if (search != null && String(search).trim() !== '') {
      const params = new HttpParams().set('search', String(search));
      return this.http.get<ServicioMedico[] | PagedResult<ServicioMedico>>(`${this.baseServicioMedico}`, { headers: this.headers, params });
    }
    return this.http.get<ServicioMedico[]>(`${this.baseServicioMedico}`, { headers: this.headers });
  }

  /**
   * POST RegisterServicioMedico
   */
  registerServicioMedico(payload: Partial<ServicioMedico>): Observable<ServicioMedico> {
    return this.http.post<ServicioMedico>(`${this.baseServicioMedico}/RegisterServicioMedico`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateServicioMedico/{id}
   */
  updateServicioMedico(id: number, payload: Partial<ServicioMedico>): Observable<ServicioMedico> {
    return this.http.put<ServicioMedico>(`${this.baseServicioMedico}/UpdateServicioMedico/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteServicioMedico/{id}
   */
  deleteServicioMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseServicioMedico}/DeleteServicioMedico/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET: /api/RangoEdad/GetRangosEdad
   */
  getRangosEdad(): Observable<RangoEdad[]> {
    return this.http.get<RangoEdad[]>(`${this.baseRangoEdad}/GetRangosEdad`, { headers: this.headers });
  }

  /**
   * POST RegisterRangoEdad
   */
  registerRangoEdad(payload: Partial<RangoEdad>): Observable<RangoEdad> {
    return this.http.post<RangoEdad>(`${this.baseRangoEdad}/RegisterRangoEdad`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateRangoEdad
   * si la API espera id en la ruta, se incluye cuando se pasa `id`.
   */
  updateRangoEdad(id: number | null, payload: Partial<RangoEdad>): Observable<RangoEdad> {
    const url = id != null
      ? `${this.baseRangoEdad}/UpdateRangoEdad/${encodeURIComponent(String(id))}`
      : `${this.baseRangoEdad}/UpdateRangoEdad`;
    return this.http.put<RangoEdad>(url, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteRangoEdad/{id}
   */
  deleteRangoEdad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseRangoEdad}/DeleteRangoEdad/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET: /api/PoblacionEstado
   * devuelve arreglo de objetos PoblacionEstado
   */
  getPoblacionEstado(): Observable<PoblacionEstado[]> {
    return this.http.get<PoblacionEstado[]>(`${this.basePoblacionEstado}`, { headers: this.headers });
  }

  /**
   * GET: /api/PoblacionEstado/{id}
   * devuelve la población para un estado específico
   */
  getPoblacionEstadoById(id: number): Observable<PoblacionEstado> {
    return this.http.get<PoblacionEstado>(`${this.basePoblacionEstado}/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * POST RegisterPoblacionEstado
   */
  registerPoblacionEstado(payload: Partial<PoblacionEstado>): Observable<PoblacionEstado> {
    return this.http.post<PoblacionEstado>(`${this.basePoblacionEstado}/RegisterPoblacionEstado`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdatePoblacionEstado  (no pide id en la ruta)
   */
  updatePoblacionEstado(payload: Partial<PoblacionEstado>): Observable<PoblacionEstado> {
    return this.http.put<PoblacionEstado>(`${this.basePoblacionEstado}/UpdatePoblacionEstado`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeletePoblacionEstado/{id}
   */
  deletePoblacionEstado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.basePoblacionEstado}/DeletePoblacionEstado/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }

  /**
   * GET: /api/Procedencia
   */
  getProcedencias(): Observable<Procedencia[]> {
    return this.http.get<Procedencia[]>(`${this.baseProcedencia}`, { headers: this.headers });
  }

  /**
   * POST RegisterProcedencia
   */
  registerProcedencia(payload: Partial<Procedencia>): Observable<Procedencia> {
    return this.http.post<Procedencia>(`${this.baseProcedencia}/RegisterProcedencia`, payload, { headers: this.headers });
  }

  /**
   * PUT UpdateProcedencia/{id}
   */
  updateProcedencia(id: number, payload: Partial<Procedencia>): Observable<Procedencia> {
    return this.http.put<Procedencia>(`${this.baseProcedencia}/UpdateProcedencia/${encodeURIComponent(String(id))}`, payload, { headers: this.headers });
  }

  /**
   * DELETE DeleteProcedencia/{id}
   */
  deleteProcedencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseProcedencia}/DeleteProcedencia/${encodeURIComponent(String(id))}`, { headers: this.headers });
  }
}

// Backwards compatibility: allow imports that expect `EnfermedadService`
export { CatalogoService as EnfermedadService };
