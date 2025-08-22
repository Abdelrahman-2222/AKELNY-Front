import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
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
import { AuthService } from '../../../../services/auth.service';
import {
  SearchConfig,
  SearchService,
} from '../../../../services/search.service';
import { UserService } from '../../../../services/user.service';
import { CartService } from '../../../../pages/cart/cart.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMainPage = false;
  isScrolled = false;
  isMobileMenuOpen = false;
  cartCount = 3;
  isDarkMode = false;
  isAuthenticated = false;
  searchConfig: SearchConfig = {
    placeholder: '',
    searchFunction: () => {},
    isVisible: false,
    showResultsDropdown: false,
  };
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  private destroy$ = new Subject<void>();

  readonly Search = Search;
  readonly ShoppingCart = ShoppingCart;
  readonly User = User;
  readonly Sun = Sun;
  readonly Moon = Moon;

  userImageUrl: string | null = null;

  constructor(
    public router: Router,
    private authService: AuthService,
    private searchService: SearchService,
    private userService: UserService
  ) {
    this.router.events.subscribe(() => {
      this.isMainPage = this.router.url === '/main';
    });
  }

  public cartService = inject(CartService);

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user?.imageUrl) {
        // Handle both local uploads and external URLs (like Google profile pictures)
        if (user.imageUrl.startsWith('http')) {
          // External URL (Google, etc.) - use as is
          this.userImageUrl = user.imageUrl;
        } else {
          // Local upload - construct URL based on environment
          this.userImageUrl = environment.production
            ? `${environment.uploadsUrl}${user.imageUrl}`
            : `${environment.uploadsUrl}${user.imageUrl}`;
        }
      } else {
        this.userImageUrl = null;
      }
    });

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    this.checkAuthStatus();

    this.searchService.searchConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        this.searchConfig = config;
      });
  }

  onSearch() {
    if (this.searchQuery.trim() && this.searchConfig.searchFunction) {
      this.searchConfig.searchFunction(this.searchQuery.trim());
      this.showSearchResults = false;
    }
  }

  onSearchInput() {
    if (this.searchConfig.searchFunction) {
      this.searchConfig.searchFunction(this.searchQuery.trim());
    }
    this.showSearchResults =
      this.searchConfig.showResultsDropdown &&
      this.searchQuery.trim().length > 0;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.userService.clearUser();
    this.isMobileMenuOpen = false;
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  protected readonly navigator = navigator;
}
