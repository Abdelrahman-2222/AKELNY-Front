import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { SignalrService } from '../../services/signalr.service';
import { LucideAngularModule, Clock, Star, CheckCircle, XCircle, DollarSign, User, Package, Timer, AlertCircle } from 'lucide-angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { OrderManagementService } from '../../services/order-management-service';
import { ActivatedRoute } from '@angular/router';

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

  // Live orders workspace state
  orders: ChefCurrentOrder[] = [];
  selectedOrderId: number | null = null;
  selectedOrderDetails: any | null = null;

  // Simple stats
  earningsToday = 0;
  totalOrders = 0;
  paidOrders = 0;

  private signalrService = inject(SignalrService);
  private subscriptions: Subscription[] = [];
  private orderManagementService = inject(OrderManagementService);
  private route = inject(ActivatedRoute);

  // When navigated via route without @Input(), we fallback to this id
  private routeOrderId: number | null = null;

  ngOnInit() {
    // Resolve route order id if present
    if (!this.order) {
      const paramId = this.route.snapshot.paramMap.get('orderId') ?? this.route.snapshot.queryParamMap.get('orderId');
      const normalized = paramId != null ? Number(paramId) : NaN;
      if (Number.isFinite(normalized)) {
        this.routeOrderId = normalized;
      }
    }

    // Join group on connect
    this.subscriptions.push(
      this.signalrService.getConnectionStatus().subscribe(connected => {
        if (connected && this.chefId) {
          this.signalrService.joinChefGroup(this.chefId);
        }
      })
    );

    // Load initial orders and maybe select one
    this.loadInitialOrders();

    // SignalR streams
    this.setupSignalRSubscriptions();

    // Initialize timeline for selected card fallback
    this.initializeOrderTimeline();
  }

  ngOnDestroy() {
    if (this.chefId) {
      this.signalrService.leaveChefGroup(this.chefId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load all current orders for the chef
  private loadInitialOrders() {
    this.orderManagementService.getChefCurrentOrders().subscribe({
      next: (rows) => {
        // Map backend rows to ChefCurrentOrder (adjust mapping as needed)
        this.orders = (rows || []).map((r: any) => ({
          id: Number(r.id ?? r.orderId),
          customer: r.customerName ?? r.customer ?? 'Customer',
          items: Array.isArray(r.items) ? r.items.length : (Number(r.itemsCount) || 0),
          amount: Number(r.totalAmount ?? r.amount ?? r.total ?? 0),
          time: new Date(r.createdAt ?? Date.now()).toLocaleTimeString(),
          status: (String(r.status || 'pending').toLowerCase() as ChefCurrentOrder['status']),
          paymentStatus: (String(r.paymentStatus || 'pending').toLowerCase() as ChefCurrentOrder['paymentStatus']),
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
        }));

        this.totalOrders = this.orders.length;
        this.paidOrders = this.orders.filter(o => o.paymentStatus === 'paid').length;
        this.earningsToday = this.orders
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + (o.amount || 0), 0);

        // Select: route param > first order > keep prior
        if (this.routeOrderId && this.orders.some(o => o.id === this.routeOrderId)) {
          this.selectOrder(this.routeOrderId);
        } else if (this.orders.length && !this.selectedOrderId) {
          this.selectOrder(this.orders[0].id);
        }
      },
      error: (e) => console.error('Failed to load chef orders', e)
    });
  }

  // Select an order to show details
  selectOrder(orderId: number) {
    this.selectedOrderId = orderId;
    this.selectedOrderDetails = null;
    this.fetchOrderDetails(orderId);
  }

  // Load detailed order info for the right panel
  private fetchOrderDetails(orderId: number) {
    this.orderManagementService.getOrderDetails(orderId).subscribe({
      next: (details) => {
        this.selectedOrderDetails = details;
      },
      error: (e) => console.error('Failed to load order details', e)
    });
  }

  private trackedOrderId(): number | null {
    return this.selectedOrderId ?? (this.order?.id as number | undefined) ?? this.routeOrderId ?? null;
  }

  // Upsert order into the list
  private upsertOrder(order: ChefCurrentOrder) {
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...order };
    } else {
      this.orders.unshift(order);
      this.totalOrders = this.orders.length;
    }
  }

  // Update one field safely
  private patchOrder(orderId: number, patch: Partial<ChefCurrentOrder>) {
    const idx = this.orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...patch };
    }
  }

  private setupSignalRSubscriptions() {
    // New order requests
    this.subscriptions.push(
      this.signalrService.getOrderRequests().subscribe((orderData) => {
        if (!orderData) return;
        const id = Number(orderData.orderId ?? orderData.id);
        if (!Number.isFinite(id)) return;

        const incoming: ChefCurrentOrder = {
          id,
          customer: orderData.customerName || orderData.customer || 'Customer',
          items: Array.isArray(orderData.items) ? orderData.items.length : (Number(orderData.itemsCount) || 0),
          amount: Number(orderData.totalAmount ?? orderData.amount ?? orderData.total ?? 0),
          time: new Date().toLocaleTimeString(),
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
        };

        this.upsertOrder(incoming);

        // If nothing is selected yet, select this one
        if (!this.selectedOrderId) {
          this.selectOrder(id);
        }
      })
    );

    // Status updates (accepted/rejected/ready/etc.) including bridged events
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((u) => {
        if (!u) return;
        const id = Number(u.orderId ?? u.id);
        if (!Number.isFinite(id)) return;

        const status = String(u.status || '').toLowerCase() as ChefCurrentOrder['status'];
        this.patchOrder(id, { status });

        // If this is the selected order, refresh details
        if (this.selectedOrderId === id) {
          this.fetchOrderDetails(id);
          this.addTimelineEvent(`Order status: ${status}`, 'info');
        }
      })
    );

    // Payment success
    this.subscriptions.push(
      this.signalrService.getOrderPaidNotifications().subscribe((notification) => {
        if (!notification) return;
        const id = Number(notification.orderId ?? notification.id);
        if (!Number.isFinite(id)) return;

        // Update payment status and earnings once
        const existing = this.orders.find(o => o.id === id);
        const wasPaid = existing?.paymentStatus === 'paid';
        this.patchOrder(id, { paymentStatus: 'paid' });

        if (!wasPaid && existing) {
          this.earningsToday += Number(existing.amount || 0);
          this.paidOrders += 1;
        }

        if (this.selectedOrderId === id) {
          this.addTimelineEvent('Payment received', 'success');
          this.fetchOrderDetails(id);
        }
      })
    );

    // Payment cancel
    this.subscriptions.push(
      this.signalrService.getOrderPaymentCancelledNotifications().subscribe((notification) => {
        if (!notification) return;
        const id = Number(notification.orderId ?? notification.id);
        if (!Number.isFinite(id)) return;

        // If previously counted as paid, roll back counters
        const existing = this.orders.find(o => o.id === id);
        const wasPaid = existing?.paymentStatus === 'paid';
        if (wasPaid && existing) {
          this.earningsToday -= Number(existing.amount || 0);
          this.paidOrders = Math.max(0, this.paidOrders - 1);
        }

        this.patchOrder(id, { paymentStatus: 'cancelled' });

        if (this.selectedOrderId === id) {
          this.addTimelineEvent('Payment cancelled', 'error');
          this.fetchOrderDetails(id);
        }
      })
    );
  }

  get selectedOrder(): ChefCurrentOrder | undefined {
    if (!this.selectedOrderId) return undefined;
    return this.orders.find(o => o.id === this.selectedOrderId);
  }


  // Actions operate on selected order by default
  // async acceptOrder() {
  //   const id = this.trackedOrderId();
  //   if (!id) return;
  //   this.isProcessing = true;
  //   try {
  //     await firstValueFrom(this.orderManagementService.acceptOrder(id));
  //     this.patchOrder(id, { status: 'accepted' });
  //     this.addTimelineEvent('Order accepted by chef', 'success');
  //     this.fetchOrderDetails(id);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     this.isProcessing = false;
  //   }
  // }

  // ... existing code ...
  async acceptOrder() {
    const id = this.trackedOrderId();
    if (!id) return;

    const current = this.orders.find(o => o.id === id) || this.order;
    // Block if already paid or not pending
    if (!current || current.paymentStatus === 'paid' || current.status !== 'pending') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.acceptOrder(id));
      this.patchOrder(id, { status: 'accepted' });
      this.addTimelineEvent('Order accepted by chef', 'success');
      this.fetchOrderDetails(id);
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  async rejectOrder() {
    const id = this.trackedOrderId();
    if (!id) return;

    const current = this.orders.find(o => o.id === id) || this.order;
    // Block if already paid or not pending
    if (!current || current.paymentStatus === 'paid' || current.status !== 'pending') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.rejectOrder(id, 'Chef declined'));
      this.patchOrder(id, { status: 'rejected' });
      this.addTimelineEvent('Order rejected by chef', 'error');
      this.fetchOrderDetails(id);
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  async markAsReady() {
    const id = this.trackedOrderId();
    if (!id) return;

    const current = this.orders.find(o => o.id === id) || this.order;
    // Optional: allow only before payment if you keep "ready" in your flow
    if (!current || current.paymentStatus === 'paid' || current.status !== 'accepted') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.markAsReady(id));
      this.patchOrder(id, { status: 'ready' });
      this.addTimelineEvent('Order marked as ready', 'info');
      this.fetchOrderDetails(id);
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  async completeOrder() {
    const id = this.trackedOrderId();
    if (!id) return;

    const current = this.orders.find(o => o.id === id) || this.order;
    // Only complete if paid and not already completed
    if (!current || current.paymentStatus !== 'paid' || current.status === 'completed') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.completeOrder(id));
      this.patchOrder(id, { status: 'completed' });
      this.addTimelineEvent('Order completed', 'success');
      this.fetchOrderDetails(id);
      // Expect backend to push OrderStatusUpdate to customer as "completed"
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }
// ... existing code ...

  // Existing helpers (still used by the selected card)
  getOrderStatusClass(): string {
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    return o?.status || 'pending';
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
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    return statusMap[o?.status || 'pending'] || 'Unknown';
  }

  showPaymentStatus(): boolean {
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    return ['accepted', 'ready', 'completed'].includes(o?.status || 'pending');
  }

  getPaymentStatusClass(): string {
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    const paymentStatus = o?.paymentStatus || 'pending';
    return `payment-${paymentStatus}`;
  }

  getPaymentIcon() {
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    const paymentStatus = o?.paymentStatus || 'pending';
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
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    const paymentStatus = o?.paymentStatus || 'pending';
    const statusMap: { [key: string]: string } = {
      'paid': 'Payment Received',
      'pending': 'Awaiting Payment',
      'cancelled': 'Payment Cancelled'
    };
    return statusMap[paymentStatus] || 'Payment Status Unknown';
  }

  isPastOrder(): boolean {
    const id = this.trackedOrderId();
    const o = id ? this.orders.find(x => x.id === id) : this.order;
    return ['completed', 'rejected', 'cancelled'].includes(o?.status || '');
  }

  private initializeOrderTimeline() {
    this.orderTimeline = [
      {
        event: 'Order placed',
        time: new Date().toLocaleTimeString(),
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
