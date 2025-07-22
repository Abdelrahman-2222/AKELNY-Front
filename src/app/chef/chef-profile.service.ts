import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChefProfileService {
  chef = {
    name: 'Houri Chon',
    specialty: 'Special Fonus',
    rating: 4.2,
    reviews: 18,
    deliveryTime: '30-40 min',
    about:
      'Passionate home chef specializing in authentic homemade dishes with a modern twist.',
  };

  menuItems = [
    {
      name: 'Shond Vrams',
      price: 13.9,
      description: 'Conl Intasto eothime inetrafine',
      category: 'Main',
    },
    {
      name: 'Mods Walp',
      price: 13.9,
      description: 'Now Intaste eothime tiretrafine',
      category: 'Main',
    },
    {
      name: 'Trawing',
      price: 11.5,
      description: 'Cow Intaste eothime trodtarine',
      category: 'Appetizer',
    },
    {
      name: 'Mat Diem',
      price: 12.9,
      description: 'Cow Intcale eothime imbrotrine',
      category: 'Dessert',
    },
  ];

  reviews = [
    {
      user: 'Dolicious Pizza',
      rating: 5,
      date: '1 month ago',
      comment:
        'The Margherita Pizza was absolutely delicious! The crust was perfect, and the toppings were fresh and flavorful.',
    },
    {
      user: 'Fresh and Tasty!',
      rating: 5,
      date: '1 month ago',
      comment:
        'Really enjoyed the Margherita Pizza. The ingredients were fresh, and the pizza had just the right amount of cheese and sauce.',
    },
  ];

  activeTab: 'menu' | 'reviews' | 'about' = 'menu';

  setActiveTab(tab: 'menu' | 'reviews' | 'about') {
    this.activeTab = tab;
  }

  getStars(rating: number) {
    return Array(5)
      .fill(0)
      .map((_, i) => i < rating);
  }
}
