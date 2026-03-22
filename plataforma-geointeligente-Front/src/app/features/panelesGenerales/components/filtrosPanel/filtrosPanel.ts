import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, startWith, map } from 'rxjs';

import {
  DashboardService,
  AnioDisponibleDto,
  CategoriaEnfermedadDto,
  SubcategoriaEnfermedadDto,
  EstadoActivoDto,
  RangoEdadFiltroDto,
  SexoFiltroDto,
  InstitucionFiltroDto,
  EstratoFiltroDto,
} from '../../../../core/services/dashboard.service';
import {
  GraficasService,
} from '../../../../core/services/Graficas/graficas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AlarmService } from '../../../../core/components/Alarms';
import { ConfirmPasswordComponent } from '../../../../core/components/dialogs/confirm-password/confirm-password.component';
import {
  SavePanelDialogComponent,
  SavePanelDialogResult,
} from '../../../../core/components/dialogs/save-panel/save-panel-dialog.component';
import { AppliedFilters, Panel } from '../../models/panelesGeneralesModels';
import { STATE_ID_TO_NAME } from '../../../../core/constants/state-mapping';

@Component({
  selector: 'app-filtros-panel',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './filtrosPanel.html',
  styleUrls: ['./filtrosPanel.css'],
})
export class FiltrosPanelComponent implements OnInit {
  @Input() parentLoading = false;
  @Output() filtersApplied = new EventEmitter<AppliedFilters>();
  @Output() exportPDF = new EventEmitter<void>();

  private alarms = inject(AlarmService);

  // ========== PANEL STATE ==========
  panels: Panel[] = [];
  noPanels = false;
  backendConnected = false;
  currentPanelId: number | null = null;
  selectedPanel: Panel | null = null;

  // ========== CATALOG DATA ==========
  aniosDisponibles: number[] = [];
  categorias: CategoriaEnfermedadDto[] = [];
  subcategorias: SubcategoriaEnfermedadDto[] = [];
  estados: EstadoActivoDto[] = [];
  rangosEdad: RangoEdadFiltroDto[] = [];
  sexos: SexoFiltroDto[] = [];
  instituciones: InstitucionFiltroDto[] = [];
  estratos: EstratoFiltroDto[] = [];

  catalogosLoading = false;

  // ========== SELECTED FILTERS (single-select) ==========
  // 1) Enfermedad
  categoriaCtrl = new FormControl('');
  filteredCategorias$!: Observable<CategoriaEnfermedadDto[]>;
  categoriaInvalid = false;
  selectedCodigoGrupo: string | null = null;
  selectedCodigoICD: string | null = null;
  subcategoriasLoading = false;

  // 2) Rango de años
  selectedAnioInicio: number | null = null;
  selectedAnioFin: number | null = null;

  // 3) Nacional / Estado
  selectedIdEstado: number | null = null; // null = Nacional

  // 4) Grupo etario
  selectedIdRangoEdad: number | null = null;

  // 5) Sexo
  selectedIdSexo: number | null = null;

  // 6) Institución
  selectedClaveInstitucion: string | null = null;

  // 7) Estrato
  selectedEstrato: string | null = null;

  // ========== SAVED CONFIGS ==========
  currentUserId = 0;

  private dialog = inject(MatDialog);

  constructor(
    private dashboardService: DashboardService,
    private graficasService: GraficasService,
    private auth: AuthService,
  ) {}

  /** Devuelve el nombre GeoJSON del estado para mostrar en el filtro */
  geoStateName(estado: EstadoActivoDto): string {
    return STATE_ID_TO_NAME[estado.idEstado] ?? estado.nombreEstado;
  }

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUserId();
    this.loadPanels();
    this.loadCatalogos();
    this.initCategoriaAutocomplete();
  }

  // ========== PANEL MANAGEMENT ==========

  loadPanels(onComplete?: () => void): void {
    this.graficasService.getPanels().subscribe({
      next: (panels: Panel[]) => {
        this.backendConnected = true;
        this.panels = Array.isArray(panels) ? panels : [];
        this.noPanels = this.panels.length === 0;
        onComplete?.();
      },
      error: () => {
        this.backendConnected = false;
        this.noPanels = true;
      },
    });
  }

  onPanelSelect(id: number | null): void {
    if (id == null) {
      this.selectedPanel = null;
      this.currentPanelId = null;
      this.clearFilters();
      return;
    }
    const panel = this.panels.find((p) => p.idPanel === id) || null;
    this.selectedPanel = panel;
    this.currentPanelId = id;
    if (panel) this.applyPanelConfig(panel);
  }

  private applyPanelConfig(panel: Panel): void {
    let cfg: any = null;
    try {
      cfg = typeof panel.configuracion === 'string'
        ? JSON.parse(panel.configuracion)
        : (panel.configuracion ?? null);
    } catch {
      cfg = null;
    }
    if (!cfg) { this.clearFilters(); return; }

    this.selectedCodigoGrupo = cfg.codigoGrupo ?? null;
    this.selectedCodigoICD = cfg.codigoICD ?? null;

    // Sync autocomplete display with the saved category
    if (this.selectedCodigoGrupo) {
      const cat = this.categorias.find(c => c.codigoGrupo === this.selectedCodigoGrupo);
      if (cat) {
        this.categoriaCtrl.setValue(cat as any);
      }
    } else {
      this.categoriaCtrl.setValue('');
    }
    this.categoriaInvalid = false;
    this.selectedAnioInicio = cfg.anioInicio ?? null;
    this.selectedAnioFin = cfg.anioFin ?? null;
    this.selectedIdEstado = cfg.idEstado ?? null;
    this.selectedIdRangoEdad = cfg.idRangoEdad ?? null;
    this.selectedIdSexo = cfg.idSexo ?? null;
    this.selectedClaveInstitucion = cfg.claveInstitucion ?? null;
    this.selectedEstrato = cfg.estrato ?? null;

    // Load subcategorías if a category was saved
    if (this.selectedCodigoGrupo) {
      this.loadSubcategorias(this.selectedCodigoGrupo);
    }

    this.applyFilters();
  }

  clearFilters(): void {
    this.categoriaCtrl.setValue('');
    this.categoriaInvalid = false;
    this.selectedCodigoGrupo = null;
    this.selectedCodigoICD = null;
    this.subcategorias = [];
    this.selectedAnioInicio = this.aniosDisponibles.length > 0 ? this.aniosDisponibles[0] : null;
    this.selectedAnioFin = this.aniosDisponibles.length > 0
      ? this.aniosDisponibles[this.aniosDisponibles.length - 1]
      : null;
    this.selectedIdEstado = null;
    this.selectedIdRangoEdad = null;
    this.selectedIdSexo = null;
    this.selectedClaveInstitucion = null;
    this.selectedEstrato = null;
  }

  // ========== CATALOG LOADING ==========

  private loadCatalogos(): void {
    this.catalogosLoading = true;
    forkJoin({
      anios: this.dashboardService.getAniosDisponibles(),
      categorias: this.dashboardService.getCategoriasEnfermedad(),
      estados: this.dashboardService.getEstados(),
      rangosEdad: this.dashboardService.getRangosEdad(),
      sexos: this.dashboardService.getSexos(),
      instituciones: this.dashboardService.getInstituciones(),
      estratos: this.dashboardService.getEstratos(),
    }).subscribe({
      next: (data) => {
        this.aniosDisponibles = data.anios.map((a) => a.anio).sort((a, b) => a - b);
        this.categorias = data.categorias;
        this.estados = data.estados;
        this.rangosEdad = data.rangosEdad;
        this.sexos = data.sexos;
        this.instituciones = data.instituciones;
        this.estratos = data.estratos;

        // Default year range
        if (this.aniosDisponibles.length > 0 && !this.selectedAnioInicio) {
          this.selectedAnioInicio = this.aniosDisponibles[0];
          this.selectedAnioFin = this.aniosDisponibles[this.aniosDisponibles.length - 1];
        }
        this.catalogosLoading = false;
      },
      error: (err) => {
        console.error('Error cargando catálogos del dashboard:', err);
        this.catalogosLoading = false;
      },
    });
  }

  // ========== ENFERMEDAD CASCADING ==========

  private initCategoriaAutocomplete(): void {
    this.filteredCategorias$ = this.categoriaCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCategorias(value ?? '')),
    );
  }

  private _filterCategorias(value: string | CategoriaEnfermedadDto | null): CategoriaEnfermedadDto[] {
    // After selecting, value is the object — extract the text to filter
    const q = typeof value === 'string' ? value?.trim().toLowerCase()
            : value ? `${value.codigoGrupo} - ${value.nombreEnfermedad}`.toLowerCase()
            : '';
    if (!q) return this.categorias;
    return this.categorias.filter(c =>
      c.codigoGrupo.toLowerCase().includes(q) ||
      c.nombreEnfermedad.toLowerCase().includes(q) ||
      `${c.codigoGrupo} - ${c.nombreEnfermedad}`.toLowerCase().includes(q)
    );
  }

  displayCategoria(cat: CategoriaEnfermedadDto | string | null): string {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return `${cat.codigoGrupo} - ${cat.nombreEnfermedad}`;
  }

  onCategoriaSelected(cat: CategoriaEnfermedadDto): void {
    this.categoriaInvalid = false;
    this.selectedCodigoGrupo = cat.codigoGrupo;
    this.selectedCodigoICD = null;
    this.subcategorias = [];
    this.loadSubcategorias(cat.codigoGrupo);
  }

  onCategoriaBlur(): void {
    const val = this.categoriaCtrl.value;
    // If the value is a string (typed, not selected) check if it matches any option
    if (typeof val === 'string' && val.trim()) {
      const match = this.categorias.find(c =>
        `${c.codigoGrupo} - ${c.nombreEnfermedad}` === val
      );
      if (!match) {
        this.categoriaInvalid = true;
      }
    }
    // If cleared, reset
    if (!val || (typeof val === 'string' && !val.trim())) {
      this.categoriaInvalid = false;
      this.selectedCodigoGrupo = null;
      this.selectedCodigoICD = null;
      this.subcategorias = [];
    }
  }

  clearCategoria(): void {
    this.categoriaCtrl.setValue('');
    this.selectedCodigoGrupo = null;
    this.selectedCodigoICD = null;
    this.subcategorias = [];
    this.categoriaInvalid = false;
  }

  onCategoriaChange(): void {
    this.selectedCodigoICD = null;
    this.subcategorias = [];
    if (this.selectedCodigoGrupo) {
      this.loadSubcategorias(this.selectedCodigoGrupo);
    }
  }

  private loadSubcategorias(codigoGrupo: string): void {
    this.subcategoriasLoading = true;
    this.dashboardService.getSubcategoriasEnfermedad(codigoGrupo).subscribe({
      next: (subs) => {
        this.subcategorias = subs;
        this.subcategoriasLoading = false;
      },
      error: () => {
        this.subcategorias = [];
        this.subcategoriasLoading = false;
      },
    });
  }

  // ========== YEAR VALIDATION ==========

  onAnioInicioChange(): void {
    if (
      this.selectedAnioInicio != null &&
      this.selectedAnioFin != null &&
      this.selectedAnioFin < this.selectedAnioInicio
    ) {
      this.selectedAnioFin = this.selectedAnioInicio;
    }
  }

  onAnioFinChange(): void {
    if (
      this.selectedAnioInicio != null &&
      this.selectedAnioFin != null &&
      this.selectedAnioInicio > this.selectedAnioFin
    ) {
      this.selectedAnioInicio = this.selectedAnioFin;
    }
  }

  /** Años disponibles filtrados para Año Fin (>= anioInicio) */
  get aniosFinDisponibles(): number[] {
    if (this.selectedAnioInicio == null) return this.aniosDisponibles;
    return this.aniosDisponibles.filter((a) => a >= this.selectedAnioInicio!);
  }

  /** Años disponibles filtrados para Año Inicio (<= anioFin) */
  get aniosInicioDisponibles(): number[] {
    if (this.selectedAnioFin == null) return this.aniosDisponibles;
    return this.aniosDisponibles.filter((a) => a <= this.selectedAnioFin!);
  }

  // ========== APPLY FILTERS ==========

  applyFilters(): void {
    if (!this.selectedAnioInicio || !this.selectedAnioFin) {
      this.alarms.showWarn('Selecciona un rango de años');
      return;
    }

    // Validate categoria autocomplete: if there's typed text but no selection, warn
    const catVal = this.categoriaCtrl.value;
    if (typeof catVal === 'string' && catVal.trim() && !this.selectedCodigoGrupo) {
      this.categoriaInvalid = true;
      this.alarms.showWarn('Debes seleccionar una categoría de la lista');
      return;
    }

    const filters: AppliedFilters = {
      panel: this.selectedPanel,
      panelId: this.currentPanelId,
      anioInicio: this.selectedAnioInicio,
      anioFin: this.selectedAnioFin,
      codigoGrupo: this.selectedCodigoGrupo,
      codigoICD: this.selectedCodigoICD,
      idEstado: this.selectedIdEstado,
      idSexo: this.selectedIdSexo,
      idRangoEdad: this.selectedIdRangoEdad,
      claveInstitucion: this.selectedClaveInstitucion,
      estrato: this.selectedEstrato,
    };

    this.filtersApplied.emit(filters);
    this.alarms.showSuccess('Filtros aplicados correctamente');
  }

  // ========== CONFIGURATION SAVE / UPDATE ==========

  private buildConfigJson(): string {
    return JSON.stringify({
      codigoGrupo: this.selectedCodigoGrupo,
      codigoICD: this.selectedCodigoICD,
      anioInicio: this.selectedAnioInicio,
      anioFin: this.selectedAnioFin,
      idEstado: this.selectedIdEstado,
      idRangoEdad: this.selectedIdRangoEdad,
      idSexo: this.selectedIdSexo,
      claveInstitucion: this.selectedClaveInstitucion,
      estrato: this.selectedEstrato,
    });
  }

  openSaveModal(): void {
    const ref = this.dialog.open(SavePanelDialogComponent, {
      data: { title: 'Guardar Nuevo Panel', confirmLabel: 'Guardar', panelName: '' },
      width: '460px',
    });

    ref.afterClosed().subscribe((result: SavePanelDialogResult | null) => {
      if (!result) return;
      const dto = {
        nombrePanel: result.panelName,
        configuracion: this.buildConfigJson(),
        usuarioCreador: this.currentUserId,
      };
      this.graficasService.createPanel(dto).subscribe({
        next: (created) => {
          this.alarms.showSuccess('Panel guardado correctamente');
          this.loadPanels(() => {
            this.currentPanelId = created.idPanel;
            this.selectedPanel = this.panels.find(p => p.idPanel === created.idPanel) ?? null;
          });
        },
        error: () => this.alarms.showError('No se pudo guardar el panel'),
      });
    });
  }

  openUpdateModal(): void {
    if (!this.selectedPanel) return;

    const ref = this.dialog.open(SavePanelDialogComponent, {
      data: {
        title: 'Actualizar Panel',
        confirmLabel: 'Actualizar',
        panelName: this.selectedPanel.nombrePanel,
      },
      width: '460px',
    });

    ref.afterClosed().subscribe((result: SavePanelDialogResult | null) => {
      if (!result) return;
      const dto = {
        idPanel: this.selectedPanel!.idPanel,
        nombrePanel: result.panelName,
        configuracion: this.buildConfigJson(),
      };
      this.graficasService.updatePanel(this.selectedPanel!.idPanel, dto).subscribe({
        next: () => {
          this.alarms.showSuccess('Panel actualizado correctamente');
          const panelId = this.selectedPanel!.idPanel;
          this.loadPanels(() => {
            this.selectedPanel = this.panels.find(p => p.idPanel === panelId) ?? null;
            this.currentPanelId = panelId;
          });
        },
        error: () => this.alarms.showError('No se pudo actualizar el panel'),
      });
    });
  }

  // ========== DELETE PANEL ==========

  openDeleteModal(): void {
    if (!this.selectedPanel) return;

    const ref = this.dialog.open(ConfirmPasswordComponent, { width: '460px' });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.graficasService.deletePanel(this.selectedPanel!.idPanel).subscribe({
        next: () => {
          this.alarms.showSuccess('Panel eliminado correctamente');
          this.selectedPanel = null;
          this.currentPanelId = null;
          this.loadPanels();
        },
        error: () => this.alarms.showError('No se pudo eliminar el panel'),
      });
    });
  }

  // ========== EXPORT ==========

  onExportPDF(): void {
    this.exportPDF.emit();
  }
}
