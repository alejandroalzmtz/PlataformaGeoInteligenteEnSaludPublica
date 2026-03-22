import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] //corregido a styleUrls
})
export class LoginComponent {
  nombreUsuario: string = '';
  contrasena: string = '';
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

    //  Llamada al login real del backend
    this.authService.login(this.nombreUsuario, this.contrasena).subscribe({
      next: (user: User) => {
        this.isLoading = false;

        // Redirigir según rol
        if (user.role === 'admin') {
          this.router.navigate(['/app/user-management']);
        } else {
          this.router.navigate(['/app/user-management']);
        }
      },
      error: (err: any) => {
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
