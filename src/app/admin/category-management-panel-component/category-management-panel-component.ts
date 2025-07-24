import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MoodCategoryItemComponent } from '../mood-category-item/mood-category-item.component';
import { ChefItemComponent } from '../chef-item/chef-item.component';
import { CategoryService, CategoryCreateDto } from './CategoryService '; // Adjust path as needed

@Component({
  selector: 'app-category-management-panel',
  imports: [
    FormsModule,
    HttpClientModule,
    MoodCategoryItemComponent,
    ChefItemComponent,
  ],
  templateUrl: './category-management-panel-component.html',
  styleUrl: './category-management-panel-component.css',
})
export class CategoryManagementPanelComponent {
  newCategory = '';
  moodCategories = ['Comfort Food', 'Healthy', 'Quick Meals', 'Gourmet'];
  chefItems = ['Signature Dish', 'Seasonal Special', 'Chef Recommendation'];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private categoryService: CategoryService) {}

  addCategory() {
    if (!this.newCategory.trim()) {
      this.errorMessage = 'Please enter a category name';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dto: CategoryCreateDto = {
      name: this.newCategory.trim(),
    };

    this.categoryService.addCategory(dto).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.moodCategories.push(this.newCategory.trim());
        this.newCategory = '';
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || error.message || 'Failed to add category';
        this.isLoading = false;

        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      },
    });
  }
}
