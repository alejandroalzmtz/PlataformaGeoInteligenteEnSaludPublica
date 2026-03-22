import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

// ═══════════════════════════════════════════════════════════
//  Interfaces – catálogos de filtros
// ═══════════════════════════════════════════════════════════

export interface AnioDisponibleDto {
  anio: number;
}

export interface CategoriaEnfermedadDto {
  codigoGrupo: string;
  codigoICD: string;
  nombreEnfermedad: string;
}

export interface SubcategoriaEnfermedadDto {
  codigoICD: string;
  nombreEnfermedad: string;
}

export interface EstadoActivoDto {
  idEstado: number;
  nombreEstado: string;
}

export interface RangoEdadFiltroDto {
  idRangoEdad: number;
  etiquetaRango: string;
}

export interface SexoFiltroDto {
  idSexo: number;
  descripcion: string;
}

export interface InstitucionFiltroDto {
  claveInstitucion: string;
  institucion: string;
}

export interface EstratoFiltroDto {
  estratoUnidad: string;
}

// ═══════════════════════════════════════════════════════════
//  Interfaces – parámetros de filtros compartidos
// ═══════════════════════════════════════════════════════════

export interface DashboardFiltrosParams {
  anioInicio: number;
  anioFin: number;
  codigoGrupo?: string | null;
  codigoICD?: string | null;
  idEstado?: number | null;
  idSexo?: number | null;
  idRangoEdad?: number | null;
  claveInstitucion?: string | null;
  estrato?: string | null;
}

// ═══════════════════════════════════════════════════════════
//  Interfaces – respuestas de datos
// ═══════════════════════════════════════════════════════════

export interface IndicadoresTotalesDto {
  totalCasos: number;
  totalDefunciones: number;
  poblacionBase: number;
  tasaIncidencia: number | null;
  tasaMortalidad: number | null;
}

export interface TendenciaAnualDto {
  anio: number;
  totalCasos: number;
  totalDefunciones: number;
  poblacion: number | null;
  tasaIncidencia: number | null;
  tasaMortalidad: number | null;
}

export interface MapaEstadoDto {
  idEstado: number;
  nombreEstado: string;
  casos: number;
  defunciones: number;
  poblacion: number | null;
  tasaIncidencia: number | null;
  tasaMortalidad: number | null;
}

export interface GraficaEdadDto {
  idRangoEdad: number;
  rangoEdad: string;
  totalCasos: number;
  totalDefunciones: number;
}

export interface GraficaInstitucionDto {
  claveInstitucion: string;
  nombreInstitucion: string;
  totalCasos: number;
  totalDefunciones: number;
}

export interface GraficaEstratoDto {
  estratoUnidad: string;
  totalCasos: number;
  totalDefunciones: number;
}

export interface GraficaSubgrupoDto {
  codigoICD: string;
  nombreEnfermedad: string;
  totalCasos: number;
  totalDefunciones: number;
}

export interface GraficaDiasEstanciaDto {
  idRangoEdad: number;
  rangoEdad: string;
  promedioDiasEstancia: number;
  totalCasos: number;
}

export interface TablaDatosFilaDto {
  idRegistro: number;
  fechaIngreso: string;
  anio: number;
  diasEstancia: number;
  nombreEstado: string;
  nombreMunicipio: string;
  edad: number;
  sexo: string;
  codigoGrupo: string;
  codigoICD: string;
  claveInstitucion: string;
  nombreInstitucion: string;
  estratoUnidad: string;
  idMotivoEgreso: number;
  esDefuncion: number;
}

export interface TablaDatosResponseDto {
  totalRegistros: number;
  datos: TablaDatosFilaDto[];
}

// ═══════════════════════════════════════════════════════════
//  Service
// ═══════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  // ──────── Catálogos de filtros ────────

  getAniosDisponibles(): Observable<AnioDisponibleDto[]> {
    return this.http.get<AnioDisponibleDto[]>(`${this.base}/filtros/anios-disponibles`);
  }

  getCategoriasEnfermedad(): Observable<CategoriaEnfermedadDto[]> {
    return this.http.get<CategoriaEnfermedadDto[]>(`${this.base}/filtros/categorias-enfermedad`);
  }

  getSubcategoriasEnfermedad(codigoGrupo: string): Observable<SubcategoriaEnfermedadDto[]> {
    const params = new HttpParams().set('codigoGrupo', codigoGrupo);
    return this.http.get<SubcategoriaEnfermedadDto[]>(`${this.base}/filtros/subcategorias-enfermedad`, { params });
  }

  getEstados(): Observable<EstadoActivoDto[]> {
    return this.http.get<EstadoActivoDto[]>(`${this.base}/filtros/estados`);
  }

  getRangosEdad(): Observable<RangoEdadFiltroDto[]> {
    return this.http.get<RangoEdadFiltroDto[]>(`${this.base}/filtros/rangos-edad`);
  }

  getSexos(): Observable<SexoFiltroDto[]> {
    return this.http.get<SexoFiltroDto[]>(`${this.base}/filtros/sexos`);
  }

  getInstituciones(): Observable<InstitucionFiltroDto[]> {
    return this.http.get<InstitucionFiltroDto[]>(`${this.base}/filtros/instituciones`);
  }

  getEstratos(): Observable<EstratoFiltroDto[]> {
    return this.http.get<EstratoFiltroDto[]>(`${this.base}/filtros/estratos`);
  }

  // ──────── Endpoints de datos (con filtros comunes) ────────

  getIndicadores(f: DashboardFiltrosParams): Observable<IndicadoresTotalesDto> {
    return this.http.get<IndicadoresTotalesDto>(`${this.base}/indicadores`, { params: this.toParams(f) });
  }

  getTendencia(f: DashboardFiltrosParams): Observable<TendenciaAnualDto[]> {
    return this.http.get<TendenciaAnualDto[]>(`${this.base}/tendencia`, { params: this.toParams(f) });
  }

  getMapaEstados(f: DashboardFiltrosParams): Observable<MapaEstadoDto[]> {
    return this.http.get<MapaEstadoDto[]>(`${this.base}/mapa-estados`, { params: this.toParams(f) });
  }

  getGraficaEdades(f: DashboardFiltrosParams): Observable<GraficaEdadDto[]> {
    return this.http.get<GraficaEdadDto[]>(`${this.base}/grafica-edades`, { params: this.toParams(f) });
  }

  getGraficaInstituciones(f: DashboardFiltrosParams): Observable<GraficaInstitucionDto[]> {
    return this.http.get<GraficaInstitucionDto[]>(`${this.base}/grafica-instituciones`, { params: this.toParams(f) });
  }

  getGraficaEstratos(f: DashboardFiltrosParams): Observable<GraficaEstratoDto[]> {
    return this.http.get<GraficaEstratoDto[]>(`${this.base}/grafica-estratos`, { params: this.toParams(f) });
  }

  getGraficaSubgrupos(f: DashboardFiltrosParams): Observable<GraficaSubgrupoDto[]> {
    return this.http.get<GraficaSubgrupoDto[]>(`${this.base}/grafica-subgrupos`, { params: this.toParams(f) });
  }

  getGraficaDiasEstancia(f: DashboardFiltrosParams): Observable<GraficaDiasEstanciaDto[]> {
    return this.http.get<GraficaDiasEstanciaDto[]>(`${this.base}/grafica-dias-estancia`, { params: this.toParams(f) });
  }

  getTabla(f: DashboardFiltrosParams, pagina = 1, registrosPagina = 100): Observable<TablaDatosResponseDto> {
    let params = this.toParams(f);
    params = params.set('pagina', pagina.toString()).set('registrosPagina', registrosPagina.toString());
    return this.http.get<TablaDatosResponseDto>(`${this.base}/tabla`, { params });
  }

  // ──────── Helper ────────

  private toParams(f: DashboardFiltrosParams): HttpParams {
    let p = new HttpParams()
      .set('anioInicio', f.anioInicio.toString())
      .set('anioFin', f.anioFin.toString());

    if (f.codigoGrupo) p = p.set('codigoGrupo', f.codigoGrupo);
    if (f.codigoICD) p = p.set('codigoICD', f.codigoICD);
    if (f.idEstado != null) p = p.set('idEstado', f.idEstado.toString());
    if (f.idSexo != null) p = p.set('idSexo', f.idSexo.toString());
    if (f.idRangoEdad != null) p = p.set('idRangoEdad', f.idRangoEdad.toString());
    if (f.claveInstitucion) p = p.set('claveInstitucion', f.claveInstitucion);
    if (f.estrato) p = p.set('estrato', f.estrato);

    return p;
  }
}
