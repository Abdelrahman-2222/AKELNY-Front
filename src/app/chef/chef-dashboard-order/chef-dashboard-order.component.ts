// TypeScript
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { SignalrService } from '../../services/signalr.service';
import { LucideAngularModule, Clock, Star, CheckCircle, XCircle, DollarSign, User, Package, Timer, AlertCircle } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { OrderManagementService } from '../../services/order-management-service';

@Component({
  selector: 'app-chef-dashboard-order',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './chef-dashboard-order.component.html',
  styleUrl: './chef-dashboard-order.component.css'
})
export class ChefDashboardOrderComponent implements OnInit, OnDestroy {
  @Input() order!: ChefCurrentOrder;
  @Input() chefId!: string;

  readonly Clock = Clock;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly DollarSign = DollarSign;
  readonly User = User;
  readonly Package = Package;
  readonly Timer = Timer;
  readonly AlertCircle = AlertCircle;

  isProcessing = false;
  orderTimeline: any[] = [];

  private signalrService = inject(SignalrService);
  private subscriptions: Subscription[] = [];
  private orderManagementService = inject(OrderManagementService);

  ngOnInit() {
    this.subscriptions.push(
      this.signalrService.getConnectionStatus().subscribe(connected => {
        if (connected && this.chefId) {
          this.signalrService.joinChefGroup(this.chefId);
        }
      })
    );

    this.setupSignalRSubscriptions();
    this.initializeOrderTimeline();
  }

  ngOnDestroy() {
    if (this.chefId) {
      this.signalrService.leaveChefGroup(this.chefId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSignalRSubscriptions() {
    this.subscriptions.push(
      this.signalrService.getOrderRequests().subscribe((orderData) => {
        if (orderData && orderData.id === this.order.id) {
          this.order = { ...this.order, ...orderData };
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.getOrderPaidNotifications().subscribe((notification) => {
        if (notification && notification.orderId === this.order.id) {
          this.order.paymentStatus = 'paid';
          this.addTimelineEvent('Payment received', 'success');
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.getOrderPaymentCancelledNotifications().subscribe((notification) => {
        if (notification && notification.orderId === this.order.id) {
          this.order.paymentStatus = 'cancelled';
          this.addTimelineEvent('Payment cancelled', 'error');
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((u) => {
        if (u && u.orderId === this.order.id) {
          this.order.status = u.status;
          this.addTimelineEvent(`Order status: ${u.status}`, 'info');
        }
      })
    );
  }

  async acceptOrder() {
    this.isProcessing = true;
    try {
      await this.orderManagementService.acceptOrder(this.order.id).toPromise();
      this.order.status = 'accepted';
      this.addTimelineEvent('Order accepted by chef', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  async rejectOrder() {
    this.isProcessing = true;
    try {
      await this.orderManagementService.rejectOrder(this.order.id, 'Chef declined').toPromise();
      this.order.status = 'rejected';
      this.addTimelineEvent('Order rejected by chef', 'error');
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  // For now, these methods just update the UI status since backend doesn't support them
  async markAsReady() {
    this.isProcessing = true;
    try {
      // Update locally until backend supports this
      this.order.status = 'ready';
      this.addTimelineEvent('Order marked as ready', 'info');
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  async completeOrder() {
    this.isProcessing = true;
    try {
      // Update locally until backend supports this
      this.order.status = 'completed';
      this.addTimelineEvent('Order completed', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  getOrderStatusClass(): string {
    return this.order?.status || 'pending';
  }


  getStatusText(): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'in_progress': 'In Progress',
      'ready': 'Ready',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'paid': 'Paid',
      'cancelled': 'Cancelled'
    };
    return statusMap[this.order?.status || 'pending'] || 'Unknown';
  }

  showPaymentStatus(): boolean {
    return ['accepted', 'ready', 'completed'].includes(this.order.status);
  }

  getPaymentStatusClass(): string {
    const paymentStatus = this.order.paymentStatus || 'pending';
    return `payment-${paymentStatus}`;
  }

  getPaymentIcon() {
    const paymentStatus = this.order.paymentStatus || 'pending';
    switch (paymentStatus) {
      case 'paid':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  }

  getPaymentStatusText(): string {
    const paymentStatus = this.order.paymentStatus || 'pending';
    const statusMap: { [key: string]: string } = {
      'paid': 'Payment Received',
      'pending': 'Awaiting Payment',
      'cancelled': 'Payment Cancelled'
    };
    return statusMap[paymentStatus] || 'Payment Status Unknown';
  }

  isPastOrder(): boolean {
    return ['completed', 'rejected', 'cancelled'].includes(this.order.status);
  }

  private initializeOrderTimeline() {
    this.orderTimeline = [
      {
        event: 'Order placed',
        time: new Date(this.order?.createdAt || Date.now()).toLocaleTimeString(),
        type: 'info'
      }
    ];
  }

  private addTimelineEvent(event: string, type: 'success' | 'info' | 'warning' | 'error') {
    this.orderTimeline.push({
      event,
      time: new Date().toLocaleTimeString(),
      type
    });
  }
}
