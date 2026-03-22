/** Re-export del servicio para conveniencia */
export type { Noticia, CreateNoticiaDto } from '../../../../core/services/noticia.service';

/** Datos que emite el formulario al guardar */
export interface NoticiaSaveEvent {
  payload: import('../../../../core/services/noticia.service').CreateNoticiaDto;
  editingId?: number;
}
