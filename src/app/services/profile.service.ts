import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileDto, User } from '../models/Profile.model';
import { getAuthHeaders } from '../helper/auth-header';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(public http: HttpClient) {}

  updateProfile(profileData: ProfileDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, {
      headers: new HttpHeaders(getAuthHeaders())
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: new HttpHeaders(getAuthHeaders())
    });
  }
}
