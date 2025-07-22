import { Component, Input } from '@angular/core';
import { TrendingDish } from '../../../models/TrendingDish';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-trending-dish-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './trending-dish-card.component.html',
  styleUrl: './trending-dish-card.component.css',
})
export class TrendingDishCardComponent {
  @Input() dish!: TrendingDish;
}
