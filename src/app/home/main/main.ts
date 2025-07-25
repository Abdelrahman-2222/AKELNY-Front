import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {
  constructor(private router: Router) {}

  handleOrderNow() {
    const user = this.getCurrentUser();

    if (user) {
      // User is authenticated - redirect based on role
      if (user.role === 'Customer' || user.role === 'customer') {
        this.router.navigate(['/customer/categories']);
      } else {
        this.router.navigate(['/register']);
      }
    } else {
      // User not authenticated - go to register
      this.router.navigate(['/register']);
    }
  }

  handleBecomeChef() {
    const user = this.getCurrentUser();

    if (user) {
      // User is authenticated - redirect based on role
      if (user.role === 'Chef' || user.role === 'chef') {
        console.log(user.role);
        this.router.navigate(['/chef/chef-dashboard']); // Go to chef dashboard
      } else {
        console.log(user.role);
        this.router.navigate(['/register']);
      }
    } else {
      // console.log(user.role);
      // User not authenticated - go to register
      this.router.navigate(['/register']);
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
