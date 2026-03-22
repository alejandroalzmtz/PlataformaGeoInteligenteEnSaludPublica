import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment.development';

// Respuesta exitosa (200)
export interface ImportacionResult {
  message: string;
  inserted: number;
  skipped: number;
  log: string;
}

// Respuesta de error (400 / 500)
export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ImportacionService {
  private baseUrl = `${environment.apiUrl}/api/Importacion`;

  constructor(private http: HttpClient) {}

  // Envía archivo multipart/form-data al endpoint (usa la ruta que funciona en tu curl)
  importRegistroMedicoCsv(file: File): Observable<ImportacionResult> {
    const form = new FormData();
    form.append('file', file);

    const url = `${this.baseUrl}/ImportRegistroMedicoCsv`; // <- coincide con tu curl/Swagger response

    return this.http.post<ImportacionResult>(url, form).pipe(
      map((res) => {
        // respuesta JSON esperada; regresar tal cual
        return res as ImportacionResult;
      }),
      catchError((err) => {
        // Normalizar error para que el componente muestre err.message correctamente
        const body = err?.error;
        const message =
          (body && (body.message || (typeof body === 'string' ? body : undefined))) ||
          err?.statusText ||
          'Error desconocido al subir archivo';
        const apiErr: ApiErrorResponse = {
          success: false,
          statusCode: err?.status ?? 0,
          message,
        };
        return throwError(() => apiErr);
      })
    );
  }
}