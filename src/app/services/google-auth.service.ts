import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendTokenToBackend(idToken: string, role?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/google`, {
      Provider: "Google",
      IdToken: idToken,
      Role: role || 'Customer' || 'customer'
    });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData);
  }
}
