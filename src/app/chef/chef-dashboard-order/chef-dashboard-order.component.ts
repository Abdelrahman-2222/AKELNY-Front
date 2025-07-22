import { Component, Input } from '@angular/core';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-chef-dashboard-order',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './chef-dashboard-order.component.html',
  styleUrl: './chef-dashboard-order.component.css',
})
export class ChefDashboardOrderComponent {
  @Input()
  order!: ChefCurrentOrder;
}
