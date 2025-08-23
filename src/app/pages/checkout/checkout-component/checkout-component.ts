import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { SignalrService } from '../../../services/signalr.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md mx-auto">
        <div class="mb-6">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-orange mx-auto"></div>
        </div>
        <h2 class="text-2xl font-bold mb-4">Waiting for Chef Approval</h2>
        <p class="text-gray-600 mb-4">Your order #{{ orderId }} has been sent to the chef</p>
        <p class="text-sm text-gray-500">Time remaining: {{ timeRemaining }}s</p>
        <p *ngIf="error" class="text-red-600 mt-4">{{ error }}</p>
      </div>
    </section>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cartService = inject(CartService);
  private signalrService = inject(SignalrService);
  private userService = inject(UserService);
  private ngZone = inject(NgZone);

  orderId: number | null = null;
  error: string | null = null;
  timeRemaining = 180; // 3 minutes in seconds

  private subscriptions: Subscription[] = [];
  private timeout: any;
  private countdownInterval: any;
  private customerId: string | null = null;

  ngOnInit(): void {
    // Get orderId from navigation state, fall back to cart service
    const stateOrderId = (history.state?.orderId as number | string | undefined) ?? null;
    const rawOrderId = stateOrderId ?? this.cartService.lastOrderId ?? null;

    // Normalize to number and validate
    const normalized = rawOrderId != null ? Number(rawOrderId) : NaN;
    this.orderId = Number.isFinite(normalized) ? normalized : null;


    if (!this.orderId) {
      this.router.navigate(['/customer/cart']);
      return;
    }

    this.customerId = this.userService.getUserId() || null;
    if (this.customerId) {
      this.subscriptions.push(
        this.signalrService.getConnectionStatus().subscribe((connected) => {
          if (connected) {
            this.signalrService.joinCustomerGroup(this.customerId!);
          }
        })
      );
    }


    this.setupSignalRSubscription();
    this.startCountdown();
    this.startTimeout();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.timeout) clearTimeout(this.timeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.customerId) {
      this.signalrService.leaveCustomerGroup(this.customerId);
    }

  }

  private setupSignalRSubscription(): void {
    // Unified status updates
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((update) => {
        if (!update) return;
        const incomingId = Number(update.orderId ?? update.id);
        if (!Number.isFinite(incomingId) || incomingId !== this.orderId) return;

        const status = String(update.status || '').toLowerCase();
        if (status === 'accepted' || status === 'approved') {
          this.ngZone.run(() => this.navigateToOrderStatus());
        } else if (status === 'rejected' || status === 'suspended') {
          this.ngZone.run(() => {
            this.error = 'Chef rejected your order. Redirecting to cart...';
            setTimeout(() => this.router.navigate(['/customer/cart']), 2000);
          });
        }
      })
    );

    // Fallback: direct accepted/rejected events
    this.subscriptions.push(
      this.signalrService.getOrderAccepted().subscribe((resp) => {
        if (!resp) return;
        const incomingId = Number(resp.orderId ?? resp.id);
        if (!Number.isFinite(incomingId) || incomingId !== this.orderId) return;
        this.ngZone.run(() => this.navigateToOrderStatus());
      })
    );

    this.subscriptions.push(
      this.signalrService.getOrderRejected().subscribe((resp) => {
        if (!resp) return;
        const incomingId = Number(resp.orderId ?? resp.id);
        if (!Number.isFinite(incomingId) || incomingId !== this.orderId) return;
        this.ngZone.run(() => {
          this.error = 'Chef rejected your order. Redirecting to cart...';
          setTimeout(() => this.router.navigate(['/customer/cart']), 2000);
        });
      })
    );
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private startTimeout(): void {
    // After 3 minutes, navigate to order status regardless
    this.timeout = setTimeout(() => {
      this.navigateToOrderStatus();
    }, 180000); // 3 minutes
  }

  private navigateToOrderStatus(): void {
    // Clear timers
    if (this.timeout) clearTimeout(this.timeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    // Navigate to order status WITH query params so the next page has a valid orderId
    this.router.navigate(['/customer/order-status'], {
      queryParams: { orderId: this.orderId, message: 'Waiting for chef approval...' }
    });
  }

}
