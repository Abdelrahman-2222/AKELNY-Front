import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getUserRole(): string | null {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      console.log('Decoded token:', decodedToken); // For debugging

      // Your backend uses ClaimTypes.Role which maps to this claim name
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decodedToken.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
