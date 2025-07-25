// // import { CanActivateFn, Router } from '@angular/router';
// // import { inject } from '@angular/core';
// // import { AuthService } from '../../services/auth.service';
// //
// // export const authGuard: CanActivateFn = (route, state) => {
// //   const authService = inject(AuthService);
// //   const router = inject(Router);
// //
// //   if (authService.isAuthenticated()) {
// //     return true;
// //   }
// //
// //   router.navigate(['/login']);
// //   return false;
// // };
//
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// // Import your auth service
// // import { AuthService } from '../services/auth.service';
//
// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
//   // const authService = inject(AuthService);
//
//   // Check if user is authenticated
//   const isAuthenticated = localStorage.getItem('token') || localStorage.getItem('user');
//
//   if (isAuthenticated) {
//     return true;
//   } else {
//     // Redirect to register page for unauthenticated users
//     router.navigate(['/register']);
//     return false;
//   }
// };


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/register']);
  return false;
};
