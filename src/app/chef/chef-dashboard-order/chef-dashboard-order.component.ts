import { Component, Input } from '@angular/core';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';

@Component({
  selector: 'app-chef-dashboard-order',
  standalone: true,
  imports: [],
  templateUrl: './chef-dashboard-order.component.html',
  styleUrl: './chef-dashboard-order.component.css',
})
export class ChefDashboardOrderComponent {
  @Input()
  order!: ChefCurrentOrder;
}
