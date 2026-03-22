import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlarmService } from '../../core/components/Alarms';

/**
 * Componente reutilizable de entrada de fecha con formato DD/MM/AAAA + selector de calendario.
 *
 * Uso:
 * ```html
 * <app-date-input
 *   label="Fecha Inicio"
 *   [(value)]="fechaInicio"
 *   [showRequired]="true"
 *   [errorMessage]="showError ? 'Este campo es requerido' : ''"
 *   [minCalendarDate]="''"
 *   [maxCalendarDate]="maxDate"
 *   (dateBlur)="onDateBlur()">
 * </app-date-input>
 * ```
 */
@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.css'],
})
export class DateInputComponent implements OnChanges {
  /** Etiqueta que se muestra arriba del input */
  @Input() label = 'Fecha';

  /** Mostrar asterisco de campo requerido */
  @Input() showRequired = false;

  /** Valor de fecha en formato YYYY-MM-DD (two-way binding con valueChange) */
  @Input() value = '';

  /** Mensaje de error para mostrar debajo del input */
  @Input() errorMessage = '';

  /** Fecha mínima para el calendario nativo (YYYY-MM-DD) */
  @Input() minCalendarDate = '';

  /** Fecha máxima para el calendario nativo (YYYY-MM-DD) */
  @Input() maxCalendarDate = '';

  /** Emite el valor de fecha (YYYY-MM-DD) cada vez que cambia. Vacío si la fecha está incompleta. */
  @Output() valueChange = new EventEmitter<string>();

  /** Emite cuando el usuario sale de cualquier campo de la fecha (blur). Útil para validaciones cruzadas. */
  @Output() dateBlur = new EventEmitter<string>();

  @ViewChild('calendarInput', { static: false }) calendarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dayInput', { static: false }) dayInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('monthInput', { static: false }) monthInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('yearInput', { static: false }) yearInputRef!: ElementRef<HTMLInputElement>;

  day: number | null = null;
  month: number | null = null;
  year: number | null = null;

  private alarms = inject(AlarmService);

  // ========== BLOQUEO DE CARACTERES NO NUMÉRICOS ==========

  /** Permite solo dígitos y teclas de navegación (Backspace, Tab, flechas, etc.) */
  onlyDigits(event: KeyboardEvent): void {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    // Permitir Ctrl+A / Ctrl+C / Ctrl+V / Ctrl+X
    if ((event.ctrlKey || event.metaKey) && ['a','c','v','x'].includes(event.key.toLowerCase())) {
      return;
    }
    if (allowed.includes(event.key)) {
      return;
    }
    // Bloquear todo lo que no sea dígito
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  /** Filtra caracteres no numéricos del texto pegado */
  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pasted)) {
      event.preventDefault();
      // Pegar solo los dígitos del texto
      const digitsOnly = pasted.replace(/\D/g, '');
      if (digitsOnly) {
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const current = input.value;
        input.value = current.slice(0, start) + digitsOnly + current.slice(end);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  // ========== LIFECYCLE ==========

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const newVal = changes['value'].currentValue as string;
      this.parseValue(newVal);
      // Formatear inputs visualmente después de que Angular actualice el DOM
      if (!changes['value'].firstChange) {
        this.formatInputs();
      }
    }
  }

  // ========== PARSING / BUILDING ==========

  /** Parsea un string YYYY-MM-DD y asigna day, month, year */
  private parseValue(val: string): void {
    if (!val) {
      this.day = null;
      this.month = null;
      this.year = null;
      return;
    }
    const parts = val.split('-');
    if (parts.length === 3) {
      this.year = parseInt(parts[0], 10) || null;
      this.month = parseInt(parts[1], 10) || null;
      this.day = parseInt(parts[2], 10) || null;
    }
  }

  /** Construye el string YYYY-MM-DD y lo emite */
  private buildAndEmit(): void {
    if (this.day !== null && this.month !== null && this.year !== null) {
      const y = this.year.toString().padStart(4, '0');
      const m = this.month.toString().padStart(2, '0');
      const d = this.day.toString().padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      if (dateStr !== this.value) {
        this.value = dateStr;
        this.valueChange.emit(dateStr);
      }
    } else {
      if (this.value !== '') {
        this.value = '';
        this.valueChange.emit('');
      }
    }
  }

  /** Formatea los inputs con ceros a la izquierda (para actualizaciones programáticas) */
  private formatInputs(): void {
    setTimeout(() => {
      if (this.day !== null && this.dayInputRef?.nativeElement) {
        this.dayInputRef.nativeElement.value = this.day.toString().padStart(2, '0');
      }
      if (this.month !== null && this.monthInputRef?.nativeElement) {
        this.monthInputRef.nativeElement.value = this.month.toString().padStart(2, '0');
      }
    }, 0);
  }

  // ========== UTILIDADES DE FECHA ==========

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private getMaxDaysInMonth(month: number, year: number): number {
    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28;
    }
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    return 31;
  }

  // ========== HANDLERS DÍA ==========

  onDayInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value === '') {
      this.day = null;
      this.buildAndEmit();
      return;
    }

    if (value.length > 2) {
      value = value.substring(0, 2);
    }

    let numValue = parseInt(value, 10);
    const maxDays = this.getMaxDaysInMonth(this.month ?? 1, this.year ?? 2000);

    if (numValue > maxDays) {
      this.alarms.showWarn(`El día no puede ser mayor a ${maxDays} para el mes seleccionado`);
      numValue = maxDays;
      value = numValue.toString();
    }

    this.day = numValue;
    input.value = value;
    this.buildAndEmit();
  }

  onDayBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.day !== null) {
      if (this.day < 1) {
        this.alarms.showWarn('El día no puede ser menor a 1');
        this.day = 1;
      }
      setTimeout(() => {
        input.value = this.day!.toString().padStart(2, '0');
      }, 0);
    }
    this.buildAndEmit();
    this.clampToMaxDate();
    this.dateBlur.emit(this.value);
  }

  // ========== HANDLERS MES ==========

  onMonthInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value === '') {
      this.month = null;
      this.buildAndEmit();
      return;
    }

    if (value.length > 2) {
      value = value.substring(0, 2);
    }

    let numValue = parseInt(value, 10);

    if (numValue > 12) {
      this.alarms.showWarn('El mes no puede ser mayor a 12');
      numValue = 12;
      value = numValue.toString();
    }

    this.month = numValue;
    input.value = value;

    // Ajustar día si excede el máximo del nuevo mes
    if (numValue > 0) {
      const maxDays = this.getMaxDaysInMonth(numValue, this.year ?? 2000);
      if (this.day && this.day > maxDays) {
        this.alarms.showWarn(`El día no puede ser mayor a ${maxDays} para el mes seleccionado`);
        this.day = maxDays;
      }
    }
    this.buildAndEmit();
  }

  onMonthBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.month !== null) {
      if (this.month < 1) {
        this.alarms.showWarn('El mes no puede ser menor a 1');
        this.month = 1;
      }
      setTimeout(() => {
        input.value = this.month!.toString().padStart(2, '0');
      }, 0);
    }
    this.buildAndEmit();
    this.clampToMaxDate();
    this.dateBlur.emit(this.value);
  }

  // ========== HANDLERS AÑO ==========

  onYearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value === '') {
      this.year = null;
      input.value = '';
      this.buildAndEmit();
      return;
    }

    const numValue = parseInt(value, 10);
    this.year = numValue;
    input.value = value;
    this.buildAndEmit();
  }

  onYearBlur(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.year === null || input.value === '') {
      this.year = null;
      input.value = '';
      this.buildAndEmit();
      this.dateBlur.emit(this.value);
      return;
    }

    if (this.year < 1900) {
      this.year = 1900;
      input.value = '1900';
      this.alarms.showWarn('El año no puede ser menor a 1900');
    } else if (this.year > 9999) {
      this.year = 9999;
      input.value = '9999';
      this.alarms.showWarn('El año no puede ser mayor a 9999');
    }

    // Ajustar día si febrero cambia de bisiesto a no bisiesto
    if (this.month === 2 && this.day) {
      const maxDays = this.getMaxDaysInMonth(this.month, this.year);
      if (this.day > maxDays) {
        this.alarms.showWarn('El año no es bisiesto. Febrero tiene un máximo de 28 días');
        this.day = maxDays;
      }
    }

    this.buildAndEmit();
    this.clampToMaxDate();
    this.dateBlur.emit(this.value);
  }

  // ========== CALENDARIO ==========

  /** Validates the current complete date against maxCalendarDate and clamps if it exceeds */
  private clampToMaxDate(): void {
    if (!this.maxCalendarDate || this.day === null || this.month === null || this.year === null) {
      return;
    }
    // Only validate when the year has 4 digits (complete date)
    if (this.year.toString().length < 4) return;

    const maxParts = this.maxCalendarDate.split('-');
    if (maxParts.length !== 3) return;

    const maxYear = parseInt(maxParts[0], 10);
    const maxMonth = parseInt(maxParts[1], 10);
    const maxDay = parseInt(maxParts[2], 10);

    const currentDate = new Date(this.year, this.month - 1, this.day);
    const maxDate = new Date(maxYear, maxMonth - 1, maxDay);

    if (currentDate > maxDate) {
      const formattedMax = `${maxDay.toString().padStart(2, '0')}/${maxMonth.toString().padStart(2, '0')}/${maxYear}`;
      this.alarms.showWarn(`La fecha no puede ser posterior al ${formattedMax}`);
      this.year = maxYear;
      this.month = maxMonth;
      this.day = maxDay;
      this.buildAndEmit();
      this.formatInputs();
    }
  }

  openCalendar(): void {
    if (this.calendarInput?.nativeElement) {
      if (this.value) {
        this.calendarInput.nativeElement.value = this.value;
      }
      this.calendarInput.nativeElement.showPicker();
    }
  }

  onCalendarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value; // formato YYYY-MM-DD

    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        this.year = parseInt(parts[0], 10);
        this.month = parseInt(parts[1], 10);
        this.day = parseInt(parts[2], 10);
        this.buildAndEmit();
        this.formatInputs();
        this.dateBlur.emit(this.value);
      }
    }
  }
}
