import { Component, inject } from '@angular/core';
import { ChefProfileService } from '../../chef/chef-profile.service';

@Component({
  selector: 'app-chef-hero-section',
  standalone: true,
  imports: [],
  templateUrl: './chef-hero-section.component.html',
  styleUrl: './chef-hero-section.component.css',
})
export class ChefHeroSectionComponent {
  public chefProfileService: ChefProfileService = inject(ChefProfileService);
}
