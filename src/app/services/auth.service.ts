// import { Injectable } from '@angular/core';
// import { jwtDecode } from 'jwt-decode';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   // getUserRole(): string | null {
//   //   // First try to get role from user object
//   //   const userStr = localStorage.getItem('user');
//   //   if (userStr) {
//   //     try {
//   //       const user = JSON.parse(userStr);
//   //       return user.role;
//   //     } catch (error) {
//   //       console.error('Error parsing user:', error);
//   //     }
//   //   }
//   //
//   //   // Fallback: get role from token (check both keys)
//   //   const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//   //   if (token) {
//   //     try {
//   //       const decodedToken: any = jwtDecode(token);
//   //       return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
//   //     } catch (error) {
//   //       console.error('Error decoding token:', error);
//   //     }
//   //   }
//   //
//   //   return null;
//   // }
//
//   getUserRole(): string | null {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     if (!token) return null;
//
//     try {
//       const decodedToken: any = jwtDecode(token);
//       return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
//     } catch (error) {
//       console.error('Error decoding token:', error);
//       return null;
//     }
//   }
//
//
//   isAuthenticated(): boolean {
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     // const user = localStorage.getItem('user');
//
//     if (!token) return false;
//
//     try {
//       const decodedToken: any = jwtDecode(token);
//       return decodedToken.exp * 1000 > Date.now();
//     } catch {
//       return false;
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getUserRole(): string | null {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
