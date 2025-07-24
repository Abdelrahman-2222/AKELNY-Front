import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  // {
  // //   path: 'register',
  // //   loadComponent: () =>
  // //     import('./register/register').then((m) => m.Register),
  // // },
   {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password').then(
        (m) => m.ForgotPassword
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password').then(
        (m) => m.ResetPassword
      ),
  },
  // {
  //   path: 'login',
  //   loadComponent: () => import('./login/login').then((m) => m.Login),
  // },
  {
    path: 'external-login',
    loadComponent: () => import('./external-login/external-login').then((m) => m.ExternalLogin),
  },
];
