import { Component, Input } from '@angular/core';
import { MenuItem } from '../../models/MenuItem.model';

@Component({
  selector: 'app-chef-menu',
  standalone: true,
  imports: [],
  templateUrl: './chef-menu.component.html',
  styleUrl: './chef-menu.component.css',
})
export class ChefMenuComponent {
  @Input()
  item!: MenuItem;
}
