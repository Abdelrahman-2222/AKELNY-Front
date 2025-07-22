import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mood-category-item',
  standalone: true,
  imports: [],
  templateUrl: './mood-category-item.component.html',
  styleUrl: './mood-category-item.component.css'
})
export class MoodCategoryItemComponent {
  @Input() cat !: string;
}
