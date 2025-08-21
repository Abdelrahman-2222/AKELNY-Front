import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { RestaurantDetails } from '../models/RestaurantDetails.model';
import { GetService } from './requests/get-service';

interface CacheEntry {
  data: RestaurantDetails;
  timestamp: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private getService: GetService) {}

  getRestaurantDetails(
    restId: number,
    page: number,
    pageSize: number,
    forceRefresh = false
  ): Observable<RestaurantDetails> {
    const cacheKey = `${restId}-${page}-${pageSize}`;
    const cached = this.cache.get(cacheKey);

    // Check if cache is valid and not forcing refresh
    if (!forceRefresh && cached && this.isCacheValid(cached.timestamp)) {
      console.log('Using cached restaurant data');
      return of(cached.data);
    }

    console.log('Fetching fresh restaurant data');
    return this.getService.get<RestaurantDetails>({
      url: `https://localhost:7045/api/Restaurants/customer-restaurant/${restId}?page=${page}&pageSize=${pageSize}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    }).pipe(
      tap(data => {
        // Ensure pagination properties exist
        const restaurantData: RestaurantDetails = {
          ...data,
          totalPages: data.totalPages || 1,
          currentPage: page,
          pageSize: pageSize,
          totalItems: data.totalItems || 0
        };

        // Cache the response
        this.cache.set(cacheKey, {
          data: restaurantData,
          timestamp: Date.now(),
          page,
          pageSize
        });
      }),
      shareReplay(1),
      catchError((error) => {
        console.error('Error fetching restaurant details:', error);
        throw error;
      })
    );
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  clearCache(restId?: number): void {
    if (restId) {
      const keysToDelete = Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${restId}-`));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  invalidateCache(restId: number): void {
    this.clearCache(restId);
  }

  // Get cache statistics for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
