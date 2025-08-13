import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  httpClient: HttpClient = inject(HttpClient);

  public restaurantId = -1;

  public cartItems: CartItemType[] = [];

  summary = {
    subtotal: this.cartItems.reduce(
      (acc, cur) => acc + cur.price * cur.quantity,
      0
    ),
    deliveryFee: 0,
    tax: 42,
    total: this.cartItems.reduce(
      (acc, cur) => acc + cur.price * cur.quantity,
      0
    ),
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
    //this.summary.tax = this.summary.subtotal * 0.1;
    this.summary.total = this.summary.subtotal; //+ this.summary.deliveryFee  + this.summary.tax;
  }

  calcTotal(): number {
    //this.calculateSummary();
    return this.summary.subtotal + this.summary.deliveryFee;
  }

  public addToCart(restId: number, item: ItemType): void {
    //ensure that all orders from the same restaurant
    if (this.restaurantId === -1) this.restaurantId = restId;
    else if (this.restaurantId !== restId) {
      alert(
        "You can't order items for more than a restaurant in the same order!"
      );
      return;
    }
    //prevent item duplication
    const isFound: boolean = this.cartItems
      .map((el) => el.id)
      .includes(item.id);
    console.log(isFound);
    if (isFound) {
      console.log('The item already exists!!!');
      return;
    }
    this.cartItems.push({
      ...item,
      price: +item.price,
      quantity: 1,
      restId: restId,
    });

    this.calculateSummary();
    console.log(this.cartItems);
  }

  public checkout() {}
}

type ItemType = {
  id: number;
  name: string;
  price: string;
  image: string;
  categoryName: string;
};

export type CartItemType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  categoryName: string;
  restId: number;
};

//when you do checkout ensure that the cart items will emptied
