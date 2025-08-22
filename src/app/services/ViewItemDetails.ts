// src/app/services/ViewItemDetails.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemClassDto } from '../models/ItemDetailsViewCustomer';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViewItemDetailsService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Get item details by ID with all includes (addons, combos, sizing)
   */
  getItemById(itemId: number): Observable<ItemClassDto> {
    return this.http.get<ItemClassDto>(`${this.baseUrl}/Items/GetDetails/${itemId}`);
  }

  /**
   * Get items by restaurant ID with includes (addons, combos, sizing)
   */
  getItemsByRestaurantId(restaurantId: number): Observable<ItemClassDto[]> {
    return this.http.get<ItemClassDto[]>(`${this.baseUrl}/Items/GetByRestaurantIdWithIncludes/${restaurantId}`);
  }

  /**
   * Get items by restaurant and category
   */
  getItemsByRestaurantAndCategory(restaurantId: number, categoryId: number): Observable<ItemClassDto[]> {
    return this.http.get<ItemClassDto[]>(`${this.baseUrl}/Items/Restaurant/${restaurantId}/${categoryId}`);
  }
}
