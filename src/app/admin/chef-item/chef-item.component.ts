import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chef-item',
  standalone: true,
  imports: [],
  templateUrl: './chef-item.component.html',
  styleUrl: './chef-item.component.css'
})
export class ChefItemComponent {
  @Input() item!: string;
}
