import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefCurrentOrder } from '../../models/ChefCurrentOrder.model';
import { SignalrService } from '../../services/signalr.service';
import { LucideAngularModule, Clock, Star, CheckCircle,
  XCircle, DollarSign, User, Package, Timer, AlertCircle,
  TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  Eye, Filter, Search, Download, Bell, RefreshCw, Zap, Award,
  Target, ShoppingBag, Users, CreditCard, MapPin } from 'lucide-angular';
import { Subscription, firstValueFrom } from 'rxjs';
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
  orderTimeline: any[] = [];
  isRefreshing = false;

  // Enhanced state management
  orders: ChefCurrentOrder[] = [];
  selectedOrderId: number | null = null;
  selectedOrderDetails: any | null = null;
  currentView: 'overview' | 'orders' | 'analytics' = 'overview';

  // Search and filter
  searchQuery = '';
  statusFilter = 'all';
  dateFilter = 'today';
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
    this.loadDashboardData();
    this.setupSignalRSubscriptions();
    this.startRealtimeUpdates();
  }

  ngOnDestroy() {
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

  private async loadOrders() {
    try {
      const response = await firstValueFrom(this.orderManagementService.getChefCurrentOrders());
      this.orders = this.mapOrdersFromResponse(response || []);
      this.updateBasicStats();

      if (this.routeOrderId && this.orders.some(o => o.id === this.routeOrderId)) {
        this.selectOrder(this.routeOrderId);
      } else if (this.orders.length && !this.selectedOrderId) {
        this.selectOrder(this.orders[0].id);
      }
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

  private mapOrdersFromResponse(response: any[]): ChefCurrentOrder[] {
    return response.map((r: any) => ({
      id: Number(r.id ?? r.orderId),
      customer: r.customerName ?? r.customer ?? 'Customer',
      items: Array.isArray(r.items) ? r.items.length : (Number(r.itemsCount) || 0),
      amount: Number(r.totalAmount ?? r.amount ?? r.total ?? 0),
      time: new Date(r.createdAt ?? Date.now()).toLocaleTimeString(),
      status: (String(r.status || 'pending').toLowerCase() as ChefCurrentOrder['status']),
      paymentStatus: (String(r.paymentStatus || 'pending').toLowerCase() as ChefCurrentOrder['paymentStatus']),
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
    }));
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
          this.fetchOrderDetails(id);
          this.addTimelineEvent(`Order status: ${status}`, 'info');
        }
      })
    );

    // Payment notifications
    this.subscriptions.push(
      this.signalrService.getOrderPaidNotifications().subscribe((notification) => {
        if (!notification) return;
        const id = Number(notification.orderId ?? notification.id);
        if (!Number.isFinite(id)) return;

        this.patchOrder(id, { paymentStatus: 'paid' });
        this.updateBasicStats();

        if (this.selectedOrderId === id) {
          this.addTimelineEvent('Payment received', 'success');
          this.fetchOrderDetails(id);
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

  async refreshData() {
    await this.loadDashboardData();
  }

  selectOrder(orderId: number) {
    this.selectedOrderId = orderId;
    this.selectedOrderDetails = null;
    this.fetchOrderDetails(orderId);
  }

  private async fetchOrderDetails(orderId: number) {
    try {
      const details = await firstValueFrom(this.orderManagementService.getOrderDetails(orderId));
      this.selectedOrderDetails = details;
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  }

  // Order Management Methods
  async acceptOrder() {
    const id = this.trackedOrderId();
    if (!id) return;

    const current = this.orders.find(o => o.id === id) || this.order;
    if (!current || current.paymentStatus === 'paid' || current.status !== 'pending') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.acceptOrder(id));
      this.patchOrder(id, { status: 'accepted' });
      this.addTimelineEvent('Order accepted by chef', 'success');
      this.fetchOrderDetails(id);
      this.updateBasicStats();
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
    if (!current || current.paymentStatus === 'paid' || current.status !== 'pending') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.rejectOrder(id, 'Chef declined'));
      this.patchOrder(id, { status: 'rejected' });
      this.addTimelineEvent('Order rejected by chef', 'error');
      this.fetchOrderDetails(id);
      this.updateBasicStats();
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
    if (!current || current.paymentStatus !== 'paid' || current.status === 'completed') return;

    this.isProcessing = true;
    try {
      await firstValueFrom(this.orderManagementService.completeOrder(id));
      this.patchOrder(id, { status: 'completed' });
      this.addTimelineEvent('Order completed', 'success');
      this.fetchOrderDetails(id);
      this.updateBasicStats();
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing = false;
    }
  }

  // Helper Methods
  private trackedOrderId(): number | null {
    return this.selectedOrderId ?? (this.order?.id as number | undefined) ?? this.routeOrderId ?? null;
  }

  private upsertOrder(order: ChefCurrentOrder) {
    const idx = this.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...order };
    } else {
      this.orders.unshift(order);
    }
  }

  private patchOrder(orderId: number, patch: Partial<ChefCurrentOrder>) {
    const idx = this.orders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...patch };
    }
  }

  get selectedOrder(): ChefCurrentOrder | undefined {
    if (!this.selectedOrderId) return undefined;
    return this.orders.find(o => o.id === this.selectedOrderId);
  }

  get filteredOrders(): ChefCurrentOrder[] {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order.customer || '').toLowerCase().includes(query) ||
        order.id.toString().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Date filter
    const now = new Date();
    if (this.dateFilter === 'today') {
      filtered = filtered.filter(order => {
        const createdAt = order.createdAt ? new Date(order.createdAt as any) : new Date(0);
        return createdAt.toDateString() === now.toDateString();
      });
    } else if (this.dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => {
        const createdAt = order.createdAt ? new Date(order.createdAt as any) : new Date(0);
        return createdAt >= weekAgo;
      });
    }

    // Sort
    if (this.sortBy === 'newest') {
      filtered.sort((a, b) => {
        const bDate = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
        const aDate = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
        return bDate - aDate;
      });
    } else if (this.sortBy === 'amount') {
      filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    return filtered;
  }

  // Status and UI helpers
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
      case 'paid': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
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

  // Analytics helpers
  getRevenueChange(): { percentage: number; trend: 'up' | 'down' | 'stable' } {
    const today = this.dashboardStats.todayRevenue;
    const yesterday = this.dashboardStats.yesterdayRevenue;

    if (yesterday === 0) return { percentage: 0, trend: 'stable' };

    const percentage = ((today - yesterday) / yesterday) * 100;
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';

    return { percentage: Math.abs(percentage), trend };
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
}
