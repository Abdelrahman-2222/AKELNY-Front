import { Component, Input } from '@angular/core';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { ChefPastOrder } from '../../models/ChefPastOrder.model';

@Component({
  selector: 'app-chef-dashboard-past-order',
  standalone: true,
  imports: [],
  templateUrl: './chef-dashboard-past-order.component.html',
  styleUrl: './chef-dashboard-past-order.component.css',
})
export class ChefDashboardPastOrderComponent {
  @Input()
  order!: ChefPastOrder;
}
