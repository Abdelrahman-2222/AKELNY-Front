import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.apiUrl}/Restaurants`;

  constructor(private http: HttpClient) {}

  getChefRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chef-restaurant`);
  }

  checkChefHasRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check`);
  }
}
