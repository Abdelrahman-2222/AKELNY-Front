import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-order-body',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './order-body.component.html',
  styleUrl: './order-body.component.css',
})
export class OrderBodyComponent {
    constructor(public cartService: CartService) {}
}
