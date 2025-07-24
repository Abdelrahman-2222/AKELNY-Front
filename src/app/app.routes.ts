import { Routes } from '@angular/router';
import {authRoutes} from './auth/auth.routes';
import {chefRoutes} from './chef/chef.routes';
import {adminRoutes} from './admin/admin-routes';
import {LayoutComponent} from './shared/layout/layout-component/layout-component';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  ...authRoutes,
  // ...chefRoutes,
  // ...adminRoutes,
  {
    path: '',
    component: LayoutComponent,
    children: [
      ...chefRoutes,
      ...adminRoutes,
      {
        path: 'main',
        loadComponent: () => import('./home/main/main').then((m) => m.Main),
      },
    ]
  },
  { path: '**', redirectTo: '/register' },
];
