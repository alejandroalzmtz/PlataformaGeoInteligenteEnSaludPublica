import { Routes } from '@angular/router';
import { Layout } from './core/components/layout/layout';
import { PublicView } from './features/vistaPublica/vista-publica';
import { UserManagement } from './features/gestion/gestionUsuarios/user-management';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { DatabaseManagement } from './features/gestion/manejoBaseDeDatos/database-management';
import { RecuperacionTemporal } from './features/gestion/recuperacionTemporal/recuperacion-temporal';
import { PanelesGeneralesComponent } from './features/panelesGenerales/panelesGenerales';

import { ImportacionComponent } from './features/gestion/importacion/importacion';
import { NoticiasComponent } from './features/gestion/noticias/noticias.component';
import { Catalogo } from './features/gestion/catalogo/catalogo';
import { LogoManagement } from './features/gestion/logosPdf/logo-management';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'vista-publica', component: PublicView },
  { path: 'about-us', component: PublicView },
  { path: '', redirectTo: 'vista-publica', pathMatch: 'full' },
  {
    path: 'app',
    component: Layout,
    canActivate: [authGuard], // <-- PROTEGE TODAS LAS RUTAS HIJAS
    children: [
      { path: '', redirectTo: 'user-management', pathMatch: 'full' },
      { path: 'user-management', component: UserManagement, canActivate: [adminGuard] },
      { path: 'database-management', component: DatabaseManagement },
      { path: 'recuperacion-temporal', component: RecuperacionTemporal, canActivate: [adminGuard] },
      { path: 'paneles-generales', component: PanelesGeneralesComponent },
      { path: 'importacion', component: ImportacionComponent, canActivate: [adminGuard] },
      //{ path: 'enfermedad', component: EnfermedadComponent },
      { path: 'noticias', component: NoticiasComponent, canActivate: [adminGuard] },
      { path: 'catalogo', component: Catalogo },
      { path: 'logo-management', component: LogoManagement, canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: 'vista-publica' },
];
