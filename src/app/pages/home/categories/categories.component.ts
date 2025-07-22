import { FoodCategoryService } from './../../../services/food-category.service';
import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FoodCategoryCardComponent } from '../food-category-card/food-category-card.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [LucideAngularModule, FoodCategoryCardComponent, NgFor],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent {
  /**
   *
   */
  constructor(public categoryService: FoodCategoryService) {}
}
