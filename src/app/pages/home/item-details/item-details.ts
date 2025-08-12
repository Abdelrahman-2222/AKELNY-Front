import { NgFor, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
export class ItemDetails implements OnInit {
  itemId = 0;

  /**
   *
   */
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap
      .subscribe((params) => {
        const id = params.get('id');
        console.log('route param id', id);
        this.itemId = Number(id);
      })
      .unsubscribe();
  }
  ngOnDestroy() {
    //console.log(this.itemId, '---------');
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
