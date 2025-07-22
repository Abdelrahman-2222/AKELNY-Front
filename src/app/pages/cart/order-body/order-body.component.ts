import { Component } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-order-body',
  standalone: true,
  imports: [],
  templateUrl: './order-body.component.html',
  styleUrl: './order-body.component.css',
})
export class OrderBodyComponent {
    constructor(public cartService: CartService) {}
}
