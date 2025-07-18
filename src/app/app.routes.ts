import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'main',
    loadComponent: () => import('./home/main/main').then(m => m.Main)
  },
  { path: '**', redirectTo: '/register' }
];
