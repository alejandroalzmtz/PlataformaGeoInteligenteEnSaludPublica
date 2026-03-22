import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import {
  DashboardService,
  TablaDatosFilaDto,
} from '../../../../core/services/dashboard.service';
import { AppliedFilters, toFilterParams } from '../../models/panelesGeneralesModels';

@Component({
  selector: 'app-tabla-datos',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './tablaDatos.html',
  styleUrls: ['./tablaDatos.css'],
})
export class TablaDatosComponent implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  public Math = Math;

  @Input() filters: AppliedFilters | null = null;
  @Input() filtersKey = 0;

  registros: TablaDatosFilaDto[] = [];
  totalRegistros = 0;
  loading = false;
  search = '';

  page = 1;
  pageSize = 50;

  constructor(private dashboardService: DashboardService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtersKey'] && this.filters) {
      this.page = 1;
      this.loadPage();
    }
  }

  loadPage(): void {
    if (!this.filters) return;
    const params = toFilterParams(this.filters);

    this.loading = true;
    this.dashboardService
      .getTabla(params, this.page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.registros = res.datos ?? [];
          this.totalRegistros = res.totalRegistros ?? 0;
        },
        error: () => (this.loading = false),
        complete: () => (this.loading = false),
      });
  }

  prev(): void {
    if (this.page > 1) {
      this.page--;
      this.loadPage();
    }
  }

  next(): void {
    if (this.page < this.maxPages) {
      this.page++;
      this.loadPage();
    }
  }

  get maxPages(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  get mostrando(): number {
    return Math.min(this.page * this.pageSize, this.totalRegistros);
  }

  get filtrados(): TablaDatosFilaDto[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.registros;
    return this.registros.filter(
      (r) =>
        String(r.idRegistro).includes(q) ||
        (r.nombreEstado ?? '').toLowerCase().includes(q) ||
        (r.nombreMunicipio ?? '').toLowerCase().includes(q) ||
        (r.codigoICD ?? '').toLowerCase().includes(q) ||
        (r.nombreInstitucion ?? '').toLowerCase().includes(q),
    );
  }
}
