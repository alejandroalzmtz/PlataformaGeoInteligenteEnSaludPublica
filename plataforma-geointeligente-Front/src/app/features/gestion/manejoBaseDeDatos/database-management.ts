import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
// removed MatPaginator imports (using PrimeNG paginator inside shared component)
import { PaginatorModule } from 'primeng/paginator';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { signal, computed } from '@angular/core';

import { RegistroMedicoService, RegistroMedico } from '../../../core/services/RegistroMedicoservice';
import { AddRegistroMedicoModal } from './añadirRegistro/add-registro-medico';
import { ExportService } from '../../../core/services/export.services';
import { EliminacionTemporalModal } from './eliminacionTemporalRegistro/eliminacion-temporal';
import { AuthService } from '../../../core/services/auth.service';
import { Tables } from '../../../core/components/tables/tables';
import { AlarmService } from '../../../core/components/Alarms';
import { ConfirmPasswordService } from '../../../core/services/confirm-password.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-database-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    Tables,
    PaginatorModule,
  ],
  providers: [],
  templateUrl: './database-management.html',
  styleUrls: ['./database-management.css'],
})
export class DatabaseManagement implements OnInit, OnDestroy {
  // UI state
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  isAdmin = false;
  private alarms = inject(AlarmService);

  // búsqueda
  q = signal<string>('');

  // datos
  allData = signal<RegistroMedico[]>([]);

  // paginación (no signals porque template usa propiedades page/pageSize en texto)
  page = 1;
  pageSize = 30;

  // total devuelto por backend
  totalRecords = signal<number>(0);
  totalPages = 0;

  // paged rows expuestos como computed para la plantilla
  filteredData = computed(() => {
    const q = this.q().toLowerCase().trim();
    let list = [...this.allData()];

    if (q) {
      list = list.filter(
        (r) =>
          String(r.idRegistro).includes(q) ||
          (r.idEnfermedad ?? '').toString().toLowerCase().includes(q) ||
          String(r.idMunicipio ?? '')
            .toLowerCase()
            .includes(q) ||
          (r.CLUES ?? '').toString().toLowerCase().includes(q),
      );
    }

    return list;
  });

  // rows reflects the data returned from server (already paged)
  rows = computed(() => this.filteredData());
  total = computed(() => this.allData().length);

  // Solo para la tabla (UI)
  displayedColumns: (keyof RegistroMedico | 'select' | 'Editar')[] = [
    'select',
    'idRegistro',
    'fechaIngreso',
    'fechaEgreso',
    'diasEstancia',
    'idEstado',
    'idMunicipio',
    'idLoc',
    'edad',
    'idSexo',
    'idDerechoHab',
    'idServicioIngreso',
    'idServicioEgreso',
    'idProcedencia',
    'idMotivoEgreso',
    'idEnfermedad',
    'Editar',
  ];

  // Solo para export (SIN select ni Editar)
  exportColumns: (keyof RegistroMedico)[] = [
    'idRegistro',
    'fechaIngreso',
    'fechaEgreso',
    'diasEstancia',
    'idEstado',
    'idMunicipio',
    'idLoc',
    'edad',
    'idSexo',
    'idDerechoHab',
    'idServicioIngreso',
    'idServicioEgreso',
    'idProcedencia',
    'idMotivoEgreso',
    'idEnfermedad',
    'CLUES',
  ];

  selectedIds = signal<Set<number>>(new Set());
  selectedCount = computed(() => this.selectedIds().size);

  bulkLoading = signal(false);

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  private search$ = new Subject<string>();
  private sub = new Subscription();

  constructor(
    private api: RegistroMedicoService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private confirmPasswordService: ConfirmPasswordService,
  ) {
    // ya no cargamos buckets por año
  }

  async bulkDelete() {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    this.bulkLoading.set(true);

    this.api.deleteMasivo(ids).subscribe({
      next: () => {
        this.bulkLoading.set(false);
        this.clearSelection();

        // recargar página desde backend
        this.loadPage();

        this.alarms.showSuccess('Registros eliminados', { detail: `Cantidad: ${ids.length}` });
      },
      error: (e) => {
        console.error(e);
        this.bulkLoading.set(false);
        this.alarms.showError('No se pudieron eliminar los registros', {
          detail: 'Intenta de nuevo.',
        });
      },
    });
  }

  async openEliminarModal(r: RegistroMedico): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const dialogRef = this.dialog.open(EliminacionTemporalModal, {
      width: '400px',
      data: { idRegistro: r.idRegistro },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // recargar la tabla completa
        this.loadPage();
        this.alarms.showSuccess(`Registro ${r.idRegistro} eliminado temporalmente`);
      }
    });
  }

  async openEliminarTemporal(r: RegistroMedico): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const dialogRef = this.dialog.open(EliminacionTemporalModal, {
      width: '400px',
      data: { idRegistro: r.idRegistro },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPage();
        this.alarms.showSuccess(`Registro ${r.idRegistro} eliminado temporalmente`);
      }
    });
  }

  async openRegistroModal(mode: 'create' | 'edit', r?: RegistroMedico): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const dialogRef = this.dialog.open(AddRegistroMedicoModal, {
      width: '900px',
      maxWidth: '95vw',
      data: { mode, registro: r ?? null },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.ok || result === true) {
        this.loadPage();

        const id = result?.id ?? r?.idRegistro;
        this.alarms.showSuccess(
          mode === 'create'
            ? 'Registro agregado correctamente'
            : 'Registro actualizado correctamente',
          { detail: id ? `ID: ${id}` : undefined },
        );
      }
    });
  }

  openAddRegistro() {
    return this.openRegistroModal('create');
  }

  openEditRegistro(r: RegistroMedico) {
    return this.openRegistroModal('edit', r);
  }

  async exportCSV(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const data = this.filteredData();
    if (!data?.length) {
      this.alarms.showWarn('No hay datos para exportar');
      return;
    }

    this.exportService.exportToCSV(data, 'registros_medicos');
    this.alarms.showSuccess('CSV descargado');
  }

  async exportPDF(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const data = this.filteredData();
    if (!data?.length) {
      this.alarms.showWarn('No hay datos para exportar');
      return;
    }

    const columns = this.exportColumns as unknown as string[];

    this.exportService.exportToPDF(data, columns, 'registros_medicos', {
      title: 'Reporte de Registros Médicos',
      orientation: 'l',
      columnLabels: {
        fechaIngreso: 'F. ingreso',
        fechaEgreso: 'F. egreso',
        diasEstancia: 'Estancia',
        idSexo: 'Sexo',
      },
      columnStyles: {
        fechaIngreso: { cellWidth: 17 },
        fechaEgreso: { cellWidth: 17 },
        CLUES: { cellWidth: 23 },
        idSexo: { cellWidth: 14 },
      },
      formatters: {
        idSexo: (v) => (v === 1 ? 'Hombre' : v === 2 ? 'Mujer' : 'N/A'),
        fechaIngreso: (v) => (v ? new Date(v).toLocaleDateString() : ''),
        fechaEgreso: (v) => (v ? new Date(v).toLocaleDateString() : ''),
      },
    });

    this.alarms.showSuccess('PDF descargado');
  }

  async exportJSON(): Promise<void> {
    const confirmed = await this.confirmAction();
    if (!confirmed) return;

    const data = this.filteredData();
    if (!data?.length) {
      this.alarms.showWarn('No hay datos para exportar');
      return;
    }

    this.exportService.exportToJSON(data, 'registros_medicos');
    this.alarms.showSuccess('JSON descargado');
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin(); // <-- determina el rol una sola vez
    if (!this.isAdmin) {
      // quitar la columna acciones
      this.displayedColumns = this.displayedColumns.filter((c) => c !== 'Editar');
    }
    this.sub.add(
      this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((q: string) => {
        this.q.set(q ?? '');
        this.page = 1;
        this.loadPage();
      }),
    );

    this.loadPage();
  }

  // no AfterViewInit logic needed; paginator is inside standalone component

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadPage(): void {
    this.loading.set(true);
    this.error.set(null);

    const query = this.q().trim();
    const obs = query
      ? this.api.search(query, this.page, this.pageSize)
      : this.api.getPaged(this.page, this.pageSize);

    obs.subscribe({
      next: (resp: any) => {
        console.log('Paged response:', resp); // depuración

        // registros recibidos (página actual)
        this.allData.set(resp.registros ?? []);

        // Determinar totalRecords:
        // - Si hay query (búsqueda) preferimos filteredRecords (incluso si es 0: indica 0 coincidencias)
        // - Si no hay query preferimos totalRecords (el total global)
        let totalFromResp = 0;
        if (resp.query) {
          // respuesta de Search
          totalFromResp =
            typeof resp.filteredRecords === 'number'
              ? resp.filteredRecords
              : typeof resp.totalRecords === 'number'
                ? resp.totalRecords
                : resp.registros
                  ? resp.registros.length
                  : 0;
        } else {
          // respuesta de Paged (no hay query)
          totalFromResp =
            typeof resp.totalRecords === 'number'
              ? resp.totalRecords
              : typeof resp.filteredRecords === 'number'
                ? resp.filteredRecords
                : resp.registros
                  ? resp.registros.length
                  : 0;
        }

        this.totalRecords.set(totalFromResp);

        // totalPages: preferir valor del servidor si viene
        this.totalPages =
          typeof resp.totalPages === 'number' && resp.totalPages > 0
            ? resp.totalPages
            : Math.max(1, Math.ceil(this.totalRecords() / this.pageSize));

        // sincronizar la página si viene del servidor
        if (resp.page && typeof resp.page === 'number') {
          this.page = resp.page;
        }

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.error.set(err?.message ?? 'Error al cargar registros');
        this.allData.set([]);
        this.totalRecords.set(0);
        this.totalPages = 0;
        this.loading.set(false);
      },
    });
  }

  onSearchInput(value: string): void {
    this.search$.next(value ?? '');
  }

  pageChanged(e: any): void {
    // Supports both PrimeNG paginator event ({first, rows, page}) and Material paginator ({pageIndex, pageSize})
    if (e == null) return;
    if (e.page !== undefined || e.first !== undefined) {
      // PrimeNG event
      const rows = e.rows ?? this.pageSize;
      const page = e.page !== undefined ? e.page : Math.floor((e.first ?? 0) / rows);
      this.page = (page ?? 0) + 1;
      this.pageSize = rows;
    } else if (e.pageIndex !== undefined) {
      // Material paginator event
      this.page = (e.pageIndex ?? 0) + 1;
      this.pageSize = e.pageSize ?? this.pageSize;
    }
    this.loadPage();
  }

  // navegación manual
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadPage();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadPage();
    }
  }

  goToPage(n: number): void {
    const target = Math.max(1, Math.min(this.totalPages || 1, Math.floor(n)));
    if (target !== this.page) {
      this.page = target;
      this.loadPage();
    }
  }

  private async confirmAction(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmPasswordService
        .open()
        .pipe(take(1))
        .subscribe((confirmed) => {
          resolve(!!confirmed);
        });
    });
  }
}
