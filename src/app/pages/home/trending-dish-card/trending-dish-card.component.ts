import { Component, Input } from '@angular/core';
import { TrendingDish } from '../../../models/TrendingDish';

@Component({
  selector: 'app-trending-dish-card',
  standalone: true,
  imports: [],
  templateUrl: './trending-dish-card.component.html',
  styleUrl: './trending-dish-card.component.css',
})
export class TrendingDishCardComponent {
  @Input() dish!: TrendingDish;
}
