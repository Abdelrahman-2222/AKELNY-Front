// import { CartService, ItemType } from './../../cart/cart.service';
// import { NgFor, NgForOf } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Component, Input, OnDestroy, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subscription } from 'rxjs';
//
// interface ItemReview {
//   id: number;
//   userName: string;
//   rating: number;
//   comment: string;
//   date: string;
//   userImage: string;
// }
//
// @Component({
//   selector: 'app-item-details',
//   templateUrl: './item-details.html',
//   styleUrl: './item-details.css',
//   imports: [NgFor, NgForOf],
// })
// export class ItemDetails implements OnInit, OnDestroy {
//   itemId = 0;
//   restaurantId: number = -1;
//   itemData: any;
//   itemDTO: ItemType = {} as ItemType;
//
//   /**
//    *
//    */
//   /**
//    *
//    */
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient,
//     public cartService: CartService
//   ) {
//     // console.log(this.router.getCurrentNavigation());
//   }
//   // @Input({ required: true }) restId!: number;
//   subscription1!: Subscription;
//   //subscription2!: Subscription;
//
//   ngOnInit(): void {
//     //const currentState = this.router.getCurrentNavigation();
//     //console.log(currentState?.extras?.state?.['restId']);
//     this.route.paramMap
//       .subscribe((params) => {
//         const id = params.get('id');
//         // console.log('route param id', id);
//         // console.log(history.state['restId']);
//         // console.log(this.router);
//         // console.log(this.router.routerState.snapshot);
//         this.itemId = Number(id);
//       })
//       .unsubscribe();
//
//     this.subscription1 = this.http
//       .get(`https://localhost:7045/api/Items/GetById/${this.itemId}`)
//       .subscribe(
//         (data: any) => {
//           console.log(data);
//           this.itemData = data;
//           this.restaurantId = data?.restaurantId;
//           console.log(this.restaurantId);
//           this.itemDTO = {
//             id: data.id,
//             name: data.name,
//             price: data.price,
//             image: data.imageUrl,
//             categoryName: '',
//             addOnIds: structuredClone(data.addOnIds),
//             comboIds: structuredClone(data.comboIds),
//           };
//           console.log(this.itemDTO);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//   }
//   ngOnDestroy() {
//     //console.log(this.itemId, '---------');
//     this.subscription1.unsubscribe();
//     //this.subscription2.unsubscribe();
//   }
//   item = {
//     name: 'Margherita Pizza',
//     description:
//       'The Margherita Pizza is a classic Italian dish with a thin and crispy crust, rich tomato sauce, fresh mozzarella cheese and basil leaves.',
//     images: [
//       'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//       'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     ],
//     mainImage:
//       'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     ingredients: ['Tomato Sauce', 'Mozzarella Cheese', 'Basil Leaves'],
//   };
//
//   reviews: ItemReview[] = [
//     // Add your review data here
//     {
//       userName: 'ahmed',
//       date: '',
//       comment: 'comment',
//       id: 2,
//       rating: 2.5,
//       userImage:
//         'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     },
//     {
//       userName: 'ahmed',
//       date: '',
//       comment: 'comment',
//       id: 2,
//       rating: 2.5,
//       userImage:
//         'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     },
//     {
//       userName: 'ahmed',
//       date: '',
//       comment: 'comment',
//       id: 2,
//       rating: 2.5,
//       userImage:
//         'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     },
//     {
//       userName: 'ahmed',
//       date: '',
//       comment: 'comment',
//       id: 2,
//       rating: 2.5,
//       userImage:
//         'https://artandcreativity.com/wp-content/uploads/2019/03/food-photography-101.jpg',
//     },
//   ];
// }

// src/app/pages/home/item-details/item-details.ts
import { CartService, ItemType } from './../../cart/cart.service';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ItemClassDto, ItemSizeType, ItemSizePriceDto, AddOnGetDto, ComboGetDto } from '../../../models/ItemDetailsViewCustomer';
import { ViewItemDetailsService } from '../../../services/ViewItemDetails';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.html',
  styleUrls: ['./item-details.css'],
  imports: [CommonModule, FormsModule],
})
export class ItemDetails implements OnInit, OnDestroy {
  itemId = 0;
  restaurantId: number = -1;
  itemData: ItemClassDto | null = null;
  loading = true;
  error: string | null = null;

  // Selection state
  selectedSize: ItemSizePriceDto | null = null;
  selectedAddOns: Set<number> = new Set();
  selectedCombos: Set<number> = new Set();
  selectedWeight = 1;

  private subscription!: Subscription;
  private navigationState: any = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public cartService: CartService,
    private viewItemDetailsService: ViewItemDetailsService
  ) {
    // Capture navigation state
    const navigation = this.router.getCurrentNavigation();
    this.navigationState = navigation?.extras?.state;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.itemId = Number(id);
        this.loadItemDetails();
      }
    });
  }

  public loadItemDetails(): void {
    this.loading = true;
    this.error = null;

    this.subscription = this.viewItemDetailsService
      .getItemById(this.itemId)
      .subscribe({
        next: (data) => {
          this.itemData = data;
          this.restaurantId = data.restaurantId;
          this.initializeDefaults();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load item details';
          this.loading = false;
          console.error('Error loading item:', error);
        }
      });
  }

  private initializeDefaults(): void {
    if (!this.itemData) return;

    // Set default size for sized items
    if (this.itemData.sizeType === ItemSizeType.Sized && this.itemData.sizePricing?.length) {
      this.selectedSize = this.itemData.sizePricing[0];
    }

    // Set default weight for weighted items
    if (this.itemData.sizeType === ItemSizeType.Weighted && this.itemData.weight) {
      this.selectedWeight = this.itemData.weight;
    }
  }

  toggleAddOn(addOn: AddOnGetDto): void {
    if (this.selectedAddOns.has(addOn.id)) {
      this.selectedAddOns.delete(addOn.id);
    } else {
      this.selectedAddOns.add(addOn.id);
    }
  }

  toggleCombo(combo: ComboGetDto): void {
    if (this.selectedCombos.has(combo.id)) {
      this.selectedCombos.delete(combo.id);
    } else {
      this.selectedCombos.add(combo.id);
    }
  }

  selectSize(size: ItemSizePriceDto): void {
    this.selectedSize = size;
  }

  calculateTotalPrice(): number {
    if (!this.itemData) return 0;

    let total = 0;

    // Base price calculation
    switch (this.itemData.sizeType) {
      case ItemSizeType.Fixed:
        total = this.itemData.price;
        break;
      case ItemSizeType.Sized:
        total = this.selectedSize?.price || this.itemData.price;
        break;
      case ItemSizeType.Weighted:
        total = this.itemData.price * this.selectedWeight;
        break;
    }

    // Add-ons
    if (this.itemData.addOns) {
      this.itemData.addOns.forEach(addOn => {
        if (this.selectedAddOns.has(addOn.id)) {
          total += addOn.additionalPrice;
        }
      });
    }

    // Combos
    if (this.itemData.combos) {
      this.itemData.combos.forEach(combo => {
        if (this.selectedCombos.has(combo.id)) {
          total += combo.comboPrice;
        }
      });
    }

    return total;
  }

  addToCart(): void {
    if (!this.itemData) return;

    const itemForCart: ItemType = {
      id: this.itemData.id,
      name: this.itemData.name,
      price: this.calculateTotalPrice().toString(),
      image: this.itemData.imageUrl || '',
      categoryName: '',
      addOnIds: Array.from(this.selectedAddOns),
      comboIds: Array.from(this.selectedCombos)
    };

    this.cartService.addToCart(this.restaurantId, itemForCart);
  }

  getSizeLabel(size: number): string {
    const sizeLabels: { [key: number]: string } = {
      0: 'Small',
      1: 'Medium',
      2: 'Large'
    };
    return sizeLabels[size] || `Size ${size}`;
  }

  goBack(): void {
    // Try to use browser back navigation first to preserve cache
    if (window.history.length > 1 && this.navigationState) {
      window.history.back();
    } else if (this.restaurantId && this.restaurantId !== -1) {
      // Navigate to restaurant details without state (will use cache)
      this.router.navigate(['/customer/restaurant-details', this.restaurantId]);
    } else {
      this.router.navigate(['/main']);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
