import { Routes } from '@angular/router';
import { App } from './app';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then(
        (m) => m.ForgotPassword
      ),
  },
  {
    path : 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password').then(
        (m) => m.ResetPassword
      ),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'external-login',
    loadComponent: () => import('./auth/external-login/external-login').then((m) => m.ExternalLogin),
  },
  {
    path: 'main',
    loadComponent: () => import('./home/main/main').then((m) => m.Main),
  },
  { path: '**', redirectTo: '/register' },
];
