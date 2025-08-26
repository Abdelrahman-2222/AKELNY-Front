import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-restaurant-view',
  imports: [FormsModule],
  templateUrl: './filter-restaurant-view.html',
  styleUrl: './filter-restaurant-view.css'
})
export class FilterRestaurantView {
  @Input() disabled = false;

  //sorting
  sortBy: string = 'rating';
  sortOrder: string = '-';
  @Output() sortChanged = new EventEmitter<{ sortBy: string, sortOrder: string }>();

  applyFilters(): void {
    if (this.disabled) return;

    //emit the sorting changes
    this.sortChanged.emit({
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    });
  }

  clearAll(): void {
    if (this.disabled) return;

    //emit the clear all event
    this.sortChanged.emit({
      sortBy: '',
      sortOrder: ''
    });
  }
}
