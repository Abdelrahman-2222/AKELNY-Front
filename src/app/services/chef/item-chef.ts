import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemDto, ItemCreateUpdateDto } from '../../models/AddItemChef';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemChef {
  private readonly apiUrl = `${environment.apiUrl}/Items`;

  constructor(private http: HttpClient) {}

  // ✅ Update to accept FormData for file uploads
  // addItem(formData: FormData): Observable<ItemDto> {
  //   return this.http.post<ItemDto>(`${this.apiUrl}/Add`, formData);
  // }
  // Update service to accept ItemCreateUpdateDto instead of FormData
  // addItem(item: ItemCreateUpdateDto): Observable<ItemDto> {
  //   return this.http.post<ItemDto>(`${this.apiUrl}/Add`, item);
  // }
  addItem(item: ItemCreateUpdateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Add`, item, {
      responseType: 'text' // ✅ Handle plain text response
    });
  }

  // updateItem(item: ItemCreateUpdateDto): Observable<ItemDto> {
  //   return this.http.put<ItemDto>(`${this.apiUrl}/Update`, item);
  // }

  updateItem(item: ItemCreateUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/Update/${item.id}`, item, {
      responseType: 'text'
    });
  }

  getItemById(itemId: number): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.apiUrl}/${itemId}`);
  }

  getItemsByRestaurant(restaurantId: number): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/GetAllByRestaurantId/${restaurantId}`);
  }

  getItemsByRestaurantAndCategory(restaurantId: number, categoryId: number): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(`${this.apiUrl}/Restaurant/${restaurantId}/${categoryId}`);
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete/${itemId}`, {
      responseType: 'text'
    });
  }

  validateItemData(item: ItemCreateUpdateDto): string[] {
    const errors: string[] = [];

    if (!item.name?.trim()) {
      errors.push('Item name is required');
    }

    if (!item.description?.trim()) {
      errors.push('Item description is required');
    }

    if (item.sizeType === undefined || item.sizeType === null) {
      errors.push('Size type is required');
    }

    switch (item.sizeType) {
      case 0: // Fixed
        if (!item.price || item.price <= 0) {
          errors.push('Price is required for fixed price items');
        }
        break;

      case 1: // Sized
        if (!item.sizePricing || item.sizePricing.length === 0) {
          errors.push('Size pricing is required for sized items');
        } else {
          item.sizePricing.forEach((pricing, index) => {
            if (!pricing.price || pricing.price <= 0) {
              errors.push(`Price is required for size option ${index + 1}`);
            }
          });
        }
        break;

      case 2: // Weighted
        if (!item.price || item.price <= 0) {
          errors.push('Price per unit weight is required for weighted items');
        }
        if (!item.weight || item.weight <= 0) {
          errors.push('Default weight is required for weighted items');
        }
        break;
    }

    return errors;
  }
}
