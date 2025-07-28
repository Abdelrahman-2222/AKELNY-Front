import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';
import { Footer } from '../../../shared/components/footer/footer';
import { CategoriesComponent } from '../categories/categories.component';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  imports: [CommonModule, CategoriesComponent],
})
export class RestaurantComponent {
  chefInfo = {
    name: 'Home Chef',
    role: 'Home Chef',
    image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
    bannerImage: 'assets/images/banner-food.jpg'
  };

  menuItems: MenuItem[] = [
    // Add your menu items here
    {
      id: 1,
      name: "Somthing",
      description: "Delicious food",
      price: 5.99,
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      category: "pizza"
    },
     {
      id: 1,
      name: "Somthing",
      description: "Delicious food",
      price: 5.99,
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      category: "pizza"
    },
     {
      id: 1,
      name: "Somthing",
      description: "Delicious food",
      price: 5.99,
      image: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
      category: "pizza"
    },

  ];

  categories = ['Categrily', 'Metegrily'];
}
