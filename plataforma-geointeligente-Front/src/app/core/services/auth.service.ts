import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment.development';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  email: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredRole?: 'admin' | 'user';
  enabled?: boolean; // si false, no se muestra en el menú
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private menuItems: MenuItem[] = [
    { id: 'user-management', label: 'Gestión de Usuarios', icon: 'fas fa-users-cog', route: '/app/user-management', requiredRole: 'admin' },
    { id: 'database-management', label: 'Manejo de Base de Datos', icon: 'fas fa-database', route: '/app/database-management' },
    { id: 'recuperacion-temporal', label: 'Recuperación Temporal', icon: 'fas fa-trash-restore', route: '/app/recuperacion-temporal', requiredRole: 'admin' },
    { id: 'importacion', label: 'Importación', icon: 'fas fa-file-import', route: '/app/importacion', requiredRole: 'admin' },
    { id: 'noticias', label: 'Noticias', icon: 'fas fa-newspaper', route: '/app/noticias', requiredRole: 'admin' },
    { id: 'logo-management', label: 'Logos PDF', icon: 'fas fa-image', route: '/app/logo-management', requiredRole: 'admin' },
    { id: 'paneles-generales', label: 'Paneles generales', icon: 'fas fa-chart-line', route: '/app/paneles-generales' },
    { id: 'catalogo', label: 'Catálogo', icon: 'fas fa-notes-medical', route: '/app/catalogo' },
  ];

  private apiUrl = `${environment.apiUrl}/api/User`;

  constructor(private router: Router, private http: HttpClient, private ngZone: NgZone) {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try { this.currentUserSubject.next(JSON.parse(raw)); } catch { }
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'logout-event') {
        this.ngZone.run(() => this.remoteSignOut());
      }
    });
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('idUsuario', String(user.id));
  }

  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  isAuthenticated(): boolean { return !!this.currentUserSubject.value; }
  isLoggedIn(): boolean { return !!this.currentUserSubject.value; }
  isAdmin(): boolean { return this.getCurrentUser()?.role === 'admin'; }

  getMenuItems(): MenuItem[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return this.menuItems
      .filter(item => item.enabled !== false) // ocultar items deshabilitados
      .filter(item => !item.requiredRole || item.requiredRole === user.role);
  }

  logout(): void {
    console.log('AuthService.logout() ejecutado');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('token');
    localStorage.setItem('logout-event', Date.now().toString());
    this.router.navigate(['/vista-publica']);
  }

  remoteSignOut(): void {
    console.log('remoteSignOut(): limpieza por logout en otra pestaña');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('token');
    this.router.navigate(['/vista-publica']);
  }

  login(nombreUsuario: string, contrasena: string): Observable<User> {
    return new Observable(observer => {
      this.http.post<{ token: string; idUsuario: number; nombreUsuario: string; idRol: number }>(
        `${this.apiUrl}/Login`,
        { nombreUsuario, contrasena }
      ).subscribe({
        next: res => {
          const user: User = {
            id: res.idUsuario.toString(),
            name: res.nombreUsuario,
            role: res.idRol === 1 ? 'admin' : 'user',
            email: nombreUsuario
          };
          this.setCurrentUser(user);
          localStorage.setItem('token', res.token);
          observer.next(user);
          if (user.role === 'admin') this.router.navigate(['/app/user-management']);
          else this.router.navigate(['/app/paneles-generales']);
          observer.complete();
        },
        error: err => observer.error(err.error?.message || 'Login fallido')
      });
    });
  }
  // dentro de AuthService
  shouldShowLayout(): boolean {
    return this.isLoggedIn(); // o cualquier otra lógica que tengas
  }

  getCurrentUserId(): number {
    const u = this.getCurrentUser();
    return u?.id ? Number(u.id) : Number(localStorage.getItem('idUsuario') || 0);
  }

  validatePassword(password: string): Observable<boolean> {
    const idUsuario = this.getCurrentUserId();

    return this.http.post<boolean>(
      `${this.apiUrl}/ValidatePassword`,
      {
        idUsuario,
        password
      }
    );
  }



}
