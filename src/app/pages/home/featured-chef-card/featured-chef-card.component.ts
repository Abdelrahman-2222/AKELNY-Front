import { Component, Input } from '@angular/core';
import { FeaturedChef } from '../../../models/FeaturedChef.model';

@Component({
  selector: 'app-featured-chef-card',
  standalone: true,
  imports: [],
  templateUrl: './featured-chef-card.component.html',
  styleUrl: './featured-chef-card.component.css',
})
export class FeaturedChefCardComponent {
  @Input() chef!: FeaturedChef;
}
