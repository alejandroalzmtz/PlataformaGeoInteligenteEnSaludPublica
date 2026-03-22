import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
  finalize,
} from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  RegistroMedicoService,
  CreateRegistroMedico,
} from '../../../../core/services/RegistroMedicoservice';
import {
  EnfermedadService,
  Estado,
  Municipio,
  Servicio,
  DerechoHabitacion,
  MotivoEgreso,
  Hospital,
} from '../../../../core/services/EnfermedadService';
import { ActividadService } from '../../../../core/services/actividad.services';
import { AuthService } from '../../../../core/services/auth.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { DateInputComponent } from '../../../../shared/date-input/date-input.component';
import { AlarmService } from '../../../../core/components/Alarms';
import { firstValueFrom } from 'rxjs';

//funciones para validar fechas del formulario
function dateNotInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
  };
}

function egresoAfterIngresoValidator(ingresoFieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !control.parent) return null;
    const ingresoControl = control.parent.get(ingresoFieldName);
    if (!ingresoControl || !ingresoControl.value) return null;
    const fechaIngreso = new Date(ingresoControl.value);
    const fechaEgreso = new Date(control.value);
    return fechaEgreso < fechaIngreso ? { egresoBeforeIngreso: true } : null;
  };
}

//valida que la fecha sea válida considerando años bisiestos
function validDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dateString = control.value;

    // Verificar formato YYYY-MM-DD
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(dateRegex);

    if (!match) return { invalidDate: true };

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    // Verificar rangos básicos
    if (month < 1 || month > 12) return { invalidDate: true };
    if (day < 1 || day > 31) return { invalidDate: true };

    // Validar días según el mes y año bisiesto
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const maxDays = daysInMonth[month - 1];

    if (day > maxDays) {
      return { invalidDate: true, invalidLeapYear: !isLeapYear && month === 2 && day === 29 };
    }

    return null;
  };
}

@Component({
  selector: 'app-add-registro-medico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    DateInputComponent,
  ],
  templateUrl: './add-registro-medico.html',
  styleUrls: ['./add-registro-medico.css'],
})
export class AddRegistroMedico implements OnInit {
  form: any;

  estados: Estado[] = [];
  municipios: Municipio[] = [];
  localidades: any[] = [];
  servicios: Servicio[] = [];
  derechos: DerechoHabitacion[] = [];
  procedencias: any[] = [];
  motivos: MotivoEgreso[] = [];
  hospitales: any[] = [];

  //listas con resultados de búsqueda en cada campo
  filteredEstados: Estado[] = [];
  filteredMunicipios: Municipio[] = [];
  filteredLocalidades: any[] = [];
  filteredServicios: Servicio[] = [];
  filteredDerechos: DerechoHabitacion[] = [];
  filteredProcedencias: any[] = [];
  filteredMotivos: MotivoEgreso[] = [];

  //configuración para el campo de enfermedades
  filteredEnfermedades: any[] = [];
  enfermedadLoading = false;
  enfermedadLoadingMore = false;
  enfermedadPage = 1;
  enfermedadHasNext = false;
  lastEnfermedadSearchTerm = '';
  noEnfermedadResults = false;
  filteredHospitales: Hospital[] = [];
  hospitalLoading = false;
  noHospEnLoc: boolean = false;

  //evita buscar cuando se selecciona una opción
  private suppressEnfermedadSearch = false;

  isSaving = false;
  private errorMsg: string | null = null;
  backendErrors: { [key: string]: string } = {};

  // String properties for date-input two-way binding
  fechaIngresoStr = '';
  fechaEgresoStr = '';

  private alarms = inject(AlarmService);

  get tituloModal(): string {
    return this.data?.mode === 'edit' ? 'Editar Registro Médico' : 'Nuevo Registro Médico';
  }

  constructor(
    private fb: FormBuilder,
    private registroSvc: RegistroMedicoService,
    private enfermedadService: EnfermedadService,
    private actividadService: ActividadService,
    private auth: AuthService,
    private dialogRef: MatDialogRef<AddRegistroMedico>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; registro?: any },
  ) {
    this.form = this.fb.group({
      fechaIngreso: [
        '',
        {
          validators: [Validators.required, dateNotInFutureValidator(), validDateValidator()],
          updateOn: 'blur',
        },
      ],
      fechaEgreso: [
        '',
        {
          validators: [
            dateNotInFutureValidator(),
            egresoAfterIngresoValidator('fechaIngreso'),
            validDateValidator(),
          ],
          updateOn: 'blur',
        },
      ],
      idEstado: [null],
      idMunicipio: [null],
      idLoc: [null],
      edad: [
        null,
        {
          validators: [Validators.min(0), Validators.max(150)],
          updateOn: 'blur',
        },
      ],
      idSexo: [1],
      idDerechoHab: [null],
      idServicioIngreso: [null],
      idServicioEgreso: [null],
      idProcedencia: [null],
      idMotivoEgreso: [null],
      enfermedadDisplay: [''],
      idEnfermedad: [''],
      CLUES: ['', Validators.required],
      hospitalSearch: [''],
      estadoSearch: [''],
      municipioSearch: [''],
      localidadSearch: [''],
      derechoHabSearch: [''],
      servicioIngresoSearch: [''],
      servicioEgresoSearch: [''],
      procedenciaSearch: [''],
      motivoEgresoSearch: [''],
    });
  }

  private validatePayload(p: any): string | null {
    if (!p) return 'No hay datos para guardar';

    console.log(
      'mun sample',
      this.municipios.find((m: any) => Number(m.idMunicipio) === Number(p.idMunicipio)),
    );
    console.log(
      'loc sample',
      this.localidades.find((l: any) => Number(l.idLoc) === Number(p.idLoc)),
    );

    if (p.idEstado != null) {
      const found = this.estados.find((e) => Number(e.idEstado) === Number(p.idEstado));
      if (!found)
        return 'El estado seleccionado no es válido. Por favor selecciona un estado de la lista.';
    }

    if (p.idMunicipio != null) {
      const found = this.municipios.find(
        (m: any) =>
          Number(m.idMunicipio) === Number(p.idMunicipio) &&
          (p.idEstado == null || Number(m.idEstado) === Number(p.idEstado)),
      );
      if (!found)
        return 'El municipio seleccionado no es válido o no corresponde al estado. Por favor verifica tu selección.';
    }

    if (p.idLoc != null) {
      const loc: any = this.localidades.find((l: any) => Number(l.idLoc) === Number(p.idLoc));
      if (!loc) {
        return 'La localidad seleccionada no es válida o no corresponde al municipio. Por favor verifica tu selección.';
      }

      if (p.idMunicipio != null && Number(loc.idMpo) !== Number(p.idMunicipio)) {
        return 'La localidad seleccionada no es válida o no corresponde al municipio. Por favor verifica tu selección.';
      }

      // opcional: si también quieres validar estado con lo que trae la localidad
      if (p.idEstado != null && loc.idEdo != null && Number(loc.idEdo) !== Number(p.idEstado)) {
        return 'La localidad seleccionada no es válida o no corresponde al estado. Por favor verifica tu selección.';
      }
    }

    if (p.idServicioIngreso != null) {
      const found = this.servicios.find(
        (s) => Number(s.idServicio) === Number(p.idServicioIngreso),
      );
      if (!found)
        return 'El servicio de ingreso seleccionado no es válido. Por favor selecciona uno de la lista.';
    }

    if (p.idServicioEgreso != null) {
      const found = this.servicios.find((s) => Number(s.idServicio) === Number(p.idServicioEgreso));
      if (!found)
        return 'El servicio de egreso seleccionado no es válido. Por favor selecciona uno de la lista.';
    }

    if (p.idDerechoHab != null) {
      const found = this.derechos.find((d) => Number(d.idDerechoHab) === Number(p.idDerechoHab));
      if (!found)
        return 'El derecho de habitación seleccionado no es válido. Por favor selecciona uno de la lista.';
    }

    if (p.idEnfermedad != null && String(p.idEnfermedad).trim() === '')
      return 'Por favor selecciona una enfermedad de la lista o déjalo en blanco.';

    if (p.CLUES != null) {
      const clues = String(p.CLUES).trim();

      if (clues === '') {
        return 'Selecciona un hospital (CLUES).';
      }

      if (Array.isArray(this.hospitales) && this.hospitales.length > 0) {
        const h: any = this.hospitales.find(
          (x: any) => String(x.clues ?? x.CLUES ?? '').trim() === clues,
        );

        if (!h) {
          return 'El hospital (CLUES) seleccionado no es válido. Por favor selecciona uno de la lista.';
        }

        if (p.idEstado != null && Number(h.estado ?? h.Estado) !== Number(p.idEstado)) {
          return 'El hospital seleccionado no corresponde al estado. Verifica tu selección.';
        }
        if (p.idMunicipio != null && Number(h.municipio ?? h.Municipio) !== Number(p.idMunicipio)) {
          return 'El hospital seleccionado no corresponde al municipio. Verifica tu selección.';
        }
        if (
          !this.noHospEnLoc &&
          p.idLoc != null &&
          Number(h.localidad ?? h.Localidad) !== Number(p.idLoc)
        ) {
          return 'El hospital seleccionado no corresponde a la localidad. Verifica tu selección.';
        }
      }
    } else {
      return 'Selecciona un hospital (CLUES).';
    }
    return null;
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
    this.initEnfermedadAutocomplete();
    this.initFilteredDropdowns();
    this.form.get('idEstado')?.valueChanges.subscribe((v: any) => this.onEstadoChanged(v));
    //this.form.get('idMunicipio')?.valueChanges.subscribe((m: any) => this.onMunicipioChanged(m));
    //volver a revisar fecha de egreso al cambiar ingreso
    this.form.get('fechaIngreso')?.valueChanges.subscribe(() => {
      this.clearBackendError('fechaIngreso');
      this.form.get('fechaEgreso')?.updateValueAndValidity();
    });
    //borrar errores del servidor cuando se edita el campo
    this.form
      .get('fechaEgreso')
      ?.valueChanges.subscribe(() => this.clearBackendError('fechaEgreso'));
    this.form.get('idLoc')?.valueChanges.subscribe(() => this.clearBackendError('idLoc'));
    this.form.get('edad')?.valueChanges.subscribe(() => this.clearBackendError('edad'));
    this.form.get('idSexo')?.valueChanges.subscribe(() => this.clearBackendError('idSexo'));
    this.form
      .get('idDerechoHab')
      ?.valueChanges.subscribe(() => this.clearBackendError('idDerechoHab'));
    this.form
      .get('idServicioIngreso')
      ?.valueChanges.subscribe(() => this.clearBackendError('idServicioIngreso'));
    this.form
      .get('idServicioEgreso')
      ?.valueChanges.subscribe(() => this.clearBackendError('idServicioEgreso'));
    this.form
      .get('idProcedencia')
      ?.valueChanges.subscribe(() => this.clearBackendError('idProcedencia'));
    this.form
      .get('idMotivoEgreso')
      ?.valueChanges.subscribe(() => this.clearBackendError('idMotivoEgreso'));
    this.form.get('enfermedadDisplay')?.valueChanges.subscribe(() => {
      this.clearBackendError('enfermedadDisplay');
      this.clearBackendError('idEnfermedad');
    });
    if (this.data?.mode === 'edit' && this.data?.registro) {
      this.precargarFormularioEdit(this.data.registro);
    }
  }

  private async precargarFormularioEdit(r: any): Promise<void> {
    // 1) Campos simples + IDs hidden
    const fechaIngresoVal = this.toDateInput(r.fechaIngreso);
    const fechaEgresoVal = r.fechaEgreso ? this.toDateInput(r.fechaEgreso) : '';

    // Sync date-input string properties
    this.fechaIngresoStr = fechaIngresoVal;
    this.fechaEgresoStr = fechaEgresoVal;

    this.form.patchValue(
      {
        fechaIngreso: fechaIngresoVal,
        fechaEgreso: fechaEgresoVal || null,
        edad: r.edad,
        idSexo: r.idSexo,
        // hidden ids
        idEstado: r.idEstado ?? null,
        idMunicipio: r.idMunicipio ?? null,
        idLoc: r.idLoc ?? null,
        idDerechoHab: r.idDerechoHab ?? null,
        idServicioIngreso: r.idServicioIngreso ?? null,
        idServicioEgreso: r.idServicioEgreso ?? null,
        idProcedencia: r.idProcedencia ?? null,
        idMotivoEgreso: r.idMotivoEgreso ?? null,
        CLUES: r.clues ?? r.CLUES ?? '',
        hospitalSearch: r.clues || r.CLUES ? { clues: r.clues ?? r.CLUES } : '',
      },
      { emitEvent: false },
    );

    // 2) Precargar Search controls con OBJETOS (para que se vean nombres)
    const estadoObj = this.estados?.find((e: any) => e.idEstado === Number(r.idEstado));
    if (estadoObj) {
      this.form.get('estadoSearch')?.setValue(estadoObj, { emitEvent: false });
      this.filteredEstados = [estadoObj];
    }

    const derechoObj = this.derechos?.find((d: any) => d.idDerechoHab === Number(r.idDerechoHab));
    if (derechoObj) {
      this.form.get('derechoHabSearch')?.setValue(derechoObj, { emitEvent: false });
      this.filteredDerechos = [derechoObj];
    }

    const servIngObj = this.servicios?.find(
      (s: any) => s.idServicio === Number(r.idServicioIngreso),
    );
    if (servIngObj) {
      this.form.get('servicioIngresoSearch')?.setValue(servIngObj, { emitEvent: false });
      // si solo tienes un filteredServicios, al menos que tenga el seleccionado
      this.filteredServicios = [servIngObj];
    }

    const servEgrObj = this.servicios?.find(
      (s: any) => s.idServicio === Number(r.idServicioEgreso),
    );
    if (servEgrObj) {
      this.form.get('servicioEgresoSearch')?.setValue(servEgrObj, { emitEvent: false });
    }

    const procObj = this.procedencias?.find(
      (p: any) => p.idProcedencia === Number(r.idProcedencia),
    );
    if (procObj) {
      this.form.get('procedenciaSearch')?.setValue(procObj, { emitEvent: false });
      this.filteredProcedencias = [procObj];
    }

    const motivoObj = this.motivos?.find((m: any) => m.idMotivoEgreso === Number(r.idMotivoEgreso));
    if (motivoObj) {
      this.form.get('motivoEgresoSearch')?.setValue(motivoObj, { emitEvent: false });
      this.filteredMotivos = [motivoObj];
    }

    // 3) Municipios y Localidades: aquí sí hay que esperar al HTTP
    const idEdo = r.idEstado != null ? Number(r.idEstado) : null;
    const idMunicipio = r.idMunicipio != null ? Number(r.idMunicipio) : null; // <- es idMunicipio
    const idLoc = r.idLoc != null ? Number(r.idLoc) : null;

    let idMpo: number | null = null;

    if (idEdo) {
      try {
        const muniResp = await firstValueFrom(this.enfermedadService.getMunicipios(1, 500, idEdo));
        this.municipios = this.asArray<Municipio>(muniResp);
        this.filteredMunicipios = this.municipios;

        const muniObj = this.municipios.find((m) => Number(m.idMunicipio) === idMunicipio);

        if (muniObj) {
          // precarga municipio (search + hidden)
          this.form.patchValue({ idMunicipio: Number(muniObj.idMunicipio) }, { emitEvent: false });
          this.form.get('municipioSearch')?.setValue(muniObj, { emitEvent: false });
          this.filteredMunicipios = [muniObj];

          // 🔥 este es el que se usa para localidades según tu BD
          idMpo = muniObj.idMpo != null ? Number(muniObj.idMpo) : null;
        }
      } catch {
        this.municipios = [];
        this.filteredMunicipios = [];
      }
    }

    if (idEdo && idMpo) {
      try {
        const locResp = await firstValueFrom(
          this.enfermedadService.getLocalidades(1, 500, idEdo, idMpo),
        );

        this.localidades = this.asArray<any>(locResp);
        this.filteredLocalidades = this.localidades;

        let locObj = this.localidades.find((l: any) => Number(l.idLoc) === idLoc);

        if (!locObj && idLoc) {
          const locDirect = await firstValueFrom(this.enfermedadService.getLocalidadById(idLoc));

          if (locDirect) {
            this.localidades = [locDirect, ...this.localidades];
            this.filteredLocalidades = this.localidades;
            locObj = locDirect;
          }
        }

        if (locObj) {
          this.form.patchValue({ idLoc: Number(locObj.idLoc) }, { emitEvent: false });
          this.form.get('localidadSearch')?.setValue(locObj, { emitEvent: false });
          this.filteredLocalidades = [locObj];
        }
      } catch {
        this.localidades = [];
        this.filteredLocalidades = [];
      }
    }

    const clues = (r.CLUES ?? r.clues ?? '').toString().trim();

    if (idEdo && idMunicipio && idLoc) {
      try {
        const hospResp = await firstValueFrom(
          this.enfermedadService.getHospitalesPaged(1, 200, idEdo, idMunicipio, idLoc),
        );

        this.hospitales = this.asArray<any>(hospResp?.items ?? []);
        this.filteredHospitales = this.hospitales;

        if (clues) {
          const match = this.hospitales.find((h: any) => (h.clues ?? h.CLUES) === clues);

          this.form.patchValue({ CLUES: clues }, { emitEvent: false });

          this.form.get('hospitalSearch')?.setValue(match ?? { clues }, { emitEvent: false });
          this.filteredHospitales = match ? [match] : this.hospitales;
        }
      } catch {
        this.hospitales = [];
        this.filteredHospitales = [];
      }
    }

    if (r.idEnfermedad) {
      this.precargarEnfermedad(r.idEnfermedad);
    }
  }

  private precargarEnfermedad(codigo: string) {
    this.enfermedadLoading = true;

    this.enfermedadService
      .getPaged(1, 10, codigo, null)
      .pipe(finalize(() => (this.enfermedadLoading = false)))
      .subscribe((resp) => {
        const e = resp.items?.[0];
        if (!e) return;

        this.form.patchValue({
          enfermedadDisplay: e,
          idEnfermedad: e.codigoICD,
        });
        this.noEnfermedadResults = false;
        this.lastEnfermedadSearchTerm = '';

        this.filteredEnfermedades = [e];
      });
  }

  private toDateInput(value: any): string {
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  //mensajes de error personalizados para cada campo
  getFechaIngresoError(): string {
    const control = this.form.get('fechaIngreso');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'La fecha de ingreso es obligatoria';
    if (control.errors['futureDate']) return 'La fecha de ingreso no puede ser futura';
    if (control.errors['invalidLeapYear'])
      return 'El año no es bisiesto. Febrero tiene un máximo de 28 días';
    if (control.errors['invalidDate']) return 'La fecha de ingreso no es válida';
    return '';
  }

  getFechaEgresoError(): string {
    const control = this.form.get('fechaEgreso');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['futureDate']) return 'La fecha de egreso no puede ser futura';
    if (control.errors['egresoBeforeIngreso'])
      return 'La fecha de egreso debe ser posterior a la fecha de ingreso';
    if (control.errors['invalidLeapYear'])
      return 'El año no es bisiesto. Febrero tiene un máximo de 28 días';
    if (control.errors['invalidDate']) return 'La fecha de egreso no es válida';
    return '';
  }

  getEdadError(): string {
    const control = this.form.get('edad');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['min']) return 'La edad no puede ser negativa';
    if (control.errors['max']) return 'La edad no puede ser mayor a 150 años';
    if (control.errors['backend']) return this.getBackendError('edad');
    return '';
  }

  getEstadoError(): string {
    const control = this.form.get('idEstado');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona un estado';
    if (control.errors['backend']) return this.getBackendError('idEstado');
    return '';
  }

  getMunicipioError(): string {
    const control = this.form.get('idMunicipio');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona un municipio';
    if (control.errors['backend']) return this.getBackendError('idMunicipio');
    return '';
  }

  getLocalidadError(): string {
    const control = this.form.get('idLoc');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona una localidad';
    if (control.errors['backend']) return this.getBackendError('idLoc');
    return '';
  }

  getHospitalError(): string {
    const control = this.form.get('CLUES');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona un hospital';
    if (control.errors['backend']) return this.getBackendError('CLUES');
    return '';
  }

  getSexoError(): string {
    const control = this.form.get('idSexo');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona el sexo';
    if (control.errors['backend']) return this.getBackendError('idSexo');
    return '';
  }

  getDerechoHabError(): string {
    const control = this.form.get('idDerechoHab');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona el derecho de habitación';
    if (control.errors['backend']) return this.getBackendError('idDerechoHab');
    return '';
  }

  getServicioIngresoError(): string {
    const control = this.form.get('idServicioIngreso');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona el servicio de ingreso';
    if (control.errors['backend']) return this.getBackendError('idServicioIngreso');
    return '';
  }

  getServicioEgresoError(): string {
    const control = this.form.get('idServicioEgreso');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona el servicio de egreso';
    if (control.errors['backend']) return this.getBackendError('idServicioEgreso');
    return '';
  }

  getProcedenciaError(): string {
    const control = this.form.get('idProcedencia');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona la procedencia';
    if (control.errors['backend']) return this.getBackendError('idProcedencia');
    return '';
  }

  getMotivoEgresoError(): string {
    const control = this.form.get('idMotivoEgreso');
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Selecciona el motivo de egreso';
    if (control.errors['backend']) return this.getBackendError('idMotivo Egreso');
    return '';
  }

  getEnfermedadError(): string {
    const control = this.form.get('enfermedadDisplay');
    const controlId = this.form.get('idEnfermedad');
    if ((!control?.errors && !controlId?.errors) || (!control?.touched && !controlId?.touched))
      return '';
    if (control?.errors?.['required'] || controlId?.errors?.['required'])
      return 'Selecciona una enfermedad';
    if (control?.errors?.['backend']) return this.getBackendError('enfermedadDisplay');
    if (controlId?.errors?.['backend']) return this.getBackendError('idEnfermedad');
    return '';
  }

  //consultar si un campo tiene problemas del servidor
  hasBackendError(fieldName: string): boolean {
    return !!this.backendErrors[fieldName];
  }

  getBackendError(fieldName: string): string {
    return this.backendErrors[fieldName] || '';
  }

  //eliminar error del servidor al editar
  clearBackendError(fieldName: string): void {
    if (this.backendErrors[fieldName]) {
      delete this.backendErrors[fieldName];
      const control = this.form.get(fieldName);
      if (control?.errors?.['backend']) {
        const errors = { ...control.errors };
        delete errors['backend'];
        if (Object.keys(errors).length === 0) {
          control.setErrors(null);
        } else {
          control.setErrors(errors);
        }
      }
    }
  }

  //mover la vista al campo con problema
  private scrollToField(fieldName: string): void {
    try {
      //buscar el elemento del campo
      const fieldElement = document.querySelector(`[formControlName="${fieldName}"]`);
      if (fieldElement) {
        //buscar el contenedor del campo
        const formFieldElement = fieldElement.closest('mat-form-field');
        if (formFieldElement) {
          //desplazar suavemente hacia el campo
          formFieldElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });

          //activar el campo después de un momento
          setTimeout(() => {
            const inputElement = fieldElement as HTMLElement;
            if (inputElement && 'focus' in inputElement) {
              inputElement.focus();
            }
          }, 300);
        }
      }
    } catch (error) {
      console.warn('No se pudo hacer scroll al campo:', fieldName, error);
    }
  }

  //convertir errores del servidor en mensajes claros
  private parseErrorMessage(err: any, payload: any): string {
    console.error('Error completo:', err);

    //limpiar errores anteriores
    this.backendErrors = {};

    //obtener el mensaje de error del servidor
    const serverMsg = err?.error?.Message ?? err?.error?.message ?? err?.message ?? '';
    const statusCode = err?.status ?? 500;

    //identificar qué campo provocó el error
    this.identifyErrorField(serverMsg, payload);

    //respuestas según el tipo de error
    if (statusCode === 400) {
      return 'Los datos enviados no son válidos. Por favor revisa que todos los campos estén correctos.';
    }

    if (statusCode === 401 || statusCode === 403) {
      return 'No tienes permisos para realizar esta acción. Por favor contacta al administrador.';
    }

    if (statusCode === 404) {
      return 'No se encontró el recurso solicitado. Por favor intenta de nuevo.';
    }

    if (statusCode === 500) {
      //traducir mensajes comunes del servidor
      if (serverMsg.includes('cannot insert') || serverMsg.includes('No se pudo insertar')) {
        return 'No se pudo guardar el registro médico. Verifica que todos los datos sean correctos y que las fechas sean válidas.';
      }

      if (serverMsg.includes('duplicate') || serverMsg.includes('duplicado')) {
        return 'Este registro ya existe en el sistema. Por favor verifica la información.';
      }

      if (serverMsg.includes('foreign key') || serverMsg.includes('referencia')) {
        return 'Algunos de los datos seleccionados no son válidos. Por favor verifica Estado, Municipio, Localidad y otros campos de selección.';
      }

      if (serverMsg.includes('date') || serverMsg.includes('fecha')) {
        return 'Error en las fechas. Asegúrate de que la fecha de ingreso sea anterior a la fecha de egreso.';
      }

      if (serverMsg.includes('null') || serverMsg.includes('requerido')) {
        return 'Falta información obligatoria. Por favor completa la fecha de ingreso.';
      }

      return 'Hubo un error al guardar el registro. Por favor intenta de nuevo. Si el error persiste, contacta al soporte técnico.';
    }

    if (statusCode === 0 || !statusCode) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }

    //mensaje genérico cuando no hay caso específico
    return `Error al guardar (${statusCode}). Por favor intenta de nuevo o contacta al soporte técnico.`;
  }

  //detectar qué campo causó el problema
  private identifyErrorField(errorMsg: string, payload: any): void {
    const msg = errorMsg.toLowerCase();

    if (msg.includes('fecha') && msg.includes('ingreso')) {
      this.backendErrors['fechaIngreso'] = 'La fecha de ingreso no es válida';
      this.form.get('fechaIngreso')?.setErrors({ backend: true });
    } else if (msg.includes('fecha') && msg.includes('egreso')) {
      this.backendErrors['fechaEgreso'] =
        'La fecha de egreso no es válida o es anterior al ingreso';
      this.form.get('fechaEgreso')?.setErrors({ backend: true });
    } else if (msg.includes('fecha')) {
      this.backendErrors['fechaIngreso'] = 'Revisa las fechas ingresadas';
      this.backendErrors['fechaEgreso'] = 'Revisa las fechas ingresadas';
      this.form.get('fechaIngreso')?.setErrors({ backend: true });
      this.form.get('fechaEgreso')?.setErrors({ backend: true });
    }

    if (msg.includes('estado')) {
      this.backendErrors['idEstado'] = 'El estado seleccionado no es válido';
      this.form.get('idEstado')?.setErrors({ backend: true });
    }

    if (msg.includes('municipio')) {
      this.backendErrors['idMunicipio'] = 'El municipio seleccionado no es válido';
      this.form.get('idMunicipio')?.setErrors({ backend: true });
    }

    if (msg.includes('localidad')) {
      this.backendErrors['idLoc'] = 'La localidad seleccionada no es válida';
      this.form.get('idLoc')?.setErrors({ backend: true });
    }

    if (msg.includes('edad')) {
      this.backendErrors['edad'] = 'La edad ingresada no es válida';
      this.form.get('edad')?.setErrors({ backend: true });
    }

    if (msg.includes('sexo')) {
      this.backendErrors['idSexo'] = 'El sexo seleccionado no es válido';
      this.form.get('idSexo')?.setErrors({ backend: true });
    }

    if (msg.includes('servicio') && msg.includes('ingreso')) {
      this.backendErrors['idServicioIngreso'] = 'El servicio de ingreso no es válido';
      this.form.get('idServicioIngreso')?.setErrors({ backend: true });
    }

    if (msg.includes('servicio') && msg.includes('egreso')) {
      this.backendErrors['idServicioEgreso'] = 'El servicio de egreso no es válido';
      this.form.get('idServicioEgreso')?.setErrors({ backend: true });
    }

    if (msg.includes('derecho') || msg.includes('derechohab')) {
      this.backendErrors['idDerechoHab'] = 'El derecho de habitación no es válido';
      this.form.get('idDerechoHab')?.setErrors({ backend: true });
    }

    if (msg.includes('enfermedad')) {
      this.backendErrors['enfermedadDisplay'] = 'La enfermedad seleccionada no es válida';
      this.form.get('enfermedadDisplay')?.setErrors({ backend: true });
    }

    if (msg.includes('procedencia')) {
      this.backendErrors['idProcedencia'] = 'La procedencia seleccionada no es válida';
      this.form.get('idProcedencia')?.setErrors({ backend: true });
    }

    if (msg.includes('motivo')) {
      this.backendErrors['idMotivoEgreso'] = 'El motivo de egreso no es válido';
      this.form.get('idMotivoEgreso')?.setErrors({ backend: true });
    }

    //marcar campos para mostrar errores visualmente
    Object.keys(this.backendErrors).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  //fecha máxima que se puede seleccionar
  get maxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /** Callback cuando el usuario sale de un campo de fecha inicio */
  onFechaIngresoBlur(): void {
    if (this.fechaIngresoStr) {
      this.form.get('fechaIngreso')?.setValue(this.fechaIngresoStr, { emitEvent: true });
      this.form.get('fechaIngreso')?.markAsTouched();
      this.clearBackendError('fechaIngreso');
    } else {
      this.form.get('fechaIngreso')?.setValue('', { emitEvent: true });
    }
    // Re-validar fechaEgreso por si cambia la relación
    this.form.get('fechaEgreso')?.updateValueAndValidity();
  }

  /** Callback cuando el usuario sale de un campo de fecha egreso */
  onFechaEgresoBlur(): void {
    if (this.fechaEgresoStr) {
      this.form.get('fechaEgreso')?.setValue(this.fechaEgresoStr, { emitEvent: true });
      this.form.get('fechaEgreso')?.markAsTouched();
      this.clearBackendError('fechaEgreso');
    } else {
      this.form.get('fechaEgreso')?.setValue('', { emitEvent: true });
    }
  }

  //funciones auxiliares para la plantilla
  saving() {
    return this.isSaving;
  }

  error() {
    return this.errorMsg;
  }

  cancel() {
    this.dialogRef.close();
  }

  private unwrapArray<T>(r: any): T[] {
    if (Array.isArray(r)) return r;
    return (r?.data ?? r?.items ?? r?.results ?? r?.value ?? []) as T[];
  }

  private asArray<T>(r: any): T[] {
    if (Array.isArray(r)) return r;
    return (r?.data ?? r?.items ?? r?.results ?? r?.value ?? []) as T[];
  }

  private async loadCatalogs(): Promise<void> {
    const res = await firstValueFrom(
      forkJoin({
        estados: this.enfermedadService.getEstados().pipe(catchError(() => of([]))),
        servicios: this.enfermedadService.getServiciosMedicos().pipe(catchError(() => of([]))),
        procedencias: this.enfermedadService.getProcedencias().pipe(catchError(() => of([]))),
        derechos: this.enfermedadService.getDerechoHabitacion().pipe(catchError(() => of([]))),
        motivos: this.enfermedadService.getMotivosEgreso().pipe(catchError(() => of([]))),
      }),
    );

    // MISMAS variables que ya tienes
    this.estados = this.asArray<Estado>(res.estados);
    this.filteredEstados = this.estados;

    this.servicios = this.asArray<Servicio>(res.servicios);
    this.filteredServicios = this.servicios;

    this.procedencias = this.asArray<any>(res.procedencias);
    this.filteredProcedencias = this.procedencias;

    this.derechos = this.asArray<DerechoHabitacion>(res.derechos);
    this.filteredDerechos = this.derechos;

    this.motivos = this.asArray<MotivoEgreso>(res.motivos);
    this.filteredMotivos = this.motivos;
  }

  private onEstadoChanged(estadoId: any) {
    this.clearBackendError('idEstado');

    const id = estadoId == null ? null : Number(estadoId);

    if (id) {
      this.enfermedadService.getMunicipios(1, 500, id).subscribe({
        next: (r) => {
          this.municipios = this.asArray<Municipio>(r);
          this.filteredMunicipios = this.municipios;
        },
        error: () => {
          this.municipios = [];
          this.filteredMunicipios = [];
        },
      });
    } else {
      this.municipios = [];
      this.filteredMunicipios = [];
      this.localidades = [];
      this.filteredLocalidades = [];
    }
  }

  private onMunicipioChanged(municipioId: any) {
    this.form.patchValue({ idLoc: null, localidadSearch: '' }, { emitEvent: false });
    this.localidades = [];
    this.filteredLocalidades = [];

    const idMunicipio = municipioId == null ? null : Number(municipioId);
    const idEdo = Number(this.form.get('idEstado')?.value);

    const muniObj = this.municipios?.find((m: any) => Number(m.idMunicipio) === idMunicipio);
    const idMpo = muniObj?.idMpo != null ? Number(muniObj.idMpo) : null;
    console.log('onMunicipioChanged', { municipioId, idMunicipio, idEdo, muniObj, idMpo });

    if (idEdo && idMpo) {
      this.enfermedadService.getLocalidades(1, 500, idEdo, idMpo).subscribe({
        next: (r) => {
          this.localidades = this.asArray<any>(r);
          this.filteredLocalidades = this.localidades;
        },
        error: () => {
          this.localidades = [];
          this.filteredLocalidades = [];
        },
      });
    }
    console.log('localidadSearch emit:', this.form.get('localidadSearch')?.value);
    console.log('localidades len:', this.localidades?.length);
  }

  blockNonNumeric(evt: KeyboardEvent) {
    const allowed = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowed.includes(evt.key)) return;
    if (!/\d/.test(evt.key)) evt.preventDefault();
  }

  //configurar filtros de búsqueda para cada campo
  private initFilteredDropdowns() {
    // buscar estados
    this.form
      .get('estadoSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.nombreEstado ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filterEstados(searchTerm);
      });

    // buscar municipios
    this.form
      .get('municipioSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.nombreMunicipio ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filterMunicipios(searchTerm);
      });

    // buscar localidades
    this.form
      .get('localidadSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) =>
          typeof v === 'string'
            ? v.trim()
            : (v?.nombreLocalidad ?? v?.NombreLocalidad ?? v?.nombre ?? v?.label ?? ''),
        ),

        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        console.log('localidadSearch emit:', this.form.get('localidadSearch')?.value);
        console.log('localidades len:', this.localidades?.length);
        this.filterLocalidades(searchTerm);
      });

    // buscar derechos de habitación
    this.form
      .get('derechoHabSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.descripcion ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filterDerechos(searchTerm);
      });

    // buscar servicios de ingreso
    this.form
      .get('servicioIngresoSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.nombreServicio ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filteredServicios = this.filterArray(this.servicios, searchTerm, 'nombreServicio');
      });

    // buscar servicios de egreso
    this.form
      .get('servicioEgresoSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.nombreServicio ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filteredServicios = this.filterArray(this.servicios, searchTerm, 'nombreServicio');
      });

    // buscar procedencias
    this.form
      .get('procedenciaSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) =>
          typeof v === 'string' ? v : (v?.descripcion ?? v?.nombre ?? v?.label ?? ''),
        ),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filterProcedencias(searchTerm);
      });

    // buscar motivos de egreso
    this.form
      .get('motivoEgresoSearch')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((v: any) => (typeof v === 'string' ? v : (v?.descripcion ?? ''))),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.filterMotivos(searchTerm);
      });
  }

  private toText(v: any, key: string): string {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') return String(v[key] ?? '');
    return '';
  }

  //funciones para filtrar cada lista
  filterEstados(searchTerm: any) {
    const text = this.toText(searchTerm, 'nombreEstado').trim().toLowerCase();
    this.filteredEstados = !text
      ? this.estados
      : this.estados.filter((e) => e.nombreEstado.toLowerCase().includes(text));
  }

  filterMunicipios(searchTerm: any) {
    const text = this.toText(searchTerm, 'nombreMunicipio').trim().toLowerCase();
    this.filteredMunicipios = !text
      ? this.municipios
      : this.municipios.filter((m) => m.nombreMunicipio.toLowerCase().includes(text));
  }

  private filterLocalidades(searchTerm: string) {
    const base = this.localidades || [];

    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.filteredLocalidades = base;
      return;
    }

    this.filteredLocalidades = base.filter((l: any) =>
      String(l.nombreLocalidad || l.NombreLocalidad || l.nombre || l.label || '')
        .toLowerCase()
        .includes(term),
    );
  }

  private filterDerechos(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredDerechos = this.derechos;
      return;
    }
    const term = searchTerm.toLowerCase();
    this.filteredDerechos = this.derechos.filter((d) =>
      d.descripcion?.toLowerCase().includes(term),
    );
  }

  private filterProcedencias(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredProcedencias = this.procedencias;
      return;
    }
    const term = searchTerm.toLowerCase();
    this.filteredProcedencias = this.procedencias.filter((p) =>
      (p.descripcion || p.nombre || p.label || '').toLowerCase().includes(term),
    );
  }

  private filterMotivos(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredMotivos = this.motivos;
      return;
    }
    const term = searchTerm.toLowerCase();
    this.filteredMotivos = this.motivos.filter((m) => m.descripcion?.toLowerCase().includes(term));
  }

  //función auxiliar para filtrar listas
  private filterArray<T>(arr: T[] | null | undefined, searchTerm: any, key: keyof T): T[] {
    const list = Array.isArray(arr) ? arr : [];
    const term = (typeof searchTerm === 'string' ? searchTerm : '').toLowerCase().trim();
    if (!term) return list;

    return list.filter((x) =>
      String(x?.[key] ?? '')
        .toLowerCase()
        .includes(term),
    );
  }

  //cómo mostrar cada opción seleccionada
  displayEstado = (item: any): string => {
    if (!item) return '';
    return typeof item === 'object' ? item.nombreEstado || '' : '';
  };

  displayMunicipio = (item: any): string => {
    if (!item) return '';
    return typeof item === 'object' ? item.nombreMunicipio || '' : '';
  };

  displayLocalidad = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'object') {
      return item.nombreLocalidad || item.nombre || item.label || '';
    }
    return '';
  };

  displayHospital = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'object') {
      const clues = item.clues || item.CLUES || '';
      const unidad = item.nombreUnidad || item.NombreUnidad || '';
      const inst = item.nombreInstitucion || item.NombreInstitucion || '';
      return `${clues}${unidad ? ' — ' + unidad : ''}${inst ? ' (' + inst + ')' : ''}`.trim();
    }
    return '';
  };

  displayDerechoHab = (item: any): string => {
    if (!item) return '';
    return typeof item === 'object' ? item.descripcion || '' : '';
  };

  displayServicio = (item: any): string => {
    if (!item) return '';
    return typeof item === 'object' ? item.nombreServicio || '' : '';
  };

  displayProcedencia = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'object') {
      return item.descripcion || item.nombre || item.label || '';
    }
    return '';
  };

  displayMotivo = (item: any): string => {
    if (!item) return '';
    return typeof item === 'object' ? item.descripcion || '' : '';
  };

  //guardar la opción elegida en cada campo
  onEstadoSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({
        idEstado: selected.idEstado,
        municipioSearch: '',
        idMunicipio: null,
        localidadSearch: '',
        idLoc: null,
        hospitalSearch: '',
        CLUES: '',
      });
      this.filteredLocalidades = [];
      this.localidades = [];
      this.filteredHospitales = [];
      this.hospitales = [];
    }
  }

  onMunicipioSelected(event: any) {
    const selected = event.option.value;

    if (selected && typeof selected === 'object') {
      // guarda el municipio y limpia localidad
      this.form.patchValue(
        {
          idMunicipio: Number(selected.idMunicipio),
          municipioSearch: selected,
          localidadSearch: '',
          idLoc: null,
          hospitalSearch: '',
          CLUES: '',
        },
        { emitEvent: false },
      );

      this.filteredLocalidades = [];
      this.localidades = [];
      this.filteredHospitales = [];
      this.hospitales = [];

      const idEdo = Number(this.form.get('idEstado')?.value);
      const idMunicipio = Number(selected.idMunicipio);

      if (!idEdo || !idMunicipio) return;

      this.enfermedadService.getLocalidades(1, 500, idEdo, idMunicipio).subscribe({
        next: (r) => {
          this.localidades = this.asArray<any>(r);
          this.filteredLocalidades = this.localidades;
          console.log('getLocalidades OK, len:', this.localidades.length);
        },
        error: (err) => {
          console.log('getLocalidades ERROR', err);
          this.localidades = [];
          this.filteredLocalidades = [];
        },
      });
    }
  }

  onLocalidadSelected(event: any) {
    const selected = event.option.value;

    if (selected && typeof selected === 'object') {
      // guarda localidad y limpia hospital
      this.form.patchValue(
        {
          idLoc: Number(selected.idLoc),
          localidadSearch: selected,

          hospitalSearch: '',
          CLUES: '',
        },
        { emitEvent: false },
      );

      this.filteredHospitales = [];
      this.hospitales = [];

      const idEdo = Number(this.form.get('idEstado')?.value);
      const idMunicipio = Number(this.form.get('idMunicipio')?.value);
      const idLoc = Number(selected.idLoc);

      if (!idEdo || !idMunicipio || !idLoc) return;

      // carga hospitales por ubicación (primera página, sin search)
      this.enfermedadService.getHospitalesPaged(1, 100, idEdo, idMunicipio, idLoc).subscribe({
        next: (res) => {
          // res.items viene del PagedHospitalesDto
          this.hospitales = (res?.items ?? []) as any[];
          this.filteredHospitales = this.hospitales;
          console.log('getHospitalesPaged OK, len:', this.hospitales.length);
        },
        error: (err) => {
          console.log('getHospitalesPaged ERROR', err);
          this.hospitales = [];
          this.filteredHospitales = [];
        },
      });
    }
  }

  onHospitalSelected(event: any) {
    const selected = event.option.value;

    if (selected && typeof selected === 'object') {
      this.form.patchValue(
        {
          CLUES: selected.clues,
          hospitalSearch: selected,
        },
        { emitEvent: false },
      );
    }
  }

  onHospitalSearch(term: string) {
    const idEdo = Number(this.form.get('idEstado')?.value);
    const idMunicipio = Number(this.form.get('idMunicipio')?.value);
    const idLoc = Number(this.form.get('idLoc')?.value);

    // LOG 1: qué llegó y qué IDs hay en ese instante
    console.log('[Hosp] onHospitalSearch()', {
      term,
      termType: typeof term,
      idEdo,
      idMunicipio,
      idLoc,
    });

    const q = (term ?? '').toString().trim();

    // LOG 2: cómo quedó el search
    console.log('[Hosp] q final:', JSON.stringify(q));

    // si no hay ubicación, no busques nada
    if (!idEdo || !idMunicipio || !idLoc) {
      console.log('[Hosp] ABORT (faltan ids)', { idEdo, idMunicipio, idLoc });
      this.hospitales = [];
      this.filteredHospitales = [];
      this.noHospEnLoc = false;
      return;
    }

    this.hospitalLoading = true;

    // LOG 3: request por localidad (params reales)
    console.log('[Hosp] REQ localidad', { idEdo, idMunicipio, idLoc, q });

    this.enfermedadService.getHospitalesPaged(1, 50, idEdo, idMunicipio, idLoc, q).subscribe({
      next: (res) => {
        const items = res?.items ?? [];
        console.log('[Hosp] RESP localidad', { len: items.length, idEdo, idMunicipio, idLoc, q });

        if (items.length > 0) {
          this.hospitales = this.asArray<any>(items);
          this.filteredHospitales = this.hospitales;
          this.noHospEnLoc = false;
          return;
        }

        // LOG 4: fallback sin localidad
        console.log('[Hosp] REQ fallback municipio', { idEdo, idMunicipio, q });

        this.enfermedadService
          .getHospitalesPaged(1, 50, idEdo, idMunicipio, undefined, q)
          .subscribe({
            next: (res2) => {
              const items2 = res2?.items ?? [];
              console.log('[Hosp] RESP fallback', { len: items2.length, idEdo, idMunicipio, q });

              this.hospitales = this.asArray<any>(items2);
              this.filteredHospitales = this.hospitales;
              this.noHospEnLoc = true;
            },
            error: (err2) => {
              console.log('[Hosp] ERROR fallback', err2);
              this.hospitales = [];
              this.filteredHospitales = [];
              this.noHospEnLoc = false;
            },
            complete: () => (this.hospitalLoading = false),
          });
      },
      error: (err) => {
        console.log('[Hosp] ERROR localidad', err);
        this.hospitales = [];
        this.filteredHospitales = [];
        this.noHospEnLoc = false;
        this.hospitalLoading = false;
      },
    });
  }

  onDerechoHabSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({ idDerechoHab: selected.idDerechoHab });
    }
  }

  onServicioIngresoSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({ idServicioIngreso: selected.idServicio });
    }
  }

  onServicioEgresoSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({ idServicioEgreso: selected.idServicio });
    }
  }

  onProcedenciaSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({ idProcedencia: selected.idProcedencia || selected.id });
    }
  }

  onMotivoEgresoSelected(event: any) {
    const selected = event.option.value;
    if (selected && typeof selected === 'object') {
      this.form.patchValue({ idMotivoEgreso: selected.idMotivoEgreso });
    }
  }

  //configuración del campo de enfermedades
  onEnfermedadFocus() {
    if ((this.filteredEnfermedades || []).length === 0) {
      this.searchEnfermedad('');
    }
  }

  private initEnfermedadAutocomplete() {
    this.form
      .get('enfermedadDisplay')
      ?.valueChanges.pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q: any) => {
          if (this.suppressEnfermedadSearch) {
            this.suppressEnfermedadSearch = false;
            return of(this.filteredEnfermedades || []);
          }

          if (q && typeof q === 'object') {
            this.noEnfermedadResults = false;
            this.lastEnfermedadSearchTerm = '';
            return of(this.filteredEnfermedades || []);
          }
          const term = String(q || '').trim();
          this.lastEnfermedadSearchTerm = term;
          if (!term) {
            this.filteredEnfermedades = [];
            this.enfermedadHasNext = false;
            this.enfermedadPage = 1;
            return of([]);
          }
          this.enfermedadLoading = true;
          this.enfermedadPage = 1;
          return this.enfermedadService.getPaged(1, 20, term).pipe(
            map((r: any) => r || {}),
            catchError((err) => {
              console.error('Error buscando enfermedades', err);
              return of({ items: [] });
            }),
            finalize(() => (this.enfermedadLoading = false)),
          );
        }),
      )
      .subscribe((resp: any) => {
        const items = Array.isArray(resp) ? resp : Array.isArray(resp?.items) ? resp.items : [];
        const normalized = this.normalizeEnfermedades(items);
        this.filteredEnfermedades = normalized;
        this.enfermedadPage = resp?.pageNumber ?? 1;
        this.enfermedadHasNext = !!resp?.hasNext || this.enfermedadPage < (resp?.totalPages ?? 1);
        this.noEnfermedadResults =
          (this.filteredEnfermedades || []).length === 0 &&
          this.lastEnfermedadSearchTerm !== null &&
          String(this.lastEnfermedadSearchTerm).trim() !== '';
      });
  }

  onLoadMoreOption(ev: any) {
    if (!this.enfermedadHasNext || this.enfermedadLoadingMore) return;
    const next = (this.enfermedadPage || 1) + 1;
    this.enfermedadLoadingMore = true;
    this.enfermedadService
      .getPaged(next, 20, this.lastEnfermedadSearchTerm || '')
      .pipe(
        map((r: any) => r || {}),
        catchError(() => of({ items: [] })),
        finalize(() => (this.enfermedadLoadingMore = false)),
      )
      .subscribe((resp: any) => {
        const items = Array.isArray(resp) ? resp : Array.isArray(resp?.items) ? resp.items : [];
        this.filteredEnfermedades = (this.filteredEnfermedades || []).concat(items || []);
        this.enfermedadPage = resp?.pageNumber ?? next;
        this.enfermedadHasNext =
          !!resp?.hasNext || this.enfermedadPage < (resp?.totalPages ?? this.enfermedadPage);
      });
  }

  displayEnfermedad(item: any) {
    if (!item) return '';
    if (typeof item === 'string') return item;
    // mostrar en formato "CODIGO - NOMBRE" cuando sea posible
    const codigo = item.codigoICD || item.idEnfermedad || item.id || '';
    const nombre = item.nombreEnfermedad || item.nombre || '';
    if (codigo && nombre) return `${codigo} - ${nombre}`;
    if (nombre) return nombre;
    return codigo || '';
  }

  onEnfermedadSelected(ev: any) {
    const val = ev?.option?.value;
    if (!val) return;
    console.log('Enfermedad selected object:', val);
    //obtener el código de la enfermedad
    let codigo = val.codigoICD ?? val.idEnfermedad ?? val.id ?? null;
    if (!codigo) {
      const nombre = val.nombreEnfermedad ?? val.nombre ?? '';
      const m = String(nombre).match(/([A-Z]\d{2,4})/i);
      if (m && m[1]) {
        codigo = m[1].toUpperCase();
        console.info('Extracted codigoICD from nombreEnfermedad:', codigo);
      }
    }
    this.suppressEnfermedadSearch = true;
    this.form.patchValue({ idEnfermedad: codigo ?? '', enfermedadDisplay: val });
    this.filteredEnfermedades = [val];
  }

  selectEnfermedad(val: any) {
    if (!val) return;
    console.log('Enfermedad selected via click:', val);
    let codigo = val.codigoICD ?? val.idEnfermedad ?? val.id ?? null;
    if (!codigo) {
      const nombre = val.nombreEnfermedad ?? val.nombre ?? '';
      const m = String(nombre).match(/([A-Z]\d{2,4})/i);
      if (m && m[1]) {
        codigo = m[1].toUpperCase();
        console.info('Extracted codigoICD from nombreEnfermedad (click):', codigo);
      }
    }
    this.suppressEnfermedadSearch = true;
    this.form.patchValue({ idEnfermedad: codigo ?? '', enfermedadDisplay: val });
    this.filteredEnfermedades = [val];
  }

  private searchEnfermedad(term: string) {
    this.lastEnfermedadSearchTerm = term;
    this.enfermedadLoading = true;
    this.enfermedadService
      .getPaged(1, 20, term)
      .pipe(
        map((r: any) => r || {}),
        catchError(() => of({ items: [] })),
        finalize(() => (this.enfermedadLoading = false)),
      )
      .subscribe((resp: any) => {
        const items = Array.isArray(resp) ? resp : Array.isArray(resp?.items) ? resp.items : [];
        const normalized = this.normalizeEnfermedades(items);
        this.filteredEnfermedades = normalized || [];
        this.noEnfermedadResults =
          (this.filteredEnfermedades || []).length === 0 &&
          term !== null &&
          String(term).trim() !== '';
        //si no hay resultados buscar en el catálogo completo
        if (
          (this.filteredEnfermedades || []).length === 0 &&
          (!term || String(term).trim() === '')
        ) {
          this.enfermedadService
            .getAll()
            .pipe(catchError(() => of([])))
            .subscribe((all: any[]) => {
              const alt = this.normalizeEnfermedades(all || []);
              this.filteredEnfermedades = alt || [];
            });
        }
      });
  }

  private normalizeEnfermedades(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    return items.map((e: any) => {
      let codigo = e.codigoICD ?? e.codigo ?? e.codigoIcd ?? null;
      const nombre = e.nombreEnfermedad ?? e.nombre ?? e.descripcion ?? '';
      if (!codigo && nombre) {
        const m = String(nombre).match(/([A-Z]\d{2,4})/i);
        if (m && m[1]) codigo = m[1].toUpperCase();
      }
      return {
        idEnfermedad: e.idEnfermedad ?? e.id ?? e.idRegistro ?? null,
        nombreEnfermedad: nombre,
        codigoICD: codigo ?? null,
        ...e,
      };
    });
  }

  //construir y enviar los datos
  save() {
    this.errorMsg = null;

    // mostrar errores si hay campos inválidos
    if (this.form.invalid) {
      let firstErrorField: string | null = null;

      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        control?.markAsTouched();
        if (!firstErrorField && control?.invalid) firstErrorField = key;
      });

      this.errorMsg =
        'Por favor, completa todos los campos obligatorios correctamente antes de guardar.';

      if (firstErrorField) {
        setTimeout(() => this.scrollToField(firstErrorField!), 100);
      }
      return;
    }

    this.isSaving = true;

    const raw = this.form.value;

    // preparar datos para enviar al servidor
    const payload: any = {};
    if (raw.fechaIngreso) payload.fechaIngreso = new Date(raw.fechaIngreso).toISOString();
    if (raw.fechaEgreso) payload.fechaEgreso = new Date(raw.fechaEgreso).toISOString();
    if (raw.idEstado != null && raw.idEstado !== '') payload.idEstado = Number(raw.idEstado);
    if (raw.idMunicipio != null && raw.idMunicipio !== '')
      payload.idMunicipio = Number(raw.idMunicipio);
    if (raw.idLoc != null && raw.idLoc !== '') payload.idLoc = Number(raw.idLoc);
    if (raw.edad != null && raw.edad !== '') payload.edad = Number(raw.edad);
    if (raw.idSexo != null && raw.idSexo !== '') payload.idSexo = Number(raw.idSexo);
    if (raw.idDerechoHab != null && raw.idDerechoHab !== '')
      payload.idDerechoHab = Number(raw.idDerechoHab);
    if (raw.idServicioIngreso != null && raw.idServicioIngreso !== '')
      payload.idServicioIngreso = Number(raw.idServicioIngreso);
    if (raw.idServicioEgreso != null && raw.idServicioEgreso !== '')
      payload.idServicioEgreso = Number(raw.idServicioEgreso);
    if (raw.idProcedencia != null && raw.idProcedencia !== '')
      payload.idProcedencia = Number(raw.idProcedencia);
    if (raw.idMotivoEgreso != null && raw.idMotivoEgreso !== '')
      payload.idMotivoEgreso = Number(raw.idMotivoEgreso);
    if (raw.idEnfermedad != null && raw.idEnfermedad !== '')
      payload.idEnfermedad = raw.idEnfermedad;
    if (raw.CLUES != null && String(raw.CLUES).trim() !== '') {
      payload.CLUES = String(raw.CLUES).trim();
    }

    const isEdit = this.data?.mode === 'edit';
    const idRegistro = this.data?.registro?.idRegistro ?? null;

    if (isEdit && !idRegistro) {
      this.isSaving = false;
      this.errorMsg = 'No se encontró el ID del registro a editar.';
      return;
    }

    console.log(isEdit ? 'Update PUT payload' : 'Register POST payload', payload);

    // verificar que los datos sean válidos
    const validationError = this.validatePayload(payload);
    if (validationError) {
      this.isSaving = false;
      this.errorMsg = validationError;
      console.warn('Payload validation failed:', validationError, payload);
      return;
    }

    // Función ÚNICA para enviar (POST o PUT según modo)
    const sendPayload = (finalPayload: any) => {
      const wrapped = { registro: finalPayload };
      console.log('Sending payload to backend', wrapped);

      const req$ = isEdit
        ? this.registroSvc.updateRegistro(idRegistro, finalPayload)
        : this.registroSvc.registerRegistroMedico(finalPayload);

      req$.subscribe({
        next: (res) => {
          this.isSaving = false;
          if (isEdit) this.dialogRef.close({ ok: true, id: idRegistro, ...res });
          else this.dialogRef.close(res);
        },
        error: (err) => {
          console.error(isEdit ? 'Update error' : 'Register error', err);
          this.isSaving = false;
          this.errorMsg = this.parseErrorMessage(err, finalPayload);

          setTimeout(() => {
            const firstBackendErrorField = Object.keys(this.backendErrors)[0];
            if (firstBackendErrorField) this.scrollToField(firstBackendErrorField);
          }, 100);
        },
      });
    };

    const enf = String(payload.idEnfermedad || '');
    const numeric = enf && !isNaN(Number(enf));
    const code = String(payload.idEnfermedad || '').trim();

    if (numeric) {
      this.enfermedadService.getById(enf).subscribe({
        next: (enfObj) => {
          if (enfObj?.codigoICD) payload.idEnfermedad = enfObj.codigoICD;
          sendPayload(payload);
        },
        error: () => {
          this.enfermedadService
            .getPaged(1, 10, code)
            .pipe(
              map((r: any) => r || {}),
              catchError(() => of({ items: [] })),
            )
            .subscribe((resp: any) => {
              const items = Array.isArray(resp)
                ? resp
                : Array.isArray(resp?.items)
                  ? resp.items
                  : [];
              const normalized = this.normalizeEnfermedades(items || []);
              if ((normalized || []).length > 0) {
                payload.idEnfermedad =
                  normalized[0].codigoICD ?? normalized[0].idEnfermedad ?? code;
                sendPayload(payload);
              } else {
                this.isSaving = false;
                this.errorMsg = `Enfermedad '${code}' no encontrada en el catálogo`;
              }
            });
        },
      });
    } else if (code) {
      this.enfermedadService
        .getPaged(1, 10, code)
        .pipe(
          map((r: any) => r || {}),
          catchError(() => of({ items: [] })),
        )
        .subscribe((resp: any) => {
          const items = Array.isArray(resp) ? resp : Array.isArray(resp?.items) ? resp.items : [];
          const normalized = this.normalizeEnfermedades(items || []);
          const exact = (normalized || []).find(
            (n: any) =>
              (n.codigoICD && String(n.codigoICD).toUpperCase() === String(code).toUpperCase()) ||
              (n.idEnfermedad &&
                String(n.idEnfermedad).toUpperCase() === String(code).toUpperCase()),
          );

          if (exact) {
            payload.idEnfermedad = exact.codigoICD ?? exact.idEnfermedad ?? code;
            sendPayload(payload);
            return;
          }

          this.enfermedadService.getById(code).subscribe({
            next: (enfObj) => {
              payload.idEnfermedad = enfObj?.codigoICD ?? enfObj?.idEnfermedad ?? code;
              sendPayload(payload);
            },
            error: () => {
              this.isSaving = false;
              this.errorMsg = `Enfermedad '${code}' no encontrada en el catálogo`;
            },
          });
        });
    } else {
      sendPayload(payload);
    }
  }

  // ========== MÉTODOS DE VALIDACIÓN DE FECHAS ==========

  /** Valida si un año es bisiesto */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /** Retorna el número máximo de días para un mes y año dados */
  private getMaxDaysInMonth(month: number, year: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month - 1] || 31;
  }
}

//exportar con nombre compatible
export { AddRegistroMedico as AddRegistroMedicoModal };
