import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FeaturedChefCardComponent } from '../featured-chef-card/featured-chef-card.component';

@Component({
  selector: 'app-featured-chefs',
  standalone: true,
  imports: [LucideAngularModule, FeaturedChefCardComponent],
  templateUrl: './featured-chefs.component.html',
  styleUrl: './featured-chefs.component.css',
})
export class FeaturedChefsComponent {
  featuredChefs = [
    {
      name: 'Houri Chon',
      specialty: 'Special Fonus',
      rating: 4.2,
      reviews: 18,
      deliveryTime: '30-40 min',
    },
    {
      name: 'Asuri Chon',
      specialty: 'Specialty Fonus',
      rating: 4.6,
      reviews: 16,
      deliveryTime: '25-35 min',
    },
    {
      name: 'Anwi Choin',
      specialty: 'SegincNatry',
      rating: 3.8,
      reviews: 15,
      deliveryTime: '40-50 min',
    },
  ];
}
