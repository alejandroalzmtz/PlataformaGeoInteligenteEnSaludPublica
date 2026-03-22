
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadService, Actividad } from '../../../../core/services/actividad.services';

@Component({
  selector: 'app-actividad',
  standalone: true,
  imports: [CommonModule, NgForOf, FormsModule],
  templateUrl: './actividad.html',
  styleUrls: ['./actividad.css'] // ✅ corregido
})
export class ActivityModalComponent implements OnInit {
  @Input() userId?: number;             // Recibe el ID del usuario
  @Input() visible: boolean = false;    // Controla si se muestra
  @Output() close = new EventEmitter<void>(); // Evento para cerrar modal

  actividades: Actividad[] = [];        // Lista de actividades del usuario

  constructor(private actividadService: ActividadService) {}

  ngOnInit() {
    if (this.userId) {
      this.loadActividades();
    }
  }

  loadActividades() {
    this.actividadService.getActividadesPorUsuario(this.userId).subscribe({
      next: (data) => this.actividades = data,
      error: (err) => console.error('Error al cargar actividades:', err)
    });
    /*this.actividadService.getActividades().subscribe({
      next: (data) => this.actividades = data,
      error: (err) => console.error('Error al cargar actividades:', err)
    });*/
  }

  closeModal() {
    this.close.emit();
    this.actividades = []; // Limpiar actividades al cerrar
  }
}
