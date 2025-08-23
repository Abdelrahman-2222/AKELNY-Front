// Clean chef-dashboard-component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { Subject, takeUntil, Subscription, firstValueFrom } from 'rxjs';
import { ChefCurrentOrder } from '../../../models/ChefCurrentOrder.model';
import { SignalrService } from '../../../services/signalr.service';
import { ChefDashboardService } from '../../chef-dashboard.service';
import { AddRestaurant } from '../../../services/chef/add-restaurant';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Restaurant, RestaurantInputDto } from '../../../models/AddRestaurant.model';
import { OrderManagementService } from '../../../services/order-management-service';

import { LucideAngularModule, Clock, Star, CheckCircle, XCircle, DollarSign,
  User, Package, Timer, AlertCircle, TrendingUp, TrendingDown, BarChart3,
  PieChart, Calendar, Eye, Filter, Search, Download, Bell, RefreshCw,
  Zap, Award, Target, ShoppingBag, Users, CreditCard, MapPin, Store } from 'lucide-angular';

// Component imports
import { ChefDashboardHeaderComponent } from '../../chef-dashboard-header/chef-dashboard-header.component';
import { ChefRestaurantSettingsComponent } from '../../chef-restaurant-settings/chef-restaurant-settings';
import { ChefOrderReport } from '../../chef-order-report/chef-order-report';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChefDashboardHeaderComponent,
    ChefRestaurantSettingsComponent,
    ChefOrderReport,
    LucideAngularModule
  ],
  templateUrl: './chef-dashboard-component.html',
  styleUrl: './chef-dashboard-component.css'
})
export class ChefDashboardComponent implements OnInit, OnDestroy {
  currentOrders: ChefCurrentOrder[] = [];
  chefId: string = '';
  subscriptions: Subscription[] = [];
  signalrService = inject(SignalrService);
  restaurant: Restaurant | null = null;
  hasRestaurant = false;
  isLoading = true;
  errorMessage = '';
  restaurantId: number | null = null;
  isSettingsModalOpen = false;
  readonly Clock = Clock;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly Store = Store;
  readonly Bell = Bell;
  readonly RefreshCw = RefreshCw;
  readonly User = User;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Timer = Timer;
  readonly AlertCircle = AlertCircle;
  readonly ShoppingBag = ShoppingBag;

  private destroy$ = new Subject<void>();

  // Add missing state properties
  isRefreshing = false;

  // Add missing service injection
  private orderManagementService = inject(OrderManagementService);


  constructor(
    public chefDashboardService: ChefDashboardService,
    private restaurantService: AddRestaurant,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.checkRestaurantStatus();
    // const user = this.userService.getUser();
    this.chefId = this.userService.getUserId() || '';
    // Start listening for incoming orders for this chef
    this.setupSignalRSubscriptions();

    // Join chef SignalR group when connected
    this.subscriptions.push(
      this.signalrService.getConnectionStatus().subscribe((connected) => {
        if (connected && this.chefId) {
          this.signalrService.joinChefGroup(this.chefId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.chefId) {
      this.signalrService.leaveChefGroup(this.chefId);
    }
  }

  // Check if chef has a restaurant
  checkRestaurantStatus(): void {
    this.isLoading = true;
    this.restaurantService.checkChefHasRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hasRestaurant) => {
          this.hasRestaurant = hasRestaurant;
          this.isLoading = false;

          if (hasRestaurant) {
            // Get restaurant details to obtain ID
            this.getRestaurantDetails();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        }
      });
  }

  private getRestaurantDetails(): void {
    this.restaurantService.getChefRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurant) => {
          this.restaurant = restaurant;
          this.restaurantId = restaurant.id || null;
          console.log('Restaurant loaded:', restaurant); // Debug log
        },
        error: (error) => {
          console.error('Error getting restaurant details:', error);
        }
      });
  }

  getPaymentIcon(paymentStatus: string | undefined) {
    switch (paymentStatus) {
      case 'paid':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  }

  getPaymentStatusText(paymentStatus: string | undefined): string {
    const statusMap: { [key: string]: string } = {
      'paid': 'Payment Received',
      'pending': 'Awaiting Payment',
      'cancelled': 'Payment Cancelled'
    };
    return statusMap[paymentStatus || 'pending'] || 'Payment Status Unknown';
  }

  // Add this method to format time
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private mapOrdersFromResponse(orders: any[]): ChefCurrentOrder[] {
    return orders.map(order => {
      const status = String(order.status || 'pending').toLowerCase();
      const paymentStatus = String(order.payment_status || order.paymentStatus || 'pending').toLowerCase();

      // Use itemTotalWithExtras if available, otherwise fall back to totalAmount
      let calculatedAmount = 0;

      if (order.items && Array.isArray(order.items)) {
        // Calculate from items with add-ons and combos
        calculatedAmount = order.items.reduce((sum: number, item: any) => {
          return sum + (item.itemTotalWithExtras || item.totalPrice || 0);
        }, 0);
      } else {
        // Fallback to totalAmount from order
        calculatedAmount = parseFloat(order.totalAmount || order.total_amount || order.amount || order.total || 0);
      }

      return {
        id: order.id || order.orderId,
        customer: order.customerName || order.customer_name || order.customer || 'Unknown Customer',
        items: order.items?.length || order.item_count || order.itemsCount || 1,
        amount: calculatedAmount, // Use the calculated amount that includes add-ons
        status: status as ChefCurrentOrder['status'],
        paymentStatus: paymentStatus as ChefCurrentOrder['paymentStatus'],
        time: order.created_at ? this.formatTime(new Date(order.created_at)) : 'Just now',
        createdAt: order.created_at || order.createdAt || new Date().toISOString()
      };
    });
  }


  async refreshCurrentOrders() {
    this.isRefreshing = true;
    try {
      const orders = await firstValueFrom(this.orderManagementService.getChefCurrentOrders());
      this.currentOrders = this.mapOrdersFromResponse(orders || []);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  async acceptOrder(orderId: number) {
    try {
      await firstValueFrom(this.orderManagementService.acceptOrder(orderId));
      // Handle success
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  }

  async rejectOrder(orderId: number) {
    try {
      await firstValueFrom(this.orderManagementService.rejectOrder(orderId, 'Chef declined'));
      // Handle success
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  }

  async markAsReady(orderId: number) {
    try {
      await firstValueFrom(this.orderManagementService.markAsReady(orderId));
      // Handle success
    } catch (error) {
      console.error('Failed to mark as ready:', error);
    }
  }

  async completeOrder(orderId: number) {
    try {
      await firstValueFrom(this.orderManagementService.completeOrder(orderId));
      // Handle success
    } catch (error) {
      console.error('Failed to complete order:', error);
    }
  }

  // Updated method to parse the string format opening hours from your API
  parseOpeningHours(openingHoursStr: string): Array<{ day: string, isOpen: boolean, hours: string }> {
    if (!openingHoursStr) {
      return [];
    }

    try {
      // Parse the string format: "Monday: 9:00 AM - 10:00 PM, Tuesday: 9:00 AM - 10:00 PM, ..."
      const dayHoursPairs = openingHoursStr.split(', ');
      const parsedHours: Array<{ day: string, isOpen: boolean, hours: string }> = [];

      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      daysOfWeek.forEach(dayName => {
        const dayPair = dayHoursPairs.find(pair => pair.startsWith(dayName));

        if (dayPair) {
          const [day, hours] = dayPair.split(': ');
          const isOpen = hours.toLowerCase() !== 'closed';

          parsedHours.push({
            day: day,
            isOpen: isOpen,
            hours: isOpen ? hours : 'Closed'
          });
        } else {
          // If day is not found, assume closed
          parsedHours.push({
            day: dayName,
            isOpen: false,
            hours: 'Closed'
          });
        }
      });

      return parsedHours;
    } catch (error) {
      console.error('Error parsing opening hours:', error);
      return [];
    }
  }

  // Helper method to format time to 12-hour format (keeping for compatibility)
  formatTime12Hour(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  }

  notification: { type: 'success' | 'error', message: string } | null = null;

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = {type, message};
    setTimeout(() => this.notification = null, 3000);
  }

  // Update restaurant (you can call this from a modal or edit form)
  updateRestaurant(restaurantId: number, updateData: Partial<RestaurantInputDto>): void {
    this.restaurantService.updateRestaurant(restaurantId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRestaurant) => {
          this.restaurant = updatedRestaurant;
          this.showNotification('success', 'Restaurant updated successfully');
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.showNotification('error', error.message);
        }
      });
  }

  // Delete restaurant
  deleteRestaurant(restaurantId: number): void {
    if (confirm('Are you sure you want to delete your restaurant? This action cannot be undone.')) {
      this.restaurantService.deleteRestaurant(restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.hasRestaurant = false;
            this.restaurant = null;
            console.log('Restaurant deleted successfully');
            // Redirect to add restaurant page
          },
          error: (error) => {
            this.errorMessage = error.message;
            console.error('Error deleting restaurant:', error);
          }
        });
    }
  }

  openRestaurantSettings(): void {
    if (this.restaurant) {
      this.isSettingsModalOpen = true;
      document.body.classList.add('overflow-hidden');
    }
  }

  onSettingsSave(updateData: Partial<RestaurantInputDto>): void {
    if (this.restaurantId) {
      this.updateRestaurant(this.restaurantId, updateData);
      this.closeSettingsModal();
    }
  }

  private saveOrdersToLocalStorage(): void {
    localStorage.setItem('chef_current_orders', JSON.stringify(this.currentOrders));
  }

  private loadOrdersFromLocalStorage(): ChefCurrentOrder[] {
    try {
      const saved = localStorage.getItem('chef_current_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  onSettingsCancel(): void {
    this.closeSettingsModal();
  }

  private closeSettingsModal(): void {
    this.isSettingsModalOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  private setupSignalRSubscriptions() {
    this.subscriptions.push(
      this.signalrService.getOrderRequests().subscribe(async (orderData) => {
        if (orderData && orderData.orderId) {
          try {
            // Calculate the correct total from items with add-ons and combos
            let calculatedAmount = 0;
            if (orderData.items && Array.isArray(orderData.items)) {
              calculatedAmount = orderData.items.reduce((sum: number, item: any) => {
                return sum + (item.itemTotalWithExtras || item.totalPrice || 0);
              }, 0);
            } else {
              calculatedAmount = Number(orderData.totalAmount || 0);
            }

            const incoming: ChefCurrentOrder = {
              id: orderData.orderId,
              customer: orderData.customerName || 'Customer',
              items: orderData.orderSummary?.itemCount || orderData.items?.length || 0,
              amount: calculatedAmount, // Use calculated amount
              time: new Date().toLocaleTimeString(),
              status: 'pending',
              paymentStatus: 'pending',
              createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),

              // Include the detailed items with add-ons and combos from SignalR
              itemsArray: orderData.items || [],
              subTotal: orderData.subTotal,
              deliveryFee: orderData.deliveryFee,
              platformFee: orderData.platformFee,
              totalAmount: calculatedAmount, // Update this too
              distanceKm: orderData.distanceKm,
              customerId: orderData.customerId,
              restaurantId: orderData.restaurantId,
              restaurantName: orderData.restaurantName
            };

            console.log('Calculated amount:', calculatedAmount);
            console.log('Complete order received via SignalR:', orderData);

            const idx = this.currentOrders.findIndex(o => o.id === incoming.id);
            if (idx >= 0) {
              this.currentOrders[idx] = {...this.currentOrders[idx], ...incoming};
            } else {
              this.currentOrders.unshift(incoming);
            }

            this.saveOrdersToLocalStorage();
          } catch (error) {
            console.error('Failed to process SignalR order data:', error);
          }
        }
      })
    );

    // Listen for status changes and patch the matching order
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((u) => {
        if (!u || !u.orderId) return;
        const idx = this.currentOrders.findIndex(o => o.id === u.orderId);
        if (idx >= 0) {
          this.currentOrders[idx] = {
            ...this.currentOrders[idx],
            status: String(u.status || 'pending').toLowerCase() as ChefCurrentOrder['status']
          };
        }
      })
    );

    // Listen for payment success
    this.subscriptions.push(
      this.signalrService.getOrderPaidNotifications().subscribe((n) => {
        if (!n || !n.orderId) return;
        const idx = this.currentOrders.findIndex(o => o.id === n.orderId);
        if (idx >= 0) {
          this.currentOrders[idx] = {
            ...this.currentOrders[idx],
            paymentStatus: 'paid'
          };
        }
      })
    );

    // Listen for payment cancelled
    this.subscriptions.push(
      this.signalrService.getOrderPaymentCancelledNotifications().subscribe((n) => {
        if (!n || !n.orderId) return;
        const idx = this.currentOrders.findIndex(o => o.id === n.orderId);
        if (idx >= 0) {
          this.currentOrders[idx] = {
            ...this.currentOrders[idx],
            paymentStatus: 'cancelled'
          };
        }
      })
    );
  }

  AddItems() {
    // navigate to chef-dashboard-item.component.html
    this.router.navigate(['/chef/chef-dashboard-item']);
  }

  ViewMenu() {
    // Logic to view items in the restaurant menu
    this.router.navigate(['/chef/chef-dashboard-menu']);

    // You can implement the logic to navigate to a view items page or open a modal
  }

  ViewOrders() {
    // Logic to view orders for the restaurant
    console.log('View orders clicked');
    this.router.navigate(['/chef/chef-dashboard-order']);
    // You can implement the logic to navigate to a view orders page or open a modal
  }

  // Enhanced order management methods
  private processingOrders = new Set<number>();

  trackByOrderId(index: number, order: ChefCurrentOrder): number {
    return order.id;
  }

  isProcessingOrder(orderId: number): boolean {
    return this.processingOrders.has(orderId);
  }

  getOrderCardClass(order: ChefCurrentOrder): string[] {
    const classes = ['order-card', `status-${order.status}`];

    if (this.isNewOrder(order)) {
      classes.push('status-pending'); // Use existing status instead of 'new-order'
    }

    return classes;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pending Review',
      'accepted': 'Accepted',
      'ready': 'Ready',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  }

  showPaymentStatus(order: ChefCurrentOrder): boolean {
    return ['accepted', 'ready', 'completed'].includes(order.status);
  }

  getStatusMessage(order: ChefCurrentOrder): string {
    if (order.status === 'pending' && order.paymentStatus === 'paid') {
      return 'Customer has paid. Review and accept the order.';
    }
    if (order.status === 'accepted' && order.paymentStatus === 'pending') {
      return 'Waiting for customer payment to proceed.';
    }
    if (order.status === 'rejected') {
      return 'Order has been rejected.';
    }
    if (order.status === 'completed') {
      return 'Order completed successfully.';
    }
    return '';
  }

  private isNewOrder(order: ChefCurrentOrder): boolean {
    const now = new Date();
    const orderTime = order.createdAt ? new Date(order.createdAt) : new Date();
    return (now.getTime() - orderTime.getTime()) < 30000; // 30 seconds
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }


  private updateOrderStatus(orderId: number, status: ChefCurrentOrder['status']): void {
    const order = this.currentOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
    }
  }

  private async loadCurrentOrders(): Promise<void> {
    try {
      const orders = await firstValueFrom(this.orderManagementService.getChefCurrentOrders());
      this.currentOrders = this.mapOrdersFromResponse(orders || []);
    } catch (error) {
      console.error('Failed to load current orders:', error);
    }
  }

  getOrderDetails(order: ChefCurrentOrder): string {
    if (!order.itemsArray || order.itemsArray.length === 0) {
      return `${order.items} items`;
    }

    const details = order.itemsArray.map(item => {
      let itemDesc = `${item.quantity}x ${item.itemName}`;

      if (item.addOns && item.addOns.length > 0) {
        const addOnNames = item.addOns.map(addon => addon.name).join(', ');
        itemDesc += ` + ${addOnNames}`;
      }

      if (item.combos && item.combos.length > 0) {
        const comboNames = item.combos.map(combo => combo.name).join(', ');
        itemDesc += ` + ${comboNames}`;
      }

      return itemDesc;
    }).join('; ');

    return details;
  }

// Method to check if order has add-ons or combos
  hasExtras(order: ChefCurrentOrder): boolean {
    if (!order.itemsArray) return false;

    return order.itemsArray.some(item =>
      (item.addOns && item.addOns.length > 0) ||
      (item.combos && item.combos.length > 0)
    );
  }

// Method to get extras summary
  getExtrasInfo(order: ChefCurrentOrder): string {
    if (!order.itemsArray) return '';

    let addOnCount = 0;
    let comboCount = 0;

    order.itemsArray.forEach(item => {
      if (item.addOns) addOnCount += item.addOns.length;
      if (item.combos) comboCount += item.combos.length;
    });

    const parts = [];
    if (addOnCount > 0) parts.push(`${addOnCount} add-ons`);
    if (comboCount > 0) parts.push(`${comboCount} combos`);

    return parts.join(', ');
  }
}
