import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EchartsMapService {
  private registered = false;

  constructor(private http: HttpClient) {}

  /** Registra el mapa de México en ECharts (solo una vez, es idempotente) */
  async ensureMexicoMapRegistered(): Promise<void> {
    if (this.registered) return;
    const echarts = await import('echarts');
    if (echarts.getMap('Mexico')) {
      this.registered = true;
      return;
    }
    const geo = await firstValueFrom(this.http.get('/mx.json'));
    echarts.registerMap('Mexico', geo as any);
    this.registered = true;
  }
}
