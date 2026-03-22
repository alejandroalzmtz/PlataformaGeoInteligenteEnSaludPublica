import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  nombreUsuario = '';
  contrasena = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 onSubmit() {
  if (!this.nombreUsuario || !this.contrasena) {
    this.errorMessage = 'Por favor, completa todos los campos';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.login(this.nombreUsuario, this.contrasena).subscribe({
    next: (user: User) => {
      this.isLoading = false;

      // Guardar el rol
      localStorage.setItem('role', user.role);

      // --- REDIRECCIÓN SEGÚN ROL ---
      if (user.role === 'admin') {
        this.router.navigate(['/app/user-management']); // Página de admin
      } else {
        this.router.navigate(['/registros-app/database-managements']);   // Página normal
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err || 'Credenciales incorrectas';
    }
  });
}


  goBackToPublic() {
    this.router.navigate(['/vista-publica']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
