import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/services/user-services';
import { ActividadService } from '../../../../core/services/actividad.services';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css']
})
export class AddUser implements OnChanges {

  @Input() userToEdit?: User;
  @Output() cancel = new EventEmitter();
  @Output() saveUser = new EventEmitter();
  @Output() showToast = new EventEmitter();

  newUser: User = { nombreUsuario: '', contrasena: '', idRol: 1, activo: true};
  error = '';

  // Límites
  readonly USER_MIN = 4;
  readonly USER_MAX = 20;
  readonly PASS_MIN = 9;
  readonly PASS_MAX = 32;

  passwordTouched = false;
  passwordInvalid = false;
  usernameInvalid = false;

  constructor(
    private actividadService: ActividadService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userToEdit'] && this.userToEdit) {
      this.newUser = { ...this.userToEdit };
      this.resetValidation();
    }
  }

  // ===== VALIDACIONES =====

  private isValidUsername(username: string): boolean {
    const regex = /^[a-zA-Z0-9._-]{4,20}$/;
    return regex.test(username);
  }

  private isStrongPassword(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,32}$/;
    return regex.test(password);
  }

  // Mientras escribe usuario
  onUsernameChange() {
    this.usernameInvalid = !this.isValidUsername(this.newUser.nombreUsuario || '');
  }

  // Mientras escribe contraseña
  onPasswordChange() {
    this.passwordTouched = true;
    this.passwordInvalid = !this.isStrongPassword(this.newUser.contrasena || '');
  }

  save() {
    this.error = '';

    if (!this.newUser.nombreUsuario || !this.newUser.contrasena) {
      this.error = 'Nombre de usuario y contraseña son obligatorios';
      return;
    }

    if (this.usernameInvalid) {
      this.error =
        'El usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números, ".", "-" y "_"';
      return;
    }

    if (this.passwordInvalid) {
      this.error =
        'La contraseña debe tener entre 9 y 32 caracteres, una mayúscula, un número y un símbolo';
      return;
    }

    // Emitir usuario
    this.saveUser.emit(this.newUser);

    this.showToast.emit(
      `Usuario ${this.userToEdit ? 'actualizado' : 'agregado'} correctamente`
    );

    setTimeout(() => this.onCancel(), 1500);

    const usuarioLogueado = this.authService.getCurrentUser();
    if (!usuarioLogueado) return;

    const descripcion = this.userToEdit
      ? `Editó al usuario (ID: ${this.newUser.idUsuario})`
      : `Agregó al usuario (ID: ${this.newUser.idUsuario})`;

    this.addActividad(usuarioLogueado.id, descripcion);
  }

  onCancel() {
    this.newUser = { nombreUsuario: '', contrasena: '', idRol: 1 };
    this.resetValidation();
    this.cancel.emit();
  }

  private resetValidation() {
    this.passwordTouched = false;
    this.passwordInvalid = false;
    this.usernameInvalid = false;
    this.error = '';
  }

  private addActividad(usuarioId: string, descripcion: string) {
    const now = new Date();
    const actividad = {
      idUsuario: parseInt(usuarioId),
      fechaInicio: now.toISOString(),
      fechaFin: now.toISOString(),
      fechaActividad: now.toISOString().split('T')[0],
      hora: now.toISOString().split('T')[1].split('.')[0],
      descripcionAccion: descripcion
    };

    this.actividadService.addActividad(actividad).subscribe({
      next: () => console.log('Actividad registrada'),
      error: (err) => console.error('Error registrando actividad: ', err)
    });
  }
}
