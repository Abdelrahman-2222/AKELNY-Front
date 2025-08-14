import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';
import { HeroSectionComponent } from '../../home/hero-section/hero-section.component';
import { FeaturedChefsComponent } from '../../home/featured-chefs/featured-chefs.component';
import { TrendingDishesComponent } from '../../home/trending-dishes/trending-dishes.component';
import { CategoriesComponent } from '../../home/categories/categories.component';
@Component({
  selector: 'app-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    HeroSectionComponent,
    FeaturedChefsComponent,
    TrendingDishesComponent,
    CategoriesComponent,
    NavbarComponent,
  ],
  templateUrl: './success.component.html',
  styleUrl: './success.component.css',
})
export class SuccessComponent implements OnInit {
  ngOnInit(): void {
    alert(
      'Your Order is placed Successfully, Thank you for choosing Akalni :)'
    );
  }
}
