import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7045/api/OrderManagement';

  acceptOrder(orderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${orderId}/accept`, {});
  }

  rejectOrder(orderId: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${orderId}/reject`, { reason });
  }
  getChefCurrentOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/chef/current`);
  }

  // Fetch full details for one order (items, customer, address, totals, etc.)
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/${orderId}`);
  }

  // Optional: update statuses from the card actions
  markAsReady(orderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${orderId}/ready`, {});
  }

  completeOrder(orderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${orderId}/complete`, {});
  }

}
