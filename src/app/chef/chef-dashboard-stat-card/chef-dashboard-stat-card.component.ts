import { Component, Input } from '@angular/core';
import { StatCard } from '../../models/StatCard.model';

@Component({
  selector: 'app-chef-dashboard-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './chef-dashboard-stat-card.component.html',
  styleUrl: './chef-dashboard-stat-card.component.css',
})
export class ChefDashboardStatCardComponent {
  @Input()
  stat!: StatCard;
}
