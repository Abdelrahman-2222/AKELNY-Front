import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'];
  const userRole = authService.getUserRole();

  // console.log('=== ROLE GUARD DEBUG ===');
  // console.log('URL:', state.url);
  // console.log('Required role:', requiredRole);
  // console.log('User role from AuthService:', userRole);
  // console.log('Token exists:', !!localStorage.getItem('token'));
  // console.log('User object:', localStorage.getItem('user'));
  // console.log('========================');

  // Case-insensitive comparison
  if (userRole && requiredRole &&
    userRole.toLowerCase() === requiredRole.toLowerCase()) {
    return true;
  }

  console.log('Access denied - redirecting to unauthorized');
  router.navigate(['/unauthorized']);
  return false;
};
