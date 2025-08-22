import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule, Package } from 'lucide-angular';
import { NgFor, NgIf } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';
import { CustomerRestaurant } from '../../../models/CustomerRestaurant.model';
import { FilterRestaurantView } from '../../../shared/components/filters/filter-restaurant-view/filter-restaurant-view';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Router, NavigationExtras } from '@angular/router';
import { CartService } from '../../cart/cart.service';

@Component({
  selector: 'app-restaurant-component',
  imports: [LucideAngularModule, FilterRestaurantView, Pagination, NgFor, NgIf],
  templateUrl: './restaurant-component.html',
  styleUrl: './restaurant-component.css'
})
export class RestaurantComponent implements OnInit {
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
  }

  private buildQuery(): string {
    const sorts = this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '';
    return `${sorts}page=${this.page}&pageSize=${this.pageSize}`;
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.getService
      .get<{ categories: CustomerRestaurant[]; totalCount: number }>({
        url: '/restaurants',
        query: this.buildQuery(),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      .subscribe({
        next: (data) => {
          this.restaurants = data.categories;
          this.totalPages = data.totalCount;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching restaurants:', err);
        },
        complete: () => {
          console.log('Restaurant data fetch complete');
        }
      });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.isLoading = false;
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.errorMessage = "Can't fetch restaurants";
    this.loadRestaurants();
  }

  onSortChanged(event: { sortBy: string; sortOrder: string }): void {
    this.sortBy = event.sortBy;
    this.sortOrder = event.sortOrder;
    this.loadRestaurants();
  }

  showRestaurantDetails(restaurantId: number): void {
    const navigationExtras: NavigationExtras = { state: { restId: restaurantId } };
    this.router.navigate(['/customer/restaurant-details', restaurantId], navigationExtras);
  }
}
