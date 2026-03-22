import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { añadirCatalogo } from './añadirCatalogo/añadirCatalogo';
import { edicionDialogo} from './edicionDialogo/edicionDialogo';
import { CatalogoService, Enfermedad, ServicioMedico, DerechoHab, Estado, MotivoEgreso, RangoEdad, Procedencia, PoblacionEstado, Localidad } from '../../../core/services/CatalogoService';
import { Tables } from '../../../core/components/tables/tables';
import { AlarmService } from '../../../core/components/Alarms/alarm.service';
import { ConfirmPasswordService } from '../../../core/services/confirm-password.service';
import { signal, computed, effect } from '@angular/core';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, Tables, MatDialogModule, MatIconModule, MatTooltipModule, MatButtonModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css']
})
export class Catalogo implements OnInit {
  // Reference Tables so the language service recognizes template usage
  public readonly __TablesRef = Tables;

  enfermedades: Enfermedad[] = [];
  servicios: any[] = [];
  derechos: DerechoHab[] = [];
  loading = false;
  error: string | null = null;

  // pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  // search for enfermedades
  searchEnfermedad: string | null = null;
  searchServicios: string | null = null;
  // derechos pagination
  derechosPageNumber = 1;
  derechosPageSize = 10;
  derechosTotalCount = 0;
  // search for derechos
  searchDerechos: string | null = null;
  // estados pagination
  estados: Estado[] = [];
  estadosPageNumber = 1;
  estadosPageSize = 10;
  estadosTotalCount = 0;
  // search for estados
  searchEstados: string | null = null;
  // motivos de egreso
  motivos: MotivoEgreso[] = [];
  motivosPageNumber = 1;
  motivosPageSize = 10;
  motivosTotalCount = 0;
  // search for motivos
  searchMotivos: string | null = null;
  // rangos de edad (no paginado, cliente)
  rangos: RangoEdad[] = [];
  rangosFiltered: RangoEdad[] = [];
  searchRangos: string | null = null;
  // procedencias (no paginado)
  procedencias: Procedencia[] = [];
  procedenciasFiltered: Procedencia[] = [];
  searchProcedencias: string | null = null;
  // UI
  private _activeTab: number = 0;
  get activeTab(): number { return this._activeTab; }
  set activeTab(v: number) {
    if (this._activeTab === v) return;
    const prevTab = this._activeTab;
    this._activeTab = v;
    // clear searches when switching
    this.clearAllSearches();
    // clear selection when switching tabs so items from previous tab aren't still selected
    try { this.clearSelection(); } catch {}
    // if we are leaving the Estados tab, clear selected estado/municipio/localidades
    if (prevTab === 3 && v !== 3) {
      this.selectedEstado = null;
      this.municipios = [];
      this.municipiosPageNumber = 1;
      this.municipiosPageSize = 10;
      this.municipiosTotalCount = 0;
      this.poblacionEstado = null;

      this.selectedMunicipio = null;
      this.localidades = [];
      this.localidadesPageNumber = 1;
      this.localidadesPageSize = 10;
      this.localidadesTotalCount = 0;
      this.searchMunicipios = null;
      this.searchLocalidades = null;
    }
    // reload first page for server-paged tabs to reflect cleared search
    if (v === 0) { this.pageNumber = 1; this.loadPage(1, null); }
    if (v === 2) { this.derechosPageNumber = 1; this.loadDerechosPage(1, null); }
    if (v === 3) { this.estadosPageNumber = 1; this.loadEstadosPage(1, null); }
    if (v === 4) { this.motivosPageNumber = 1; this.loadMotivosPage(1, null); }
    if (v === 5) { this.rangosFiltered = this.rangos.slice(); }
    if (v === 6) { this.procedenciasFiltered = this.procedencias.slice(); }
  }

  // selected estado -> shows municipios + poblacion
  selectedEstado: Estado | null = null;
  municipios: any[] = [];
  municipiosPageNumber = 1;
  municipiosPageSize = 10;
  municipiosTotalCount = 0;
  // search for municipios
  searchMunicipios: string | null = null;
  poblacionEstado: PoblacionEstado | null = null;
  // localidades for selected municipio
  selectedMunicipio: any | null = null;
  localidades: Localidad[] = [];
  localidadesPageNumber = 1;
  localidadesPageSize = 10;
  localidadesTotalCount = 0;
  // search for localidades
  searchLocalidades: string | null = null;

  // UI collapse state: allow user to hide municipios/localidades manually
  collapsedMunicipios: boolean = false;
  collapsedLocalidades: boolean = false;

  toggleMunicipios() { this.collapsedMunicipios = !this.collapsedMunicipios; }
  toggleLocalidades() { this.collapsedLocalidades = !this.collapsedLocalidades; }

  onEstadoClick(row: any) {
    console.debug('[Catalogo] onEstadoClick called', { row });
    const id = Number(row?.idEstado ?? null);
    if (!Number.isFinite(id)) return;
    // clear municipios/localidades UI state before switching to a new estado
    this.selectedMunicipio = null;
    this.localidades = [];
    this.localidadesPageNumber = 1;
    this.localidadesPageSize = 10;
    this.localidadesTotalCount = 0;
    this.searchLocalidades = null;

    this.municipios = [];
    this.municipiosPageNumber = 1;
    this.municipiosPageSize = 10;
    this.municipiosTotalCount = 0;
    this.searchMunicipios = null;

    this.poblacionEstado = null;

    this.selectedEstado = row as Estado;
    // clear any previous municipio/localidad selections when switching estado
    try { this.selectedMunicipioIds.set(new Set()); } catch {}
    try { this.selectedLocalidadIds.set(new Set()); } catch {}
    this.municipiosPageNumber = 1;
    this.loadMunicipiosForEstado(id, 1, this.searchMunicipios);
    this.loadPoblacionEstado(id);
  }

  loadMunicipiosForEstado(estadoId: number, page: number = 1, search: string | null = null) {
    this.catalogoSvc.getMunicipiosPaged(page, this.municipiosPageSize, estadoId, search).subscribe({
      next: (res) => {
        this.municipios = res.items || [];
        this.municipiosPageNumber = res.pageNumber || page;
        this.municipiosPageSize = res.pageSize || this.municipiosPageSize;
        this.municipiosTotalCount = res.totalCount || 0;
      },
      error: () => {
        this.municipios = [];
        this.municipiosTotalCount = 0;
      }
    });
  }

  async saveEdit() {
    if (!this.editingItem || !this.editingKind) return;
    const confirmed = await this.confirmAction();
    if (!confirmed) return;
    this.saveLoading = true;
    const item = this.editingItem;

    const finish = (updated: any, message: string) => {
      // update local arrays depending on activeTab
      switch (this.activeTab) {
        case 0:
          this.enfermedades = (this.enfermedades || []).map((e: any) => ((String(e.idEnfermedad) === String(updated.idEnfermedad || updated.id)) ? updated : e));
          break;
        case 1:
          this.servicios = (this.servicios || []).map((s: any) => ((Number(s.idServicio) === Number(updated.idServicio || updated.id)) ? updated : s));
          this.serviciosFiltered = this.servicios.slice();
          break;
        case 2:
          this.derechos = (this.derechos || []).map((d: any) => ((Number(d.idDerechoHab) === Number(updated.idDerechoHab || updated.id)) ? updated : d));
          break;
        case 3:
          this.estados = (this.estados || []).map((e: any) => ((Number(e.idEstado) === Number(updated.idEstado || updated.id)) ? updated : e));
          break;
        case 4:
          this.motivos = (this.motivos || []).map((m: any) => ((Number(m.idMotivoEgreso) === Number(updated.idMotivoEgreso || updated.id)) ? updated : m));
          break;
        case 5:
          this.rangos = (this.rangos || []).map((r: any) => ((Number(r.id) === Number(updated.id)) ? updated : r));
          this.rangosFiltered = this.rangos.slice();
          break;
        case 6:
          this.procedencias = (this.procedencias || []).map((p: any) => ((Number(p.idProcedencia) === Number(updated.idProcedencia || updated.id)) ? updated : p));
          this.procedenciasFiltered = this.procedencias.slice();
          break;
      }
      this.alarms.showSuccess(message || 'Elemento actualizado', { detail: '' });
      // reload the current tab with empty search so results reflect server state
      try { this.clearCurrentSearch(); } catch {}
      this.editDialogVisible = false;
      this.saveLoading = false;
    };


    // call appropriate update endpoint
    switch (this.editingKind) {
      case 'enfermedad': {
        const id = String(item.idEnfermedad ?? item.id ?? item.codigoICD ?? '');
        this.catalogoSvc.update(id, item).subscribe({ next: (r) => finish(r, 'Enfermedad actualizada'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'servicio': {
        const id = Number(item.idServicio ?? item.id ?? null);
        this.catalogoSvc.updateServicioMedico(id, item).subscribe({ next: (r) => finish(r, 'Servicio actualizado'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'derecho': {
        const id = Number(item.idDerechoHab ?? item.id ?? null);
        this.catalogoSvc.updateDerechoHab(id, item).subscribe({ next: (r) => finish(r, 'Derecho actualizado'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'estado': {
        const id = Number(item.idEstado ?? item.id ?? null);
        this.catalogoSvc.updateEstado(id, item).subscribe({ next: (r) => finish(r, 'Estado actualizado'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'motivo': {
        const id = Number(item.idMotivoEgreso ?? item.id ?? null);
        this.catalogoSvc.updateMotivoEgreso(id, item).subscribe({ next: (r) => finish(r, 'Motivo actualizado'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'rango': {
        const id = Number(item.id ?? null);
        const payload: any = {
          rangoInicial: Number(item.rangoInicial ?? item.desde ?? 0),
          rangoFinal: Number(item.rangoFinal ?? item.hasta ?? 0),
        };
        this.catalogoSvc.updateRangoEdad(id, payload).subscribe({ next: (r) => finish(r, 'Rango actualizado'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      case 'procedencia': {
        const id = Number(item.idProcedencia ?? item.id ?? null);
        this.catalogoSvc.updateProcedencia(id, item).subscribe({ next: (r) => finish(r, 'Procedencia actualizada'), error: (e) => { console.error(e); this.alarms.showError('No se pudo actualizar'); this.saveLoading = false; } });
        break;
      }
      default:
        this.saveLoading = false;
        this.alarms.showInfo('Tipo no soportado para editar');
    }
  }

  onCancelEdit() {
    // close dialog without saving
    this.editDialogVisible = false;
    this.editingItem = null;
    this.editingKind = null;
    try { this.cdr.detectChanges(); } catch {}
  }

  onMunicipiosPage(ev: any) {
    const first = Number(ev?.first ?? 0);
    let rows = Number(ev?.rows ?? this.municipiosPageSize);
    rows = Math.min(rows, 10);
    const nextPage = Math.floor(first / rows) + 1;
    this.municipiosPageSize = rows;
    if (this.selectedEstado) this.loadMunicipiosForEstado(this.selectedEstado.idEstado, nextPage, this.searchMunicipios);
  }

  onMunicipioClick(row: any) {
    const idMpo = Number(row?.idMunicipio ?? row?.id ?? null);
    if (!Number.isFinite(idMpo)) return;
    // close/clear localidades table before changing municipio
    this.localidades = [];
    this.localidadesPageNumber = 1;
    this.localidadesPageSize = 10;
    this.localidadesTotalCount = 0;
    this.searchLocalidades = null;

    // clear any previously selected localidades when switching municipio
    try { this.selectedLocalidadIds.set(new Set()); } catch {}

    this.selectedMunicipio = row;
    this.localidadesPageNumber = 1;
    // require selectedEstado for idEdo parameter
    const idEdo = Number(this.selectedEstado?.idEstado ?? null);
    this.loadLocalidadesForMunicipio(idEdo || undefined, idMpo, 1, this.searchLocalidades);
  }

  loadLocalidadesForMunicipio(idEdo: number | undefined, idMpo: number, page: number = 1, search: string | null = null) {
    // clear selected localidades before requesting new page to avoid stale selection
    try { this.selectedLocalidadIds.set(new Set()); } catch {}

    this.catalogoSvc.getLocalidadesPaged(page, this.localidadesPageSize, idEdo ?? null, idMpo, search).subscribe({
      next: (res) => {
        // Normalize server response so each localidad has a stable `idLocalidad` property
        const items: any[] = Array.isArray(res?.items) ? res.items : (res?.items ? [res.items] : []);
        this.localidades = (items || []).map((it: any, idx: number) => {
          if (it == null) return it;
          const hasIdLocalidad = !(it.idLocalidad == null || Number(it.idLocalidad) === 0);
          if (!hasIdLocalidad) {
            const hasIdLoc = !(it.idLoc == null || Number(it.idLoc) === 0);
            if (hasIdLoc) it.idLocalidad = it.idLoc;
            else if (it.id != null && Number(it.id) !== 0) it.idLocalidad = it.id;
            else it.idLocalidad = Number(String(page) + String(idx)); // fallback unique-ish id
          }
          return it;
        });
        this.localidadesPageNumber = res.pageNumber || page;
        this.localidadesPageSize = res.pageSize || this.localidadesPageSize;
        this.localidadesTotalCount = res.totalCount || 0;
      },
      error: () => {
        this.localidades = [];
        this.localidadesTotalCount = 0;
      }
    });
  }

  onLocalidadesPage(ev: any) {
    const first = Number(ev?.first ?? 0);
    let rows = Number(ev?.rows ?? this.localidadesPageSize);
    rows = Math.min(rows, 10);
    const nextPage = Math.floor(first / rows) + 1;
    this.localidadesPageSize = rows;
    if (this.selectedMunicipio) {
      const idMpo = Number(this.selectedMunicipio?.idMunicipio ?? this.selectedMunicipio?.id ?? null);
      const idEdo = Number(this.selectedEstado?.idEstado ?? null);
      if (Number.isFinite(idMpo)) this.loadLocalidadesForMunicipio(idEdo || undefined, idMpo, nextPage, this.searchLocalidades);
    }
  }

  loadPoblacionEstado(estadoId: number) {
    console.debug('[Catalogo] loadPoblacionEstado calling API for estadoId', estadoId);
    this.catalogoSvc.getPoblacionEstadoById(estadoId).subscribe({
      next: (r) => {
        console.debug('[Catalogo] loadPoblacionEstado response', r);
        try {
          if (Array.isArray(r)) {
            const out: any = { id: estadoId, estado: estadoId, anio2000: 0, anio2005: 0, anio2010: 0, anio2020: 0 };
            (r as any[]).forEach((it: any) => {
              const y = Number(it?.anio ?? it?.year ?? null);
              const p = Number(it?.poblacion ?? it?.poblacionTotal ?? 0);
              if (y === 2000) out.anio2000 = p;
              else if (y === 2005) out.anio2005 = p;
              else if (y === 2010) out.anio2010 = p;
              else if (y === 2020) out.anio2020 = p;
            });
            this.poblacionEstado = out as PoblacionEstado;
          } else {
            this.poblacionEstado = r || null;
          }
        } catch (err) {
          console.error('[Catalogo] error normalizing poblacionEstado', err);
          this.poblacionEstado = null;
        }
      },
      error: (e) => { console.error('[Catalogo] loadPoblacionEstado error', e); this.poblacionEstado = null; }
    });
  }

  constructor(private catalogoSvc: CatalogoService, private dialog: MatDialog) {
    // Watch municipio selection: when emptied close localidades; when single selected open it
    effect(() => {
      const msel = this.selectedMunicipioIds();
      if (!msel || msel.size === 0) {
        if (this.selectedMunicipio) {
          this.selectedMunicipio = null;
          this.localidades = [];
          this.localidadesPageNumber = 1;
          this.localidadesPageSize = 10;
          this.localidadesTotalCount = 0;
          this.searchLocalidades = null;
          this.selectedLocalidadIds.set(new Set());
          try { this.cdr.detectChanges(); } catch {}
        }
      } else if (msel.size === 1) {
        const id = Array.from(msel)[0];
        // clear previous localidad selections when usuario selects a new municipio
        try { this.selectedLocalidadIds.set(new Set()); } catch {}
        const found = (this.municipios || []).find((m: any) => Number(m.idMunicipio ?? m.id ?? m.idMpo) === Number(id));
        if (found && (!this.selectedMunicipio || Number(this.selectedMunicipio.idMunicipio ?? this.selectedMunicipio.id) !== Number(id))) {
          try { this.onMunicipioClick(found); } catch {}
        }
      }
    });

    // Watch estado selection: when emptied close municipios+localidades and clear selections; when single selected open it
    effect(() => {
      const esel = this.selectedEstadoIds();
      if (!esel || esel.size === 0) {
        if (this.selectedEstado) {
          this.selectedEstado = null;
          this.municipios = [];
          this.municipiosPageNumber = 1;
          this.municipiosPageSize = 10;
          this.municipiosTotalCount = 0;
          this.poblacionEstado = null;

          this.selectedMunicipio = null;
          this.localidades = [];
          this.localidadesPageNumber = 1;
          this.localidadesPageSize = 10;
          this.localidadesTotalCount = 0;
          this.searchMunicipios = null;
          this.searchLocalidades = null;

          // clear any selection sets when no estado is selected
          try { this.selectedMunicipioIds.set(new Set()); } catch {}
          try { this.selectedLocalidadIds.set(new Set()); } catch {}
          try { this.cdr.detectChanges(); } catch {}
        }
      } else {
        // Whenever the selected estado set changes (selecting a different estado),
        // clear municipio/localidad selections to avoid leftover selections from previous estado.
        try { this.selectedMunicipioIds.set(new Set()); } catch {}
        try { this.selectedLocalidadIds.set(new Set()); } catch {}

        if (esel.size === 1) {
          const id = Array.from(esel)[0];
          const found = (this.estados || []).find((e: any) => Number(e.idEstado ?? e.id) === Number(id));
          if (found && (!this.selectedEstado || Number(this.selectedEstado.idEstado) !== Number(id))) {
            try { this.onEstadoClick(found); } catch {}
          }
        }
      }
    });
  }

  // label for the add button depending on active tab
  addLabel(): string {
    switch (this.activeTab) {
      case 0: return 'Enfermedad';
      case 1: return 'Servicio';
      case 2: return 'Derecho Habiente';
      case 3: return 'Estado';
      case 4: return 'Motivo';
      case 5: return 'Rango de Edad';
      case 6: return 'Procedencia';
      default: return 'Elemento';
    }
  }

  async onAddClick() {
    // require confirmation modal before opening add dialog
    const confirmed = await this.confirmAction();
    if (!confirmed) return;
    // Open the modal for the active tab and insert the created item into the right list
    switch (this.activeTab) {
      case 0: { // Enfermedades
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'enfermedad' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            this.enfermedades = [created, ...(this.enfermedades || [])];
            this.clearCurrentSearch();
            this.alarms.showSuccess('Enfermedad agregada', { detail: `${created?.nombreEnfermedad ?? ''}` });
          }
        });
        break;
      }
      case 1: { // Servicio
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'servicio' } });
        ref.afterClosed().subscribe((created: any) => {
          // Always refresh servicios from server to ensure consistency
          try { this.clearCurrentSearch(); } catch {}
          if (created) {
            this.servicios = [created, ...(this.servicios || [])];
            this.serviciosFiltered = this.servicios.slice();
            this.alarms.showSuccess('Servicio agregado', { detail: `${created?.nombreServicio ?? ''}` });
          }
        });
        break;
      }
      case 2: { // Derecho Habiente
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'derecho' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            this.derechos = [created, ...(this.derechos || [])];
            this.clearCurrentSearch();
            this.alarms.showSuccess('Derecho agregado', { detail: `${created?.descripcion ?? ''}` });
          }
        });
        break;
      }
      case 3: { // Estado
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'estado' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            // Normalize returned id field so callers can rely on `idEstado`
            if ((created as any).idEstado == null && (created as any).id != null) {
              (created as any).idEstado = (created as any).id;
            }
            this.estados = [created, ...(this.estados || [])];
            // auto-select the newly created estado so the user can immediately add municipios
            try { this.selectedEstado = created as Estado; } catch {}
            this.municipios = [];
            this.municipiosPageNumber = 1;
            // load municipios for the new estado (if id present)
            const idEdo = Number((created as any).idEstado ?? null);
            if (Number.isFinite(idEdo)) this.loadMunicipiosForEstado(idEdo, 1, null);
            this.clearCurrentSearch();
            this.alarms.showSuccess('Estado agregado', { detail: `${created?.nombreEstado ?? ''}` });
          }
        });
        break;
      }
      case 4: { // Motivo
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'motivo' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            this.motivos = [created, ...(this.motivos || [])];
            this.clearCurrentSearch();
            this.alarms.showSuccess('Motivo agregado', { detail: `${created?.descripcion ?? ''}` });
          }
        });
        break;
      }
      case 5: { // Rango de edad
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'rango' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            this.rangos = [created, ...(this.rangos || [])];
            this.rangosFiltered = this.rangos.slice();
            this.clearCurrentSearch();
            this.alarms.showSuccess('Rango agregado', { detail: `${created?.descripcion ?? ''}` });
          }
        });
        break;
      }
      case 6: { // Procedencia
        const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'procedencia' } });
        ref.afterClosed().subscribe((created: any) => {
          if (created) {
            this.procedencias = [created, ...(this.procedencias || [])];
            this.procedenciasFiltered = this.procedencias.slice();
            this.clearCurrentSearch();
            this.alarms.showSuccess('Procedencia agregada', { detail: `${created?.descripcion ?? ''}` });
          }
        });
        break;
      }
      default: {
        this.alarms.showInfo('Agregar no implementado', { detail: `Agregar ${this.addLabel()} no está implementado todavía.` });
        break;
      }
    }
  }

  public async onAddMunicipio(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;
    if (!this.selectedEstado) {
      try { this.alarms.showInfo('Selecciona un estado antes de agregar un municipio'); } catch {}
      return;
    }
    const estadoId = Number(this.selectedEstado!.idEstado);
    const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'municipio', idEdo: estadoId } });
    ref.afterClosed().subscribe((created: any) => {
      if (!created) return;
      // normalize id field
      if ((created as any).idMunicipio == null && (created as any).id != null) (created as any).idMunicipio = (created as any).id;
      this.municipios = [created, ...(this.municipios || [])];
      try { this.alarms.showSuccess('Municipio agregado', { detail: `${created?.nombreMunicipio ?? ''}` }); } catch {}
      try { this.loadMunicipiosForEstado(estadoId, 1, this.searchMunicipios); } catch {}
    });
  }

  public async onAddLocalidad(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;
    if (!this.selectedEstado) {
      try { this.alarms.showInfo('Selecciona un estado antes de agregar una localidad'); } catch {}
      return;
    }
    if (!this.selectedMunicipio) {
      try { this.alarms.showInfo('Selecciona un municipio antes de agregar una localidad'); } catch {}
      return;
    }
    const estadoId = Number(this.selectedEstado!.idEstado);
    const idMpo = Number(this.selectedMunicipio!.idMunicipio ?? this.selectedMunicipio!.id ?? null);
    const ref = this.dialog.open(añadirCatalogo, { width: '520px', data: { kind: 'localidad', idEdo: estadoId, idMpo } });
    ref.afterClosed().subscribe((created: any) => {
      if (!created) return;
      if ((created as any).idLocalidad == null && (created as any).id != null) (created as any).idLocalidad = (created as any).id;
      this.localidades = [created, ...(this.localidades || [])];
      try { this.alarms.showSuccess('Localidad agregada', { detail: `${created?.nombreLocalidad ?? ''}` }); } catch {}
      try { this.loadLocalidadesForMunicipio(estadoId, idMpo, 1, this.searchLocalidades); } catch {}
    });
  }

  async openEditItem(row: any) {
    // require confirmation modal before opening edit dialog
    const confirmed = await this.confirmAction();
    if (!confirmed) return;
    // Open global MatDialog-based edit dialog component
    // Open global MatDialog-based edit dialog component
    const item = row?.__raw ? row.__raw : row;
    console.debug('[Catalogo] openEditItem called for tab', this.activeTab, 'item:', item);
    let kind: string | null = null;
    // Determine kind; for the Estados tab, rows may be estado/municipio/localidad
    if (this.activeTab === 3) {
      if (item && (item.idLocalidad != null || item.nombreLocalidad != null || item.idLoc != null)) kind = 'localidad';
      else if (item && (item.idMunicipio != null || item.nombreMunicipio != null || item.idMpo != null)) kind = 'municipio';
      else kind = 'estado';
    } else {
      switch (this.activeTab) {
        case 0: kind = 'enfermedad'; break;
        case 1: kind = 'servicio'; break;
        case 2: kind = 'derecho'; break;
        case 4: kind = 'motivo'; break;
        case 5: kind = 'rango'; break;
        case 6: kind = 'procedencia'; break;
        default: kind = null; break;
      }
    }
    const ref = this.dialog.open(edicionDialogo, { width: '520px', data: { kind, item } });
    ref.afterClosed().subscribe((result: any) => {
      if (result && result.updated) {
        this.clearCurrentSearch();
        // Pass along kind if provided so applyUpdatedItem can update the correct list
        this.applyUpdatedItem(result.updated, result.message || 'Elemento actualizado', result.kind);
      }
    });
  }

  private applyUpdatedItem(updated: any, message: string, kind?: string | null) {
    // If kind is provided, prefer it to determine where to apply the update
    if (kind === 'municipio' || (!kind && (updated && (updated.idMunicipio != null || updated.nombreMunicipio != null)))) {
      this.municipios = (this.municipios || []).map((m: any) => ((Number(m.idMunicipio ?? m.idMpo ?? m.id) === Number(updated.idMunicipio ?? updated.idMpo ?? updated.id)) ? updated : m));
      try { this.alarms.showSuccess(message || 'Municipio actualizado'); } catch {}
      return;
    }
    if (kind === 'localidad' || (!kind && (updated && (updated.idLocalidad != null || updated.nombreLocalidad != null)))) {
      this.localidades = (this.localidades || []).map((l: any) => ((Number(l.idLocalidad ?? l.idLoc ?? l.id) === Number(updated.idLocalidad ?? updated.idLoc ?? updated.id)) ? updated : l));
      try { this.alarms.showSuccess(message || 'Localidad actualizada'); } catch {}
      return;
    }

    switch (this.activeTab) {
      case 0:
        this.enfermedades = (this.enfermedades || []).map((e: any) => ((String(e.idEnfermedad) === String(updated.idEnfermedad || updated.id)) ? updated : e));
        break;
      case 1:
        this.servicios = (this.servicios || []).map((s: any) => ((Number(s.idServicio) === Number(updated.idServicio || updated.id)) ? updated : s));
        this.serviciosFiltered = this.servicios.slice();
        break;
      case 2:
        this.derechos = (this.derechos || []).map((d: any) => ((Number(d.idDerechoHab) === Number(updated.idDerechoHab || updated.id)) ? updated : d));
        break;
      case 3:
        this.estados = (this.estados || []).map((e: any) => ((Number(e.idEstado) === Number(updated.idEstado || updated.id)) ? updated : e));
        break;
      case 4:
        this.motivos = (this.motivos || []).map((m: any) => ((Number(m.idMotivoEgreso) === Number(updated.idMotivoEgreso || updated.id)) ? updated : m));
        break;
      case 5:
        this.rangos = (this.rangos || []).map((r: any) => ((Number(r.id) === Number(updated.id)) ? updated : r));
        this.rangosFiltered = this.rangos.slice();
        break;
      case 6:
        this.procedencias = (this.procedencias || []).map((p: any) => ((Number(p.idProcedencia) === Number(updated.idProcedencia || updated.id)) ? updated : p));
        this.procedenciasFiltered = this.procedencias.slice();
        break;
    }
    try { this.alarms.showSuccess(message || 'Elemento actualizado', { detail: '' }); } catch {}
  }

  // Clear the search input corresponding to the active tab
  clearCurrentSearch() {
    switch (this.activeTab) {
      case 0:
        this.searchEnfermedad = null;
        this.pageNumber = 1;
        this.loadPage(1, null);
        break;
      case 1:
        this.searchServicios = null;
        // refresh servicios from server to reflect latest state after CRUD
        this.loadServicios();
        break;
      case 2:
        this.searchDerechos = null;
        this.derechosPageNumber = 1;
        this.loadDerechosPage(1, null);
        break;
      case 3:
        this.searchEstados = null;
        this.estadosPageNumber = 1;
        this.loadEstadosPage(1, null);
        break;
      case 4:
        this.searchMotivos = null;
        this.motivosPageNumber = 1;
        this.loadMotivosPage(1, null);
        break;
      case 5:
        this.searchRangos = null;
        this.rangosFiltered = this.rangos.slice();
        break;
      case 6:
        this.searchProcedencias = null;
        this.procedenciasFiltered = this.procedencias.slice();
        break;
      default:
        break;
    }
  }

  onRowActionEdit(row: any) {
    console.debug('[Catalogo] onRowActionEdit called', { row });
    try { this.openEditItem(row); } catch (e) { console.error('openEditItem error', e); }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(ev: Event) {
    try {
      const t = ev?.target as HTMLElement | null;
      if (!t) return;
      // only log clicks inside our table component to reduce noise
      if (t.closest && t.closest('.global-table')) {
        console.debug('[Catalogo] document click inside global-table', { tag: t.tagName, classes: t.className, el: t });
      }
    } catch (e) {
      console.error('[Catalogo] handleDocumentClick error', e);
    }
  }

  deleteItem(row: any) {
    const item = row?.__raw ? row.__raw : row;
    let id: any = null;
    let call$: any = null;
    switch (this.activeTab) {
      case 0:
        id = String(item.idEnfermedad ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteEnfermedad(String(id));
        break;
      case 1:
        id = Number(item.idServicio ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteServicioMedico(Number(id));
        break;
      case 2:
        id = Number(item.idDerechoHab ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteDerechoHab(Number(id));
        break;
      case 3:
        id = Number(item.idEstado ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteEstado(Number(id));
        break;
      case 4:
        id = Number(item.idMotivoEgreso ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteMotivoEgreso(Number(id));
        break;
      case 5:
        id = Number(item.id ?? item.idRango ?? item);
        call$ = this.catalogoSvc.deleteRangoEdad(Number(id));
        break;
      case 6:
        id = Number(item.idProcedencia ?? item.id ?? item);
        call$ = this.catalogoSvc.deleteProcedencia(Number(id));
        break;
    }
    if (!call$) return;
    const ok = window.confirm('¿Seguro que quieres eliminar este elemento?');
    if (!ok) return;
    call$.subscribe({
      next: () => {
        // remove from local arrays
        switch (this.activeTab) {
          case 0:
            this.enfermedades = (this.enfermedades || []).filter((e: any) => String(e.idEnfermedad) !== String(id));
            break;
          case 1:
            this.servicios = (this.servicios || []).filter((s: any) => Number(s.idServicio) !== Number(id));
            this.serviciosFiltered = this.servicios.slice();
            break;
          case 2:
            this.derechos = (this.derechos || []).filter((d: any) => Number(d.idDerechoHab) !== Number(id));
            break;
          case 3:
            this.estados = (this.estados || []).filter((e: any) => Number(e.idEstado) !== Number(id));
            break;
          case 4:
            this.motivos = (this.motivos || []).filter((m: any) => Number(m.idMotivoEgreso) !== Number(id));
            break;
          case 5:
            this.rangos = (this.rangos || []).filter((r: any) => Number(r.id) !== Number(id));
            this.rangosFiltered = this.rangos.slice();
            break;
          case 6:
            this.procedencias = (this.procedencias || []).filter((p: any) => Number(p.idProcedencia) !== Number(id));
            this.procedenciasFiltered = this.procedencias.slice();
            break;
        }
        this.alarms.showSuccess('Elemento eliminado', { detail: `ID: ${id}` });
        try { this.clearCurrentSearch(); } catch {}
      },
      error: (e: any) => {
        console.error(e);
        this.alarms.showError('No se pudo eliminar el elemento');
      }
    });
  }

  // selection for bulk actions
  // inline edit dialog state (PrimeNG p-dialog)
  editingItem: any = null;
  editingKind: string | null = null;
  editDialogVisible: boolean = false;
  saveLoading: boolean = false;

  selectedIds = signal<Set<number>>(new Set());
  selectedEstadoIds = signal<Set<number>>(new Set());
  selectedMunicipioIds = signal<Set<number>>(new Set());
  selectedLocalidadIds = signal<Set<number>>(new Set());
  selectedCount = computed(() => {
    // Prefer the most-specific visible selection so the counter reflects the user's current context
    if (this.selectedLocalidadIds().size > 0) return this.selectedLocalidadIds().size;
    if (this.selectedMunicipioIds().size > 0) return this.selectedMunicipioIds().size;
    if (this.activeTab === 3) return this.selectedEstadoIds().size;
    // fallback to global selection used by other tabs
    return this.selectedIds().size;
  });
  bulkLoading = signal<boolean>(false);

  private alarms = inject(AlarmService);
  private confirmPasswordService = inject(ConfirmPasswordService);
  private cdr = inject(ChangeDetectorRef);

  clearSelection() {
    this.selectedIds.set(new Set());
    this.selectedEstadoIds.set(new Set());
    this.selectedMunicipioIds.set(new Set());
    this.selectedLocalidadIds.set(new Set());
  }

  private async confirmAction(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmPasswordService.open().pipe(take(1)).subscribe((confirmed) => {
        resolve(!!confirmed);
      });
    });
  }

  async bulkDelete() {
    // pick the most-specific non-empty selection set: localidades > municipios > estados > global
    let selectionType: 'localidad' | 'municipio' | 'estado' | 'global' = 'global';
    let idsSet: Set<number> = this.selectedIds();
    if (this.selectedLocalidadIds().size) { selectionType = 'localidad'; idsSet = this.selectedLocalidadIds(); }
    else if (this.selectedMunicipioIds().size) { selectionType = 'municipio'; idsSet = this.selectedMunicipioIds(); }
    else if (this.selectedEstadoIds().size) { selectionType = 'estado'; idsSet = this.selectedEstadoIds(); }

    const ids = Array.from(idsSet);
    if (!ids.length) return;

    // pedir confirmación
    const confirmed = await new Promise<boolean>((resolve) => {
      this.confirmPasswordService.open().pipe(take(1)).subscribe((ok) => resolve(!!ok));
    });
    if (!confirmed) return;

    this.bulkLoading.set(true);

    const calls = [] as any[];
    for (const id of ids) {
      if (selectionType === 'localidad') {
        calls.push(this.catalogoSvc.deleteLocalidad(Number(id)));
        continue;
      }
      if (selectionType === 'municipio') {
        calls.push(this.catalogoSvc.deleteMunicipio(Number(id)));
        continue;
      }
      if (selectionType === 'estado') {
        calls.push(this.catalogoSvc.deleteEstado(Number(id)));
        continue;
      }
      // fallback: use activeTab mapping
      switch (this.activeTab) {
        case 0: // enfermedades
          calls.push(this.catalogoSvc.deleteEnfermedad(String(id)));
          break;
        case 1: // servicios
          calls.push(this.catalogoSvc.deleteServicioMedico(Number(id)));
          break;
        case 2: // derechos
          calls.push(this.catalogoSvc.deleteDerechoHab(Number(id)));
          break;
        case 3: // estados (should be handled earlier)
          calls.push(this.catalogoSvc.deleteEstado(Number(id)));
          break;
        case 4: // motivos
          calls.push(this.catalogoSvc.deleteMotivoEgreso(Number(id)));
          break;
        case 5: // rangos
          calls.push(this.catalogoSvc.deleteRangoEdad(Number(id)));
          break;
        case 6: // procedencias
          calls.push(this.catalogoSvc.deleteProcedencia(Number(id)));
          break;
        default:
          break;
      }
    }

    if (calls.length === 0) {
      this.bulkLoading.set(false);
      return;
    }

    forkJoin(calls).subscribe({
      next: () => {
        // remove deleted from local arrays depending on selectionType (or activeTab fallback)
        const removed = new Set(ids.map((i) => Number(i)));
        if (selectionType === 'localidad') {
          this.localidades = (this.localidades || []).filter((l: any) => !removed.has(Number(l.idLocalidad ?? l.idLoc ?? l.id)));
        } else if (selectionType === 'municipio') {
          this.municipios = (this.municipios || []).filter((m: any) => !removed.has(Number(m.idMunicipio ?? m.idMpo ?? m.id)));
        } else if (selectionType === 'estado') {
          this.estados = (this.estados || []).filter((e: any) => !removed.has(Number(e.idEstado)));
        } else {
          switch (this.activeTab) {
            case 0:
              this.enfermedades = (this.enfermedades || []).filter((e: any) => !removed.has(Number(e.idEnfermedad)));
              break;
            case 1:
              this.servicios = (this.servicios || []).filter((s: any) => !removed.has(Number(s.idServicio)));
              this.serviciosFiltered = this.serviciosFiltered?.filter((s: any) => !removed.has(Number(s.idServicio))) || [];
              break;
            case 2:
              this.derechos = (this.derechos || []).filter((d: any) => !removed.has(Number(d.idDerechoHab)));
              break;
            case 3:
              this.estados = (this.estados || []).filter((e: any) => !removed.has(Number(e.idEstado)));
              break;
            case 4:
              this.motivos = (this.motivos || []).filter((m: any) => !removed.has(Number(m.idMotivoEgreso)));
              break;
            case 5:
              this.rangos = (this.rangos || []).filter((r: any) => !removed.has(Number(r.id)));
              this.rangosFiltered = this.rangosFiltered?.filter((r: any) => !removed.has(Number(r.id))) || [];
              break;
            case 6:
              this.procedencias = (this.procedencias || []).filter((p: any) => !removed.has(Number(p.idProcedencia)));
              this.procedenciasFiltered = this.procedenciasFiltered?.filter((p: any) => !removed.has(Number(p.idProcedencia))) || [];
              break;
          }
        }

        this.clearSelection();
        this.alarms.showSuccess('Elementos eliminados', { detail: `Cantidad: ${ids.length}` });
        try { this.clearCurrentSearch(); } catch {}
        this.bulkLoading.set(false);
      },
      error: (e: any) => {
        console.error(e);
        this.alarms.showError('No se pudieron eliminar los elementos', { detail: 'Intenta de nuevo.' });
        this.bulkLoading.set(false);
      },
    });
  }

  // Flattened data for global table component
  get tableData() {
    try {
      return (this.enfermedades || []).map((e) => ({
        idEnfermedad: e.idEnfermedad,
        codigoICD: e.codigoICD,
        nombreEnfermedad: e.nombreEnfermedad,
        descripcion: e.descripcion,
        __raw: e,
      }));
    } catch {
      return [];
    }
  }

  get serviciosTableData() {
    try {
      const src = (this.serviciosFiltered && this.serviciosFiltered.length) ? this.serviciosFiltered : this.servicios || [];
      return (src || []).map((s) => ({
        idServicio: (s as any).idServicio ?? null,
        nombreServicio: (s as any).nombreServicio ?? '',
        descripcion: (s as any).descripcion ?? '',
        __raw: s,
      }));
    } catch {
      return [];
    }
  }

  // filtered servicios for client-side search
  serviciosFiltered: any[] = [];


  get derechosTableData() {
    try {
      return (this.derechos || []).map((d) => ({
        idDerechoHab: (d as any).idDerechoHab ?? null,
        descripcion: (d as any).descripcion ?? '',
        __raw: d,
      }));
    } catch {
      return [];
    }
  }

  get estadosTableData() {
    try {
      return (this.estados || []).map((e) => ({
        idEstado: (e as any).idEstado ?? null,
        nombreEstado: (e as any).nombreEstado ?? '',
        __raw: e,
      }));
    } catch {
      return [];
    }
  }

  // debounce timers
  private _tEnfermedad: any = null;
  private _tServicios: any = null;
  private _tDerechos: any = null;
  private _tEstados: any = null;
  private _tMotivos: any = null;
  private _tRangos: any = null;
  private _tProcedencias: any = null;
  private _tMunicipios: any = null;
  private _tLocalidades: any = null;

  onTablePage(ev: any) {
    // primeng paginator gives first (zero-based) and rows
    const first = Number(ev?.first ?? 0);
    let rows = Number(ev?.rows ?? this.pageSize);
    // enforce maximum rows per page
    rows = Math.min(rows, 30);
    const nextPage = Math.floor(first / rows) + 1;
    if (this.activeTab === 0) {
      this.pageSize = rows;
      this.loadPage(nextPage, this.searchEnfermedad);
    } else if (this.activeTab === 2) {
      // Derechos pagination
      this.derechosPageSize = rows;
      this.loadDerechosPage(nextPage, this.searchDerechos);
    } else if (this.activeTab === 3) {
      // Estados pagination
      this.estadosPageSize = rows;
      this.loadEstadosPage(nextPage, this.searchEstados);
    } else if (this.activeTab === 4) {
      // Motivos de egreso pagination
      this.motivosPageSize = rows;
      this.loadMotivosPage(nextPage, this.searchMotivos);
    } else {
      // other tabs (services) are currently not paged
    }
  }

  ngOnInit(): void {
    this.loadPage();
    // preload servicios list so switching tabs is instant
    this.loadServicios();

    // load first page of DerechoHab
    this.loadDerechosPage(this.derechosPageNumber);
    // load first page of Estados
    this.loadEstadosPage(this.estadosPageNumber);
    // load first page of Motivos de Egreso
    this.loadMotivosPage(this.motivosPageNumber);
    // preload rangos de edad (client-side)
    this.catalogoSvc.getRangosEdad().subscribe({
      next: (r) => {
        this.rangos = Array.isArray(r) ? r : [];
        this.rangosFiltered = this.rangos.slice();
      },
      error: () => { this.rangos = []; this.rangosFiltered = []; }
    });
    // preload procedencias (client-side)
    this.catalogoSvc.getProcedencias().subscribe({
      next: (p) => {
        this.procedencias = Array.isArray(p) ? p : [];
        this.procedenciasFiltered = this.procedencias.slice();
      },
      error: () => { this.procedencias = []; this.procedenciasFiltered = []; }
    });
  }

  loadServicios(search: string | null = null) {
    this.catalogoSvc.getServiciosMedicos(search).subscribe({
      next: (r: any) => {
        if (Array.isArray(r)) {
          this.servicios = r || [];
        } else if (r && Array.isArray(r.items)) {
          this.servicios = r.items || [];
        } else {
          this.servicios = [];
        }
        this.serviciosFiltered = this.servicios.slice();
      },
      error: () => { this.servicios = []; this.serviciosFiltered = []; }
    });
  }

  // RangoEdad table mapping + filter
  get rangosTableData() {
    try {
      const src = (this.rangosFiltered && this.rangosFiltered.length) ? this.rangosFiltered : this.rangos || [];
      return (src || []).map((x) => ({
        id: (x as any).id ?? null,
        rangoInicial: (x as any).rangoInicial ?? (x as any).desde ?? null,
        rangoFinal: (x as any).rangoFinal ?? (x as any).hasta ?? null,
        __raw: x,
      }));
    } catch {
      return [];
    }
  }

  filterRangos() {
    const q = String(this.searchRangos || '').trim().toLowerCase();
    if (!q) { this.rangosFiltered = this.rangos.slice(); return; }
    this.rangosFiltered = (this.rangos || []).filter((r) => {
      const ri = String((r as any).rangoInicial ?? (r as any).desde ?? '').toLowerCase();
      const rf = String((r as any).rangoFinal ?? (r as any).hasta ?? '').toLowerCase();
      return (ri + ' ' + rf).includes(q);
    });
  }

  onRangosInput(v: string) {
    this.searchRangos = v;
    if (this._tRangos) clearTimeout(this._tRangos);
    this._tRangos = setTimeout(() => this.filterRangos(), 300);
  }

  // Procedencias (client-side)
  get procedenciasTableData() {
    try {
      const src = (this.procedenciasFiltered && this.procedenciasFiltered.length) ? this.procedenciasFiltered : this.procedencias || [];
      return (src || []).map((p) => ({
        idProcedencia: (p as any).idProcedencia ?? null,
        descripcion: (p as any).descripcion ?? '',
        __raw: p,
      }));
    } catch {
      return [];
    }
  }

  filterProcedencias() {
    const q = String(this.searchProcedencias || '').trim().toLowerCase();
    if (!q) { this.procedenciasFiltered = this.procedencias.slice(); return; }
    this.procedenciasFiltered = (this.procedencias || []).filter((r) => {
      return ((String(r.descripcion || '')).toLowerCase().includes(q));
    });
  }

  onProcedenciasInput(v: string) {
    this.searchProcedencias = v;
    if (this._tProcedencias) clearTimeout(this._tProcedencias);
    this._tProcedencias = setTimeout(() => this.filterProcedencias(), 300);
  }

  // Motivos de Egreso
  get motivosTableData() {
    try {
      return (this.motivos || []).map((m) => ({
        idMotivoEgreso: (m as any).idMotivoEgreso ?? null,
        descripcion: (m as any).descripcion ?? '',
        __raw: m,
      }));
    } catch {
      return [];
    }
  }

  loadMotivosPage(page: number = 1, search: string | null = null) {
    this.catalogoSvc.getMotivosEgresoPaged(page, this.motivosPageSize, search).subscribe({
      next: (res) => {
        console.debug('[Catalogo] Motivos page response:', res);
        this.motivos = res.items || [];
        this.motivosPageNumber = res.pageNumber || page;
        this.motivosPageSize = res.pageSize || this.motivosPageSize;
        this.motivosTotalCount = res.totalCount || 0;
      },
      error: () => {
        this.motivos = [];
        this.motivosTotalCount = 0;
      }
    });
  }

  loadDerechosPage(page: number = 1, search: string | null = null) {
    this.catalogoSvc.getDerechosHabPaged(page, this.derechosPageSize, search).subscribe({
      next: (res) => {
        console.debug('[Catalogo] Derechos page response:', res);
        this.derechos = res.items || [];
        this.derechosPageNumber = res.pageNumber || page;
        this.derechosPageSize = res.pageSize || this.derechosPageSize;
        this.derechosTotalCount = res.totalCount || 0;
      },
      error: () => {
        this.derechos = [];
        this.derechosTotalCount = 0;
      }
    });
  }

  loadEstadosPage(page: number = 1, search: string | null = null) {
    this.catalogoSvc.getEstadosPaged(page, this.estadosPageSize, search).subscribe({
      next: (res) => {
        console.debug('[Catalogo] Estados page response:', res);
        this.estados = res.items || [];
        this.estadosPageNumber = res.pageNumber || page;
        this.estadosPageSize = res.pageSize || this.estadosPageSize;
        this.estadosTotalCount = res.totalCount || 0;
      },
      error: () => {
        this.estados = [];
        this.estadosTotalCount = 0;
      }
    });
  }

  loadPage(page: number = this.pageNumber, search: string | null = null) {
    this.loading = true;
    this.error = null;
    this.catalogoSvc.getEnfermedadesPaged(page, this.pageSize, search).subscribe({
      next: (res) => {
        this.enfermedades = res.items || [];
        this.pageNumber = res.pageNumber || page;
        this.pageSize = res.pageSize || this.pageSize;
        this.totalCount = res.totalCount || 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error cargando enfermedades';
        this.loading = false;
      }
    });
  }

  // search helpers invoked from template
  onSearchEnfermedad() {
    this.pageNumber = 1;
    this.loadPage(1, this.searchEnfermedad);
  }

  onSearchDerechos() {
    this.derechosPageNumber = 1;
    this.loadDerechosPage(1, this.searchDerechos);
  }

  onSearchEstados() {
    this.estadosPageNumber = 1;
    this.loadEstadosPage(1, this.searchEstados);
  }

  // client-side filter for servicios
  filterServicios() {
    const q = String(this.searchServicios || '').trim().toLowerCase();
    if (!q) {
      this.serviciosFiltered = this.servicios.slice();
      return;
    }
    this.serviciosFiltered = (this.servicios || []).filter((s: any) => {
      return (String(s.nombreServicio || '') + ' ' + String(s.descripcion || '')).toLowerCase().includes(q);
    });
  }

  // clear search fields and cancel pending debounces
  private clearAllSearches() {
    this.searchEnfermedad = null;
    this.searchServicios = null;
    this.searchDerechos = null;
    this.searchEstados = null;
    this.serviciosFiltered = this.servicios.slice();
    if (this._tEnfermedad) { clearTimeout(this._tEnfermedad); this._tEnfermedad = null; }
    if (this._tServicios) { clearTimeout(this._tServicios); this._tServicios = null; }
    if (this._tDerechos) { clearTimeout(this._tDerechos); this._tDerechos = null; }
    if (this._tEstados) { clearTimeout(this._tEstados); this._tEstados = null; }
    if (this._tMotivos) { clearTimeout(this._tMotivos); this._tMotivos = null; }
    if (this._tRangos) { clearTimeout(this._tRangos); this._tRangos = null; }
    if (this._tProcedencias) { clearTimeout(this._tProcedencias); this._tProcedencias = null; }
    if (this._tMunicipios) { clearTimeout(this._tMunicipios); this._tMunicipios = null; }
    if (this._tLocalidades) { clearTimeout(this._tLocalidades); this._tLocalidades = null; }
    this.searchMotivos = null;
    this.searchRangos = null;
    this.searchProcedencias = null;
    this.searchMunicipios = null;
    this.searchLocalidades = null;
    this.rangosFiltered = this.rangos.slice();
    this.procedenciasFiltered = this.procedencias.slice();
  }

  // input handlers with debounce
  onEnfermedadInput(v: string) {
    this.searchEnfermedad = v;
    if (this._tEnfermedad) clearTimeout(this._tEnfermedad);
    this._tEnfermedad = setTimeout(() => this.onSearchEnfermedad(), 400);
  }

  onServiciosInput(v: string) {
    this.searchServicios = v;
    if (this._tServicios) clearTimeout(this._tServicios);
    this._tServicios = setTimeout(() => {
      // call server-side search for servicios
      this.loadServicios(this.searchServicios);
    }, 300);
  }

  onDerechosInput(v: string) {
    this.searchDerechos = v;
    if (this._tDerechos) clearTimeout(this._tDerechos);
    this._tDerechos = setTimeout(() => this.onSearchDerechos(), 400);
  }

  onEstadosInput(v: string) {
    this.searchEstados = v;
    if (this._tEstados) clearTimeout(this._tEstados);
    this._tEstados = setTimeout(() => this.onSearchEstados(), 400);
  }

  onMotivosInput(v: string) {
    this.searchMotivos = v;
    if (this._tMotivos) clearTimeout(this._tMotivos);
    this._tMotivos = setTimeout(() => this.onSearchMotivos(), 400);
  }

  onSearchMotivos() {
    this.motivosPageNumber = 1;
    this.loadMotivosPage(1, this.searchMotivos);
  }

  onMunicipiosInput(v: string) {
    this.searchMunicipios = v;
    if (this._tMunicipios) clearTimeout(this._tMunicipios);
    this._tMunicipios = setTimeout(() => {
      this.municipiosPageNumber = 1;
      if (this.selectedEstado) this.loadMunicipiosForEstado(this.selectedEstado.idEstado, 1, this.searchMunicipios);
    }, 400);
  }

  onLocalidadesInput(v: string) {
    this.searchLocalidades = v;
    if (this._tLocalidades) clearTimeout(this._tLocalidades);
    this._tLocalidades = setTimeout(() => {
      this.localidadesPageNumber = 1;
      if (this.selectedMunicipio) {
        const idMpo = Number(this.selectedMunicipio?.idMunicipio ?? this.selectedMunicipio?.id ?? null);
        const idEdo = Number(this.selectedEstado?.idEstado ?? null);
        if (Number.isFinite(idMpo)) this.loadLocalidadesForMunicipio(idEdo || undefined, idMpo, 1, this.searchLocalidades);
      }
    }, 400);
  }

  prev() {
    if (this.pageNumber > 1) this.loadPage(this.pageNumber - 1);
  }

  next() {
    const totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    if (this.pageNumber < totalPages) this.loadPage(this.pageNumber + 1);
  }
}
