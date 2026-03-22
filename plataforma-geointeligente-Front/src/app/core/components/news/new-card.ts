import { Component, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface NoticiaDialogData {
  titulo?: string;
  contenido?: string;
  imagenPrincipal?: string;
}

@Component({
  selector: 'app-noticia-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ data.titulo }}</mat-card-title>
      </mat-card-header>
      <img *ngIf="data.imagenPrincipal" [src]="data.imagenPrincipal" alt="imagen" style="width:100%;max-height:320px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />
      <mat-card-content>
        <div [innerHTML]="data.contenido"></div>
      </mat-card-content>
      <mat-card-actions style="justify-content:flex-end">
        <button mat-stroked-button (click)="close()">Cerrar</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class NoticiaDetalleDialog {
  constructor(
    public dialogRef: MatDialogRef<NoticiaDetalleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: NoticiaDialogData
  ) {}

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-new-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './new-card.html',
  styleUrls: ['./new-card.css']
})
export class NewCardComponent {
  @Input() image: string | undefined;
  @Input() description: string | undefined;
  @Input() titulo: string | undefined;
  @Input() contenido: string | undefined;

  constructor(private dialog: MatDialog) {}

  openDetalle() {
    this.dialog.open(NoticiaDetalleDialog, {
      width: '600px',
      data: {
        titulo: this.titulo || this.description,
        imagenPrincipal: this.image,
        contenido: this.contenido
      }
    });
  }
}
