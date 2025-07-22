import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Star, Clock, Check } from 'lucide-angular';
import { AboutComponent } from '../../../chef/about/about.component';
import { ChefProfileService } from '../../../chef/chef-profile.service';
import { ChefMenuComponent } from '../../chef-menu/chef-menu.component';
import { ChefReviewsComponent } from '../../chef-reviews/chef-reviews.component';
import { ChefHeroSectionComponent } from '../../chef-hero-section/chef-hero-section.component';

@Component({
  selector: 'app-chef-profile',
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    NgFor,
    NgIf,
    AboutComponent,
    ChefMenuComponent,
    ChefReviewsComponent,
    ChefHeroSectionComponent,
  ],
  templateUrl: './chef-profile-component.html',
  styleUrl: './chef-profile-component.css',
})
export class ChefProfileComponent {
  constructor() {}

  public chefProfileService: ChefProfileService = inject(ChefProfileService);
}
