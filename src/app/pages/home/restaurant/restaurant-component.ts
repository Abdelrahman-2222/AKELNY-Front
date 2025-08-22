import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule,Package } from 'lucide-angular';
import { NgFor, NgIf } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';
import { CustomerRestaurant } from '../../../models/CustomerRestaurant.model'; // Assuming you have a Restaurant model defined
import { FilterRestaurantView } from '../../../shared/components/filters/filter-restaurant-view/filter-restaurant-view';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Router, NavigationExtras } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { environment } from '../../../../environments/environment';


interface Chef {
  id: number;
  name: string;
  location: string;
  speciality: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  image: string;
  foodImage: string;
}

@Component({
  selector: 'app-restaurant-component',
  imports: [
    LucideAngularModule,
    FilterRestaurantView,
    Pagination,
    NgFor,
    NgIf
  ],
  templateUrl: './restaurant-component.html',
  styleUrl:'./restaurant-component.css'
})
export class RestaurantComponent implements OnInit {

  readonly Package = Package;
  isLoading = true;
  errorMessage = ''

  getService = inject(GetService);
  router = inject(Router);
  cartService: CartService = inject(CartService);

  restaurants: CustomerRestaurant[] = [];

  //pagination
  page = 1;
  pageSize = 3;
  totalPages = 0;

  //sorting
  sortBy: string = '';
  sortOrder: string = ''; // 'asc' for ascending, 'desc' for descending
  url =
    `${environment.apiUrl}/restaurants?` +
    (this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '') +
    `page=${this.page}&pageSize=${this.pageSize}`;

  ngOnInit(): void {
    //restaurants
    this.loadRestaurants();
  }
  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.getService
      .get<CustomerRestaurant[]>({
        url:
          `${environment.apiUrl}/api/restaurants?` +
          (this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '') +
          `page=${this.page}&pageSize=${this.pageSize}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      })
      .subscribe({
        next: (data: any) => {
          this.restaurants = data.categories;
          this.totalPages = data.totalCount;
          this.isLoading = false;
          // console.log(this.restaurants);
        },
        error: (err) => {
          console.error('Error fetching restaurants:', err);
        },
        complete: () => {
          console.log('Restaurant data fetch complete');
        },
      });
  }
  onPageChange(event: { page: number; pageSize: number }): void {
    this.isLoading = false;
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.errorMessage = "Can't fetch restaurants"
    this.loadRestaurants();
  }
  onSortChanged(event: { sortBy: string; sortOrder: string }): void {
    this.sortBy = event.sortBy;
    this.sortOrder = event.sortOrder;
    // Here you can implement the logic to sort the restaurants based on the selected criteria
    // For example, you might want to call a service to fetch sorted data from the backend
    // console.log(this.url);
    // You can also update the restaurant list based on the sorting criteria
    this.loadRestaurants();
  }
  showRestaurantDetails(restaurantId: number): void {
    const data = {
      restId: restaurantId,
    };
    const navigationExtras: NavigationExtras = {
      state: data,
    };
    // console.log(`restaurantId : ${restaurantId}`);
    this.router.navigate(
      ['/customer/restaurant-details', restaurantId],
      navigationExtras
    );
  }
}
