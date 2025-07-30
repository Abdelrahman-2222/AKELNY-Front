import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileDto, User } from '../models/Profile.model';
import { getAuthHeaders } from '../helper/auth-header';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'https://localhost:7045/api/Auth';

  constructor(public http: HttpClient) {}

  // private getAuthHeaders(): HttpHeaders {
  //   const token = localStorage.getItem('token') ||
  //     localStorage.getItem('authToken') ||
  //     localStorage.getItem('userToken');
  //
  //   return new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   });
  // }
  // private getAuthHeaders(): HttpHeaders {
  //   const token = localStorage.getItem('token');
  //   console.log('📦 Token used for auth header:', token); // 👈 ADD THIS
  //
  //   return new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   });
  // }


  // updateProfile(profileData: ProfileDto): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/profile`, profileData, {
  //     headers: this.getAuthHeaders()
  //   });
  updateProfile(profileData: ProfileDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, {
      headers: new HttpHeaders(getAuthHeaders())
    });
  }
  //
  // getCurrentUser(): Observable<User> {
  //   return this.http.get<User>(`${this.apiUrl}/profile`, {
  //     headers: this.getAuthHeaders()
  //   });
  // }

  getCurrentUser(): Observable<User> {
    // console.log('💥 Final headers:', getAuthHeaders());
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: new HttpHeaders(getAuthHeaders())
    });
  }
  // getCurrentUser(): Observable<User> {
  //   return this.http.get<User>(`${this.apiUrl}/profile`);
  //}
}
