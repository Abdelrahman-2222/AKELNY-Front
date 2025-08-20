import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { SignalrService } from '../../services/signalr.service';
import { LucideAngularModule, Clock, Star, CheckCircle,
  XCircle, DollarSign, User, Package, Timer, AlertCircle,
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  Eye, Filter, Search, Download, Bell, RefreshCw, Zap, Award,
  Target, ShoppingBag, Users, CreditCard, MapPin } from 'lucide-angular';
import { Subscription, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { OrderManagementService } from '../../services/order-management-service';
import { ActivatedRoute } from '@angular/router';
import {FormsModule} from '@angular/forms';

interface DashboardStats {
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  revenueByDay: Array<{
    day: string;
    revenue: number;
    orders: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  peakHours: Array<{
    hour: string;
    orders: number;
  }>;
  customerStats: {
    newCustomers: number;
    returningCustomers: number;
    averageOrdersPerCustomer: number;
  };
  performanceMetrics: {
    averagePreparationTime: number;
    orderAcceptanceRate: number;
    customerSatisfaction: number;
    onTimeDelivery: number;
  };
}

@Component({
  selector: 'app-chef-dashboard-order',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './chef-dashboard-order.component.html',
  styleUrl: './chef-dashboard-order.component.css'
})
export class ChefDashboardOrderComponent implements OnInit, OnDestroy {
  @Input() order!: ChefCurrentOrder;
  @Input() chefId!: string;

  private destroy$ = new Subject<void>();
  private _selectedOrder: ChefCurrentOrder | null = null;

  // Icons
  readonly Clock = Clock;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly DollarSign = DollarSign;
  readonly User = User;
  readonly Package = Package;
  readonly Timer = Timer;
  readonly AlertCircle = AlertCircle;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly BarChart3 = BarChart3;
  readonly PieChart = PieChart;
  readonly Calendar = Calendar;
  readonly Eye = Eye;
  readonly Filter = Filter;
  readonly Search = Search;
  readonly Download = Download;
  readonly Bell = Bell;
  readonly RefreshCw = RefreshCw;
  readonly Zap = Zap;
  readonly Award = Award;
  readonly Target = Target;
  readonly ShoppingBag = ShoppingBag;
  readonly Users = Users;
  readonly CreditCard = CreditCard;
  readonly MapPin = MapPin;

  isProcessing = false;
  orderTimeline: Array<{event: string, time: string, type: 'success' | 'error' | 'info'}> = [];
  isRefreshing = false;

  // Enhanced state management
  orders: ChefCurrentOrder[] = [];
  selectedOrderId: number | null = null;
  selectedOrderDetails: any = null;
  isLoadingDetails = false;
  currentView: 'overview' | 'orders' | 'analytics' = 'overview';
  currentOrders: ChefCurrentOrder[] = [];

  // Search and filter
  searchQuery = '';
  statusFilter = 'all';
  dateFilter = 'all';
  sortBy = 'newest';

  // Dashboard statistics
  dashboardStats: DashboardStats = {
    todayRevenue: 0,
    yesterdayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    revenueByDay: [],
    orderStatusDistribution: [],
    peakHours: [],
    customerStats: {
      newCustomers: 0,
      returningCustomers: 0,
      averageOrdersPerCustomer: 0
    },
    performanceMetrics: {
      averagePreparationTime: 0,
      orderAcceptanceRate: 0,
      customerSatisfaction: 0,
      onTimeDelivery: 0
    }
  };

  // Time-based data for charts
  selectedTimeRange = '7days';

  private signalrService = inject(SignalrService);
  private subscriptions: Subscription[] = [];
  private orderManagementService = inject(OrderManagementService);
  private route = inject(ActivatedRoute);
  private routeOrderId: number | null = null;

  ngOnInit() {
    this.initializeComponent();
    const routeOrderId = this.route.snapshot.paramMap.get('orderId');
    if (routeOrderId) {
      this.routeOrderId = parseInt(routeOrderId, 10);
    }
    this.loadDashboardData();
    this.loadOrders();
    this.setupSignalRSubscriptions();
    this.startRealtimeUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chefId) {
      this.signalrService.leaveChefGroup(this.chefId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeComponent() {
    // Route handling
    if (!this.order) {
      const paramId = this.route.snapshot.paramMap.get('orderId') ?? this.route.snapshot.queryParamMap.get('orderId');
      const normalized = paramId != null ? Number(paramId) : NaN;
      if (Number.isFinite(normalized)) {
        this.routeOrderId = normalized;
      }
    }

    // SignalR connection
    this.subscriptions.push(
      this.signalrService.getConnectionStatus().subscribe(connected => {
        if (connected && this.chefId) {
          this.signalrService.joinChefGroup(this.chefId);
        }
      })
    );

    this.initializeOrderTimeline();
  }

  private async loadDashboardData() {
    this.isRefreshing = true;
    try {
      await Promise.all([
        this.loadOrders(),
        this.loadStatistics(),
        this.loadAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      this.isRefreshing = false;
    }
  }
  // Add the formatTime method
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private async loadCurrentOrders(): Promise<void> {
    try {
      const orders = await firstValueFrom(this.orderManagementService.getChefCurrentOrders());
      this.currentOrders = this.mapOrdersFromResponse(orders || []);
    } catch (error) {
      console.error('Failed to load current orders:', error);
    }
  }

  async loadOrders(): Promise<void> {
    try {
      const response = await firstValueFrom(this.orderManagementService.getChefCurrentOrders());
      this.orders = this.mapOrdersFromResponse(response || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  private async loadStatistics() {
    // Mock data - replace with actual API calls
    this.dashboardStats = {
      ...this.dashboardStats,
      todayRevenue: 1247.50,
      yesterdayRevenue: 1156.30,
      weekRevenue: 8945.25,
      monthRevenue: 32750.80,
      topSellingItems: [
        { name: 'Margherita Pizza', quantity: 45, revenue: 675.00, trend: 'up' },
        { name: 'Caesar Salad', quantity: 32, revenue: 384.00, trend: 'up' },
        { name: 'Grilled Salmon', quantity: 28, revenue: 560.00, trend: 'down' },
        { name: 'Chocolate Cake', quantity: 25, revenue: 250.00, trend: 'stable' },
        { name: 'Beef Burger', quantity: 22, revenue: 330.00, trend: 'up' }
      ],
      revenueByDay: [
        { day: 'Mon', revenue: 1156.30, orders: 23 },
        { day: 'Tue', revenue: 1342.50, orders: 28 },
        { day: 'Wed', revenue: 1089.75, orders: 21 },
        { day: 'Thu', revenue: 1567.20, orders: 31 },
        { day: 'Fri', revenue: 1823.45, orders: 35 },
        { day: 'Sat', revenue: 1966.05, orders: 38 },
        { day: 'Sun', revenue: 1247.50, orders: 26 }
      ],
      orderStatusDistribution: [
        { status: 'completed', count: 156, percentage: 65, color: 'bg-green-500' },
        { status: 'pending', count: 23, percentage: 15, color: 'bg-amber-500' },
        { status: 'in_progress', count: 18, percentage: 12, color: 'bg-blue-500' },
        { status: 'cancelled', count: 12, percentage: 8, color: 'bg-red-500' }
      ],
      peakHours: [
        { hour: '12:00', orders: 15 },
        { hour: '13:00', orders: 22 },
        { hour: '18:00', orders: 18 },
        { hour: '19:00', orders: 25 },
        { hour: '20:00', orders: 20 }
      ],
      customerStats: {
        newCustomers: 34,
        returningCustomers: 89,
        averageOrdersPerCustomer: 2.3
      },
      performanceMetrics: {
        averagePreparationTime: 18.5,
        orderAcceptanceRate: 94.2,
        customerSatisfaction: 4.7,
        onTimeDelivery: 89.3
      }
    };
  }

  private async loadAnalytics() {
    // Load advanced analytics data
    // This would typically come from your analytics service
  }

  // private mapOrdersFromResponse(response: any[]): ChefCurrentOrder[] {
  //   return response.map((r: any) => ({
  //     id: Number(r.id ?? r.orderId),
  //     customer: r.customerName ?? r.customer ?? 'Customer',
  //     items: Array.isArray(r.items) ? r.items.length : (Number(r.itemsCount) || 0),
  //     amount: Number(r.totalAmount ?? r.amount ?? r.total ?? 0),
  //     time: new Date(r.createdAt ?? Date.now()).toLocaleTimeString(),
  //     status: (String(r.status || 'pending').toLowerCase() as ChefCurrentOrder['status']),
  //     paymentStatus: (String(r.paymentStatus || 'pending').toLowerCase() as ChefCurrentOrder['paymentStatus']),
  //     createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
  //   }));
  // }

  private mapOrdersFromResponse(response: any[]): ChefCurrentOrder[] {
    return response.map((r: any) => ({
      id: Number(r.id),
      customer: r.customerName || r.customer || 'Customer',
      items: Array.isArray(r.items) ? r.items.length : 0,
      amount: Number(r.totalAmount || 0),
      time: new Date(r.createdAt).toLocaleTimeString(),
      status: this.mapStatus(r.status),
      paymentStatus: r.payment ? 'paid' : 'pending',
      createdAt: new Date(r.createdAt),

      // Map additional fields
      subTotal: r.subTotal,
      deliveryFee: r.deliveryFee,
      platformFee: r.platformFee,
      totalAmount: r.totalAmount,
      distanceKm: r.distanceKm,
      customerId: r.customerId,
      customerName: r.customerName,
      restaurantId: r.restaurantId,
      restaurantName: r.restaurantName,
      itemsArray: r.items,
      payment: r.payment
    }));
  }

  private mapStatus(status: number): ChefCurrentOrder['status'] {
    const statusMap: { [key: number]: ChefCurrentOrder['status'] } = {
      1: 'pending',
      2: 'accepted',
      3: 'in_progress',
      4: 'ready',
      5: 'completed',
      6: 'rejected',
      7: 'cancelled'
    };
    return statusMap[status] || 'pending';
  }


  private updateBasicStats() {
    this.dashboardStats.totalOrders = this.orders.length;
    this.dashboardStats.pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    this.dashboardStats.completedOrders = this.orders.filter(o => o.status === 'completed').length;

    const paidOrders = this.orders.filter(o => o.paymentStatus === 'paid');
    const todayRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    this.dashboardStats.todayRevenue = todayRevenue;
    this.dashboardStats.averageOrderValue = paidOrders.length ? todayRevenue / paidOrders.length : 0;
  }

  private getOrderAmount(orderId: number): number {
    const order = this.orders.find(o => o.id === orderId);
    return order?.amount || 0;
  }

  private setupSignalRSubscriptions() {
    // Order requests
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
        this.updateBasicStats();

        // Only auto-select if no order is currently selected
        if (!this.selectedOrderId) {
          this.selectOrder(id);
        }
      })
    );

    // Status updates
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((u) => {
        if (!u) return;
        const id = Number(u.orderId ?? u.id);
        if (!Number.isFinite(id)) return;

        const status = String(u.status || '').toLowerCase() as ChefCurrentOrder['status'];
        this.patchOrder(id, { status });

        if (this.selectedOrderId === id) {
          setTimeout(() => this.fetchOrderDetails(id), 500);
          this.addTimelineEvent(`Order status: ${status}`, 'info');
        }
        this.updateBasicStats();
      })
    );

    // Payment notifications - ENHANCED
    this.subscriptions.push(
      this.signalrService.getOrderPaidNotifications().subscribe((n) => {
        if (!n || !n.orderId) return;
        const id = Number(n.orderId);
        if (!Number.isFinite(id)) return;

        this.patchOrder(id, { paymentStatus: 'paid' });
        if (this.selectedOrderId === id) {
          this.addTimelineEvent('Payment received', 'success');
        }
      })
    );

    // Payment cancelled
    this.subscriptions.push(
      this.signalrService.getOrderPaymentCancelledNotifications().subscribe((n) => {
        if (!n || !n.orderId) return;
        const id = Number(n.orderId);
        if (!Number.isFinite(id)) return;

        this.patchOrder(id, { paymentStatus: 'cancelled' });
        if (this.selectedOrderId === id) {
          this.addTimelineEvent('Payment cancelled', 'error');
        }
      })
    );
  }

  private startRealtimeUpdates() {
    // Update dashboard stats every 30 seconds
    setInterval(() => {
      this.updateBasicStats();
    }, 30000);
  }

  // UI Methods
  switchView(view: 'overview' | 'orders' | 'analytics') {
    this.currentView = view;
  }

  refreshData() {
    this.loadOrders();
  }

  trackByOrderId(index: number, order: ChefCurrentOrder): number {
    return order.id;
  }


// Update the selectOrder method
  selectOrder(orderId: number): void {
    this.selectedOrderId = orderId;
    this.selectedOrder = this.orders.find(o => o.id === orderId) || null;
    this.loadOrderDetails(orderId);
  }

  public loadOrderDetails(orderId: number): void {
    this.isLoadingDetails = true;
    this.selectedOrderDetails = null;

    this.orderManagementService.getOrderDetails(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details: any) => {
          this.selectedOrderDetails = {
            customerName: details?.customerName || 'Customer',
            deliveryAddress: details?.deliveryAddress || 'No address provided',
            items: details?.items || [],
            subTotal: details?.subTotal || 0,
            deliveryFee: details?.deliveryFee || 0,
            platformFee: details?.platformFee || 0,
            totalAmount: details?.totalAmount || 0,
            customerId: details?.customerId,
            restaurantId: details?.restaurantId,
            restaurantName: details?.restaurantName
          };
          this.isLoadingDetails = false;
        },
        error: (error) => {
          console.error('Failed to load order details:', error);
          this.isLoadingDetails = false;
          // Fallback to basic order info
          this.selectedOrderDetails = {
            customerName: this.selectedOrder?.customer || 'Customer',
            deliveryAddress: 'No address provided',
            items: [],
            subTotal: this.selectedOrder?.amount || 0,
            deliveryFee: 0,
            platformFee: 0
          };
        }
      });
  }

  private async fetchOrderDetails(orderId: number): Promise<void> {
    try {
      this.selectedOrderDetails = await firstValueFrom(this.orderManagementService.getOrderDetails(orderId));
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      this.selectedOrderDetails = null;
    }
  }

  private updateOrderStatus(orderId: number, status: ChefCurrentOrder['status']): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
    }
    if (this.order && this.order.id === orderId) {
      this.order.status = status;
    }
  }
  // Order Management Methods
  async acceptOrder(): Promise<void> {
    if (!this.order && !this.selectedOrderId) return;

    const orderId = this.order?.id || this.selectedOrderId!;
    this.isProcessing = true;

    try {
      await firstValueFrom(this.orderManagementService.acceptOrder(orderId));
      this.updateOrderStatus(orderId, 'accepted');
      this.addTimelineEvent('Order accepted', 'success');
    } catch (error) {
      console.error('Failed to accept order:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async rejectOrder(): Promise<void> {
    if (!this.order && !this.selectedOrderId) return;

    const orderId = this.order?.id || this.selectedOrderId!;
    this.isProcessing = true;

    try {
      await firstValueFrom(this.orderManagementService.rejectOrder(orderId, 'Chef declined'));
      this.updateOrderStatus(orderId, 'rejected');
      this.addTimelineEvent('Order rejected', 'error');
    } catch (error) {
      console.error('Failed to reject order:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async markAsReady(): Promise<void> {
    if (!this.order && !this.selectedOrderId) return;

    const orderId = this.order?.id || this.selectedOrderId!;
    this.isProcessing = true;

    try {
      await firstValueFrom(this.orderManagementService.markAsReady(orderId));
      this.updateOrderStatus(orderId, 'ready');
      this.addTimelineEvent('Order marked as ready', 'success');
    } catch (error) {
      console.error('Failed to mark as ready:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async completeOrder(): Promise<void> {
    if (!this.order && !this.selectedOrderId) return;

    const orderId = this.order?.id || this.selectedOrderId!;
    this.isProcessing = true;

    try {
      await firstValueFrom(this.orderManagementService.completeOrder(orderId));
      this.updateOrderStatus(orderId, 'completed');
      this.addTimelineEvent('Order completed', 'success');
    } catch (error) {
      console.error('Failed to complete order:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Helper Methods
  private trackedOrderId(): number | null {
    return this.selectedOrderId ?? (this.order?.id as number | undefined) ?? this.routeOrderId ?? null;
  }

  private upsertOrder(order: ChefCurrentOrder): void {
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...order };
    } else {
      this.orders.unshift(order);
    }
  }

  private patchOrder(orderId: number, updates: Partial<ChefCurrentOrder>): void {
    const idx = this.orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...updates };
    }
  }

  // Fix the selectedOrder getter/setter
  get selectedOrder(): ChefCurrentOrder | null {
    return this._selectedOrder;
  }

  private set selectedOrder(order: ChefCurrentOrder | null) {
    this._selectedOrder = order;
  }

  get filteredOrders(): ChefCurrentOrder[] {
    let filtered = [...this.orders];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.customer.toLowerCase().includes(query) ||
        order.id.toString().includes(query)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    if (this.dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        switch (this.dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'amount':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
    }

    return filtered;
  }

  // Status and UI helpers
  getOrderStatusClass(): string {
    return this.order ? `status-${this.order.status}` : '';
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
    return this.order ? ['accepted', 'ready', 'completed'].includes(this.order.status) : false;
  }

  getPaymentStatusClass(): string {
    const order = this.order || this.selectedOrder;
    return order ? `payment-${order.paymentStatus}` : '';
  }

  getPaymentIcon(): any {
    if (!this.order && !this.selectedOrder) return Clock;
    const order = this.order || this.selectedOrder;
    switch (order?.paymentStatus) {
      case 'paid': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  }

  getPaymentStatusText(): string {
    if (!this.order && !this.selectedOrder) return 'Unknown';
    const order = this.order || this.selectedOrder;
    const statusMap: { [key: string]: string } = {
      'paid': 'Payment Received',
      'pending': 'Awaiting Payment',
      'cancelled': 'Payment Cancelled'
    };
    return statusMap[order?.paymentStatus || 'pending'] || 'Payment Status Unknown';
  }

  isPastOrder(): boolean {
    return this.selectedOrder?.status === 'completed' || this.selectedOrder?.status === 'rejected';
  }

  private initializeOrderTimeline(): void {
    this.orderTimeline = [
      { event: 'Order placed', time: this.order?.time || 'Unknown', type: 'info' }
    ];
  }

  private addTimelineEvent(event: string, type: 'success' | 'error' | 'info'): void {
    this.orderTimeline.push({
      event,
      time: new Date().toLocaleTimeString(),
      type
    });
  }

  // Analytics helpers
  getRevenueChange(): { trend: 'up' | 'down', percentage: number } {
    const change = ((this.dashboardStats.todayRevenue - this.dashboardStats.yesterdayRevenue) / this.dashboardStats.yesterdayRevenue) * 100;
    return {
      trend: change >= 0 ? 'up' : 'down',
      percentage: Math.abs(change)
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  public refreshOrderData(): void {
    this.loadCurrentOrders();
  }


  private handlePaymentStatusChange(orderId: number): void {
    const order = this.currentOrders.find((o: ChefCurrentOrder) => o.id === orderId);
    if (order) {
      this.loadCurrentOrders();
    }
  }
}
