import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant, RestaurantInputDto } from '../../models/AddRestaurant.model';

@Component({
  selector: 'app-chef-restaurant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'chef-restaurant-settings.html'
})
export class ChefRestaurantSettingsComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() restaurant: Restaurant | null = null;
  @Output() save = new EventEmitter<Partial<RestaurantInputDto>>();
  @Output() cancel = new EventEmitter<void>();

  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.restaurant) {
      this.settingsForm.patchValue({
        name: this.restaurant.name,
        description: this.restaurant.description,
        location: this.restaurant.location
      });
    }
  }

  ngOnChanges(): void {
    if (this.restaurant && this.settingsForm) {
      this.settingsForm.patchValue({
        name: this.restaurant.name,
        description: this.restaurant.description,
        location: this.restaurant.location
      });
    }
  }

  // TypeScript
  onSave(): void {
    if (this.settingsForm.valid) {
      this.save.emit(this.settingsForm.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
