// chef-dashboard-menu.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Package, ChefHat, DollarSign, Star, Clock, Users, TrendingUp, Filter, Grid, List, Search } from 'lucide-angular';

import { ItemChef } from '../../services/chef/item-chef';
import { CategoryService } from '../../admin/services/category';
import { RestaurantService } from '../../services/chef/restaurant.service';
import { Category } from '../../admin/models/categoryModel';
import { ItemDto } from '../../models/AddItemChef';

interface MenuCategory {
  category: Category;
  items: ItemDto[];
}

@Component({
  selector: 'app-chef-dashboard-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './chef-dashboard-menu.component.html',
  styleUrl: './chef-dashboard-menu.component.css',
})
export class ChefDashboardMenuComponent implements OnInit, OnDestroy {
  menuCategories: MenuCategory[] = [];
  categories: Category[] = [];
  isLoading = true;
  errorMessage = '';
  restaurantId: number | null = null;

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  selectedCategory: number | null = null;

  // Statistics
  totalItems = 0;
  totalCategories = 0;
  averagePrice = 0;

  // Icons
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly Package = Package;
  readonly ChefHat = ChefHat;
  readonly DollarSign = DollarSign;
  readonly Star = Star;
  readonly Clock = Clock;
  readonly Users = Users;
  readonly TrendingUp = TrendingUp;
  readonly Filter = Filter;
  readonly Grid = Grid;
  readonly List = List;
  readonly Search = Search;

  private destroy$ = new Subject<void>();

  constructor(
    private itemService: ItemChef,
    private categoryService: CategoryService,
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurantMenu();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurantMenu(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get restaurant details first
    this.restaurantService.getChefRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurant) => {
          this.restaurantId = restaurant.id;
          this.loadMenuData();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load restaurant details';
          console.error('Error loading restaurant:', error);
        }
      });
  }

  private loadMenuData(): void {
    if (!this.restaurantId) return;

    // Load both categories and items concurrently
    forkJoin({
      categories: this.categoryService.getCategories(),
      items: this.itemService.getItemsByRestaurant(this.restaurantId)
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data.categories;
          this.organizeItemsByCategory(data.items);
          this.calculateStatistics(data.items);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load menu data';
          console.error('Error loading menu data:', error);
        }
      });
  }

  private organizeItemsByCategory(items: ItemDto[]): void {
    // Create a map of category ID to category object
    const categoryMap = new Map<number, Category>();
    this.categories.forEach(cat => categoryMap.set(cat.id, cat));

    // Group items by category
    const categoryItemsMap = new Map<number, ItemDto[]>();

    items.forEach(item => {
      const categoryId = item.categoryId;
      if (!categoryItemsMap.has(categoryId)) {
        categoryItemsMap.set(categoryId, []);
      }
      categoryItemsMap.get(categoryId)!.push(item);
    });

    // Create menu categories with proper category data
    this.menuCategories = Array.from(categoryItemsMap.entries()).map(([categoryId, categoryItems]) => ({
      category: categoryMap.get(categoryId) || { id: categoryId, name: 'Unknown Category' },
      items: categoryItems
    }));

    // Sort categories by name
    this.menuCategories.sort((a, b) => a.category.name.localeCompare(b.category.name));
  }

  private calculateStatistics(items: ItemDto[]): void {
    this.totalItems = items.length;
    this.totalCategories = this.menuCategories.length;

    if (items.length > 0) {
      const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
      this.averagePrice = totalPrice / items.length;
    }
  }

  // formatPrice(item: ItemDto): string {
  //   if (item.sizeType === 1 && item.sizePricing && item.sizePricing.length > 0) {
  //     const minPrice = Math.min(...item.sizePricing.map(sp => sp.price));
  //     const maxPrice = Math.max(...item.sizePricing.map(sp => sp.price));
  //     return minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
  //   }
  //   return `$${item.price.toFixed(2)}`;
  // }
  formatPrice(item: ItemDto): string {
    console.log('Formatting price for item:', item.name, 'SizeType:', item.sizeType, 'SizePricing:', item.sizePricing);

    // Check if it's a sized item (sizeType = 1) and has size pricing
    if (item.sizeType === 1 && item.sizePricing && item.sizePricing.length > 0) {
      const prices = item.sizePricing.map(sp => sp.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }

    // For weighted items, show price per kg
    if (item.sizeType === 2 && item.weight) {
      return `$${item.price.toFixed(2)}/kg`;
    }

    // Default to base price for fixed items or fallback
    return `$${item.price.toFixed(2)}`;
  }

  getSizeTypeLabel(sizeType: number): string {
    switch (sizeType) {
      case 0: return 'Fixed';
      case 1: return 'Sized';
      case 2: return 'Weighted';
      default: return 'Unknown';
    }
  }

  getSizeTypeColor(sizeType: number): string {
    switch (sizeType) {
      case 0: return 'bg-blue-100 text-blue-700 border-blue-200';
      case 1: return 'bg-green-100 text-green-700 border-green-200';
      case 2: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  // Filtered categories based on search and category filter
  get filteredCategories(): MenuCategory[] {
    let filtered = this.menuCategories;

    // Filter by selected category
    if (this.selectedCategory) {
      filtered = filtered.filter(cat => cat.category.id === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      })).filter(category => category.items.length > 0);
    }

    return filtered;
  }

  addNewItem(): void {
    this.router.navigate(['/chef/chef-dashboard-item']);
  }

  editItem(item: ItemDto): void {
    this.router.navigate(['/chef/chef-dashboard-item'], {
    //   queryParams: { id: item.id, mode: 'edit' }
    // });
      state: {
        itemData: item,
        mode: 'edit'
      }
    });
  }

  deleteItem(item: ItemDto): void {
    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      this.itemService.deleteItem(item.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Item deleted successfully');
            this.loadMenuData(); // Reload the menu data
          },
          error: (error) => {
            console.error('❌ Error deleting item:', error);
            this.errorMessage = 'Failed to delete item';
          }
        });
    }
  }

  viewItemDetails(item: ItemDto): void {
    // TODO: Implement item details modal or navigate to details page
    console.log('View item details:', item);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
  }

  getItemCount(): number {
    return this.totalItems;
  }

  getCategoryCount(): number {
    return this.totalCategories;
  }

  // Track by functions for performance
  trackByCategory(index: number, category: MenuCategory): number {
    return category.category.id;
  }

  trackByItem(index: number, item: ItemDto): number {
    return item.id;
  }
}
