import { AddOn } from './../../models/AddItemChef';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { OrderCreateDTO } from '../../models/order-create-dto';
import { OrderItemCreateDTO } from '../../models/order-item-create-dto';
import { catchError, Observable } from 'rxjs';
import { Order } from '../../models/order-model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
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
  checkoutUrl = 'https://localhost:7045/api/Orders/create-ckeckout-session';

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
      addOnIds: [],
      comboIds: [],
    });

    this.calculateSummary();
    console.log(this.cartItems);
  }

  public transferToDto() {
    if (this.cartItems.length === 0) return;

    let orderDTO: OrderCreateDTO = {} as OrderCreateDTO;
    let orderItemsDTOArr: OrderItemCreateDTO[] = [];

    orderDTO.RestaurantId = this.restaurantId;
    orderDTO.DistanceKm = 0;
    orderDTO.Items = [];

    this.cartItems.forEach((el) => {
      orderItemsDTOArr.push({
        ItemId: el.id,
        Quantity: el.quantity,
        AddOnIds: [...el.addOnIds],
        ComboIds: [...el.comboIds],
      });
    });
    orderDTO.Items.push(...orderItemsDTOArr);
    this.orderDTO = structuredClone(orderDTO);
    console.log('class val: ', this.orderDTO);
    console.log(orderDTO);
  }

  public checkoutOrder(): Observable<OrderCreateDTO> {
    this.transferToDto();
    return this.http.post<OrderCreateDTO>(this.checkoutUrl, this.orderDTO);
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
