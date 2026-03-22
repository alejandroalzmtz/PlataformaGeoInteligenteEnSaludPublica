import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { LogoService, LogoItem } from '../../../core/services/logo.service';
import { AlarmService } from '../../../core/components/Alarms';
import { ConfirmPasswordService } from '../../../core/services/confirm-password.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-logo-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    FileUploadModule
  ],
  providers: [],
  templateUrl: './logo-management.html',
  styleUrls: ['./logo-management.css']
})
export class LogoManagement implements OnInit, OnDestroy {
  logos: LogoItem[] = [];
  activeLogo: LogoItem | null = null;
  uploadedFiles: File[] = [];
  isDragOver = false;
  private readonly allowedExtensions = ['.png', '.jpg', '.jpeg'];
  storageInfo: { totalSizeMB: number; logosCount: number } = {
    totalSizeMB: 0,
    logosCount: 0
  };

  private subscriptions = new Subscription();

  constructor(
    private logoService: LogoService,
    private alarmService: AlarmService,
    private confirmPasswordService: ConfirmPasswordService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los logos
    this.subscriptions.add(
      this.logoService.logos$.subscribe(logos => {
        this.logos = logos;
        this.updateStorageInfo();
      })
    );

    // Suscribirse al logo activo
    this.subscriptions.add(
      this.logoService.activeLogo$.subscribe(logo => {
        this.activeLogo = logo;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Actualiza la información de almacenamiento
   */
  updateStorageInfo(): void {
    this.storageInfo = this.logoService.getStorageInfo();
  }

  /**
   * Solicita confirmación de contraseña del administrador
   */
  private async confirmAction(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmPasswordService
        .open()
        .pipe(take(1))
        .subscribe((confirmed) => {
          resolve(!!confirmed);
        });
    });
  }

  /**
   * Valida si la extensión del archivo es permitida
   */
  private isValidFileExtension(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return this.allowedExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Maneja la selección de archivos desde el file upload
   */
  async onFileSelect(event: any): Promise<void> {
    const files = event.files || event.currentFiles;
    const validFiles: File[] = [];

    for (const file of files) {
      if (!this.isValidFileExtension(file)) {
        this.alarmService.showWarn('Formato no permitido', {
          detail: `El archivo "${file.name}" no tiene un formato válido. Solo se permiten archivos .png, .jpg y .jpeg`,
          life: 5000
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    for (const file of validFiles) {
      await this.addLogoFile(file);
    }

    // Limpiar el input
    if (event.files) {
      event.files = [];
    }
  }

  /**
   * Maneja el evento dragover
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Maneja el evento dragleave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Maneja el evento drop
   */
  async onDrop(event: DragEvent, fileUploader: any): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!this.isValidFileExtension(file)) {
        this.alarmService.showWarn('Formato no permitido', {
          detail: `El archivo "${file.name}" no tiene un formato válido. Solo se permiten archivos .png, .jpg y .jpeg`,
          life: 5000
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    for (const file of validFiles) {
      await this.addLogoFile(file);
    }
  }

  /**
   * Agrega un logo desde un archivo
   */
  async addLogoFile(file: File): Promise<void> {
    const result = await this.logoService.addLogo(file);

    if (result.success) {
      this.alarmService.showSuccess('Éxito', { detail: result.message });
    } else {
      this.alarmService.showError('Error', { detail: result.message });
    }
  }

  /**
   * Elimina un logo
   */
  async deleteLogo(logo: LogoItem): Promise<void> {
    if (!logo.idLogo) return;

    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    this.logoService.deleteLogo(logo.idLogo!).subscribe({
      next: (result) => {
        if (result.success) {
          this.alarmService.showSuccess('Eliminado', { detail: result.message });
        } else {
          this.alarmService.showError('Error', { detail: result.message });
        }
      },
      error: (error) => {
        this.alarmService.showError('Error', { detail: 'Error al eliminar el logo' });
      }
    });
  }

  /**
   * Establece un logo como activo
   */
  async setActiveLogo(logo: LogoItem): Promise<void> {
    if (!logo.idLogo) return;

    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    this.logoService.setActiveLogo(logo.idLogo).subscribe({
      next: (result) => {
        if (result.success) {
          this.alarmService.showSuccess('Logo activo', { detail: result.message });
        } else {
          this.alarmService.showError('Error', { detail: result.message });
        }
      },
      error: (error) => {
        this.alarmService.showError('Error', { detail: 'Error al activar el logo' });
      }
    });
  }

  /**
   * Construye la URL absoluta de la imagen de un logo
   */
  getLogoImageUrl(logo: LogoItem): string {
    return this.logoService.getImageUrl(logo);
  }

  /**
   * Verifica si un logo es el activo
   */
  isActiveLogo(logo: LogoItem): boolean {
    return this.activeLogo?.idLogo === logo.idLogo;
  }

  /**
   * Formatea el tamaño del archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Formatea la fecha
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Limpia todos los logos después de confirmar
   */
  async clearAllLogos(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    this.logoService.clearAllLogos().subscribe({
      next: () => {
        this.alarmService.showSuccess('Limpieza completa', { detail: 'Todos los logos han sido eliminados' });
      },
      error: (error) => {
        this.alarmService.showError('Error', { detail: 'Error al eliminar los logos' });
      }
    });
  }
}
