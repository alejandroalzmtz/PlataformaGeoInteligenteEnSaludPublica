import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard para rutas que requieren usuario autenticado
export const authGuard: CanActivateFn = () => {
const authService = inject(AuthService);
const router = inject(Router);

if (!authService.isLoggedIn()) {
return router.parseUrl('/login');
}

return true;
};

// Guard para rutas que requieren administrador
export const adminGuard: CanActivateFn = () => {
const authService = inject(AuthService);
const router = inject(Router);

if (!authService.isLoggedIn() || !authService.isAdmin()) {
return router.parseUrl('/login');
}

return true;
};