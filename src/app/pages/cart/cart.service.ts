import { AddOn } from './../../models/AddItemChef';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { OrderCreateDTO } from '../../models/order-create-dto';
import { OrderItemCreateDTO } from '../../models/order-item-create-dto';
import { catchError, Observable } from 'rxjs';
import { Order } from '../../models/order-model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public lastOrderId: number | null = null;
  orderDTO: OrderCreateDTO = {
    RestaurantId: 0,
    Items: [
      {
        ItemId: 0,
        Quantity: 1000,
        AddOnIds: [0],
        ComboIds: [0],
      },
    ],
    DistanceKm: 0,
    // "amount": 0
  };

  http: HttpClient = inject(HttpClient);
  checkoutUrl = `${environment.apiUrl}/Orders/create-ckeckout-session`;
  paymentSessionUrl = `${environment.apiUrl}/Orders`;

  public restaurantId = -1;

  public cartItems: CartItemType[] = [];
  //public cartItems: OrderCreateDTO[] = [];

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
    if (this.restaurantId === -1) this.restaurantId = restId;
    else if (this.restaurantId !== restId) {
      alert("You can't order items for more than a restaurant in the same order!");
      return;
    }

    const isFound = this.cartItems.some(el => el.id === item.id);
    if (isFound) {
      console.log('The item already exists!');
      return;
    }

    this.cartItems.push({
      ...item,
      price: +item.price,
      quantity: 1,
      restId: restId,
      addOnIds: item.addOnIds || [],
      comboIds: item.comboIds || []
    });

    this.calculateSummary();
    console.log('Item added to cart:', this.cartItems);
  }

  public transferToDto() {
    if (this.cartItems.length === 0) {
      console.error('Cart is empty - cannot create order');
      return;
    }

    // Initialize orderDTO with proper structure
    let orderDTO: OrderCreateDTO = {
      RestaurantId: this.restaurantId,
      DistanceKm: 0,
      Items: []
    };

    // Create order items array
    this.cartItems.forEach((item) => {
      orderDTO.Items.push({
        ItemId: item.id,
        Quantity: item.quantity,
        AddOnIds: item.addOnIds || [],
        ComboIds: item.comboIds || []
      });
    });

    this.orderDTO = orderDTO;
    console.log('Transfer to DTO - Final orderDTO:', this.orderDTO);
  }

  public checkoutOrder(): Observable<any> {
    // Validate cart before transfer
    if (this.cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    if (this.restaurantId === -1) {
      throw new Error('No restaurant selected');
    }

    this.transferToDto();

    console.log('Sending checkout request with:', this.orderDTO);

    return this.http.post<any>(this.checkoutUrl, this.orderDTO).pipe(
      catchError(error => {
        console.error('Checkout error:', error);
        throw error;
      })
    );
  }

  public createPaymentSession(orderId: number): Observable<any> {
    return this.http.post<any>(`${this.paymentSessionUrl}/${orderId}/create-payment-session`, {});
  }

  public clearCart(): void {
    this.cartItems = [];
    this.restaurantId = -1;
    this.calculateSummary();
  }
}

export type ItemType = {
  id: number;
  name: string;
  price: string;
  image: string;
  categoryName: string;
  addOnIds?: number[];
  comboIds?: number[];
};

export type CartItemType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  categoryName: string;
  restId: number;

  addOnIds: number[];
  comboIds: number[];
};

//when you do checkout ensure that the cart items will emptied
