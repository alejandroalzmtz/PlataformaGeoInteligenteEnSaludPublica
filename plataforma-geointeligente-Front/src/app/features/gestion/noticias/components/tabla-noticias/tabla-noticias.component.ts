import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Noticia } from '../../models/noticias.models';

@Component({
  selector: 'app-tabla-noticias',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './tabla-noticias.component.html',
  styleUrls: ['./tabla-noticias.component.css'],
})
export class TablaNoticiasComponent {
  /** Lista de noticias a mostrar */
  @Input() noticias: Noticia[] = [];

  /** ID que se está eliminando (para deshabilitar botón) */
  @Input() deletingId?: number;

  /** Emite la noticia a editar */
  @Output() edit = new EventEmitter<Noticia>();

  /** Emite el ID de la noticia a eliminar */
  @Output() delete = new EventEmitter<number>();

  displayedColumns = ['idNoticia', 'titulo', 'image', 'acciones'];

  onEdit(noticia: Noticia): void {
    this.edit.emit(noticia);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }
}
