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
          <p class="text-gray-600 mb-4">Order #{{ orderId }}</p>

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
    this.route.queryParams.subscribe(params => {
      this.orderId = +params['orderId'];
      this.statusMessage = params['message'] || 'Waiting for chef approval...';
    });

    this.setupSignalRSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSignalRSubscriptions() {
    this.subscriptions.push(
      this.signalrService.getOrderStatusUpdates().subscribe((update) => {
        if (update && update.orderId === this.orderId) {
          this.orderStatus = update.status;

          if (update.status === 'accepted') {
            this.statusMessage = 'Chef approved your order!';
          } else if (update.status === 'rejected') {
            this.statusMessage = 'Chef declined your order';
          }
        }
      })
    );
  }

  proceedToPayment() {
    if (!this.orderId) return;

    this.isCreatingPayment = true;
    this.cartService.createPaymentSession(this.orderId).subscribe(
      (res: any) => {
        if (res.url) {
          this.cartService.clearCart();
          window.location.href = res.url;
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
