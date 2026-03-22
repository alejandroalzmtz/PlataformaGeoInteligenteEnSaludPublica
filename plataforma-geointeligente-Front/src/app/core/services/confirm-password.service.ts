import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPasswordComponent } from '../components/dialogs/confirm-password/confirm-password.component';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmPasswordService {
  constructor(private dialog: MatDialog) {}

  open(): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmPasswordComponent, {
      width: '400px',
      disableClose: true,
    });

    return dialogRef.afterClosed();
  }
  
}
