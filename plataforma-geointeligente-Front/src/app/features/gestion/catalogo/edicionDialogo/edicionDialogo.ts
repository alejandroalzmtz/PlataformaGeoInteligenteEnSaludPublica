import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoService } from '../../../../core/services/CatalogoService';
import { AlarmService } from '../../../../core/components/Alarms/alarm.service';

@Component({
  selector: 'edicionDialogo',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './edicionDialogo.html',
  styleUrls: ['./edicionDialogo.css']
})
export class edicionDialogo {
  formData: any = {};
  loading = false;
  kind: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<edicionDialogo>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private catalogoSvc: CatalogoService,
    private alarms: AlarmService
  ) {
    this.kind = data?.kind ?? null;
    this.formData = data?.item ? JSON.parse(JSON.stringify(data.item)) : {};
  }

  keys() {
    // For enfermedad, present fields in a specific order and hide technical fields
    if (this.kind === 'enfermedad') {
      // do not expose internal idEnfermedad for editing; show codigoICD, nombre, descripcion in order
      const order = ['codigoICD', 'nombreEnfermedad', 'descripcion'];
      const src = Object.keys(this.formData || {}).filter((k) => k !== '__raw' && k !== 'idEnfermedad');
      // return only keys that exist in the data, in the preferred order
      return order.filter((k) => src.includes(k)).concat(src.filter((k) => !order.includes(k)));
    }
    // For servicio, hide the idServicio field (not editable)
    if (this.kind === 'servicio') {
      return Object.keys(this.formData || {}).filter((k) => k !== '__raw' && k !== 'idServicio');
    }
    // For derecho, hide the idDerechoHab field (not editable)
    if (this.kind === 'derecho') {
      return Object.keys(this.formData || {}).filter((k) => {
        const lower = String(k).toLowerCase();
        return lower !== '__raw' && lower !== 'idderechohab' && lower !== 'id';
      });
    }
    // For motivo, hide the idMotivoEgreso field (not editable)
    if (this.kind === 'motivo') {
      return Object.keys(this.formData || {}).filter((k) => {
        const lower = String(k).toLowerCase();
        return lower !== '__raw' && lower !== 'idmotivoegreso' && lower !== 'id';
      });
    }
    // For procedencia, hide idProcedencia (not editable)
    if (this.kind === 'procedencia') {
      return Object.keys(this.formData || {}).filter((k) => {
        const lower = String(k).toLowerCase();
        return lower !== '__raw' && lower !== 'idprocedencia' && lower !== 'id';
      });
    }
    // For rango, hide any id-like fields (not editable)
    if (this.kind === 'rango') {
      return Object.keys(this.formData || {}).filter((k) => {
        const lower = String(k).toLowerCase();
        return lower !== '__raw' && lower !== 'id' && lower !== 'idrango' && lower !== 'idrangoedad' && lower !== 'idrangoid';
      });
    }
    // For municipio, show only nombreMunicipio (do not expose any id fields)
    if (this.kind === 'municipio') {
      const src = Object.keys(this.formData || {}).filter((k) => k !== '__raw');
      const order = ['nombreMunicipio'];
      return order.filter((k) => src.includes(k));
    }
    // For localidad, show only nombreLocalidad (do not expose ids like idMpo/idEdo)
    if (this.kind === 'localidad') {
      const src = Object.keys(this.formData || {}).filter((k) => k !== '__raw');
      const order = ['nombreLocalidad'];
      return order.filter((k) => src.includes(k));
    }
    // For estado, show only nombreEstado (do not expose idEstado)
    if (this.kind === 'estado') {
      const src = Object.keys(this.formData || {}).filter((k) => k !== '__raw');
      const order = ['nombreEstado'];
      return order.filter((k) => src.includes(k));
    }
    return Object.keys(this.formData || {}).filter((k) => k !== '__raw');
  }

  isTextarea(key: string) {
    const lower = String(key || '').toLowerCase();
    return lower.includes('descripcion') || lower.includes('desc') || lower.includes('observ') || lower.includes('nota');
  }

  // Friendly label mapping per field/key
  labelFor(key: string) {
    if (!key) return key;
    if (this.kind === 'enfermedad') {
      const map: Record<string, string> = {
        codigoICD: 'Código ICD',
        idEnfermedad: 'ID',
        nombreEnfermedad: 'Nombre de la enfermedad',
        descripcion: 'Descripción'
      };
      return map[key] ?? key;
    }
    if (this.kind === 'derecho') {
      const map: Record<string, string> = { descripcion: 'Descripción' };
      return map[key] ?? key;
    }
    if (this.kind === 'motivo') {
      const map: Record<string, string> = { descripcion: 'Descripción' };
      return map[key] ?? key;
    }
    if (this.kind === 'rango') {
      const map: Record<string, string> = { rangoInicial: 'Desde', rangoFinal: 'Hasta' };
      return map[key] ?? key;
    }
    if (this.kind === 'procedencia') {
      const map: Record<string, string> = { idProcedencia: 'ID', descripcion: 'Descripción' };
      return map[key] ?? key;
    }
    if (this.kind === 'municipio') {
      const map: Record<string, string> = { idMunicipio: 'ID', nombreMunicipio: 'Nombre municipio' };
      return map[key] ?? key;
    }
    if (this.kind === 'localidad') {
      const map: Record<string, string> = { idLocalidad: 'ID', nombreLocalidad: 'Nombre localidad', idLoc: 'ID' };
      return map[key] ?? key;
    }
    if (this.kind === 'estado') {
      const map: Record<string, string> = { idEstado: 'ID', nombreEstado: 'Nombre estado' };
      return map[key] ?? key;
    }
    return key;
  }

  isReadOnly(key: string) {
    if (!key) return false;
    // For enfermedades the ID must not be editable
    if (this.kind === 'enfermedad' && String(key).toLowerCase() === 'idenfermedad') return true;
    // For derecho/motivo ensure any ID-like field is read-only if it slipped through
    const lower = String(key).toLowerCase();
    if (this.kind === 'derecho' && (lower === 'idderechohab' || lower === 'id')) return true;
    if (this.kind === 'motivo' && (lower === 'idmotivoegreso' || lower === 'id')) return true;
    if (this.kind === 'rango' && (lower === 'id' || lower === 'idrango' || lower === 'idrangoedad')) return true;
    if (this.kind === 'procedencia' && (lower === 'idprocedencia' || lower === 'id')) return true;
    return false;
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    // basic validation for enfermedad
    if (this.kind === 'enfermedad') {
      const name = String(this.formData?.nombreEnfermedad || '').trim();
      if (!name) {
        this.alarms.showError('El nombre de la enfermedad es obligatorio');
        return;
      }
    }

    this.loading = true;
    const item = this.formData;

    const finish = (updated: any, message: string) => {
      this.loading = false;
      this.dialogRef.close({ updated, message, kind: this.kind });
    };
    const handleErr = (e: any) => {
      console.error(e);
      this.alarms.showError('No se pudo actualizar');
      this.loading = false;
    };

    switch (this.kind) {
      case 'enfermedad': {
        // Only send the editable fields; API expects the id in the URL to be the codigoICD
        const idForUrl = String(item.codigoICD ?? item.idEnfermedad ?? '');
        const payload: Partial<any> = {
          codigoICD: item.codigoICD,
          nombreEnfermedad: item.nombreEnfermedad,
          descripcion: item.descripcion,
        };
        this.catalogoSvc.update(idForUrl, payload).subscribe({ next: (r) => finish(r, 'Enfermedad actualizada'), error: handleErr });
        break;
      }
      case 'servicio': {
        const id = Number(item.idServicio ?? item.id ?? null);
        const payload = { nombreServicio: item.nombreServicio, descripcion: item.descripcion };
        this.catalogoSvc.updateServicioMedico(id, payload).subscribe({ next: (r) => finish(r, 'Servicio actualizado'), error: handleErr });
        break;
      }
      case 'derecho': {
        const id = Number(item.idDerechoHab ?? item.id ?? null);
        const descVal = (item.descripcion ?? '') ? String(item.descripcion) : null;
        const payload: any = { descripcion: descVal };
        this.catalogoSvc.updateDerechoHab(id, payload).subscribe({ next: (r) => finish(r, 'Derecho actualizado'), error: handleErr });
        break;
      }
      case 'estado': {
        const id = Number(item.idEstado ?? item.id ?? null);
        const payload: any = { nombreEstado: item.nombreEstado };
        this.catalogoSvc.updateEstado(id, payload).subscribe({ next: (r) => finish(r, 'Estado actualizado'), error: handleErr });
        break;
      }
      case 'motivo': {
        const id = Number(item.idMotivoEgreso ?? item.id ?? null);
        const descVal = (item.descripcion ?? '') ? String(item.descripcion) : null;
        const payload: any = { descripcion: descVal };
        this.catalogoSvc.updateMotivoEgreso(id, payload).subscribe({ next: (r) => finish(r, 'Motivo actualizado'), error: handleErr });
        break;
      }
      case 'rango': {
        const id = Number(item.id ?? null);
        // Normalize payload expected by backend: { rangoInicial, rangoFinal }
        const payload: any = {
          rangoInicial: Number(item.rangoInicial ?? item.desde ?? 0),
          rangoFinal: Number(item.rangoFinal ?? item.hasta ?? 0),
        };
        this.catalogoSvc.updateRangoEdad(id, payload).subscribe({ next: (r) => finish(r, 'Rango actualizado'), error: handleErr });
        break;
      }
      case 'procedencia': {
        const id = Number(item.idProcedencia ?? item.id ?? null);
        const payload: any = { descripcion: item.descripcion };
        this.catalogoSvc.updateProcedencia(id, payload).subscribe({ next: (r) => finish(r, 'Procedencia actualizada'), error: handleErr });
        break;
      }
      case 'municipio': {
        const id = Number(item.idMunicipio ?? item.idMpo ?? item.id ?? null);
        const payload: any = { nombreMunicipio: item.nombreMunicipio };
        this.catalogoSvc.updateMunicipio(id, payload).subscribe({ next: (r) => finish(r, 'Municipio actualizado'), error: handleErr });
        break;
      }
      case 'localidad': {
        // Backend expects the numeric idLoc in the URL (example: UpdateLocalidad/{idLoc})
        const id = Number(item.idLoc ?? item.idLocalidad ?? item.id ?? null);
        const payload: any = { nombreLocalidad: item.nombreLocalidad };
        this.catalogoSvc.updateLocalidad(id, payload).subscribe({ next: (r) => finish(r, 'Localidad actualizada'), error: handleErr });
        break;
      }
      default:
        this.loading = false;
        this.alarms.showInfo('Tipo no soportado para editar');
        break;
    }
  }
}
