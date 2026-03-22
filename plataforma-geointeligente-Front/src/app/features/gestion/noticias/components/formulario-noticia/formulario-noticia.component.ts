import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Noticia, CreateNoticiaDto } from '../../models/noticias.models';

@Component({
  selector: 'app-formulario-noticia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './formulario-noticia.component.html',
  styleUrls: ['./formulario-noticia.component.css'],
})
export class FormularioNoticiaComponent implements OnChanges {
  /** Noticia que se está editando (null = modo creación) */
  @Input() editingNoticia: Noticia | null = null;

  /** Indica si el padre está procesando un guardado */
  @Input() isSaving = false;

  /** Emite el payload para guardar (crear o actualizar) */
  @Output() save = new EventEmitter<{ payload: CreateNoticiaDto; editingId?: number }>();

  /** Emite cuando el usuario cancela la edición */
  @Output() cancelEdit = new EventEmitter<void>();

  form: FormGroup;
  imagePreview?: string;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      contenido: ['', Validators.required],
      imagenPrincipal: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingNoticia']) {
      const noticia = this.editingNoticia;
      if (noticia) {
        this.form.patchValue({
          titulo: noticia.titulo,
          contenido: noticia.contenido,
          imagenPrincipal: noticia.imagenPrincipal ?? '',
        });
        this.imagePreview = noticia.imagenPrincipal;
      } else {
        this.form.reset();
        this.imagePreview = undefined;
      }
    }
  }

  onImageUrlChange(): void {
    this.imagePreview = this.form.get('imagenPrincipal')?.value || undefined;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: CreateNoticiaDto = {
      titulo: this.form.value.titulo,
      contenido: this.form.value.contenido,
      imagenPrincipal: this.form.value.imagenPrincipal || undefined,
    };

    this.save.emit({
      payload,
      editingId: this.editingNoticia?.idNoticia,
    });
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }

  /** Verifica que los campos requeridos estén llenos */
  get isFormComplete(): boolean {
    const titulo = this.form.get('titulo')?.value;
    const contenido = this.form.get('contenido')?.value;
    return !!titulo && !!contenido;
  }

  /** Reseteamos el formulario después de un guardado exitoso */
  resetForm(): void {
    this.form.reset();
    this.imagePreview = undefined;
  }
}
