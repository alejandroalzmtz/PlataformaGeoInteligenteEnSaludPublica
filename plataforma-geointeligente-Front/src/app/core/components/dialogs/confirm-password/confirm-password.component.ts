import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { AlarmService } from '../../Alarms/alarm.service';

@Component({
  selector: 'app-confirm-password',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 CLAVE
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.css'],
})
export class ConfirmPasswordComponent {
  password = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ConfirmPasswordComponent>,
    private authService: AuthService,
    private alarmService: AlarmService
  ) {}

  confirm() {
    if (!this.password) {
      this.alarmService.showWarn('Ingresa tu contraseña');
      return;
    }

    this.loading = true;

    this.authService.validatePassword(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.alarmService.showError('Contraseña incorrecta');
      },
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
