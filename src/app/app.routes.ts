import { Routes } from '@angular/router';
import { loginGuard, OwnerGuard, GuestGuard } from './core/guards/role.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'owner',
    canActivate: [OwnerGuard],
    loadComponent: () =>
      import('./features/owner/owner-dashboard.component').then((m) => m.OwnerDashboardComponent)
  },
  {
    path: 'guest',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/guest/guest-portal.component').then((m) => m.GuestPortalComponent)
  },
  { path: '**', redirectTo: 'login' }
];
