import { Component } from '@angular/core';
import { OrderStatusCardsComponent } from '../order-status-cards-component/order-status-cards-component';
import { OrdersTableComponent } from '../orders-table-component/orders-table-component';
import { CategoryManagementPanelComponent } from '../category-management-panel-component/category-management-panel-component';
import { SalesChartComponent } from '../sales-chart-component/sales-chart-component';
import { ChefPerformanceChartComponent } from '../chef-performance-chart-component/chef-performance-chart-component';

@Component({
  selector: 'app-order-management',
  imports: [
    OrderStatusCardsComponent,
    OrdersTableComponent,
    CategoryManagementPanelComponent,
    SalesChartComponent,
  ],
  templateUrl: './order-management-component.html',
  styleUrl: './order-management-component.css',
})
export class OrderManagementComponent {}
