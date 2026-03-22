import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistroMedicoService } from '../../../../core/services/RegistroMedicoservice';

@Component({
  selector: 'app-eliminacion-permanente',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './eliminacion-permanente.html',
})
export class EliminacionPermanenteModal {

  constructor(
    private api: RegistroMedicoService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<EliminacionPermanenteModal>,
    @Inject(MAT_DIALOG_DATA) public data: { idRegistro: number }
  ) {}

  confirmarEliminacion(): void {
    this.api.deleteRegistro(this.data.idRegistro).subscribe({
      next: () => {
        this.snackbar.open('✓ Registro eliminado permanentemente', 'Cerrar', {
          duration: 2500,
          panelClass: ['snack-center', 'snack-success']
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackbar.open('✖ No se pudo eliminar permanentemente', 'Cerrar', {
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
