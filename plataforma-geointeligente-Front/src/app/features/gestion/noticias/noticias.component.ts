import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticiaService, Noticia, CreateNoticiaDto } from '../../../core/services/noticia.service';
import { ActividadService } from '../../../core/services/actividad.services';
import { AuthService } from '../../../core/services/auth.service';
import { AlarmService } from '../../../core/components/Alarms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPasswordComponent } from '../../../core/components/dialogs/confirm-password/confirm-password.component';

import { FormularioNoticiaComponent } from './components/formulario-noticia/formulario-noticia.component';
import { TablaNoticiasComponent } from './components/tabla-noticias/tabla-noticias.component';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [
    CommonModule,
    FormularioNoticiaComponent,
    TablaNoticiasComponent,
  ],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css'],
})
export class NoticiasComponent implements OnInit {
  @ViewChild(FormularioNoticiaComponent) formulario!: FormularioNoticiaComponent;

  noticias: Noticia[] = [];
  editingNoticia: Noticia | null = null;
  isSaving = false;
  deletingId?: number;

  private alarms = inject(AlarmService);

  constructor(
    private noticiaService: NoticiaService,
    private actividadService: ActividadService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadNoticias();
  }

  // ========== DATA LOADING ==========

  loadNoticias(): void {
    this.noticiaService.getNoticias().subscribe({
      next: (data) => (this.noticias = data || []),
      error: (err) => console.error('Error al cargar noticias', err),
    });
  }

  // ========== EVENTS FROM CHILDREN ==========

  onEdit(noticia: Noticia): void {
    this.confirmPassword().then((confirmed) => {
      if (!confirmed) return;
      this.editingNoticia = { ...noticia };
    });
  }

  onCancelEdit(): void {
    this.editingNoticia = null;
  }

  async onSave(event: { payload: CreateNoticiaDto; editingId?: number }): Promise<void> {
    // Para crear pedimos contraseña aquí; para editar ya se pidió al presionar "edit"
    if (!event.editingId) {
      const confirmed = await this.confirmPassword();
      if (!confirmed) return;
    }

    this.isSaving = true;

    if (event.editingId) {
      this.updateNoticia(event.editingId, event.payload);
    } else {
      this.createNoticia(event.payload);
    }
  }

  async onDelete(id: number): Promise<void> {
    const confirmed = await this.confirmPassword();
    if (!confirmed) return;

    this.deletingId = id;

    this.noticiaService.deleteNoticia(id).subscribe({
      next: () => {
        this.noticias = this.noticias.filter((x) => x.idNoticia !== id);
        this.alarms.showSuccess('Noticia eliminada', { detail: `ID: ${id}` });
        this.registerActivity(`Eliminó noticia (ID: ${id})`);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'No se pudo eliminar la noticia.';
        this.alarms.showError('No se pudo eliminar la noticia', { detail: msg, life: 7000 });
      },
      complete: () => {
        this.deletingId = undefined;
      },
    });
  }

  // ========== CRUD PRIVADO ==========

  private createNoticia(payload: CreateNoticiaDto): void {
    this.noticiaService.createNoticia(payload).subscribe({
      next: () => {
        this.alarms.showSuccess('Noticia creada correctamente', { detail: `Título: ${payload.titulo}` });
        this.loadNoticias();
        this.formulario.resetForm();
        this.registerActivity(`Agregó noticia (Título: ${payload.titulo})`);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'No se pudo crear la noticia.';
        this.alarms.showError('No se pudo crear la noticia', { detail: msg });
      },
      complete: () => (this.isSaving = false),
    });
  }

  private updateNoticia(id: number, payload: CreateNoticiaDto): void {
    this.noticiaService.updateNoticia(id, payload).subscribe({
      next: () => {
        this.alarms.showSuccess('Noticia actualizada correctamente', {
          detail: `ID: ${id}${payload?.titulo ? ` • ${payload.titulo}` : ''}`,
        });
        this.loadNoticias();
        this.formulario.resetForm();
        this.editingNoticia = null;
        this.registerActivity(`Editó noticia (ID: ${id})`);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'No se pudo actualizar la noticia.';
        this.alarms.showError('No se pudo actualizar la noticia', { detail: msg });
      },
      complete: () => (this.isSaving = false),
    });
  }

  // ========== HELPERS ==========

  private confirmPassword(): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialog
        .open(ConfirmPasswordComponent, { width: '420px', disableClose: true })
        .afterClosed()
        .subscribe((confirmed) => resolve(!!confirmed));
    });
  }

  private registerActivity(descripcion: string): void {
    try {
      const usuarioId = this.authService.getCurrentUserId();
      const now = new Date();
      const actividad = {
        idUsuario: Number(usuarioId),
        fechaInicio: now.toISOString(),
        fechaFin: now.toISOString(),
        fechaActividad: now.toISOString().split('T')[0],
        hora: now.toISOString().split('T')[1].split('.')[0],
        descripcionAccion: descripcion,
      };
      this.actividadService.addActividad(actividad as any).subscribe({ next: () => {}, error: () => {} });
    } catch (e) {
      console.error('Error al registrar actividad', e);
    }
  }
}
