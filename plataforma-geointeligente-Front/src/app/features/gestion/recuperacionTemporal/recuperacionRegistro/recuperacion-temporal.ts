import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistroMedicoService } from '../../../../core/services/RegistroMedicoservice';
import { ActividadService } from '../../../../core/services/actividad.services';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-recuperacion-temporal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './recuperacion-temporal.html',
})
export class RecuperacionTemporalModal {

  constructor(
    private api: RegistroMedicoService,
    private snackbar: MatSnackBar,
    private actividadService: ActividadService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<RecuperacionTemporalModal>,
    @Inject(MAT_DIALOG_DATA) public data: { idRegistro: number }
  ) {}

 confirmarRecuperacion(): void {
  this.api.revertirEliminacion(this.data.idRegistro).subscribe({
    next: () => {
      this.snackbar.open('✓ Registro recuperado', 'Cerrar', {
        duration: 2500,
        panelClass: ['snack-center', 'snack-success']
      });

      // Registrar actividad del usuario
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
            descripcionAccion: `Recuperó registro (ID: ${this.data.idRegistro})`
          };
          this.actividadService.addActividad(actividad as any).subscribe({ next: () => {}, error: () => {} });
        }
      } catch (e) { console.error('Error al registrar actividad', e); }

      this.dialogRef.close(true);
    },
    error: () => {
      this.snackbar.open('✖ No se pudo recuperar', 'Cerrar', {
        duration: 2500,
        panelClass: ['snack-center', 'snack-error']
      });
      this.dialogRef.close(false);
    }
  });
}


  cancelar(): void {
    this.dialogRef.close(false);
  }
}
