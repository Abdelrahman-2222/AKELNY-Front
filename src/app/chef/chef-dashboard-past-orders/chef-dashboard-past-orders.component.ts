import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ChefDashboardService } from '../chef-dashboard.service';
import { ChefDashboardPastOrderComponent } from '../chef-dashboard-past-order/chef-dashboard-past-order.component';

@Component({
  selector: 'app-chef-dashboard-past-orders',
  standalone: true,
  imports: [ChefDashboardPastOrderComponent, NgFor],
  templateUrl: './chef-dashboard-past-orders.component.html',
  styleUrl: './chef-dashboard-past-orders.component.css',
})
export class ChefDashboardPastOrdersComponent {
  public chefDashboardService: ChefDashboardService;
  constructor(chefDashboardService: ChefDashboardService) {
    this.chefDashboardService = chefDashboardService;
  }
}
