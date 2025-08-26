import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { RestaurantDetails } from '../models/RestaurantDetails.model';
import { GetService } from './requests/get-service';
import { environment } from '../../environments/environment';

interface RestaurantBasicInfo {
  resName: string;
  resImage: string;
  rating: number;
  location: string;
  categories: { id: number; name: string }[];
}

interface RestaurantItemsPage {
  items: any[];
  totalPages: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantCacheService {
  private getService = inject(GetService);
  private itemsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }


  getRestaurantItems(restId: number, page: number, pageSize: number): Observable<any> {
    const cacheKey = `${restId}-${page}-${pageSize}`;
    const cached = this.itemsCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return of(cached.data);
    }

    return this.getService.get<any>({
      url: `${environment.apiUrl}/Restaurants/customer-restaurant/${restId}?page=${page}&pageSize=${pageSize}`,
      headers: this.getHeaders()
    }).pipe(
      tap(data => {
        // Cache the complete response
        this.itemsCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      })
    );
  }

  preloadNextPage(restId: number, currentPage: number, pageSize: number): void {
    const nextPage = currentPage + 1;
    const cacheKey = `${restId}-${nextPage}-${pageSize}`;

    if (!this.itemsCache.has(cacheKey)) {
      this.getRestaurantItems(restId, nextPage, pageSize)
        .subscribe();
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
  }

  refreshInBackground(restId: number, page: number, pageSize: number): void {
    setTimeout(() => {
      this.getRestaurantItems(restId, page, pageSize)
        .subscribe();
    }, 100);
  }
}
