import { Component, inject, Input } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-shopping-cart-item',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './shopping-cart-item.component.html',
  styleUrl: './shopping-cart-item.component.css',
})
export class ShoppingCartItemComponent {
  // X Icon
  readonly X = X;
  public cartService: CartService = inject(CartService);
  @Input() item: any;
  @Input()
  i!: number;
}
