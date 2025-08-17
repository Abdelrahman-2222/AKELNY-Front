import { FoodCategoryService } from './../../../services/food-category.service';
import {CommonModule, NgFor} from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FoodCategoryCardComponent } from '../food-category-card/food-category-card.component';

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
  selector: 'app-categories',
  standalone: true,
  imports: [LucideAngularModule, FoodCategoryCardComponent, CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent {
  /**
   *
   */
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
  constructor(public categoryService: FoodCategoryService) { }
}
