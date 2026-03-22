import { Component, inject, signal, Inject } from '@angular/core';
import { Observable } from 'rxjs';
// confirmation handled by caller; keep native confirm here for fallback
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CatalogoService } from '../../../../core/services/CatalogoService';
import { AlarmService } from '../../../../core/components/Alarms/alarm.service';

@Component({
  selector: 'app-anadir-catalogo',
  standalone: true,
  templateUrl: './añadirCatalogo.html',
  styleUrls: ['./añadirCatalogo.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class añadirCatalogo {
  private fb = inject(FormBuilder);
  private api = inject(CatalogoService);
  private dialogRef = inject(MatDialogRef<añadirCatalogo>);
  private alarms = inject(AlarmService);
  data = inject(MAT_DIALOG_DATA) as { kind?: string } | null;

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombreEnfermedad: ['', [Validators.required]],
    descripcion: [''],
    codigoICD: [''],
    nombreServicio: [''],
    descripcionSimple: [''],
    nombreEstado: [''],
    nombreMunicipio: ['', [Validators.required]],
    nombreLocalidad: ['', [Validators.required]],
    desde: [null, [Validators.required, Validators.min(0), Validators.max(110)]],
    hasta: [null, [Validators.required, Validators.min(0), Validators.max(110)]],
  });

  // determine if we're editing an existing item
  public isEdit = false;

  constructor() {
    // Prefill form if dialog provided an item for editing
    const item = (this.data as any)?.item;
    this.isEdit = !!item;
    if (this.isEdit && item) {
      // Map fields based on possible shapes
      this.form.patchValue({
        nombreEnfermedad: item.nombreEnfermedad ?? item.nombre ?? '',
        descripcion: item.descripcion ?? item.descripcionSimple ?? '',
        codigoICD: item.codigoICD ?? '',
        nombreServicio: item.nombreServicio ?? '',
        descripcionSimple: item.descripcion ?? item.descripcionSimple ?? '',
        nombreEstado: item.nombreEstado ?? '',
        nombreMunicipio: item.nombreMunicipio ?? item.nombre ?? '',
        nombreLocalidad: item.nombreLocalidad ?? item.nombre ?? '',
        desde: (item.desde ?? item.rangoInicial ?? null),
        hasta: (item.hasta ?? item.rangoFinal ?? null),
      });
    }
    // If dialog kind is not 'enfermedad', remove the required validator
    const kind = (this.data && (this.data as any).kind) ? String((this.data as any).kind) : 'enfermedad';
    if (kind !== 'enfermedad') {
      const ctrl = this.form.get('nombreEnfermedad');
      if (ctrl) { ctrl.clearValidators(); ctrl.updateValueAndValidity(); }
    }
    // If not adding municipio/localidad, clear their validators
    if (kind !== 'municipio') {
      const ctrl = this.form.get('nombreMunicipio'); if (ctrl) { ctrl.clearValidators(); ctrl.updateValueAndValidity(); }
    }
    if (kind !== 'localidad') {
      const ctrl = this.form.get('nombreLocalidad'); if (ctrl) { ctrl.clearValidators(); ctrl.updateValueAndValidity(); }
    }
    // If dialog kind is not 'rango', remove validators for desde/hasta so non-rango forms are valid
    if (kind !== 'rango' && kind !== 'rango-edad') {
      const from = this.form.get('desde');
      const to = this.form.get('hasta');
      if (from) { from.clearValidators(); from.updateValueAndValidity(); }
      if (to) { to.clearValidators(); to.updateValueAndValidity(); }
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }

  save() {
    if (this.form.invalid) {
      console.debug('[añadirCatalogo] form invalid, values:', this.form.value);
      this.form.markAllAsTouched();
      return;
    }
    const kind = (this.data && this.data.kind) ? String(this.data.kind) : 'enfermedad';

    // confirmation (word differs when editing)
    const name = String(this.form.value.nombreEnfermedad ?? this.form.value.nombreServicio ?? this.form.value.nombreEstado ?? this.form.value.descripcion ?? '');
    const actionWord = this.isEdit ? 'actualizar' : 'agregar';
    const ok = window.confirm(`¿Seguro que quieres ${actionWord} ${kind} "${name}"?`);
    if (!ok) return;

    this.saving.set(true);
    this.error.set(null);

    const v = this.form.value as any;

    // route to proper register or update method
    let call$: Observable<any> | null = null;
    switch (kind) {
      case 'servicio':
      case 'servicio-medico':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idServicio ?? (this.data as any).item.id ?? 0));
          const descVal = (v.descripcionSimple ?? v.descripcion) ? String(v.descripcionSimple || v.descripcion) : null;
          const payload: any = { nombreServicio: String(v.nombreServicio || ''), descripcion: descVal };
          console.debug('[añadirCatalogo] updating servicio', id, payload);
          call$ = this.api.updateServicioMedico ? this.api.updateServicioMedico(id, payload) : this.api.registerServicioMedico(payload);
        } else {
          const descVal = (v.descripcionSimple ?? v.descripcion) ? String(v.descripcionSimple || v.descripcion) : null;
          const payload: any = { nombreServicio: String(v.nombreServicio || ''), descripcion: descVal };
          console.debug('[añadirCatalogo] registering servicio', payload);
          call$ = this.api.registerServicioMedico(payload);
        }
        break;
      case 'derecho':
      case 'derecho-habiente':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idDerechoHab ?? (this.data as any).item.id ?? 0));
          const descVal = (v.descripcionSimple ?? v.descripcion) ? String(v.descripcionSimple || v.descripcion) : null;
          const payload: any = { descripcion: descVal };
          call$ = this.api.updateDerechoHab ? this.api.updateDerechoHab(id, payload) : this.api.registerDerechoHab(payload);
        } else {
          const descVal = (v.descripcionSimple ?? v.descripcion) ? String(v.descripcionSimple || v.descripcion) : null;
          const payload: any = { descripcion: descVal };
          call$ = this.api.registerDerechoHab(payload);
        }
        break;
      case 'estado':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idEstado ?? (this.data as any).item.id ?? 0));
          call$ = this.api.updateEstado ? this.api.updateEstado(id, { nombreEstado: String(v.nombreEstado || v.nombreEnfermedad || '') }) : this.api.registerEstado({ nombreEstado: String(v.nombreEstado || v.nombreEnfermedad || '') });
        } else {
          call$ = this.api.registerEstado({ nombreEstado: String(v.nombreEstado || v.nombreEnfermedad || '') });
        }
        break;
      case 'motivo':
      case 'motivo-egreso':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idMotivoEgreso ?? (this.data as any).item.id ?? 0));
          call$ = this.api.updateMotivoEgreso ? this.api.updateMotivoEgreso(id, { descripcion: String(v.descripcionSimple || v.descripcion || '') }) : this.api.registerMotivoEgreso({ descripcion: String(v.descripcionSimple || v.descripcion || '') });
        } else {
          call$ = this.api.registerMotivoEgreso({ descripcion: String(v.descripcionSimple || v.descripcion || '') });
        }
        break;
      case 'rango':
      case 'rango-edad':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.id ?? (this.data as any).item.idRango ?? 0));
          const payload: any = { rangoInicial: Number(v.desde ?? 0), rangoFinal: Number(v.hasta ?? 0) };
          call$ = this.api.updateRangoEdad ? this.api.updateRangoEdad(id, payload) : this.api.registerRangoEdad(payload);
        } else {
          const payload: any = { rangoInicial: Number(v.desde ?? 0), rangoFinal: Number(v.hasta ?? 0) };
          call$ = this.api.registerRangoEdad(payload);
        }
        break;
      case 'procedencia':
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idProcedencia ?? (this.data as any).item.id ?? 0));
          const payload: any = { descripcion: String(v.descripcionSimple || v.descripcion || '') };
          console.debug('[añadirCatalogo] updating procedencia', id, payload);
          call$ = this.api.updateProcedencia ? this.api.updateProcedencia(id, payload) : this.api.registerProcedencia(payload);
        } else {
          const payload: any = { descripcion: String(v.descripcionSimple || v.descripcion || '') };
          console.debug('[añadirCatalogo] registering procedencia', payload);
          call$ = this.api.registerProcedencia(payload);
        }
        break;
      case 'municipio':
        // create/update municipio; caller should provide `idEdo` in dialog data when creating
        if (this.isEdit && (this.data as any)?.item) {
          const id = Number(((this.data as any).item.idMunicipio ?? (this.data as any).item.id ?? 0));
          const payload: any = { idEdo: Number((this.data as any).idEdo ?? (this.data as any).item?.idEstado ?? null), nombreMunicipio: String(v.nombreMunicipio || '') };
          call$ = this.api.updateMunicipio ? this.api.updateMunicipio(id, payload) : this.api.registerMunicipio(payload);
        } else {
          const payload: any = { idEdo: Number((this.data as any).idEdo ?? (this.data as any).item?.idEstado ?? null), nombreMunicipio: String(v.nombreMunicipio || '') };
          call$ = this.api.registerMunicipio(payload);
        }
        break;
      case 'localidad':
        // create/update localidad; caller should provide `idEdo` and `idMpo` in dialog data when creating
        if (this.isEdit && (this.data as any)?.item) {
          const itemAny = (this.data as any).item;
          const id = Number(itemAny?.idLocalidad ?? itemAny?.idLoc ?? itemAny?.id ?? 0);
          const payload: any = { idEdo: Number((this.data as any).idEdo ?? itemAny?.idEdo ?? null), idMpo: Number((this.data as any).idMpo ?? itemAny?.idMpo ?? null), nombreLocalidad: String(v.nombreLocalidad || '') };
          call$ = this.api.updateLocalidad ? this.api.updateLocalidad(id, payload) : this.api.registerLocalidad(payload);
        } else {
          const itemAny = (this.data as any).item;
          const payload: any = { idEdo: Number((this.data as any).idEdo ?? itemAny?.idEdo ?? null), idMpo: Number((this.data as any).idMpo ?? itemAny?.idMpo ?? null), nombreLocalidad: String(v.nombreLocalidad || '') };
          call$ = this.api.registerLocalidad(payload);
        }
        break;
      case 'enfermedad':
      default:
        if (this.isEdit && (this.data as any)?.item) {
          const id = String(((this.data as any).item.idEnfermedad ?? (this.data as any).item.id ?? ''));
          call$ = this.api.update(id, { nombreEnfermedad: String(v.nombreEnfermedad || ''), descripcion: String(v.descripcion || ''), codigoICD: String(v.codigoICD || '') });
        } else {
          call$ = this.api.registerEnfermedad({ nombreEnfermedad: String(v.nombreEnfermedad || ''), descripcion: String(v.descripcion || ''), codigoICD: String(v.codigoICD || '') });
        }
        break;
    }

    if (!call$) {
      this.saving.set(false);
      this.error.set('Tipo de registro no soportado.');
      return;
    }

    call$.subscribe({
      next: (created: any) => {
        console.debug('[añadirCatalogo] save success', created);
        this.saving.set(false);
        try { this.alarms.showSuccess('Elemento guardado', { detail: `${name}` }); } catch {}
        this.dialogRef.close(created);
      },
      error: (err: any) => {
        console.error('register error', err);
        this.saving.set(false);
        // Prefer server error message if available
        let msg = 'No se pudo registrar el elemento.';
        try {
          if (err?.error) {
            msg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
          } else if (err?.message) {
            msg = String(err.message);
          }
        } catch (e) {
          // ignore stringify errors
        }
        this.error.set(msg);
        try { this.alarms.showError('Error al guardar', { detail: msg, sticky: false, life: 6000, key: 'br' }); } catch {}
      }
    });
  }
}
