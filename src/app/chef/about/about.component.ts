import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule, Star, Clock, Check } from 'lucide-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  chef = {
    name: 'Houri Chon',
    specialty: 'Special Fonus',
    rating: 4.2,
    reviews: 18,
    deliveryTime: '30-40 min',
    about:
      'Passionate home chef specializing in authentic homemade dishes with a modern twist.',
  };

  activeTab: 'menu' | 'reviews' | 'about' = 'menu';

  setActiveTab(tab: 'menu' | 'reviews' | 'about') {
    this.activeTab = tab;
  }
}
