// Clean chef-dashboard-component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ChefDashboardService } from '../../chef-dashboard.service';
import { AddRestaurant } from '../../../services/chef/add-restaurant';
import { AuthService } from '../../../services/auth.service';
import { Restaurant, RestaurantInputDto } from '../../../models/AddRestaurant.model';

// Component imports
import { ChefDashboardHeaderComponent } from '../../chef-dashboard-header/chef-dashboard-header.component';
import { ChefDashboardEarningsComponent } from '../../chef-dashboard-earnings/chef-dashboard-earnings.component';
import { ChefDashboardPastOrdersComponent } from '../../chef-dashboard-past-orders/chef-dashboard-past-orders.component';
import { ChefDashboardStatsCardsComponent } from '../../chef-dashboard-stats-cards/chef-dashboard-stats-cards.component';
import { ChefDashboardCurrentOrdersComponent } from '../../chef-dashboard-current-orders/chef-dashboard-current-orders.component';
import { ChefDashboardMenuComponent } from '../../chef-dashboard-menu/chef-dashboard-menu.component';
import { ChefRestaurantSettingsComponent } from '../../chef-restaurant-settings/chef-restaurant-settings';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChefDashboardHeaderComponent,
    ChefDashboardEarningsComponent,
    ChefDashboardPastOrdersComponent,
    ChefDashboardStatsCardsComponent,
    ChefDashboardCurrentOrdersComponent,
    ChefDashboardMenuComponent,
    ChefRestaurantSettingsComponent
  ],
  templateUrl: './chef-dashboard-component.html',
  styleUrl: './chef-dashboard-component.css'
})
export class ChefDashboardComponent implements OnInit, OnDestroy {
  restaurant: Restaurant | null = null;
  hasRestaurant = false;
  isLoading = true;
  errorMessage = '';
  restaurantId: number | null = null;
  isSettingsModalOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    public chefDashboardService: ChefDashboardService,
    private restaurantService: AddRestaurant,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.checkRestaurantStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Check if chef has a restaurant
  checkRestaurantStatus(): void {
    this.isLoading = true;
    this.restaurantService.checkChefHasRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hasRestaurant) => {
          this.hasRestaurant = hasRestaurant;
          this.isLoading = false;

          if (hasRestaurant) {
            // Get restaurant details to obtain ID
            this.getRestaurantDetails();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        }
      });
  }

  private getRestaurantDetails(): void {
    // You'll need to add this endpoint to your backend and service
    this.restaurantService.getChefRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurant) => {
          this.restaurant = restaurant;
          this.restaurantId = restaurant.id || null;
        },
        error: (error) => {
          console.error('Error getting restaurant details:', error);
        }
      });
  }

  notification: { type: 'success' | 'error', message: string } | null = null;

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }

  // Update restaurant (you can call this from a modal or edit form)
  updateRestaurant(restaurantId: number, updateData: Partial<RestaurantInputDto>): void {
    this.restaurantService.updateRestaurant(restaurantId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRestaurant) => {
          this.restaurant = updatedRestaurant;
          this.showNotification('success', 'Restaurant updated successfully');
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.showNotification('error', error.message);
        }
      });
  }

  // Delete restaurant
  deleteRestaurant(restaurantId: number): void {
    if (confirm('Are you sure you want to delete your restaurant? This action cannot be undone.')) {
      this.restaurantService.deleteRestaurant(restaurantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.hasRestaurant = false;
            this.restaurant = null;
            console.log('Restaurant deleted successfully');
            // Redirect to add restaurant page
          },
          error: (error) => {
            this.errorMessage = error.message;
            console.error('Error deleting restaurant:', error);
          }
        });
    }
  }

  openRestaurantSettings(): void {
    if (this.restaurant) {
      this.isSettingsModalOpen = true;
      document.body.classList.add('overflow-hidden');
    }
  }

  onSettingsSave(updateData: Partial<RestaurantInputDto>): void {
    if (this.restaurantId) {
      this.updateRestaurant(this.restaurantId, updateData);
      this.isSettingsModalOpen = false;
    }
  }

  onSettingsCancel(): void {
    this.isSettingsModalOpen = false;
    document.body.classList.remove('overflow-hidden');
  }
}


