import { Component } from '@angular/core';
import { OrderPromocodeComponent } from '../order-promocode/order-promocode.component';
import { OrderBodyComponent } from '../order-body/order-body.component';
import { CartService } from '../cart.service';

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
  //constructor(public cartService: CartService) {}
}
