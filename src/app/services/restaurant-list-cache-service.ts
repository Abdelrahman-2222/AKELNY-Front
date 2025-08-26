import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { GetService } from './requests/get-service';
import { CustomerRestaurant } from '../models/CustomerRestaurant.model';

interface RestaurantListResponse {
  restaurants: CustomerRestaurant[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantListCacheService {
  private cache = new Map<string, { data: RestaurantListResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  constructor(private getService: GetService) {}

  getRestaurants(page: number, pageSize: number, sortBy: string, sortOrder: string): Observable<RestaurantListResponse> {
    const cacheKey = `${page}-${pageSize}-${sortBy}-${sortOrder}`;
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return of(cached.data);
    }

    const sorts = sortBy ? `sorts=${sortOrder}${sortBy}&` : '';
    const query = `${sorts}page=${page}&pageSize=${pageSize}`;

    return this.getService.get<RestaurantListResponse>({
      url: '/restaurants',
      query,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).pipe(
      tap(data => this.cache.set(cacheKey, { data, timestamp: Date.now() })),
      shareReplay(1)
    );
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
