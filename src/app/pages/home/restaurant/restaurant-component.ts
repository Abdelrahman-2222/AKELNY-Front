import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FoodCategoryCardComponent } from '../food-category-card/food-category-card.component';
import { NgFor } from '@angular/common';
import { GetService } from '../../../services/requests/get-service';


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
  imports: [LucideAngularModule, FoodCategoryCardComponent, NgFor],
  templateUrl: './restaurant-component.html',
})
export class RestaurantComponent implements OnInit {
  getService = inject(GetService);
  restaurants: any[] = [];

  ngOnInit(): void {
    try {
      var restaurants = this.getService.get({
        url: 'https://localhost:7045/api/restaurants',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      ).subscribe((data) => {
        console.log(data)
      })

    }catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  }


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
}
