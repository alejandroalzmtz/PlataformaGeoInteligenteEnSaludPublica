import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Nav } from '../nav/nav';
import { AuthService, MenuItem } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [Nav, CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  selectedMenuItem: string = '';
  private routerSubscription?: Subscription;
  showLayout = true;

  constructor(
    public authService: AuthService,  // <-- hacerlo público para usarlo en el HTML
    private router: Router
  ) {
    // previously closed sidebar on navigation; sidebar removed so no-op here
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {});
  }

  ngOnInit() {
    // Escuchar cambios de ruta para actualizar el elemento seleccionado
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSelectedMenuItem(event.url);
      });

    // Establecer el elemento seleccionado inicial
    this.updateSelectedMenuItem(this.router.url);

    // Escuchar cambios de ruta para mostrar/ocultar layout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showLayout = this.authService.shouldShowLayout();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  shouldShowSidebar(): boolean {
    return this.showLayout && this.authService.shouldShowLayout();
  }

  getMenuItems(): MenuItem[] {
    return this.authService.getMenuItems();
  }
  private updateSelectedMenuItem(url: string): void {
    const menuItems = this.getMenuItems();
    const activeItem = menuItems.find(item => url.includes(item.route));
    this.selectedMenuItem = activeItem?.id || '';
  }
}
