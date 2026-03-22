import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, of } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

export interface LogoItem {
  idLogo?: number;
  nombre: string;
  formato: 'PNG' | 'JPEG';
  tamanio: number; // bytes
  fechaSubida: Date;
  esActivo: boolean;
  imagenUrl: string; // URL relativa para obtener la imagen binaria
}

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private readonly apiUrl = `${environment.apiUrl}/api/LogoPdf`;

  private logosSubject = new BehaviorSubject<LogoItem[]>([]);
  public logos$ = this.logosSubject.asObservable();

  private activeLogoSubject = new BehaviorSubject<LogoItem | null>(null);
  public activeLogo$ = this.activeLogoSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar con retraso para evitar problemas de inicialización
    setTimeout(() => {
      this.loadLogos();
      this.loadActiveLogo();
    }, 100);
  }

  /**
   * Carga los logos desde el servidor (solo metadatos, sin imagen)
   */
  private loadLogos(): void {
    this.http.get<any[]>(this.apiUrl).pipe(
      map(logos => logos.map(l => ({
        idLogo: l.idLogo,
        nombre: l.nombre,
        formato: l.formato as 'PNG' | 'JPEG',
        tamanio: l.tamanio,
        fechaSubida: new Date(l.fechaSubida),
        esActivo: l.esActivo,
        imagenUrl: l.imagenUrl
      }))),
      catchError(error => {
        console.error('Error al cargar logos:', error);
        return of([]);
      })
    ).subscribe(logos => {
      this.logosSubject.next(logos);
    });
  }

  /**
   * Carga el logo activo desde el servidor (solo metadatos)
   */
  private loadActiveLogo(): void {
    this.http.get<any>(`${this.apiUrl}/activo`).pipe(
      map(logo => logo ? {
        idLogo: logo.idLogo,
        nombre: logo.nombre,
        formato: logo.formato as 'PNG' | 'JPEG',
        tamanio: logo.tamanio,
        fechaSubida: new Date(logo.fechaSubida),
        esActivo: logo.esActivo,
        imagenUrl: logo.imagenUrl
      } : null),
      catchError(error => {
        console.warn('No hay logo activo o error al cargar:', error);
        return of(null);
      })
    ).subscribe(logo => {
      this.activeLogoSubject.next(logo);
    });
  }

  /**
   * Obtiene todos los logos
   */
  getLogos(): LogoItem[] {
    return this.logosSubject.value;
  }

  /**
   * Obtiene el logo activo
   */
  getActiveLogo(): LogoItem | null {
    return this.activeLogoSubject.value;
  }

  /**
   * Construye la URL absoluta de la imagen de un logo
   */
  getImageUrl(logo: LogoItem): string {
    if (!logo.idLogo) return '';
    return `${this.apiUrl}/${logo.idLogo}/imagen`;
  }

  /**
   * Refresca la lista de logos
   */
  refreshLogos(): void {
    this.loadLogos();
    this.loadActiveLogo();
  }

  /**
   * Agrega un nuevo logo desde un archivo.
   * Envía el archivo como multipart/form-data (no base64 JSON).
   */
  async addLogo(file: File): Promise<{ success: boolean; message: string; logo?: LogoItem }> {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return { success: false, message: 'El archivo debe ser una imagen (PNG, JPEG, etc.)' };
    }

    try {
      const formData = new FormData();
      formData.append('imagen', file, file.name);

      const result = await this.http.post<any>(this.apiUrl, formData).toPromise();

      if (result) {
        this.refreshLogos();
        return { success: true, message: 'Logo agregado correctamente', logo: result };
      } else {
        return { success: false, message: 'Error al agregar el logo' };
      }
    } catch (error) {
      console.error('Error al agregar logo:', error);
      return { success: false, message: 'Error al procesar la imagen' };
    }
  }

  /**
   * Elimina un logo por ID
   */
  deleteLogo(logoId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete(`${this.apiUrl}/${logoId}`).pipe(
      map(() => {
        this.refreshLogos();
        return { success: true, message: 'Logo eliminado correctamente' };
      }),
      catchError(error => {
        const mensaje = error.error?.message || 'Error al eliminar el logo';
        return of({ success: false, message: mensaje });
      })
    );
  }

  /**
   * Establece un logo como activo
   */
  setActiveLogo(logoId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/${logoId}/activar`, {}).pipe(
      tap(() => {
        this.refreshLogos();
      }),
      map(() => {
        return { success: true, message: 'Logo seleccionado como activo' };
      }),
      catchError(error => {
        console.error('Error al establecer logo activo:', error);
        return of({ success: false, message: 'Error al guardar la configuración' });
      })
    );
  }

  /**
   * Obtiene información sobre el uso de almacenamiento
   */
  getStorageInfo(): { totalSizeMB: number; logosCount: number } {
    const logos = this.logosSubject.value;
    const totalSize = logos.reduce((sum, logo) => sum + logo.tamanio, 0);
    const sizeInMB = totalSize / (1024 * 1024);

    return {
      totalSizeMB: parseFloat(sizeInMB.toFixed(2)),
      logosCount: logos.length
    };
  }

  /**
   * Limpia todos los logos
   */
  clearAllLogos(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/all`).pipe(
      tap(() => {
        this.logosSubject.next([]);
        this.activeLogoSubject.next(null);
        console.log('Todos los logos han sido eliminados');
      }),
      catchError(error => {
        console.error('Error al limpiar logos:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene el logo activo como Data URL (para usar en jsPDF).
   * Usa el endpoint /activo/dataurl que devuelve la imagen como base64 en JSON.
   */
  async getActiveLogoDataUrl(): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
    try {
      const result = await this.http.get<{ dataUrl: string; format: string }>(
        `${this.apiUrl}/activo/dataurl`
      ).toPromise();

      if (!result || !result.dataUrl) {
        console.warn('[LogoService] No hay logo activo configurado');
        return null;
      }

      console.log('[LogoService] Logo dataUrl obtenido, longitud:', result.dataUrl.length);
      return {
        dataUrl: result.dataUrl,
        format: (result.format as 'PNG' | 'JPEG') || 'PNG'
      };
    } catch (error) {
      console.error('[LogoService] Error al obtener data URL del logo activo:', error);
      return null;
    }
  }

  /**
   * Convierte un Blob a Data URL
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
