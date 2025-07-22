import { NgFor } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FoodCategoryService } from '../../../services/food-category.service';
import { FoodCategory } from '../../../models/FoodCategory.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-food-category-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './food-category-card.component.html',
  styleUrl: './food-category-card.component.css',
})
export class FoodCategoryCardComponent {
  public categoryService: FoodCategoryService = inject(FoodCategoryService);
  @Input() category!: FoodCategory;
}
