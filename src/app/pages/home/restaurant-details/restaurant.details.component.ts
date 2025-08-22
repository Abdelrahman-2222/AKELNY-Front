import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { RestaurantDetails } from '../../../models/RestaurantDetails.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CartService } from '../../cart/cart.service';
import { RestaurantCacheService } from '../../../services/restaurant-cache.service';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule , Package} from 'lucide-angular';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant.details.component.html',
  imports: [CommonModule, Pagination,LucideAngularModule],
})
export class RestaurantDetailsComponent implements OnInit, OnDestroy {
  readonly Package = Package;
  router = inject(Router);
  cartService = inject(CartService);
  restaurantCacheService = inject(RestaurantCacheService);
  route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  restId: number = 0;
  restDetails: RestaurantDetails | null = null;
  loading = false;
  error: string | null = null;

  // Pagination
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
        this.loadRestaurantDetails();
      } else {
        console.error('No restaurant ID found in the route parameters.');
      }
    });
  }

  loadRestaurantDetails(forceRefresh = false): void {
    this.loading = true;
    this.error = null;

    this.restaurantCacheService
      .getRestaurantDetails(this.restId, this.page, this.pageSize, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.restDetails = data;
          this.totalPages = data.totalPages;
          this.loading = false;
          console.log('Restaurant details loaded:', this.restDetails);
        },
        error: (err) => {
          this.error = 'Failed to load restaurant details';
          this.loading = false;
          console.error('Error fetching restaurant details:', err);
        }
      });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadRestaurantDetails();
  }

  showItemDetails(itemId: number): void {
    console.log(`Navigating to item: ${itemId}`);
    this.router.navigate(['/customer/item-details', itemId]);
  }

  refreshData(): void {
    this.loadRestaurantDetails(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showCategoryItems(catId:number):void{


    this.router.navigate(['/customer/restaurant-category-items', this.restId ,catId]);
  }

}
