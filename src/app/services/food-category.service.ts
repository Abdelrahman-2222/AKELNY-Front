import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FoodCategoryService {
  categories = [
    { name: 'Italian', icon: 'pizza', chefs: 12 },
    { name: 'Mexican', icon: 'taco', chefs: 8 },
    { name: 'Indian', icon: 'curry', chefs: 15 },
    { name: 'Desserts', icon: 'cupcake', chefs: 10 },
  ];
  
}
