import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MegaMenuModule } from 'primeng/megamenu';
import { RippleModule } from 'primeng/ripple';
import { MegaMenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule, ButtonModule, MegaMenuModule, RippleModule],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class Nav implements OnInit {
  items: MegaMenuItem[] | undefined;
  mobileMenuOpen = false;
  expandedGestion = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Navigation handling
      });
  }

  ngOnInit(): void {
    this.initializeMenuItems();
  }
  initializeMenuItems(): void {
    const fromAuth = this.buildMenuFromAuth();

    this.items = [


      {
        label: 'Paneles Generales',
        root: true,
        icon: 'pi pi-chart-bar',
        command: () => this.router.navigate(['/app/paneles-generales'])
      },
      {
        label: 'Vista Pública',
        root: true,
        icon: 'pi pi-globe',
        command: () => this.router.navigate(['/vista-publica'])
      },
      // spread auth-provided management group(s)
      ...fromAuth,
    ];
  }

  private buildMenuFromAuth(): MegaMenuItem[] {
  const user = this.authService.getCurrentUser();

  let authItems = this.authService.getMenuItems()
    .filter(mi => mi.id !== 'paneles-generales');

  // 👉 NUEVA LÓGICA: si es USER, solo dejar Catálogo
  if (user?.role === 'user') {
    authItems = authItems.filter(mi => mi.id === 'enfermedad');
  }

  if (authItems.length === 0) return [];

  const chunkSize = 3;
  const columns: any[] = [];

  for (let i = 0; i < authItems.length; i += chunkSize) {
    const chunk = authItems.slice(i, i + chunkSize).map(mi => ({
      label: mi.label,
      icon: mi.icon,
      subtext: '',
      command: () => this.router.navigate([mi.route])
    }));

    columns.push([{ items: chunk }]);
  }

  return [
    {
      label: 'Gestión',
      root: true,
      icon: 'pi pi-cog',
      items: columns
    }
  ];
}




  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Invitado';
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    return user.role === 'admin' ? 'Administrador' : 'Usuario';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/vista-publica']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  handleMobileMenuClick(item: MegaMenuItem): void {
    // Ejecutar comando del menú si existe
    if (item.command) {
      item.command();
    }
    // Cerrar el menú móvil después de hacer clic
    this.mobileMenuOpen = false;
  }

  handleMobileMenuSubitem(subItem: any): void {
    // Ejecutar comando del subítem si existe
    if (subItem.command) {
      subItem.command();
    }
    // Cerrar el menú móvil después de hacer clic
    this.mobileMenuOpen = false;
  }

  toggleGestionExpand(event: Event): void {
    event.stopPropagation();
    this.expandedGestion = !this.expandedGestion;
  }
}
