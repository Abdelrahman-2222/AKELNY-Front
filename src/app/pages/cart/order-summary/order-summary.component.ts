import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderPromocodeComponent } from '../order-promocode/order-promocode.component';
import { OrderBodyComponent } from '../order-body/order-body.component';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, OrderPromocodeComponent, OrderBodyComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent {
  isProcessing = false;

  constructor(public cartService: CartService, private router: Router) {}

  checkout(e: MouseEvent) {
    e.preventDefault();
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.cartService.checkoutOrder().subscribe(
      (res: any) => {
        console.log('Order created successfully: ', res);

        if (res.status === 'pending_approval') {
          // Navigate to order status page to wait for chef approval
          this.router.navigate(['/order-status'], {
            queryParams: {
              orderId: res.orderId,
              message: 'Waiting for chef approval'
            }
          });
        } else if (res.url) {
          // Direct redirect to Stripe (if your backend still supports direct payment)
          window.location.href = res.url;
        }
        this.isProcessing = false;
      },
      (err) => {
        console.error('Checkout failed: ', err);
        alert('Checkout failed. Please try again.');
        this.isProcessing = false;
        // Don't navigate away - let user retry
      }
    );
  }
}
