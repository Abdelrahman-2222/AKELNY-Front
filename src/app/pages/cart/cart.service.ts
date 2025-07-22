import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public cartItems = [
    { name: 'Wiape Braw', price: 100, quantity: 1 },
    { name: 'Goot Cooked', price: 120, quantity: 2 },
    { name: 'Cam Olife', price: 80, quantity: 1 },
  ];
  
  summary = {
    subtotal: 420,
    deliveryFee: 50,
    tax: 42,
    total: 512,
  };

  updateQuantity(item: any, change: number) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
    this.calculateSummary();
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateSummary();
  }

  calculateSummary() {
    this.summary.subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.summary.tax = this.summary.subtotal * 0.1;
    this.summary.total =
      this.summary.subtotal + this.summary.deliveryFee + this.summary.tax;
  }
}
