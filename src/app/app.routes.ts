import { Routes } from '@angular/router';
import { roleGuardGuard } from './shared/guards/role-guard-guard';
import { authGuard } from './shared/guards/auth-guard';
import { RestaurantComponent } from './pages/home/restaurant/restaurant.component';

export const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },

  // Auth routes without navbar (lazy loaded)
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },

  // Public main page (accessible to everyone)
  {
    path: 'main',
    loadComponent: () => import('./shared/layout/layout-component/layout-component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/main/main').then((m) => m.Main),
      }
    ]
  },

  // Protected routes with navbar (lazy loaded)
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout-component/layout-component').then((m) => m.LayoutComponent),
    canActivate: [authGuard], // Protect all child routes
    children: [
      {
        path: 'admin',
        canActivate: [roleGuardGuard],
        data: { role: 'Admin' },
        loadChildren: () => import('./admin/admin-routes').then(m => m.adminRoutes)
      },
      {
        path: 'chef',
        canActivate: [roleGuardGuard],
        data: { role: 'Chef' },
        loadChildren: () => import('./chef/chef.routes').then(m => m.chefRoutes)
      },
      {
        path: 'customer',
        canActivate: [roleGuardGuard],
        data: { role: 'Customer' },
        loadChildren: () => import('./customer-routes').then(m => m.customerRoutes)
      },
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
      }
    ]
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path:'restaurant',
    component:RestaurantComponent
  },
  { path: '**', redirectTo: '/main' },
];
