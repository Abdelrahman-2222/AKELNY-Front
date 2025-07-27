// src/app/services/restaurant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Restaurant, RestaurantInputDto, RestaurantResponseDto } from '../../models/AddRestaurant.model';

@Injectable({
  providedIn: 'root'
})
export class AddRestaurant {
  private readonly apiUrl = 'https://localhost:7045/api/Restaurants';

  constructor(private http: HttpClient) {}

  createRestaurant(restaurantData: RestaurantInputDto): Observable<RestaurantResponseDto> {
    const headers = this.getAuthHeaders();
    return this.http.post<RestaurantResponseDto>(this.apiUrl, restaurantData, { headers })
      .pipe(catchError(this.handleError));
  }

  updateRestaurant(restaurantId: number, restaurantData: Partial<RestaurantInputDto>): Observable<Restaurant> {
    const headers = this.getAuthHeaders();
    return this.http.put<Restaurant>(`${this.apiUrl}/${restaurantId}`, restaurantData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteRestaurant(restaurantId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${restaurantId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  getChefRestaurant(): Observable<Restaurant> {
    const headers = this.getAuthHeaders();
    return this.http.get<Restaurant>(`${this.apiUrl}/chef-restaurant`, { headers })
      .pipe(catchError(this.handleError));
  }

  checkChefHasRestaurant(): Observable<boolean> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ hasRestaurant: boolean }>(`${this.apiUrl}/check`, { headers })
      .pipe(
        map(response => response.hasRestaurant),
        catchError(this.handleError)
      );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Restaurant not found';
          break;
        case 409:
          errorMessage = 'Restaurant already exists for this chef';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
