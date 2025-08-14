import { Component } from '@angular/core';
import { OrderPromocodeComponent } from '../order-promocode/order-promocode.component';
import { OrderBodyComponent } from '../order-body/order-body.component';
import { CartService } from '../cart.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [OrderPromocodeComponent, OrderBodyComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent {
  /**
   *
   */
  constructor(public cartService: CartService, private router: Router) {}
  checkout(e: MouseEvent) {
    e.preventDefault();
    this.cartService.checkoutOrder().subscribe(
      (res: any) => {
        console.log('Data posted successfully: ', res);
        window.location.href = res?.url;
      },
      (err) => {
        console.log('Data postint failed: ', err);
        this.router.navigate(['/']);
      }
    );
  }
}
