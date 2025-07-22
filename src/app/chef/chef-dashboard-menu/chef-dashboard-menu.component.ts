import { Component } from '@angular/core';
import { ChefDashboardItemComponent } from '../chef-dashboard-item/chef-dashboard-item.component';

@Component({
  selector: 'app-chef-dashboard-menu',
  standalone: true,
  imports: [ChefDashboardItemComponent],
  templateUrl: './chef-dashboard-menu.component.html',
  styleUrl: './chef-dashboard-menu.component.css',
})
export class ChefDashboardMenuComponent {}
