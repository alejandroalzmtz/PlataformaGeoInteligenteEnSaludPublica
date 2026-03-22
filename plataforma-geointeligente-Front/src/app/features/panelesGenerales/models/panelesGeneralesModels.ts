import { DashboardFiltrosParams } from '../../../core/services/dashboard.service';

/** Minimal Panel shape used by filtros-panel. */
export interface Panel {
  idPanel: number;
  nombrePanel: string;
  configuracion: string | null;
  usuarioCreador: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
}

/**
 * Estado completo de filtros aplicados por el usuario.
 * Emitido por FiltrosPanelComponent al pulsar "Aplicar Filtros".
 *
 * Los filtros son SINGLE-SELECT y coinciden 1-a-1 con DashboardFiltrosParams.
 */
export interface AppliedFilters extends DashboardFiltrosParams {
  panel: Panel | null;
  panelId: number | null;
}

/** Extrae solo los parámetros de filtro del dashboard desde AppliedFilters */
export function toFilterParams(f: AppliedFilters): DashboardFiltrosParams {
  return {
    anioInicio: f.anioInicio,
    anioFin: f.anioFin,
    codigoGrupo: f.codigoGrupo,
    codigoICD: f.codigoICD,
    idEstado: f.idEstado,
    idSexo: f.idSexo,
    idRangoEdad: f.idRangoEdad,
    claveInstitucion: f.claveInstitucion,
    estrato: f.estrato,
  };
}
