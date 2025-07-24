import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  ShoppingCart,
  User,
} from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent {
  isScrolled = false;
  isMobileMenuOpen = false;
  cartCount = 3;

  // Expose icons to template
  readonly Search = Search;
  readonly ShoppingCart = ShoppingCart;
  readonly User = User;

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    this.isMobileMenuOpen = false;
    this.router.navigate(['/login']);
  }
}
