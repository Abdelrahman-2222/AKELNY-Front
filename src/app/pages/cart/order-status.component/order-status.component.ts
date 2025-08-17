// order-status.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../services/signalr.service';
import { CartService } from '../cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">Order Status</h2>

        <div class="text-center">
          <div class="mb-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>

          <h3 class="text-lg font-semibold mb-2">{{ statusMessage }}</h3>
          <p class="text-gray-600 mb-4">Order #{{ orderId ?? '...' }}</p>

          <div *ngIf="orderStatus === 'accepted'" class="space-y-4">
            <p class="text-green-600 font-semibold">Chef approved your order!</p>
            <button
              (click)="proceedToPayment()"
              [disabled]="isCreatingPayment"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
              {{ isCreatingPayment ? 'Creating Payment...' : 'Proceed to Payment' }}
            </button>
          </div>

          <div *ngIf="orderStatus === 'rejected'" class="text-center">
            <p class="text-red-600 font-semibold mb-4">Chef declined your order</p>
            <button
              (click)="goBackToMenu()"
              class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  orderId?: number;
  statusMessage = 'Waiting for chef approval...';
  orderStatus = 'pending';
  isCreatingPayment = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private signalrService = inject(SignalrService);
  private cartService = inject(CartService);
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // Resolve orderId from query params first
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const qpId = params['orderId'];
        const fromQuery = qpId !== undefined ? Number(qpId) : NaN;

        // Fallback to history.state or cart service if needed
        const stateId = history.state?.orderId;
        const fromState = stateId !== undefined ? Number(stateId) : NaN;

        const cartId = (this.cartService as any)?.lastOrderId;
        const fromCart = cartId !== undefined ? Number(cartId) : NaN;

        const resolved = [fromQuery, fromState, fromCart].find(n => Number.isFinite(n));
        this.orderId = resolved as number | undefined;

        this.statusMessage = params['message'] || this.statusMessage;

        if (!this.orderId) {
          // No valid order id -> go back
          this.router.navigate(['/customer/cart']);
          return;
        }
      })
    );

    this.setupSignalRSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSignalRSubscriptions() {
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((update) => {
        if (!update) return;

        const incomingId = Number(update.orderId ?? update.id);
        if (!this.orderId || !Number.isFinite(incomingId) || incomingId !== this.orderId) {
          return;
        }

        const status = String(update.status || '').toLowerCase();
        if (status === 'accepted' || status === 'approved') {
          this.orderStatus = 'accepted';
          this.statusMessage = 'Chef approved your order!';
          // Optional: auto-start payment
          this.proceedToPayment();
        } else if (status === 'rejected' || status === 'suspended') {
          this.orderStatus = 'rejected';
          this.statusMessage = 'Chef declined your order';
        }
      })
    );
  }

  proceedToPayment() {
    if (!this.orderId || this.isCreatingPayment) return;

    this.isCreatingPayment = true;
    this.cartService.createPaymentSession(this.orderId).subscribe(
      (res: any) => {
        if (res?.url) {
          this.cartService.clearCart();
          window.location.href = res.url;
        } else {
          this.isCreatingPayment = false;
          alert('No payment URL received. Please try again.');
        }
      },
      (err) => {
        console.error('Payment session creation failed:', err);
        alert('Failed to create payment session. Please try again.');
        this.isCreatingPayment = false;
      }
    );
  }

  goBackToMenu() {
    this.router.navigate(['/chefs']);
  }
}
