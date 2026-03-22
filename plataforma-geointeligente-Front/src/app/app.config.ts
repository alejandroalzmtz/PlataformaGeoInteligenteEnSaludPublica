import { ApplicationConfig, NgZone } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service'; // ajusta ruta si es distinto
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([AuthInterceptor])),
    MessageService,
    provideAnimations(),

    // Listener robusto: storage + BroadcastChannel, usa NgZone y AuthService
    {
      provide: 'SESSION_SYNC',
      useFactory: (router: Router, ngZone: NgZone, authService: AuthService) => {
        // Storage listener
        window.addEventListener('storage', (event) => {
          console.log('STORAGE EVENT RECEIVED:', event.key, event.newValue);
          if (event.key === 'currentUser' && event.newValue === null) {
            console.log('storage -> limpiar estado y navegar a /login via NgZone');
            ngZone.run(() => {
              authService.remoteSignOut(); // limpia memoria
              router.navigate(['/login']);
            });
          }
          if (event.key === 'logout-event') {
            console.log('storage logout-event -> limpiar estado y navegar a /login via NgZone');
            ngZone.run(() => {
              authService.remoteSignOut();
              router.navigate(['/login']);
            });
          }
        });

        // BroadcastChannel listener (respaldo)
        try {
          const bc = new BroadcastChannel('auth_channel');
          bc.addEventListener('message', (ev) => {
            console.log('BroadcastChannel message:', ev.data);
            if (ev.data && ev.data.type === 'logout') {
              console.log('broadcast -> limpiar estado y navegar a /login via NgZone');
              ngZone.run(() => {
                authService.remoteSignOut();
                router.navigate(['/login']);
              });
            }
          });
        } catch (err) {
          console.warn('BroadcastChannel no disponible:', err);
        }

        return true;
      },
      deps: [Router, NgZone, AuthService],
    },
  ],
};
