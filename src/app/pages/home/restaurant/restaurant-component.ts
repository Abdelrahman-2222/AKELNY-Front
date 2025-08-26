import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Package } from 'lucide-angular';
import { NgFor, NgIf } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';
import { CustomerRestaurant } from '../../../models/CustomerRestaurant.model';
import { FilterRestaurantView } from '../../../shared/components/filters/filter-restaurant-view/filter-restaurant-view';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Router, NavigationExtras } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, retry } from 'rxjs/operators';
import { Subject, Observable, timer } from 'rxjs';
import { RestaurantListCacheService } from '../../../services/restaurant-list-cache-service';

interface RestaurantListResponse {
  restaurants: CustomerRestaurant[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-restaurant-component',
  imports: [LucideAngularModule, FilterRestaurantView, Pagination, NgFor, NgIf],
  templateUrl: './restaurant-component.html',
  styleUrl: './restaurant-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RestaurantComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private sortSubject = new Subject<{ sortBy: string; sortOrder: string }>();
  private cacheService = inject(RestaurantListCacheService);


  public isNavigating = false;

  readonly Package = Package;
  isLoading = true;
  errorMessage = '';

  getService = inject(GetService);
  router = inject(Router);
  cartService: CartService = inject(CartService);

  restaurants: CustomerRestaurant[] = [];

  // pagination
  page = 1;
  pageSize = 3;
  totalPages = 0;

  // sorting
  sortBy = '';
  sortOrder = '';

  ngOnInit(): void {
    this.loadRestaurants();
    this.setupSortDebouncing();
  }

  private setupSortDebouncing(): void {
    this.sortSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.loadRestaurantsObservable())
    ).subscribe();
  }

  private buildQuery(): string {
    const sorts = this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '';
    return `${sorts}page=${this.page}&pageSize=${this.pageSize}`;
  }

  // loadRestaurants(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';
  //
  //   this.getService
  //     .get<{
  //       restaurants: CustomerRestaurant[];
  //       totalCount: number;
  //       page: number;
  //       pageSize: number;
  //     }>({
  //       url: '/restaurants',
  //       query: this.buildQuery(),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'Bearer ' + localStorage.getItem('token')
  //       }
  //     })
  //     .subscribe({
  //       next: (data) => {
  //         this.restaurants = data.restaurants; // Changed from data.categories
  //         this.totalPages = Math.ceil(data.totalCount / data.pageSize); // Calculate total pages
  //         this.page = data.page; // Sync with server response
  //         this.pageSize = data.pageSize; // Sync with server response
  //         this.isLoading = false;
  //       },
  //       error: (err) => {
  //         console.error('Error fetching restaurants:', err);
  //         this.errorMessage = "Can't fetch restaurants";
  //         this.isLoading = false;
  //       },
  //       complete: () => {
  //         console.log('Restaurant data fetch complete');
  //       }
  //     });
  // }

  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cacheService.getRestaurants(this.page, this.pageSize, this.sortBy, this.sortOrder)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.log(`Retry attempt ${retryCount}`);
            return timer(Math.pow(2, retryCount) * 1000);
          }
        })
      )
      .subscribe({
        next: (data: RestaurantListResponse) => {
          this.restaurants = data.restaurants;
          this.totalPages = Math.ceil(data.totalCount / data.pageSize);
          this.page = data.page;
          this.pageSize = data.pageSize;
          this.isLoading = false;

          // Reset loading states
          this.loadingStates.pagination = false;
          this.loadingStates.sorting = false;

          this.cdr.markForCheck();
          setTimeout(() => this.preloadNextPage(), 1000);
        },
        error: (err: any) => {
          console.error('Error fetching restaurants after retries:', err);
          this.errorMessage = "Can't fetch restaurants. Please try again.";
          this.isLoading = false;

          // Reset loading states
          this.loadingStates.pagination = false;
          this.loadingStates.sorting = false;

          this.cdr.markForCheck();
        }
      });
  }

  private preloadNextPage(): void {
    if (this.page < this.totalPages) {
      this.cacheService.getRestaurants(this.page + 1, this.pageSize, this.sortBy, this.sortOrder)
        .subscribe(); // Just cache it silently
    }
  }

  loadingStates = {
    initial: false,
    pagination: false,
    sorting: false
  };

  onPageChange(event: { page: number; pageSize: number }): void {
    this.loadingStates.pagination = true;
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadRestaurants();
  }

  onSortChanged(event: { sortBy: string; sortOrder: string }): void {
    this.loadingStates.sorting = true;
    this.sortBy = event.sortBy;
    this.sortOrder = event.sortOrder;
    this.page = 1;
    this.sortSubject.next(event);
  }

  private loadRestaurantsObservable(): Observable<RestaurantListResponse> {
    this.isLoading = true;
    return this.getService.get<RestaurantListResponse>({
      url: '/restaurants',
      query: this.buildQuery(),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).pipe(
      tap((data: RestaurantListResponse) => {
        this.restaurants = data.restaurants;
        this.totalPages = Math.ceil(data.totalCount / data.pageSize);
        this.isLoading = false;
      }),
      catchError((err: any) => {
        this.errorMessage = "Can't fetch restaurants";
        this.isLoading = false;
        throw err;
      })
    );
  }

  trackByRestaurantId(index: number, restaurant: CustomerRestaurant): number {
    return restaurant.id;
  }

  showRestaurantDetails(restaurantId: number): void {
    if (this.isNavigating) return;

    this.isNavigating = true;
    const navigationExtras: NavigationExtras = { state: { restId: restaurantId } };
    this.router.navigate(['/customer/restaurant-details', restaurantId], navigationExtras)
      .finally(() => this.isNavigating = false);
  }
}
