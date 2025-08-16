import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7045/api/OrderManagement';

  // acceptOrder(orderId: number): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/${orderId}/accept`, {});
  // }
  async acceptOrder() {
    this.isProcessing = true;
    try {
      const response = await this.orderManagementService.acceptOrder(this.order.id).toPromise();
      this.order.status = 'accepted';
      this.addTimelineEvent('Order accepted by chef', 'success');
    } catch (error) {
      console.error('Failed to accept order:', error);
      // Optionally show user feedback
    } finally {
      this.isProcessing = false;
    }
  }

  rejectOrder(orderId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${orderId}/reject`, { reason });
  }
}
