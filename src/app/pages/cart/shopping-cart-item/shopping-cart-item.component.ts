import { Component, inject, Input, OnInit } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { CartItemType, CartService } from '../cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shopping-cart-item',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './shopping-cart-item.component.html',
  styleUrl: './shopping-cart-item.component.css',
})
export class ShoppingCartItemComponent implements OnInit {
  readonly X = X;
  public cartService: CartService = inject(CartService);

  @Input() item!: CartItemType;
  @Input() i!: number;

  // Responsive breakpoint detection
  public isMobile = false;
  public isTablet = false;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width < 640;
    this.isTablet = width >= 640 && width < 1024;
  }

  // Enhanced quantity update with animation
  updateQuantity(change: number) {
    const quantityElement = document.querySelector('.quantity-value');
    if (quantityElement) {
      quantityElement.classList.add('quantity-change');
      setTimeout(() => {
        quantityElement.classList.remove('quantity-change');
      }, 300);
    }
    this.cartService.updateQuantity(this.item, change);
  }

  // Remove item with confirmation on mobile
  removeItem() {
    if (this.isMobile) {
      const confirmed = confirm(`Remove ${this.item.name} from cart?`);
      if (confirmed) {
        this.cartService.removeItem(this.i);
      }
    } else {
      this.cartService.removeItem(this.i);
    }
  }
}
