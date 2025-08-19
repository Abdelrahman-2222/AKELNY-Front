import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';
import { Footer } from '../../../shared/components/footer/footer';
import { CategoriesComponent } from '../categories/categories.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GetService } from '../../../services/requests/get-service';
import { RestaurantDetails } from '../../../models/RestaurantDetails.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CartService } from '../../cart/cart.service';
import { LucideAngularModule,Package} from 'lucide-angular';


@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant.details.component.html',
  styleUrl:'./restaurant.details.component.css',
  imports: [CommonModule, CategoriesComponent, Pagination , LucideAngularModule],
})
export class RestaurantDetailsComponent implements OnInit {

  readonly Package = Package;
  isLoading = true;
  errorMessage = ''

  router = inject(Router);
  cartService = inject(CartService);
  getService = inject(GetService);
  route = inject(ActivatedRoute);
  restId: number = 0;
  restDetails: RestaurantDetails | undefined;

  //pagination
  page = 1;
  pageSize = 4;
  totalPages = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const restaurantId = params.get('id');
      if (restaurantId) {
        this.restId = +restaurantId; // Convert to number
        console.log(`Restaurant ID: ${restaurantId}`);
        // You can now use the restaurantId to fetch details or perform other actions
      } else {
        console.error('No restaurant ID found in the route parameters.');
      }
    });

    //load restaurant details
    this.loadRestaurantDetails();
  }

  loadRestaurantDetails() {
    this.isLoading = true;
    this.errorMessage = '';

    this.getService
      .get<RestaurantDetails>({
        url: `https://localhost:7045/api/Restaurants/customer-restaurant/${this.restId}?page=${this.page}&pageSize=${this.pageSize}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      })
      .subscribe({
        next: (data: any) => {
          this.restDetails = data;
          this.totalPages = data.totalPages;
          this.isLoading = false
          console.log(this.restDetails);
        },
        error: (err) => {
          this.isLoading = false
          this.errorMessage = "Can't fetch restaurant Details"
          console.error('Error fetching restDetails:', err);
        },
        complete: () => {
          console.log('Restaurant data fetch complete');
        },
      });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.loadRestaurantDetails();
  }
  showItemDetails(itemId: number): void {
    console.log(`itemId : ${itemId}`);
    this.router.navigate(['/customer/item-details', itemId]);
  }
}
