import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { FeaturedChefsComponent } from '../featured-chefs/featured-chefs.component';
import { TrendingDishesComponent } from '../trending-dishes/trending-dishes.component';
import { CategoriesComponent } from '../categories/categories.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';
@Component({
  selector: 'app-home',
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
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {}
