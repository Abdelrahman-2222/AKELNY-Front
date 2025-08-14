import { CartService, ItemType } from './../../cart/cart.service';
import { NgFor, NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface ItemReview {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userImage: string;
}

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.html',
  imports: [NgFor, NgForOf],
})
export class ItemDetails implements OnInit, OnDestroy {
  itemId = 0;
  restaurantId: number = -1;
  itemDTO: ItemType = {} as ItemType;

  /**
   *
   */
  /**
   *
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public cartService: CartService
  ) {
    // console.log(this.router.getCurrentNavigation());
  }
  // @Input({ required: true }) restId!: number;
  subscription1!: Subscription;
  //subscription2!: Subscription;

  ngOnInit(): void {
    //const currentState = this.router.getCurrentNavigation();
    //console.log(currentState?.extras?.state?.['restId']);
    this.route.paramMap
      .subscribe((params) => {
        const id = params.get('id');
        // console.log('route param id', id);
        // console.log(history.state['restId']);
        // console.log(this.router);
        // console.log(this.router.routerState.snapshot);
        this.itemId = Number(id);
      })
      .unsubscribe();

    this.subscription1 = this.http
      .get(`https://localhost:7045/api/Items/GetById/${this.itemId}`)
      .subscribe(
        (data: any) => {
          console.log(data);
          this.itemDTO = data;
          this.restaurantId = data?.restaurantId;
          console.log(this.restaurantId);
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }
  ngOnDestroy() {
    //console.log(this.itemId, '---------');
    this.subscription1.unsubscribe();
    //this.subscription2.unsubscribe();
  }
  item = {
    name: 'Margherita Pizza',
    description:
      'The Margherita Pizza is a classic Italian dish with a thin and crispy crust, rich tomato sauce, fresh mozzarella cheese and basil leaves.',
    images: [
      'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
      'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    ],
    mainImage:
      'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    ingredients: ['Tomato Sauce', 'Mozzarella Cheese', 'Basil Leaves'],
  };

  reviews: ItemReview[] = [
    // Add your review data here
    {
      userName: 'ahmed',
      date: '',
      comment: 'comment',
      id: 2,
      rating: 2.5,
      userImage:
        'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    },
    {
      userName: 'ahmed',
      date: '',
      comment: 'comment',
      id: 2,
      rating: 2.5,
      userImage:
        'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    },
    {
      userName: 'ahmed',
      date: '',
      comment: 'comment',
      id: 2,
      rating: 2.5,
      userImage:
        'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    },
    {
      userName: 'ahmed',
      date: '',
      comment: 'comment',
      id: 2,
      rating: 2.5,
      userImage:
        'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
    },
  ];
}
