import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { betaGuard } from './core/guards/beta-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, betaGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'beta-gate',
    loadComponent: () =>
      import('./features/beta-gate/beta-gate.component').then(
        (m) => m.BetaGateComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

