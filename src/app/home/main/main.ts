import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AddRestaurant} from '../../services/chef/add-restaurant';
// import {SearchService} from '../../services/search.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main{
  searchResults: any[] = [];
  constructor(
    private router: Router,
    private authService: AuthService,
    private restaurantService: AddRestaurant,
    // private searchService: SearchService
  ) {}

  // ngOnInit() {
  //   this.searchService.setSearchConfig({
  //     placeholder: 'Search dishes, chefs, categories...',
  //     searchFunction: (query: string) => this.searchComponents(query),
  //     isVisible: true
  //   });
  // }

  // ngOnDestroy() {
  //   this.searchService.clearSearch();
  // }

  // private searchComponents(query: string) {
  //   console.log('Searching for:', query);
  //
  //   // Example search logic - replace with your actual search API call
  //   const mockResults = [
  //     { type: 'dish', name: 'Pizza Margherita', chef: 'Mario' },
  //     { type: 'chef', name: 'Chef Sarah', specialty: 'Italian' },
  //     { type: 'category', name: 'Italian Food' }
  //   ].filter(item =>
  //     item.name.toLowerCase().includes(query.toLowerCase())
  //   );
  //
  //   // You can emit results to navbar or navigate to search results page
  //   this.router.navigate(['/search'], {
  //     queryParams: { q: query },
  //     state: { results: mockResults }
  //   });
  // }

  handleOrderNow() {
    const user = this.getCurrentUser();

    if (user) {
      // User is authenticated - redirect based on role
      if (user.role === 'Customer' || user.role === 'customer') {
        this.router.navigate(['/customer/categories']);
      } else {
        this.router.navigate(['/unauthorized']);
      }
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  handleBecomeChef(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const role = this.authService.getUserRole();
    if (role === 'Chef') {
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
          // If check fails, default to add restaurant
          this.router.navigate(['/chef/chef-add-restaurant']);
        }
      });
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  private getCurrentUser() {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}
