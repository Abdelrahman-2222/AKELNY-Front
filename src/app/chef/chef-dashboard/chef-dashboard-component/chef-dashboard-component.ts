// Clean chef-dashboard-component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ChefDashboardService } from '../../chef-dashboard.service';
import { AddRestaurant } from '../../../services/chef/add-restaurant';
import { AuthService } from '../../../services/auth.service';
import { Restaurant, RestaurantInputDto } from '../../../models/AddRestaurant.model';

import { LucideAngularModule, Clock, Star, MapPin,  Store} from 'lucide-angular';

// Component imports
import { ChefDashboardHeaderComponent } from '../../chef-dashboard-header/chef-dashboard-header.component';
// import { ChefDashboardEarningsComponent } from '../../chef-dashboard-earnings/chef-dashboard-earnings.component';
// import { ChefDashboardPastOrdersComponent } from '../../chef-dashboard-past-orders/chef-dashboard-past-orders.component';
// import { ChefDashboardStatsCardsComponent } from '../../chef-dashboard-stats-cards/chef-dashboard-stats-cards.component';
// import { ChefDashboardCurrentOrdersComponent } from '../../chef-dashboard-current-orders/chef-dashboard-current-orders.component';
// import { ChefDashboardMenuComponent } from '../../chef-dashboard-menu/chef-dashboard-menu.component';
import { ChefRestaurantSettingsComponent } from '../../chef-restaurant-settings/chef-restaurant-settings';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChefDashboardHeaderComponent,
    // ChefDashboardEarningsComponent,
    // ChefDashboardPastOrdersComponent,
    // ChefDashboardStatsCardsComponent,
    // ChefDashboardCurrentOrdersComponent,
    // ChefDashboardMenuComponent,
    ChefRestaurantSettingsComponent,
    LucideAngularModule
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
  readonly Clock = Clock;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly Store = Store;

  private destroy$ = new Subject<void>();

  constructor(
    public chefDashboardService: ChefDashboardService,
    private restaurantService: AddRestaurant,
    private authService: AuthService,
    private router: Router
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
    this.restaurantService.getChefRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurant) => {
          this.restaurant = restaurant;
          this.restaurantId = restaurant.id || null;
          console.log('Restaurant loaded:', restaurant); // Debug log
        },
        error: (error) => {
          console.error('Error getting restaurant details:', error);
        }
      });
  }

  // Updated method to parse the string format opening hours from your API
  parseOpeningHours(openingHoursStr: string): Array<{ day: string, isOpen: boolean, hours: string }> {
    if (!openingHoursStr) {
      return [];
    }

    try {
      // Parse the string format: "Monday: 9:00 AM - 10:00 PM, Tuesday: 9:00 AM - 10:00 PM, ..."
      const dayHoursPairs = openingHoursStr.split(', ');
      const parsedHours: Array<{ day: string, isOpen: boolean, hours: string }> = [];

      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      daysOfWeek.forEach(dayName => {
        const dayPair = dayHoursPairs.find(pair => pair.startsWith(dayName));

        if (dayPair) {
          const [day, hours] = dayPair.split(': ');
          const isOpen = hours.toLowerCase() !== 'closed';

          parsedHours.push({
            day: day,
            isOpen: isOpen,
            hours: isOpen ? hours : 'Closed'
          });
        } else {
          // If day is not found, assume closed
          parsedHours.push({
            day: dayName,
            isOpen: false,
            hours: 'Closed'
          });
        }
      });

      return parsedHours;
    } catch (error) {
      console.error('Error parsing opening hours:', error);
      return [];
    }
  }

  // Helper method to format time to 12-hour format (keeping for compatibility)
  formatTime12Hour(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  }

  notification: { type: 'success' | 'error', message: string } | null = null;

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = {type, message};
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
      this.closeSettingsModal();
    }
  }


  onSettingsCancel(): void {
    this.closeSettingsModal();
  }

  private closeSettingsModal(): void {
    this.isSettingsModalOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  AddItems()
  {
    // navigate to chef-dashboard-item.component.html
    this.router.navigate(['/chef/chef-dashboard-item']);
  }
  ViewMenu()
  {
    // Logic to view items in the restaurant menu
    this.router.navigate(['/chef/chef-dashboard-menu']);

    // You can implement the logic to navigate to a view items page or open a modal
  }
  ViewOrders() {
    // Logic to view orders for the restaurant
    console.log('View orders clicked');
    // You can implement the logic to navigate to a view orders page or open a modal
  }
}

