import { Component, Input } from '@angular/core';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { ChefPastOrder } from '../../models/ChefPastOrder.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-chef-dashboard-past-order',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './chef-dashboard-past-order.component.html',
  styleUrl: './chef-dashboard-past-order.component.css',
})
export class ChefDashboardPastOrderComponent {
  @Input()
  order!: ChefPastOrder;
}
