// TypeScript
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Package } from 'lucide-angular';
import { NgFor, NgIf } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';
import { CustomerRestaurant } from '../../../models/CustomerRestaurant.model';
import { FilterRestaurantView } from '../../../shared/components/filters/filter-restaurant-view/filter-restaurant-view';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Router, NavigationExtras } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { retry } from 'rxjs/operators';
import { timer } from 'rxjs';
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

  loadingStates = {
    initial: false,
    pagination: false,
    sorting: false
  };

  ngOnInit(): void {
    this.loadRestaurants();
  }

  public loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cacheService
      .getRestaurants(this.page, this.pageSize, this.sortBy, this.sortOrder)
      .pipe(
        retry({
          count: 3,
          delay: (_error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
        })
      )
      .subscribe({
        next: (data: RestaurantListResponse) => {
          this.restaurants = data.restaurants;

          // Use consistent pageSize - prefer the one from component
          this.totalPages = Math.ceil(data.totalCount / this.pageSize);
          this.page = data.page;

          // Log for debugging
          // console.log('Pagination debug:', {
          //   totalCount: data.totalCount,
          //   frontendPageSize: this.pageSize,
          //   backendPageSize: data.pageSize,
          //   calculatedTotalPages: this.totalPages,
          //   currentPage: this.page
          // });

          this.isLoading = false;
          this.loadingStates.pagination = false;
          this.loadingStates.sorting = false;

          this.cdr.markForCheck();
        },
        error: (err: any) => {
          // console.error('Error fetching restaurants after retries:', err);
          this.errorMessage = "Can't fetch restaurants. Please try again.";
          this.isLoading = false;
          this.loadingStates.pagination = false;
          this.loadingStates.sorting = false;
          this.cdr.markForCheck();
        }
      });
  }

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
    this.loadRestaurants();
  }

  trackByRestaurantId(_index: number, restaurant: CustomerRestaurant): number {
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
