import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RegistroMedicoService } from '../../../../core/services/RegistroMedicoservice';
import { ActividadService } from '../../../../core/services/actividad.services';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlarmService } from '../../../../core/components/Alarms';

@Component({
  selector: 'app-eliminacion-temporal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './eliminacion-temporal.html',
  styleUrls: ['./eliminacion-temporal.css'], // ← AGREGA ESTO
})
export class EliminacionTemporalModal {
  private alarms = inject(AlarmService);

  constructor(
    private registroService: RegistroMedicoService,
    private snackbar: MatSnackBar,
    private actividadService: ActividadService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<EliminacionTemporalModal>,
    @Inject(MAT_DIALOG_DATA) public data: { idRegistro: number },
  ) {}

  confirmarEliminacion(): void {
    this.registroService.eliminacionTemporal(this.data.idRegistro).subscribe({
      next: () => {
        // ✅ Toast success
        this.alarms.showSuccess('Registro eliminado', {
          detail: `ID: ${this.data.idRegistro}`,
        });

        // Registrar actividad
        try {
          const usuarioLogueado = this.authService.getCurrentUser();
          if (usuarioLogueado) {
            const now = new Date();
            const actividad = {
              idUsuario: parseInt(usuarioLogueado.id),
              fechaInicio: now.toISOString(),
              fechaFin: now.toISOString(),
              fechaActividad: now.toISOString().split('T')[0],
              hora: now.toISOString().split('T')[1].split('.')[0],
              descripcionAccion: `Eliminó temporalmente registro (ID: ${this.data.idRegistro})`,
            };
            this.actividadService
              .addActividad(actividad as any)
              .subscribe({ next: () => {}, error: () => {} });
          }
        } catch (e) {
          console.error('Error al registrar actividad', e);
        }

        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);

        const msg = err?.error?.message ?? err?.message ?? 'No se pudo eliminar el registro';

        this.alarms.showError('Error al eliminar', {
          detail: msg,
          life: 7000,
        });
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
