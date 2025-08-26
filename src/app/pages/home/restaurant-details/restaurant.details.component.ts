import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantDetails } from '../../../models/RestaurantDetails.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CartService } from '../../cart/cart.service';
import { RestaurantCacheService } from '../../../services/restaurant-cache.service';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Package } from 'lucide-angular';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant.details.component.html',
  imports: [CommonModule, Pagination, LucideAngularModule],
})
export class RestaurantDetailsComponent implements OnInit, OnDestroy {
  readonly Package = Package;
  router = inject(Router);
  cartService = inject(CartService);
  restaurantCacheService = inject(RestaurantCacheService);
  route = inject(ActivatedRoute);

  basicInfoLoaded = false;
  itemsLoaded = false;

  private destroy$ = new Subject<void>();

  restId: number = 0;
  restDetails: RestaurantDetails | null = null;
  loading = false;
  error: string | null = null;

  page = 1;
  pageSize = 4;
  totalPages = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params) => {
      const restaurantId = params.get('id');
      if (restaurantId) {
        this.restId = +restaurantId;
        this.loadRestaurantData();
      }
    });
  }

  loadRestaurantData(forceRefresh = false): void {
    this.error = null;
    this.loading = true;

    if (forceRefresh) {
      const cacheKey = `${this.restId}-${this.page}-${this.pageSize}`;
      this.restaurantCacheService['itemsCache'].delete(cacheKey);
    }

    this.restaurantCacheService
      .getRestaurantItems(this.restId, this.page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.restDetails = {
            resName: data.resName,
            resImage: data.resImage,
            rating: data.rating,
            location: data.location,
            categories: data.categories || [],
            items: data.items || [],
            totalPages: data.totalPages,
            currentPage: data.currentPage || this.page,
            totalItems: data.totalItems || 0,
            pageSize: data.pageSize || this.pageSize
          };

          this.totalPages = data.totalPages;
          this.page = data.currentPage;
          this.basicInfoLoaded = true;
          this.itemsLoaded = true;
          this.loading = false;

          // Preload next page for better UX
          if (this.page < this.totalPages) {
            this.restaurantCacheService.preloadNextPage(this.restId, this.page, this.pageSize);
          }
        },
        error: (err) => {
          this.error = 'Failed to load restaurant details';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    if (event.page === this.page && event.pageSize === this.pageSize) {
      return;
    }

    this.page = event.page;
    this.pageSize = event.pageSize;
    this.itemsLoaded = false;
    this.loadRestaurantData();
  }

  get showContent(): boolean {
    return this.basicInfoLoaded && !this.error;
  }

  get showItems(): boolean {
    return this.itemsLoaded && (this.restDetails?.items?.length || 0) > 0;
  }

  showItemDetails(itemId: number): void {
    this.router.navigate(['/customer/item-details', itemId]);
  }

  refreshData(): void {
    this.loadRestaurantData(true);
  }

  showCategoryItems(catId: number): void {
    this.router.navigate(['/customer/restaurant-category-items', this.restId, catId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
