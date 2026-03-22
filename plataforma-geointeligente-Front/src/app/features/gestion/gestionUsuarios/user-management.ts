import { Component, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AddUser } from './agregarUsuario/add-user';
import { UserService, User } from '../../../core/services/user-services';
import { ActivityModalComponent } from './actividadUsuario/actividad';
import { Tables } from '../../../core/components/tables/tables';
import { AlarmService } from '../../../core/components/Alarms/alarm.service';
import { ActividadService } from '../../../core/services/actividad.services';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.services';
import { FormsModule } from '@angular/forms';
import { ConfirmPasswordService } from '../../../core/services/confirm-password.service';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, AddUser, ActivityModalComponent, FormsModule, MatIconModule, Tables],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css'],
})
export class UserManagement {
  // Reference `Tables` so the Angular language service recognizes it is used by the template
  // (prevents "not used within the template" diagnostics).
  private readonly __TablesRef = Tables;
  showAddUser = false;
  showEditUser = false;
  selectedUser?: User; // Para edición
  // successMessage and snackBar removed — using AlarmService for notifications

  showActivityModal = false;
  users: any[] = [];

  // Provide a flattened array for the global table component
  get tableData() {
    try {
      const source = this.filteredUsers || [];

      return source.map((u) => ({
        idUsuario: u.idUsuario,
        nombreUsuario: u.nombreUsuario,
        fechaRegistro: this.formatDate(
          (u as any).fechaRegistro ||
          (u as any).createdAt ||
          (u as any).createdDate ||
          ''
        ),
        rol: u.idRol === 1 ? 'Administrador' : 'Usuario',
        __raw: u,
      }));
    } catch {
      return [];
    }
  }



  private formatDate(raw: any) {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw ?? '';
      return d.toLocaleDateString();
    } catch {
      return raw ?? '';
    }
  }

  constructor(
    private userService: UserService,
    private actividadService: ActividadService,
    private authService: AuthService,
    private exportService: ExportService,
    private alarmService: AlarmService,
    private confirmPasswordService: ConfirmPasswordService,
  ) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }
  //FILTROS USADOS PARA MOSTRAR EN LA TABLA(SOLO ACTIVOS)
  get filteredUsers(): User[] {
    let list = this.users as User[];

    // solo activos
    list = list.filter(u => u.activo !== false);

    // ocultar admins si no es admin
    if (!this.authService.isAdmin()) {
      list = list.filter(u => u.idRol !== 1);
    }

    return list;
  }



  exportCSV() {
    const data = this.tableData ?? [];
    if (!data.length) return this.alarmService.showWarn('No hay usuarios para exportar');

    this.exportService.exportToCSV(data, 'usuarios');
    this.alarmService.showSuccess('CSV descargado');
  }

  exportPDF() {
    const data = this.tableData ?? [];
    if (!data.length) return this.alarmService.showWarn('No hay usuarios para exportar');

    const columns = ['idUsuario', 'nombreUsuario', 'fechaRegistro', 'rol'];
    this.exportService.exportToPDF(data, columns, 'usuarios');
    this.alarmService.showSuccess('PDF descargado');
  }

  exportJSON() {
    const data = this.tableData ?? [];
    if (!data.length) return this.alarmService.showWarn('No hay usuarios para exportar');

    this.exportService.exportToJSON(data, 'usuarios');
    this.alarmService.showSuccess('JSON descargado');
  }

  openAddUser() {
    this.confirmPasswordService.open().subscribe((confirmed) => {
      if (!confirmed) return;
      this.selectedUser = undefined;
      this.showAddUser = true;
    });
  }

  editUser(user: User) {
    this.confirmPasswordService.open().subscribe((confirmed) => {
      if (!confirmed) return;

      this.selectedUser = { ...user };
      this.showAddUser = true;
    });
  }


  onCancelAddUser() {
    this.showAddUser = false;
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
  }

  onSaveUser(user: User) {

    // VALIDACIÓN EN FRONT 
    if (this.isDuplicateUsername(user.nombreUsuario, user.idUsuario)) {
      this.alarmService.showWarn('Usuario duplicado', {
        detail: `El usuario "${user.nombreUsuario}" ya existe`,
        life: 4000,
      });
      return;
    }

    if (user.idUsuario) {
      //ACTUALIZACIÓN
      this.userService.updateUser(user.idUsuario, user).subscribe({
        next: () => {
          this.loadUsers();
          this.showAddUser = false;

          this.alarmService.showSuccess('Usuario actualizado', {
            detail: `"${user.nombreUsuario}" actualizado correctamente`,
            life: 4000,
          });

          const usuarioLogueado = this.authService.getCurrentUser();
          if (usuarioLogueado) {
            const descripcion = `Actualizó al usuario "${user.nombreUsuario}" (ID: ${user.idUsuario})`;
            this.registrarActividad(usuarioLogueado.id, descripcion);
          }
        },
        error: (err) => {
          if (err.status === 409) {
            this.alarmService.showWarn('Usuario duplicado', {
              detail: err.error?.message || 'El nombre de usuario ya existe',
              life: 4000,
            });
            return;
          }

          this.alarmService.showError('Error al actualizar usuario', {
            detail: err?.message || 'Error inesperado',
            sticky: true,
          });
        },
      });

    } else {
      // CREACIÓN
      this.userService.addUser(user).subscribe({
        next: () => {
          this.loadUsers();
          this.showAddUser = false;

          const usuarioLogueado = this.authService.getCurrentUser();
          if (usuarioLogueado) {
            const descripcion = `Creó al usuario "${user.nombreUsuario}"`;
            this.registrarActividad(usuarioLogueado.id, descripcion);
          }

          this.alarmService.showSuccess('Usuario creado', {
            detail: `"${user.nombreUsuario}" creado correctamente`,
            life: 4000,
          });
        },
        error: (err) => {

          // RESPUESTA DEL BACK
          if (err.status === 409) {
            this.alarmService.showWarn('Usuario duplicado', {
              detail: err.error?.message || 'El nombre de usuario ya existe',
              life: 4000,
            });
            return;
          }

          this.alarmService.showError('Error al crear usuario', {
            detail: err?.message || 'Error inesperado',
            sticky: true,
          });
        },
      });
    }
  }


  // Inline success banner removed; use AlarmService for success notifications.

  deleteUser(user: User) {
    if (!user.idUsuario) return;

    if (confirm(`¿Deseas eliminar al usuario ${user.nombreUsuario}?`)) {
      const usuarioLogueado = this.authService.getCurrentUser();
      if (!usuarioLogueado) return;

      this.userService.deleteUser(user.idUsuario).subscribe({
        next: () => {
          this.loadUsers();
          const descripcion = `Eliminó al usuario "${user.nombreUsuario}" (ID: ${user.idUsuario})`;
          this.registrarActividad(usuarioLogueado.id, descripcion);
          // Alarma global de éxito (abajo derecha)
          this.alarmService.showSuccess('Usuario eliminado', {
            detail: `"${user.nombreUsuario}" eliminado correctamente`,
            life: 4000,
          });
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          const detail =
            (err && err.error && (err.error.Message || err.error.Message)) ||
            err?.message ||
            JSON.stringify(err);
          this.alarmService.showError('Error al eliminar usuario', {
            detail: String(detail),
            sticky: true,
          });
        },
      });
    }
  }

  viewUserActivity(userId: number) {
    this.selectedUser = this.users.find((u) => u.idUsuario === userId);
    this.showActivityModal = true;
  }

  closeActivityModal() {
    this.showActivityModal = false;
    this.selectedUser = undefined;
  }

  private registrarActividad(usuarioId: string, descripcion: string) {
    const now = new Date();
    const actividad = {
      idUsuario: parseInt(usuarioId),
      fechaInicio: now.toISOString(),
      fechaFin: now.toISOString(),
      fechaActividad: now.toISOString().split('T')[0],
      hora: now.toISOString().split('T')[1].split('.')[0],
      descripcionAccion: descripcion,
    };

    this.actividadService.addActividad(actividad).subscribe({
      next: () => console.log('Actividad registrada:', descripcion),
      error: (err) => console.error('Error registrando actividad:', err),
    });
  }
  //Validacion al ingresar un nuevo usuario pero es duplicado
  private isDuplicateUsername(nombreUsuario: string, currentUserId?: number): boolean {
    if (!nombreUsuario) return false;

    const username = nombreUsuario.trim().toLowerCase();

    return this.users.some(u =>
      u.nombreUsuario?.trim().toLowerCase() === username &&
      u.idUsuario !== currentUserId // permite editar sin bloquearse a sí mismo
    );
  }

  //Funcion para saber el id del usuario actual
  isCurrentUser(user: User): boolean {
    const current = this.authService.getCurrentUser();
    if (!current) return false;

    return Number(current.id) === user.idUsuario;
  }

  deactivateUser(user: User) {
    const id = user.idUsuario;
    if (id == null) return; // cubre undefined y null

    this.confirmPasswordService.open().subscribe((confirmed) => {
      if (!confirmed) return;

      const usuarioLogueado = this.authService.getCurrentUser();
      if (!usuarioLogueado) return;

      this.userService.deactivateUser(id).subscribe({
        next: () => {
          this.loadUsers();

          const descripcion = `Desactivó al usuario "${user.nombreUsuario}" (ID: ${id})`;
          this.registrarActividad(usuarioLogueado.id, descripcion);

          this.alarmService.showSuccess('Usuario desactivado', {
            detail: `"${user.nombreUsuario}" fue desactivado correctamente`,
            life: 4000,
          });
        },
        error: () => {
          this.alarmService.showError('Error al desactivar usuario', {
            detail: 'No se pudo desactivar el usuario',
            sticky: true,
          });
        },
      });
    });
  }



  // MatSnackBar removed; AlarmService used for notifications.
}
