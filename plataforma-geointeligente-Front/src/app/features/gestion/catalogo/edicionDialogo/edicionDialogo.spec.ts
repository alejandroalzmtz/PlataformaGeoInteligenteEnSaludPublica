import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { edicionDialogo } from './edicionDialogo';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoService } from '../../../../core/services/CatalogoService';
import { AlarmService } from '../../../../core/components/Alarms/alarm.service';

describe('edicionDialogo', () => {
	let component: edicionDialogo;
	let fixture: ComponentFixture<edicionDialogo>;

	const mockDialogRef = { close: jasmine.createSpy('close') };
	const mockCatalogo: Partial<CatalogoService> = {
		update: jasmine.createSpy('update').and.returnValue(of({})),
		updateServicioMedico: jasmine.createSpy('updateServicioMedico').and.returnValue(of({})),
		updateDerechoHab: jasmine.createSpy('updateDerechoHab').and.returnValue(of({})),
		updateEstado: jasmine.createSpy('updateEstado').and.returnValue(of({})),
		updateMotivoEgreso: jasmine.createSpy('updateMotivoEgreso').and.returnValue(of({})),
		updateRangoEdad: jasmine.createSpy('updateRangoEdad').and.returnValue(of({})),
		updateProcedencia: jasmine.createSpy('updateProcedencia').and.returnValue(of({})),
		updateMunicipio: jasmine.createSpy('updateMunicipio').and.returnValue(of({})),
		updateLocalidad: jasmine.createSpy('updateLocalidad').and.returnValue(of({})),
	};
	const mockAlarms: Partial<AlarmService> = {
		showError: jasmine.createSpy('showError'),
		showInfo: jasmine.createSpy('showInfo'),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [edicionDialogo],
			providers: [
				{ provide: CatalogoService, useValue: mockCatalogo },
				{ provide: AlarmService, useValue: mockAlarms },
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: { kind: 'enfermedad', item: { codigoICD: 'C1', nombreEnfermedad: 'Old', descripcion: 'old' } } },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(edicionDialogo);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		(mockDialogRef.close as jasmine.Spy).calls.reset();
		for (const k of Object.keys(mockCatalogo)) { try { (mockCatalogo as any)[k].calls.reset(); } catch {} }
		(mockAlarms.showError as jasmine.Spy).calls.reset?.();
	});

	it('should create and initialize formData', () => {
		expect(component).toBeTruthy();
		expect(component.kind).toBe('enfermedad');
		expect(component.formData.nombreEnfermedad).toBe('Old');
	});

	it('cancel() should close dialog', () => {
		component.cancel();
		expect(mockDialogRef.close).toHaveBeenCalled();
	});

	it('save() validates required for enfermedad and shows error when missing', () => {
		component.formData.nombreEnfermedad = '';
		component.save();
		expect((mockAlarms.showError as jasmine.Spy)).toHaveBeenCalledWith('El nombre de la enfermedad es obligatorio');
		expect(component.loading).toBeFalse();
	});

	it('save() calls update for enfermedad and closes dialog', fakeAsync(() => {
		component.formData.nombreEnfermedad = 'NewName';
		component.formData.codigoICD = 'C1';
		component.save();
		// allow subscriptions and change detection to settle
		fixture.detectChanges();
		tick();
		expect((mockCatalogo.update as jasmine.Spy)).toHaveBeenCalledWith('C1', jasmine.objectContaining({ nombreEnfermedad: 'NewName' }));
		expect(mockDialogRef.close).toHaveBeenCalled();
	}));

	it('save() surfaces API error and shows alarm', fakeAsync(() => {
		(mockCatalogo.update as jasmine.Spy).and.returnValue(throwError({ error: 'boom' }));
		component.formData.nombreEnfermedad = 'NewName';
		component.formData.codigoICD = 'C1';
		component.save();
		tick();
		expect((mockAlarms.showError as jasmine.Spy)).toHaveBeenCalled();
		expect(component.loading).toBeFalse();
	}));
});

