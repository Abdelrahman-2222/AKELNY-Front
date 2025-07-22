import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TrendingDishCardComponent } from '../trending-dish-card/trending-dish-card.component';

@Component({
  selector: 'app-trending-dishes',
  standalone: true,
  imports: [NgFor, LucideAngularModule, TrendingDishCardComponent],
  templateUrl: './trending-dishes.component.html',
  styleUrl: './trending-dishes.component.css',
})
export class TrendingDishesComponent {
  trendingDishes = [
    { name: 'Margherita Pizza', price: 12.99, chef: 'Houri Chon', rating: 4.9 },
    { name: 'Shond Vrams', price: 13.9, chef: 'Asuri Chon', rating: 4.7 },
    { name: 'Con Atk Songs', price: 11.5, chef: 'Anwi Choin', rating: 4.5 },
  ];
}
