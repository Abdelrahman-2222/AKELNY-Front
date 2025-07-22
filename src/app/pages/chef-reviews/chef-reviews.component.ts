import { NgFor } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChefProfileService } from '../../chef/chef-profile.service';
import { ChefReview } from '../../models/ChefReview.model';

@Component({
  selector: 'app-chef-reviews',
  standalone: true,
  imports: [NgFor],
  templateUrl: './chef-reviews.component.html',
  styleUrl: './chef-reviews.component.css',
})
export class ChefReviewsComponent {
  public chefProfileService: ChefProfileService = inject(ChefProfileService);
  @Input()
  review!: ChefReview;
}
