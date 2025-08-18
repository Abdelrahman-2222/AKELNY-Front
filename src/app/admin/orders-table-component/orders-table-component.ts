import { Component } from '@angular/core';
import { NgClass, CurrencyPipe } from '@angular/common';
import { Order, OrderStatus } from '../../models/order-model';

@Component({
  selector: 'app-orders-table',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './orders-table-component.html',
  styleUrl: './orders-table-component.css',
})
export class OrdersTableComponent {
  sortColumn = 'customer';
  sortDirection: 'asc' | 'desc' = 'asc';

  tableHeaders = [
    { key: 'customer', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'intervention', label: 'All Inverventon' },
    { key: 'total', label: 'All Orders' },
  ];

  orders: Order[] = [
    {
      id: '1',
      customer: 'Left C43',
      status: OrderStatus.PENDING,
      intervention: 'All Invervenron',
      total: 42.99,
      items: [],
    },
    // More orders...
  ];

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Sorting logic would go here
  }

  getStatusClasses(status: OrderStatus) {
    return {
      'bg-yellow-100 text-yellow-800': status === OrderStatus.PENDING,
      'bg-green-100 text-green-800': status === OrderStatus.APPROVED,
      'bg-red-100 text-red-800': status === OrderStatus.SUSPENDED,
      'bg-blue-100 text-blue-800': status === OrderStatus.COMPLETED,
    };
  }
}
