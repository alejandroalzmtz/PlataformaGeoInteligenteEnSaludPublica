import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    ButtonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tables.html',
  styleUrls: ['./tables.css'],
})
export class Tables {
  @Input() value: any[] = [];
  @Input() rows = 30;
  @Input() first = 0;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions = [10, 30, 50, 100];

  /** Columns to hide (case-insensitive) */
  @Input() excludeColumns: string[] = ['habilitado'];
  /** Optional mapping to override column header labels: { fieldName: 'Label' } */
  @Input() columnLabels: { [key: string]: string } = {};

  @Input() options: { label: string; value: any }[] = [
    { label: '10', value: 10 },
    { label: '30', value: 30 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  @Output() pageChange = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  /** Emitted when a user clicks inside the actions cell. Payload: the row */
  @Output() actionClick = new EventEmitter<any>();

  /** Optional template for per-row actions. Context: let-row */
  @Input() actionsTemplate?: TemplateRef<any> | null = null;

  // ✅ NUEVO: selección
  @Input() selectable = false;

  // selectedIds can be number or string depending on datasource
  @Input() selectedIds: Set<any> = new Set<any>();

  @Output() selectedIdsChange = new EventEmitter<Set<any>>();
  /** Emitted when a single row is deselected by the user; payload is the raw id */
  @Output() rowDeactivateRequest = new EventEmitter<any>();

  // ✅ key del id (por si luego lo reusan en otras tablas)
  @Input() rowIdKey: string = 'idRegistro';

  // track last toggled row id to avoid stale id retention
  lastToggledId: any = null;

  @Input() actionsLabel: string = 'Acciones';

  // Bulk actions UI (shared)
  @Input() showBulkBar: boolean = true;
  @Input() bulkLoading: boolean = false;
  @Output() bulkDeleteRequest = new EventEmitter<number[]>();
  @Output() clearSelectionRequest = new EventEmitter<void>();

  get selectedCount(): number {
    return this.selectedIds ? this.selectedIds.size : 0;
  }

  onBulkDeleteClick() {
    // clear last toggled id when performing bulk action
    this.lastToggledId = null;
    this.bulkDeleteRequest.emit(Array.from(this.selectedIds));
  }

  onClearSelectionClick() {
    // clear stored last toggled id when clearing selection
    this.lastToggledId = null;
    const next = new Set<number>();
    this.selectedIdsChange.emit(next);
    this.clearSelectionRequest.emit();
  }

  onPageChange(ev: any) {
    this.pageChange.emit(ev);
  }

  handleRowClick(row: any, ev?: Event) {
    // preserve existing selection behavior
    if (this.selectable) {
      this.toggleRow(row, !this.isRowSelected(row));
    }
    this.rowClick.emit(row);
  }

  // helpers selección
  private getRowId(row: any): any | null {
    const v = row?.[this.rowIdKey];
    if (v === undefined || v === null) return null;
    return v;
  }

  // Create a stable normalized id string for internal comparison to avoid
  // mismatches between number vs string identity across different data sources.
  private normalizeId(id: any): string {
    return `${typeof id}:${String(id)}`;
  }

  private getNormalizedSelectedIds(): Set<string> {
    try {
      return new Set(Array.from(this.selectedIds || []).map((i) => this.normalizeId(i)));
    } catch (e) {
      return new Set<string>();
    }
  }

  isRowSelected(row: any): boolean {
    const id = this.getRowId(row);
    if (id === null) return false;
    try {
      const normalized = this.normalizeId(id);
      const normalizedSet = this.getNormalizedSelectedIds();
      const has = normalizedSet.has(normalized);
      // debug: help track selection issues
      // console.debug('[Tables] isRowSelected', { id, normalized, has, selectedIds: Array.from(this.selectedIds), normalizedSelected: Array.from(normalizedSet) });
      return has;
    } catch (e) {
      console.error('[Tables] isRowSelected error', e, { id, selectedIds: this.selectedIds });
      return false;
    }
  }

  toggleRow(row: any, checked: boolean) {
    const id = this.getRowId(row);
    if (id === null) return;

    // debug
    console.debug('[Tables] toggleRow', { id, normalized: this.normalizeId(id), checked, before: Array.from(this.selectedIds) });

    const next = new Set(this.selectedIds);
    if (checked) next.add(id); else next.delete(id);

    const normalizedAfter = Array.from(next).map((i) => this.normalizeId(i));
    console.debug('[Tables] toggleRow emitting', { id, normalized: this.normalizeId(id), checked, after: Array.from(next), normalizedAfter });
    this.selectedIdsChange.emit(next);

    // update last toggled id: keep when selecting, clear when deselecting
    this.lastToggledId = checked ? id : null;

    // If the user deselected a single row, emit a deactivate request for that id
    if (!checked) {
      console.debug('[Tables] rowDeactivateRequest emit', { id });
      this.rowDeactivateRequest.emit(id);
    }
  }

  isAllSelectedOnPage(): boolean {
    if (!this.value || this.value.length === 0) return false;
    return this.value.every((r) => {
      const id = this.getRowId(r);
      return id !== null && this.selectedIds.has(id);
    });
  }

  toggleAllOnPage(checked: boolean) {
    const next = new Set(this.selectedIds);
    for (const r of this.value || []) {
      const id = this.getRowId(r);
      if (id === null) continue;
      checked ? next.add(id) : next.delete(id);
    }
    // clearing lastToggledId because multiple rows changed
    this.lastToggledId = null;
    const normalizedAfter = Array.from(next).map((i) => this.normalizeId(i));
    console.debug('[Tables] toggleAllOnPage emitting', { checked, after: Array.from(next), normalizedAfter });
    this.selectedIdsChange.emit(next);
  }

  get keys(): string[] {
    return this.value && this.value.length ? Object.keys(this.value[0]) : [];
  }

  get visibleKeys(): string[] {
    const excludes = (this.excludeColumns || []).map((s) => String(s).toLowerCase());
    return this.keys.filter((k) => !excludes.includes(String(k).toLowerCase()));
  }

  getChecked(ev: Event): boolean {
    const el = ev?.target as HTMLInputElement | null;
    return !!el?.checked;
  }

  // checkbox click handlers to ensure clicks are handled consistently
  onRowCheckboxClick(ev: Event, row: any) {
    try {
      console.debug('[Tables] onRowCheckboxClick', { rowId: this.getRowId(row), eventTarget: ev?.target });
    } catch (e) {
      console.error('[Tables] onRowCheckboxClick error', e);
    }
    ev.stopPropagation();
  }

  onHeaderCheckboxClick(ev: Event) {
    try {
      console.debug('[Tables] onHeaderCheckboxClick', { checked: this.isAllSelectedOnPage(), some: this.isSomeSelectedOnPage() });
    } catch (e) {
      console.error('[Tables] onHeaderCheckboxClick error', e);
    }
    ev.stopPropagation();
  }

  onActionCellClick(ev: Event, row: any) {
    try {
      ev.stopPropagation();
      console.debug('[Tables] onActionCellClick', { row });
      this.actionClick.emit(row);
    } catch (e) {
      console.error('[Tables] onActionCellClick error', e);
    }
  }
  isSomeSelectedOnPage(): boolean {
    if (!this.value || this.value.length === 0) return false;
    const selectedCount = this.value.filter((r) => this.isRowSelected(r)).length;
    return selectedCount > 0 && selectedCount < this.value.length;
  }

  formatCell(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  }
}
