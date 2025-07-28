import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,
} from 'lucide-angular';
import { AuthService } from '../../../../services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  cartCount = 3;
  isDarkMode = false;
  isAuthenticated = false; // Add this property

  // Expose icons to template
  readonly Search = Search;
  readonly ShoppingCart = ShoppingCart;
  readonly User = User;
  readonly Sun = Sun;
  readonly Moon = Moon;

  constructor(
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Check authentication status
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    this.isMobileMenuOpen = false;
    this.isAuthenticated = false; // Update status
    this.router.navigate(['/login']);
  }
}
