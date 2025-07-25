import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  handleChefNavigation() {
    const user = this.getCurrentUser();

    if (user?.role === 'Chef') {
      this.router.navigate(['/chef']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  handleCustomerNavigation() {
    const user = this.getCurrentUser();

    if (user?.role === 'Customer' || user?.role === 'Chef') {
      this.router.navigate(['/customer']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  private getCurrentUser() {
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

  onNewsletterSubmit(email: string) {
    if (email && email.includes('@')) {
      console.log('Newsletter subscription for:', email);
    }
  }
}
