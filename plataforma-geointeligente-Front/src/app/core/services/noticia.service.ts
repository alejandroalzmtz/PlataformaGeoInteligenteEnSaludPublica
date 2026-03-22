import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';

export interface Noticia {
  idNoticia: number;
  titulo: string;
  contenido: string;
  imagenPrincipal?: string;
}

export interface CreateNoticiaDto {
  titulo: string;
  contenido: string;
  imagenPrincipal?: string;
}

@Injectable({ providedIn: 'root' })
export class NoticiaService {
  private baseUrl = `${environment.apiUrl}/api/Noticia`;

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.baseUrl);
  }

  getNoticiaById(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.baseUrl}/${id}`);
  }

  createNoticia(payload: CreateNoticiaDto): Observable<Noticia> {
    return this.http.post<Noticia>(this.baseUrl, payload);
  }

  updateNoticia(id: number, payload: CreateNoticiaDto): Observable<Noticia> {
    return this.http.put<Noticia>(`${this.baseUrl}/${id}`, payload);
  }

  deleteNoticia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
