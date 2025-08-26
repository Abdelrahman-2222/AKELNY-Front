import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GetService } from '../../../services/requests/get-service';
import { CategoryItem } from '../../../models/CategoryItem.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { CartService } from '../../cart/cart.service';
import { LucideAngularModule, Package } from 'lucide-angular';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-category-items',
  imports: [CommonModule,Pagination,LucideAngularModule,NgIf],
  templateUrl: './restaurant-category-items.html',
  styleUrl: './restaurant-category-items.css'
})
export class RestaurantCategoryItems implements OnInit {

  readonly Package = Package;
  route = inject(ActivatedRoute);
  router = inject(Router);
  getService = inject(GetService)
  cartService = inject(CartService);
  // Pagination
  page = 1;
  pageSize = 4;
  totalPages = 0;

  loading = false;
  error: string | null = null;
  CategoryItem: CategoryItem | null = null;
  catId = -1
  restId = -1

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const catId = params.get('catId');
      const restId = params.get('restId')
      if (catId && restId != null) {
        this.catId = +catId;
        this.restId = +restId;
        // console.log(this.catId)
        // console.log(this.restId)
        this.loadCatItems();
      } else {
        // console.error('No Category ID and restaurant ID Not found in the route parameters.');
      }
    });
  }

    loadCatItems(): void {
      this.loading = true;
      this.error = '';

      this.getService
        .get<CategoryItem>({
          url:
            `https://localhost:7045/api/restaurants/restCatItems/${this.restId}?`
            +  `catId=${this.catId}&page=${this.page}&pageSize=${this.pageSize}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        })
        .subscribe({
          next: (data: any) => {
            this.CategoryItem = data
            this.totalPages = data.totalCount;
            this.loading = false;
            // console.log(this.CategoryItem);
          },
          error: (err) => {
            // console.error('Error fetching restaurants:', err);
          },
          complete: () => {
            // console.log('Restaurant data fetch complete');
          },
        });
    }

    showItemDetails(itemId: number): void {
    // console.log(`Navigating to item: ${itemId}`);
    this.router.navigate(['/customer/item-details', itemId]);
  }

    onPageChange(event: { page: number; pageSize: number }): void {
      this.loading = false;
      this.page = event.page;
      this.pageSize = event.pageSize;
      this.error = "Can't fetch restaurants"
      this.loadCatItems();
    }



}
