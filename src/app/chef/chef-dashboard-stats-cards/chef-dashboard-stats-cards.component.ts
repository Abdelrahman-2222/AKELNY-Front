import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ChefDashboardService } from '../chef-dashboard.service';
import { ChefDashboardStatCardComponent } from '../chef-dashboard-stat-card/chef-dashboard-stat-card.component';

@Component({
  selector: 'app-chef-dashboard-stats-cards',
  standalone: true,
  imports: [ChefDashboardStatCardComponent, NgFor],
  templateUrl: './chef-dashboard-stats-cards.component.html',
  styleUrl: './chef-dashboard-stats-cards.component.css',
})
export class ChefDashboardStatsCardsComponent {
  public chefDashboardService: ChefDashboardService;
  constructor(chefDashboardService: ChefDashboardService) {
    this.chefDashboardService = chefDashboardService;
  }
}
