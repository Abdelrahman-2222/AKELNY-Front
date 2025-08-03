import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FoodCategoryCardComponent } from '../food-category-card/food-category-card.component';
import { NgFor } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';
import { CustomerRestaurant } from '../../../models/CustomerRestaurant.model'; // Assuming you have a Restaurant model defined
import { FilterItemView } from '../../../shared/components/filters/filter-item-view/filter-item-view';
import { FilterRestaurantView } from '../../../shared/components/filters/filter-restaurant-view/filter-restaurant-view';
import { Pagination } from '../../../shared/components/pagination/pagination';


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
  imports: [LucideAngularModule, FoodCategoryCardComponent, FilterRestaurantView,FilterItemView, Pagination,NgFor],
  templateUrl: './restaurant-component.html',
})
export class RestaurantComponent implements OnInit {
  getService = inject(GetService);
  restaurants: CustomerRestaurant[] = [];


  //pagination
  page = 1;
  pageSize = 3;
  totalPages = 0;

  //sorting
  sortBy: string = '';
  sortOrder: string = ''; // 'asc' for ascending, 'desc' for descending
  url = 'https://localhost:7045/api/restaurants?' +
      (this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '') +
      `page=${this.page}&pageSize=${this.pageSize}`

  ngOnInit(): void {
    //restaurants
    this.loadRestaurants();
  }
 loadRestaurants(): void {
    this.getService.get<CustomerRestaurant[]>({
      url:'https://localhost:7045/api/restaurants?' +
      (this.sortBy ? `sorts=${this.sortOrder}${this.sortBy}&` : '') +
      `page=${this.page}&pageSize=${this.pageSize}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }
    ).subscribe({
      next: (data: any) => {
        this.restaurants = data.categories;
        this.totalPages = data.totalCount;
        console.log(this.restaurants);
      }
      , error: (err) => {
        console.error('Error fetching restaurants:', err);
      }
      , complete: () => {
        console.log('Restaurant data fetch complete');
      }
    })
  }

onPageChange(event: { page: number; pageSize: number }): void {
  this.page = event.page;
  this.pageSize = event.pageSize;
  this.loadRestaurants();
}
onSortChanged(event: { sortBy: string; sortOrder: string }): void {
  this.sortBy = event.sortBy;
  this.sortOrder = event.sortOrder;
  // Here you can implement the logic to sort the restaurants based on the selected criteria
  // For example, you might want to call a service to fetch sorted data from the backend
  console.log(this.url);
  // You can also update the restaurant list based on the sorting criteria
  this.loadRestaurants();
}

}
