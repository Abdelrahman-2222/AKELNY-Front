import { Component, inject } from '@angular/core';
import { CartService } from '../cart.service';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-body',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './order-body.component.html',
  styleUrl: './order-body.component.css',
})
export class OrderBodyComponent {
  public cartService = inject(CartService);
  private router = inject(Router);
  isProcessing = false;

  async proceedToCheckout(): Promise<void> {
    if (this.cartService.cartItems.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const res = await firstValueFrom(this.cartService.checkoutOrder());
      this.cartService.lastOrderId = res.orderId;

      // Clear cart after successful order creation
      this.cartService.clearCart();

      // Navigate to checkout waiting page
      this.router.navigate(['/customer/checkout'], {
        state: { orderId: res.orderId },
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      this.isProcessing = false;
    }
  }
}
