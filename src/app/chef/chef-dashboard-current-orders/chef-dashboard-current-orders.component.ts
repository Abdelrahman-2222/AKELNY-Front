import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ChefDashboardOrderComponent } from '../chef-dashboard-order/chef-dashboard-order.component';
import { ChefDashboardService } from '../chef-dashboard.service';

@Component({
  selector: 'app-chef-dashboard-current-orders',
  standalone: true,
  imports: [NgFor, ChefDashboardOrderComponent],
  templateUrl: './chef-dashboard-current-orders.component.html',
  styleUrl: './chef-dashboard-current-orders.component.css',
})
export class ChefDashboardCurrentOrdersComponent {
  public chefDashboardService: ChefDashboardService;
  constructor(chefDashboardService: ChefDashboardService) {
    this.chefDashboardService = chefDashboardService;
  }
}
