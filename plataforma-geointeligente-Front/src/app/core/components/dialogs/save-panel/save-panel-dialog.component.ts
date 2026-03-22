import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { AlarmService } from '../../Alarms/alarm.service';

export interface SavePanelDialogData {
  title: string;
  confirmLabel: string;
  panelName: string;
}

export interface SavePanelDialogResult {
  panelName: string;
}

@Component({
  selector: 'app-save-panel-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './save-panel-dialog.component.html',
  styleUrl: './save-panel-dialog.component.css',
})
export class SavePanelDialogComponent {
  panelName: string;
  password = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<SavePanelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SavePanelDialogData,
    private authService: AuthService,
    private alarmService: AlarmService,
  ) {
    this.panelName = data.panelName ?? '';
  }

  confirm(): void {
    if (!this.panelName.trim()) {
      this.alarmService.showWarn('El nombre del panel es requerido');
      return;
    }
    if (!this.password) {
      this.alarmService.showWarn('Ingresa tu contraseña');
      return;
    }

    this.loading = true;

    this.authService.validatePassword(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close({ panelName: this.panelName.trim() } as SavePanelDialogResult);
      },
      error: () => {
        this.loading = false;
        this.alarmService.showError('Contraseña incorrecta');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
