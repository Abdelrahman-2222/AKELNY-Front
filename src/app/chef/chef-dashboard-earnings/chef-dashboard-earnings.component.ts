import { Component } from '@angular/core';
import { ChefPayoutComponent } from '../chef-payout/chef-payout.component';

@Component({
  selector: 'app-chef-dashboard-earnings',
  standalone: true,
  imports: [ChefPayoutComponent],
  templateUrl: './chef-dashboard-earnings.component.html',
  styleUrl: './chef-dashboard-earnings.component.css',
})
export class ChefDashboardEarningsComponent {}
