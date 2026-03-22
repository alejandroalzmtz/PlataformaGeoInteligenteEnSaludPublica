import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ImportacionService, ImportacionResult } from '../../../core/services/ImportacionService';
import { AlarmService } from '../../../core/components/Alarms/alarm.service';
import { ActividadService } from '../../../core/services/actividad.services';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-importacion',
  templateUrl: './importacion.html',
  styles: [
    `/* Estilos para importación CSV */
.importacion-container {
  /* Aumentado el ancho máximo y usar un ancho responsivo */
  max-width: 1600px; /* aumentar más */
  width: 98%;
  margin: 30px auto;
  font-family: 'Open Sans', Arial, sans-serif;
  padding: 20px;
}

/* Título principal estilo solicitado */
.importacion-container h2 {
  color: #000000;
  font-weight: 700;
  font-size: 28px;
  margin: 0 0 16px;
}

/* Hacer la tarjeta más amplia y con más padding */
.card {
  background: #ffffff;
  border: 1px solid #e6e9ee;
  padding: 26px; /* antes 14px */
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15,23,42,0.03);
}
.notes { 
  background: #fbfdff; 
  border: 1px solid #e6eef6; 
  padding: 14px; 
  border-radius: 6px; 
  margin-bottom: 12px; 
  color: #0f172a; 
  font-size: 14px; 
  line-height: 1.45;
}
.notes h4 { margin: 6px 0; }
.note-small { font-size: 13px; color: #64748b; margin-top: 8px; }

.form-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.file-label { 
  display:flex; 
  align-items:center; 
  gap:8px; 
  cursor:pointer; 
  border: 1px dashed #cbd5e1; 
  padding: 10px 14px; 
  border-radius:6px; 
  background:#fff; 
  font-size: 15px;
}
.file-input { display:none; }
.file-placeholder { 
  color:#334155; 
  font-size: 15px; 
}
.actions { margin-left: auto; display:flex; gap:8px; }
.btn { 
  padding: 10px 14px; 
  border-radius:6px; 
  border:1px solid #cbd5e1; 
  background:#f8fafc; 
  cursor:pointer; 
  font-weight:600; 
  color:#0f172a; 
  font-size: 14px;
}
.btn.primary { 
  background:#0A4DA6; 
  color:white; 
  border-color: #0A4DA6; 
  padding: 10px 16px;
  transition: background 0.18s ease;
}
.btn.primary:hover { background:#083a7f; }
.btn.ghost { background:transparent; border:1px solid transparent; color:#334155; }
.btn[disabled] { opacity:0.6; cursor:not-allowed; }
/* Primary disabled style: lighter brand blue */
.btn.primary[disabled] {
  background: #9BB7DB; /* lighter blue when disabled */
  border-color: #9BB7DB;
  color: #ffffff;
}
.meta { 
  margin-top: 10px; 
  color: #475569; 
  font-size: 15px; 
  display:flex; 
  gap:18px; 
  flex-wrap:wrap; 
  align-items:center; 
}

.warning { 
  color:#b45309; 
  background:#fffbeb; 
  border:1px solid #fef3c7; 
  padding:8px 10px; 
  border-radius:6px; 
  font-weight:600; 
  font-size: 14px;
}

.status { margin-top:10px; color:#0ea5a4; font-weight:600; }
.preview { margin-top:14px; }
.table-wrap { 
  overflow:auto; 
  max-height:640px; 
  border:1px solid #e6e9ee; 
  border-radius:6px; 
  background:#fbfdff; 
  padding:10px; 
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px; /* antes 13px */
}
.preview-table thead th {
  position: sticky;
  top: 0;
  background: #f1f5f9;
  padding: 12px; /* antes 8px */
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}
.preview-table td {
  padding: 10px 12px; /* antes 6px 8px */
  border-bottom: 1px dashed #e6eef6;
  vertical-align: top;
  max-width: 520px; /* aumentar para dar espacio */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview-meta { margin-top:8px; color:#64748b; font-size:13px; }

.result { border: 1px solid #e6eef6; padding: 12px; border-radius: 6px; margin-top: 12px; background: #f8fff9; }
.result.error { background:#fff6f6; border-color:#fbe6e6; }
.log { white-space: pre-wrap; background: #f8f9fb; padding: 8px; border-radius: 4px; max-height:180px; overflow:auto; }

/* Custom PrimeNG upload button tweaks */
.upload-btn {
  padding: 10px 18px !important;
  display: inline-flex !important;
  gap: 8px !important;
  align-items: center !important;
  font-weight: 700 !important;
  box-shadow: 0 6px 12px rgba(10,77,166,0.12) !important;
}
.upload-btn .pi {
  font-size: 1rem;
}
.upload-btn:disabled, .upload-btn[disabled] {
  box-shadow: none !important;
  opacity: 0.7 !important;
}

/* Fallback modal styles */
.progress-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2,6,23,0.45);
  z-index: 6000;
}
.progress-modal {
  width: 420px;
  background: linear-gradient(180deg, rgba(10,12,16,0.98), rgba(18,24,38,0.98));
  color: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(2,6,23,0.6);
}
.progress-header { display:flex; gap:12px; align-items:center; }
.modal-icon { font-size: 1.5rem; }
.progress-title { font-weight:700; }
.progress-body { margin-top:12px; }
.progress-label { margin-top:8px; font-weight:700; font-size:13px; }
.progress-actions { margin-top:14px; display:flex; justify-content:flex-end; }
.progress-actions .btn { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.06); }
`],
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, ProgressBarModule],
})
export class ImportacionComponent implements OnDestroy {
  selectedFile?: File;
  loading = false;
  // Results and inline error messages are handled via AlarmService now

  // preview
  previewHeaders: string[] = [];
  previewRows: string[][] = [];
  previewMaxRows = 10;

  // upload progress for toast
  progress = 0;
  private progressInterval: any;
  // fallback modal visibility
  showProgressModal = false;

  // limits / warnings
  readonly sizeLimitBytes = 1_000_000_000; // ~1 GB
  readonly maxRecords = 1_000_000; // 1 millón de registros
  recordEstimate: number | null = null;
  sizeWarning?: string;
  recordWarning?: string;

  constructor(
    private importService: ImportacionService,
    private actividadService: ActividadService,
    private authService: AuthService
    , private messageService: MessageService
    , private alarmService: AlarmService
  ) {}

  // Demo helpers to trigger global alarms from the UI
  showSuccess() { this.alarmService.showSuccess('Success', { detail: 'Operación completada correctamente' }); }
  showInfo() { this.alarmService.showInfo('Info', { detail: 'Información relevante' }); }
  showWarn() { this.alarmService.showWarn('Warning', { detail: 'Se completó con advertencias' }); }
  showError() { this.alarmService.showError('Error', { detail: 'Ocurrió un error', sticky: true }); }
  showSecondary() { this.alarmService.showSecondary('Secondary', { detail: 'Mensaje secundario' }); }
  showContrast() { this.alarmService.showContrast('Contrast', { detail: 'Mensaje en contraste' }); }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.previewHeaders = [];
    this.previewRows = [];
    this.recordEstimate = null;
    this.sizeWarning = undefined;
    this.recordWarning = undefined;

    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];

      // Size check
      if (this.selectedFile.size > this.sizeLimitBytes) {
        this.sizeWarning = `El archivo es mayor a ~1 GB (${this.formatBytes(this.selectedFile.size)}). Recomendado dividirlo.`;
      }

      // Estimate records reading small slice (no leer archivo completo)
      this.estimateRecords(this.selectedFile).catch(() => {
        // si falla, no bloquear; sólo no mostrar estimación
      });
    } else {
      this.selectedFile = undefined;
    }
  }

  clear() {
    this.selectedFile = undefined;
    this.previewHeaders = [];
    this.previewRows = [];
    this.recordEstimate = null;
    this.sizeWarning = undefined;
    this.recordWarning = undefined;
  }

  // lee sólo un slice para previsualizar y/o estimar filas
  async estimateRecords(file: File, sliceSize = 2_000_000): Promise<void> {
    const chunk = file.slice(0, Math.min(sliceSize, file.size));
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const text = String(reader.result || '');
        // contar saltos de línea en el chunk
        const linesInChunk = (text.match(/\n/g) || []).length + (text.trim() ? 1 : 0);
        const chunkBytes = Math.min(sliceSize, file.size);
        const estimated = Math.max(0, Math.round((linesInChunk / chunkBytes) * file.size));
        // restar 1 para cabecera (si hay)
        this.recordEstimate = Math.max(0, estimated - 1);
        if (this.recordEstimate > this.maxRecords) {
          this.recordWarning = `Estimado de filas: ${this.recordEstimate.toLocaleString()}. Se recomienda dividir si excede ${this.maxRecords.toLocaleString()} filas.`;
        } else {
          this.recordWarning = undefined;
        }
        resolve();
      };
      reader.onerror = () => reject();
      reader.readAsText(chunk, 'UTF-8');
    });
  }

  // lee el slice inicial para generar previsualización sin cargar archivos gigantes
  parsePreview() {
    if (!this.selectedFile) {
      this.alarmService.showWarn('Archivo requerido', { detail: 'Selecciona un archivo CSV primero.' });
      return;
    }
    this.previewHeaders = [];
    this.previewRows = [];

    // Si el archivo es muy grande, leemos sólo un slice inicial
    const previewSliceSize = 500_000; // 500 KB
    const slice = this.selectedFile.size > previewSliceSize ? this.selectedFile.slice(0, previewSliceSize) : this.selectedFile;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = this.parseCsv(text);
      this.previewHeaders = parsed.headers;
      // Si leímos sólo un slice, puede que falten filas; mostrarlas hasta previewMaxRows
      this.previewRows = parsed.rows.slice(0, this.previewMaxRows);
      // si estimación previa excede límites, advertir
      if (this.recordEstimate && this.recordEstimate > this.maxRecords) {
        this.recordWarning = `Estimado de filas: ${this.recordEstimate.toLocaleString()}. El archivo supera ${this.maxRecords.toLocaleString()} registros por petición.`;
      }
    };
    reader.onerror = () => {
      this.alarmService.showError('Lectura', { detail: 'No se pudo leer el archivo.', sticky: false });
    };
    reader.readAsText(slice, 'UTF-8');
  }

  // Subida al backend con cheques básicos
  upload() {
    if (!this.selectedFile) {
      this.alarmService.showError('Archivo requerido', { detail: 'Selecciona un archivo CSV antes de subir.', sticky: true });
      return;
    }

    if (this.selectedFile.size > this.sizeLimitBytes) {
      this.alarmService.showError('Tamaño excedido', { detail: 'El archivo excede el tamaño permitido (~1 GB). Divide el archivo y vuelve a intentar.', sticky: true });
      return;
    }
    if (this.recordEstimate && this.recordEstimate > this.maxRecords) {
      this.alarmService.showError('Límite de filas', { detail: `Estimado de filas (${this.recordEstimate.toLocaleString()}) excede el máximo permitido (${this.maxRecords.toLocaleString()}). Divide el archivo.`, sticky: true });
      return;
    }

    this.loading = true;
    // reset transient UI; results/errors shown via AlarmService

    // show toast modal and start simulated progress
    this.progress = 0;
    this.messageService.add({ key: 'confirm', severity: 'info', summary: 'Uploading your files.', sticky: true });
    this.startProgressSimulation();
    // show fallback modal as well in case toast doesn't appear
    this.showProgressModal = true;

    // debug antes de enviar
    console.log('ImportacionComponent: subiendo archivo', this.selectedFile.name, this.selectedFile.size);
    const testForm = new FormData();
    testForm.append('file', this.selectedFile);
    // ver entradas (solo para debug en navegador)
    // for (const e of testForm.entries()) { console.log('form entry', e); }

    this.importService.importRegistroMedicoCsv(this.selectedFile).subscribe({
      next: (res) => {
        console.log('ImportacionComponent: respuesta del servicio', res);
        // do not persist result in component; show via AlarmService
        this.loading = false;
        // completar progreso y cerrar toast + fallback modal
        this.completeProgressAndCloseToast();
        this.showProgressModal = false;

        // Map response to alarm severity:
        // - If skipped > 0 -> warning
        // - If inserted > 0 and skipped == 0 -> success
        // - Otherwise -> info
        try {
          // Prefer showing the server log when available for visibility
          const detailText = (res.log && String(res.log).trim()) || `Insertados: ${res.inserted ?? 0} · Omitidos: ${res.skipped ?? 0}`;
          if (res.skipped && res.skipped > 0) {
            this.alarmService.showWarn(res.message || 'Import completed with warnings', { detail: detailText });
          } else if (res.inserted && res.inserted > 0) {
            this.alarmService.showSuccess(res.message || 'Import successful', { detail: detailText });
          } else {
            this.alarmService.showInfo(res.message || 'Import result', { detail: detailText });
          }
        } catch (e) {
          console.error('Error mostrando alarma:', e);
        }

        // Registrar actividad de importación
        try {
          const usuarioId = this.authService.getCurrentUserId();
          if (usuarioId && this.selectedFile) {
            const now = new Date();
            const actividad = {
              idUsuario: Number(usuarioId),
              fechaInicio: now.toISOString(),
              fechaFin: now.toISOString(),
              fechaActividad: now.toISOString().split('T')[0],
              hora: now.toISOString().split('T')[1].split('.')[0],
              descripcionAccion: `Importó archivo ${this.selectedFile.name} (insertados: ${res.inserted ?? 0}, omitidos: ${res.skipped ?? 0})`
            };
            this.actividadService.addActividad(actividad as any).subscribe({ next: () => {}, error: () => {} });
          }
        } catch (e) { console.error('Error al registrar actividad de importación', e); }
      },
      error: (err) => {
        this.loading = false;
        console.error('ImportacionComponent: error en upload', err);
        // stop progress and close toast
        this.clearProgressSimulation();
        this.messageService.clear('confirm');
        this.showProgressModal = false;
        // err is ApiErrorResponse from ImportacionService.catchError
        try {
          const status = (err && (err as any).statusCode) ?? (err && (err as any).status) ?? 0;
          const msg = (err && (err as any).message) || JSON.stringify(err);
          if (status >= 500) {
            this.alarmService.showError('Error de conexión', { detail: msg, sticky: true });
          } else if (status === 400) {
            this.alarmService.showError('Error en archivo', { detail: msg, sticky: true });
          } else {
            this.alarmService.showError('Error', { detail: msg, sticky: true });
          }
        } catch (e) {
          console.error('Error mostrando alarma en error handler', e);
        }
        // Additional parsing not needed: errors are shown via alarms above
      }
    });
  }

  private startProgressSimulation() {
    this.clearProgressSimulation();
    this.progressInterval = setInterval(() => {
      if (this.progress < 90) {
        // advance randomly to keep UI feeling alive
        this.progress = Math.min(90, this.progress + Math.floor(Math.random() * 8) + 2);
      } else {
        // stay until server completes
        this.clearProgressSimulation();
      }
    }, 400);
  }

  private completeProgressAndCloseToast() {
    this.clearProgressSimulation();
    this.progress = 100;
    // small delay so user sees 100%
    setTimeout(() => {
      this.messageService.clear('confirm');
      this.progress = 0;
    }, 600);
  }

  private clearProgressSimulation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  onClose() {
    // user closed the toast manually
    this.clearProgressSimulation();
    this.progress = 0;
  }

  ngOnDestroy(): void {
    this.clearProgressSimulation();
  }

  // parse CSV simple; maneja comillas dobles que contienen comas
  private parseCsv(text: string): { headers: string[]; rows: string[][] } {
    // normalizar saltos de línea y tomar sólo hasta cierto número de líneas para evitar memory spikes
    const maxLinesToParse = 2000;
    const normalized = text.replace(/\r\n/g, '\n');
    const allLines = normalized.split('\n').filter(l => l.trim() !== '');
    const lines = allLines.slice(0, maxLinesToParse);

    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
      const fields: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' ) {
          if (inQuotes && line[i + 1] === '"') { // escaped quote
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          fields.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      fields.push(cur);
      return fields.map(f => f.trim());
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine).filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
    return { headers, rows };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
