import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category, CategoryCreateDto, CategoryResponse } from '../models/categoryModel';
import { CategoryService } from '../services/category';

@Component({
  selector: 'app-category-management-panel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './category-management-panel-component.html',
  styleUrl: './category-management-panel-component.css',
})
export class CategoryManagementPanelComponent implements OnInit {
  newCategory = '';
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  // Add these properties
  editingCategory: Category | null = null;
  editCategoryName: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  addCategory() {
    if (!this.newCategory.trim()) {
      this.errorMessage = 'Please enter a category name';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dto: CategoryCreateDto = { name: this.newCategory.trim() };

    this.categoryService.addCategory(dto).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.newCategory = '';
        this.loadCategories(); // Reload categories
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to add category';
        this.isLoading = false;
        console.error('Error adding category:', error);
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: (response) => {
          this.successMessage = response;
          this.loadCategories(); // Reload categories
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete category';
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  trackByCategory(index: number, category: Category): any {
    return category.id || index;
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  startEditCategory(category: Category): void {
    this.editingCategory = category;
    this.editCategoryName = category.name;
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.editCategoryName = '';
  }

  updateCategory(): void {
    if (!this.editingCategory || !this.editCategoryName.trim()) return;

    this.isLoading = true;
    const dto: CategoryCreateDto = { name: this.editCategoryName.trim() };

    this.categoryService.updateCategory(this.editingCategory.id!, dto).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.editingCategory!.name = this.editCategoryName;
        this.cancelEdit();
        this.isLoading = false;
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to update category';
        this.isLoading = false;
      }
    });
  }
  clearMessagesAfterDelay() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
  }

  // bulkImportCategories(): void {
  //   const defaultCategories = [
  //     'Appetizers', 'Main Courses', 'Desserts', 'Breakfast', 'Pizza',
  //     'Burgers', 'Sandwiches', 'Salads', 'Pasta', 'Seafood', 'Chicken',
  //     'Vegetarian', 'Vegan', 'Italian', 'Chinese', 'Mexican', 'Indian',
  //     'Coffee', 'Tea', 'Healthy Options', 'Fast Food', 'Soups', 'Steamed',
  //     'Grilled', 'Fried', 'Baked', 'Hot Drinks', 'Cold Drinks', 'Smoothies'
  //   ];
  //
  //   this.isLoading = true;
  //
  //   this.categoryService.bulkAddCategories(defaultCategories).subscribe({
  //     next: (response) => {
  //       this.successMessage = response;
  //       this.loadCategories(); // Refresh the categories list
  //       this.isLoading = false;
  //       this.clearMessagesAfterDelay();
  //     },
  //     error: (error) => {
  //       this.errorMessage = error.error || 'Failed to import categories';
  //       this.isLoading = false;
  //     }
  //   });
  // }
}
