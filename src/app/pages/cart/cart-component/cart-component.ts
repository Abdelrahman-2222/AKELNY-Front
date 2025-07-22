import { CartService } from './../cart.service';
import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { ShoppingCartItemComponent } from '../shopping-cart-item/shopping-cart-item.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    OrderSummaryComponent,
    ShoppingCartItemComponent,
    NgIf,
    NavbarComponent,
  ],
  templateUrl: './cart-component.html',
})
export class CartComponent {
  constructor(public cartService: CartService) {}
}
