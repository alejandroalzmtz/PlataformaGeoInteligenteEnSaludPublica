import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RegistroMedicoService, RegistroMedico } from '../../../core/services/RegistroMedicoservice';
import { RecuperacionTemporalModal } from './recuperacionRegistro/recuperacion-temporal';
import { EliminacionPermanenteModal } from './eliminarRegistro/eliminacion-permanente';
import { MatDialog } from '@angular/material/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { Tables } from '../../../core/components/tables/tables';
import { AlarmService } from '../../../core/components/Alarms';
import { ConfirmPasswordComponent } from '../../../core/components/dialogs/confirm-password/confirm-password.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-recuperacion-temporal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    Tables,
    PaginatorModule,
  ],
  templateUrl: './recuperacion-temporal.html',
  styleUrls: ['./recuperacion-temporal.css'],
})
export class RecuperacionTemporal implements OnInit, OnDestroy {
  // expose Math for template usage (e.g. Math.min)
  readonly Math = Math;
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  allData = signal<RegistroMedico[]>([]);

  // búsqueda
  q = signal<string>('');
  private search$ = new Subject<string>();
  private sub = new Subscription();

  private alarms = inject(AlarmService);

  // columnas (mismas que Gestión de Base de Datos)
  displayedColumns: (keyof RegistroMedico | 'select')[] = [
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
  ];

  // paginación
  page = signal<number>(0);
  pageSize = signal<number>(30);
  totalRecords = computed(() => this.allData().length);

  // datos filtrados por búsqueda
  filteredData = computed(() => {
    const q = this.q().toLowerCase().trim();
    let list = this.allData();
    if (q) {
      list = list.filter(
        (r) =>
          String(r.idRegistro).includes(q) ||
          (r.idEnfermedad ?? '').toString().toLowerCase().includes(q) ||
          String(r.idMunicipio ?? '').toLowerCase().includes(q) ||
          (r.CLUES ?? '').toString().toLowerCase().includes(q),
      );
    }
    return list;
  });

  totalFiltered = computed(() => this.filteredData().length);

  // filas visibles según página
  rows = computed(() => {
    const p = this.page();
    const s = this.pageSize();
    return this.filteredData().slice(p * s, p * s + s);
  });

  private api = inject(RegistroMedicoService);

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.sub.add(
      this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((val) => {
        this.q.set(val);
        this.page.set(0);
      }),
    );
    this.loadDeleted();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.search$.next(value ?? '');
  }

  selectedIds = signal<Set<number>>(new Set());

  selectedCount = computed(() => this.selectedIds().size);

  isSelected(id: number) {
    return this.selectedIds().has(id);
  }

  toggleRow(id: number, checked: boolean) {
    const next = new Set(this.selectedIds());
    checked ? next.add(id) : next.delete(id);
    this.selectedIds.set(next);
  }

  toggleAllCurrentPage(checked: boolean) {
    const next = new Set(this.selectedIds());
    if (!checked) {
      // des-selecciona solo los visibles
      for (const r of this.rows()) next.delete(r.idRegistro);
      this.selectedIds.set(next);
      return;
    }
    // selecciona visibles
    for (const r of this.rows()) next.add(r.idRegistro);
    this.selectedIds.set(next);
  }

  allPageSelected = computed(() => {
    const rs = this.rows();
    if (rs.length === 0) return false;
    const s = this.selectedIds();
    return rs.every((r) => s.has(r.idRegistro));
  });

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  bulkLoading = signal<boolean>(false);
  async bulkRecover() {
  const ids = Array.from(this.selectedIds());
  if (ids.length === 0) return;

  // 🔐 Confirmar contraseña ANTES de hacer nada
  const confirmado = await this.confirmAction();
  if (!confirmado) return;

  this.bulkLoading.set(true);

  this.api.revertirMasivo(ids).subscribe({
    next: () => {
      const removed = new Set(ids);
      this.allData.set(
        this.allData().filter((x) => !removed.has(x.idRegistro))
      );

      this.clearSelection();

      this.alarms.showSuccess('Registros recuperados', {
        detail: `Cantidad: ${ids.length}`,
      });

      this.bulkLoading.set(false);
    },
    error: (e: any) => {
      console.error(e);

      this.alarms.showError('No se pudieron recuperar los registros', {
        detail: 'Intenta de nuevo.',
      });

      this.bulkLoading.set(false);
    },
  });
}


  async bulkDeletePermanent() {
  const ids = Array.from(this.selectedIds());
  if (ids.length === 0) return;

  const confirmado = await this.confirmAction();
  if (!confirmado) return;

  this.bulkLoading.set(true);

  this.api.deleteMasivo(ids).subscribe({
    next: () => {
      const removed = new Set(ids);
      this.allData.set(
        this.allData().filter((x) => !removed.has(x.idRegistro))
      );

      this.clearSelection();

      this.alarms.showSuccess('Registros eliminados permanentemente', {
        detail: `Cantidad: ${ids.length}`,
      });

      this.bulkLoading.set(false);
    },
    error: (e: any) => {
      console.error(e);

      this.alarms.showError('No se pudieron eliminar los registros', {
        detail: 'Intenta de nuevo.',
      });

      this.bulkLoading.set(false);
    },
  });
}


  pageChanged(ev: any) {
    // PrimeNG paginator event contains {first, rows, page}
    try {
      const rows = Number(ev.rows) || this.pageSize();
      const page =
        ev.page !== undefined ? Number(ev.page) : Math.floor((Number(ev.first) || 0) / rows);
      this.pageSize.set(rows);
      this.page.set(page);
    } catch (e) {
      // noop
    }
  }

  onPageSizeChange(value: any) {
    const v = Number(value) || 30;
    this.pageSize.set(v);
    this.page.set(0);
  }

  private loadDeleted() {
    this.loading.set(true);
    this.error.set(null);
    // Preferir el endpoint específico que devuelve los registros deshabilitados
    const svcAny = this.api as any;
    if (typeof svcAny.getRegistrosDeshabilitados === 'function') {
      svcAny.getRegistrosDeshabilitados().subscribe({
        next: (res: RegistroMedico[]) => {
          this.allData.set(res ?? []);
          this.loading.set(false);
        },
        error: (e: any) => {
          console.error(e);
          this.error.set('No se pudieron cargar los registros eliminados.');
          this.loading.set(false);
        },
      });
      return;
    }

    // Fallback: obtener todos y filtrar por Habilitado == false / 0
    this.api.getRegistros().subscribe({
      next: (res) => {
        const deleted = (res || []).filter((r) => {
          const v: any = (r as any).Habilitado;
          // si Habilitado no existe, no filtramos (mostramos vacío para seguridad)
          if (v === undefined || v === null) return false;
          return v === 0 || v === false || v === '0' || v === 'false';
        });
        this.allData.set(deleted);
        this.loading.set(false);
      },
      error: (e: any) => {
        console.error(e);
        this.error.set('No se pudieron cargar los registros eliminados.');
        this.loading.set(false);
      },
    });
  }

  async recover(r: RegistroMedico) {
  const ok = await this.confirmAction();
  if (!ok) return;

  const ref = this.dialog.open(RecuperacionTemporalModal, {
    width: '380px',
    data: { idRegistro: r.idRegistro },
  });

  ref.afterClosed().subscribe((done: boolean) => {
    if (done) {
      this.allData.set(this.allData().filter((x) => x.idRegistro !== r.idRegistro));
      this.alarms.showSuccess('Registro recuperado', { detail: `ID: ${r.idRegistro}` });
    }
  });
}

async deletePermanent(r: RegistroMedico) {
  const ok = await this.confirmAction();
  if (!ok) return;

  const ref = this.dialog.open(EliminacionPermanenteModal, {
    width: '420px',
    panelClass: 'modal-alto',
    data: { idRegistro: r.idRegistro },
  });

  ref.afterClosed().subscribe((done: boolean) => {
    if (done) {
      this.allData.set(this.allData().filter((x) => x.idRegistro !== r.idRegistro));
      this.alarms.showSuccess('Registro eliminado permanentemente', {
        detail: `ID: ${r.idRegistro}`,
      });
    }
  });
}


  private confirmAction(): Promise<boolean> {
  return new Promise((resolve) => {
    this.dialog
      .open(ConfirmPasswordComponent, {
        width: '420px',
        disableClose: true,
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((ok) => resolve(!!ok));
  });
}

}
