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
  page = 1;
  pageSize = 3;
  totalPages = 0;

  ngOnInit(): void {
    //restaurants
    this.loadRestaurants();
  }
 loadRestaurants(): void {
    this.getService.get<CustomerRestaurant[]>({
      url: 'https://localhost:7045/api/restaurants?'+`page=${this.page}&pageSize=${this.pageSize}`,
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
  //temp
  chefs: Chef[] = [
    // Add sample chef data here
    {
      id: 1,
      name: 'Chef John',
      location: 'New York',
      speciality: 'Italian Cuisine',
      rating: 4.5,
      reviews: 120,
      deliveryTime: '30 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    },
    {
      id: 2,
      name: 'Chef Maria',
      location: 'Los Angeles',
      speciality: 'Mexican Cuisine',
      rating: 4.7,
      reviews: 200,
      deliveryTime: '25 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    },
    {
      id: 2,
      name: 'Chef Maria',
      location: 'Los Angeles',
      speciality: 'Mexican Cuisine',
      rating: 4.7,
      reviews: 200,
      deliveryTime: '25 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    },
    {
      id: 2,
      name: 'Chef Maria',
      location: 'Los Angeles',
      speciality: 'Mexican Cuisine',
      rating: 4.7,
      reviews: 200,
      deliveryTime: '25 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    },
    {
      id: 2,
      name: 'Chef Maria',
      location: 'Los Angeles',
      speciality: 'Mexican Cuisine',
      rating: 4.7,
      reviews: 200,
      deliveryTime: '25 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    },
    {
      id: 2,
      name: 'Chef Maria',
      location: 'Los Angeles',
      speciality: 'Mexican Cuisine',
      rating: 4.7,
      reviews: 200,
      deliveryTime: '25 mins',
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      foodImage: 'https://wallpapercat.com/w/full/3/a/e/2143097-1920x1080-desktop-1080p-healthy-food-background-photo.jpg'
    }
  ];
  //temp
}
