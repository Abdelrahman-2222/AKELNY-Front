import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Restaurant, RestaurantInputDto, RestaurantResponseDto } from '../../models/AddRestaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddRestaurant {
  private readonly apiUrl = `${environment.apiUrl}/Restaurants`;

  constructor(private http: HttpClient) {}

  createRestaurant(restaurantData: RestaurantInputDto): Observable<RestaurantResponseDto> {
    const headers = this.getAuthHeaders();
    console.log('Making request to:', this.apiUrl);
    console.log('Request data:', restaurantData);

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
    if (!token) {
      console.warn('No authentication token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('HTTP Error Details:', error);
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          // Handle validation errors from ModelState
          if (error.error && typeof error.error === 'object') {
            if (error.error.errors) {
              // ASP.NET Core validation errors
              const validationErrors = Object.values(error.error.errors).flat() as string[];
              errorMessage = validationErrors.join(', ');
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          } else {
            errorMessage = 'Invalid request data';
          }
          break;
        case 401:
          errorMessage = 'You are not authorized to perform this action. Please login again.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission to perform this action.';
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
          errorMessage = error.error?.message || `Server error (${error.status}). Please try again.`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
