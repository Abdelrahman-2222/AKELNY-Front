import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddRestaurant } from '../../services/chef/add-restaurant';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {
  constructor(
    private router: Router,
    private authService: AuthService,
    private restaurantService: AddRestaurant,
  ) { }

  handleOrderNow() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const role = this.authService.getUserRole();
    //console.log('Current user role:', role);

    if (role === 'Customer') {
      this.router.navigate(['/customer/restaurant']);
    } else {
      // console.log('Access denied for role:', role);
      this.router.navigate(['/unauthorized']);
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }

  handleBecomeChef(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const role = this.authService.getUserRole();
    if (role === 'Chef' || role === 'chef') {
      // Check if chef has a restaurant
      this.restaurantService.checkChefHasRestaurant().subscribe({
        next: (hasRestaurant) => {
          if (hasRestaurant) {
            this.router.navigate(['/chef/chef-dashboard']);
          } else {
            this.router.navigate(['/chef/chef-add-restaurant']);
          }
        },
        error: () => {
          this.router.navigate(['/chef/chef-add-restaurant']);
        }
      });
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}
