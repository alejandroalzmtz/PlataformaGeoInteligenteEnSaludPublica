import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';
import { map } from 'rxjs/operators';

export interface PagedResponse<T> {
  data?: T[];
  items?: T[];
  results?: T[];
}

export interface Enfermedad {
  idEnfermedad: string;
  nombreEnfermedad: string;
  descripcion: string;
  codigoICD: string;
}

export interface DerechoHabitacion {
  idDerechoHab: number;
  descripcion: string;
}

export interface Estado {
  idEstado: number;
  nombreEstado: string;
}

export interface Municipio {
  idMunicipio: number;
  idMpo: number;
  nombreMunicipio: string;
  idEstado: number;
}

export interface Servicio {
  idServicio: number;
  nombreServicio: string;
  descripcion: string;
}

export interface MotivoEgreso {
  idMotivoEgreso: number;
  descripcion: string;
}

export interface EnfermedadPagedResponse {
  items: Enfermedad[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  search?: string;
}

export interface Hospital {
  clues: string;
  nombreInstitucion: string;
  nombreUnidad: string;
  estado: number;
  municipio: number;
  localidad: number;
}

export interface HospitalesPagedResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Hospital[];
}

@Injectable({
  providedIn: 'root',
})
export class EnfermedadService {
  // endpoints
  private baseEnfermedad = `${environment.apiUrl}/api/Enfermedad`;
  private baseEstado = `${environment.apiUrl}/api/Estado`;
  private baseMunicipio = `${environment.apiUrl}/api/Municipio`;
  private baseLocalidad = `${environment.apiUrl}/api/Localidad`;
  private baseDerechoHab = `${environment.apiUrl}/api/DerechoHab`;
  private baseProcedencia = `${environment.apiUrl}/api/Procedencia`;
  private baseMotivosE = `${environment.apiUrl}/api/MotivosE`;
  private baseServicioMedico = `${environment.apiUrl}/api/ServicioMedico`;
  private baseHospitales = `${environment.apiUrl}/api/Hospitales`;

  // usar application/json (tu API devuelve application/json según el response headers)
  private headers = new HttpHeaders({
    Accept: 'application/json',
  });

  private unwrap<T>(r: any): T[] {
    if (Array.isArray(r)) return r;
    return (r?.data ?? r?.items ?? r?.results ?? []) as T[];
  }

  constructor(private http: HttpClient) {}

  // Enfermedades
  getAll(): Observable<Enfermedad[]> {
    return this.http.get<any>(`${this.baseEnfermedad}/GetEnfermedades`, {
      headers: this.headers,
      params: { pageSize: '200' },
    }).pipe(
      map((res) => {
        if (Array.isArray(res)) return res as Enfermedad[];
        return (res?.items ?? res?.Items ?? res?.data ?? []) as Enfermedad[];
      }),
    );
  }

  /** Paginado: GetEnfermedades?pageNumber=1&pageSize=5 (&search=... optional, &startsWith=... optional) */
  getPaged(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string | null,
    startsWith?: string | null,
  ): Observable<EnfermedadPagedResponse> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (search != null && String(search).trim() !== '') {
      params = params.set('search', String(search));
    }
    if (startsWith != null && String(startsWith).trim() !== '') {
      params = params.set('startsWith', String(startsWith));
    }

    return this.http.get<EnfermedadPagedResponse>(`${this.baseEnfermedad}/GetEnfermedades`, {
      headers: this.headers,
      params,
    });
  }

  getById(id: string): Observable<Enfermedad> {
    return this.http.get<Enfermedad>(
      `${this.baseEnfermedad}/GetEnfermedades/${encodeURIComponent(id)}`,
      { headers: this.headers },
    );
  }

  create(payload: Partial<Enfermedad>): Observable<Enfermedad> {
    return this.http.post<Enfermedad>(`${this.baseEnfermedad}`, payload, { headers: this.headers });
  }

  /** Registro explícito usando endpoint RegisterEnfermedad */
  registerEnfermedad(payload: Partial<Enfermedad>): Observable<Enfermedad> {
    return this.http.post<Enfermedad>(`${this.baseEnfermedad}/RegisterEnfermedad`, payload, {
      headers: this.headers,
    });
  }

  update(id: string, payload: Partial<Enfermedad>): Observable<Enfermedad> {
    return this.http.put<Enfermedad>(`${this.baseEnfermedad}/${encodeURIComponent(id)}`, payload, {
      headers: this.headers,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseEnfermedad}/${encodeURIComponent(id)}`, {
      headers: this.headers,
    });
  }

  // Catalogos (Catalogo endpoints)
  // NOTE: endpoint name corrected to GetDerechosHabitaciones (plural) según tu curl
  getDerechoHabitacion(
    pageNumber = 1,
    pageSize = 500,
    search?: string,
  ): Observable<DerechoHabitacion[]> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (search?.trim()) params = params.set('search', search.trim());

    return this.http
      .get<any>(`${this.baseDerechoHab}/GetDerechosHabPaged`, { headers: this.headers, params })
      .pipe(map((r) => this.unwrap<DerechoHabitacion>(r)));
  }

  getEstados(pageNumber = 1, pageSize = 500, search?: string): Observable<Estado[]> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (search?.trim()) params = params.set('search', search.trim());

    return this.http
      .get<any>(`${this.baseEstado}/GetEstadosPaged`, { headers: this.headers, params })
      .pipe(map((r) => this.unwrap<Estado>(r)));
  }

  /**
   * Obtiene municipios.
   * Si pasas estadoId se añade como query param: ?estadoId=#
   */
  getMunicipios(
    pageNumber = 1,
    pageSize = 500,
    idEstado?: number,
    search?: string,
  ): Observable<Municipio[]> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (idEstado != null) params = params.set('idEstado', String(idEstado));
    if (search?.trim()) params = params.set('search', search.trim());

    return this.http
      .get<any>(`${this.baseMunicipio}/GetMunicipiosPaged`, { headers: this.headers, params })
      .pipe(map((r) => this.unwrap<Municipio>(r)));
  }

  getLocalidades(
    pageNumber = 1,
    pageSize = 500,
    idEstado?: number,
    idMunicipio?: number,
    search?: string,
  ) {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (idEstado != null) params = params.set('idEdo', String(idEstado));

    if (idMunicipio != null) params = params.set('idMpo', String(idMunicipio));

    if (search?.trim()) params = params.set('search', search.trim());

    return this.http.get<any>(`${this.baseLocalidad}/GetLocalidadesPaged`, {
      headers: this.headers,
      params,
    });
  }

  getLocalidadById(idLoc: number) {
    return this.http.get<any>(`${this.baseLocalidad}/${idLoc}`, {
      headers: this.headers,
    });
  }

  getProcedencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseProcedencia}`, { headers: this.headers });
  }

  getServiciosMedicos(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.baseServicioMedico, { headers: this.headers });
  }

  getMotivosEgreso(pageNumber = 1, pageSize = 500, search?: string): Observable<MotivoEgreso[]> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (search?.trim()) params = params.set('search', search.trim());

    return this.http
      .get<any>(`${this.baseMotivosE}/GetMotivosEgresoPaged`, { headers: this.headers, params })
      .pipe(map((r) => this.unwrap<MotivoEgreso>(r)));
  }

  getHospitalesPaged(
    page: number = 1,
    pageSize: number = 20,
    estado?: number,
    municipio?: number,
    localidad?: number,
    search?: string | null,
  ): Observable<HospitalesPagedResponse> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));

    if (estado != null) params = params.set('estado', String(estado));
    if (municipio != null) params = params.set('municipio', String(municipio));
    if (localidad != null) params = params.set('localidad', String(localidad));

    if (search != null && String(search).trim() !== '') {
      params = params.set('search', String(search).trim());
    }

    return this.http.get<HospitalesPagedResponse>(`${this.baseHospitales}/Paged`, {
      headers: this.headers,
      params,
    });
  }
}
