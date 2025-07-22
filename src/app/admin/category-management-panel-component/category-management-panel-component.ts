import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoodCategoryItemComponent } from '../mood-category-item/mood-category-item.component';
import { ChefItemComponent } from '../chef-item/chef-item.component';
@Component({
  selector: 'app-category-management-panel',
  imports: [FormsModule, MoodCategoryItemComponent, ChefItemComponent],
  templateUrl: './category-management-panel-component.html',
  styleUrl: './category-management-panel-component.css',
})
export class CategoryManagementPanelComponent {
  newCategory = '';
  moodCategories = ['Comfort Food', 'Healthy', 'Quick Meals', 'Gourmet'];
  chefItems = ['Signature Dish', 'Seasonal Special', 'Chef Recommendation'];

  addCategory() {
    if (this.newCategory.trim()) {
      this.moodCategories.push(this.newCategory.trim());
      this.newCategory = '';
    }
  }
}
