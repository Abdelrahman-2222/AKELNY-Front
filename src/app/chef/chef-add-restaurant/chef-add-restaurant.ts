// src/app/chef/chef-add-restaurant/chef-add-restaurant.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, MapPin, FileText, Store, ArrowLeft } from 'lucide-angular';

import { AuthService } from '../../services/auth.service';
import { RestaurantInputDto } from '../../models/AddRestaurant.model';
import { AddRestaurant } from '../../services/chef/add-restaurant';

@Component({
  selector: 'app-chef-add-restaurant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './chef-add-restaurant.html',
  styleUrl: './chef-add-restaurant.css'
})
export class ChefAddRestaurant implements OnInit, OnDestroy {
  restaurantForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  // Expose icons to template
  readonly MapPin = MapPin;
  readonly FileText = FileText;
  readonly Store = Store;
  readonly ArrowLeft = ArrowLeft;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private restaurantService: AddRestaurant,
    private authService: AuthService
  ) {
    this.restaurantForm = this.createForm();
  }

  ngOnInit(): void {
    this.validateChefAccess();
    this.checkExistingRestaurant();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      location: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]]
    });
  }

  private validateChefAccess(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const role = this.authService.getUserRole();
    if (role !== 'Chef') {
      this.router.navigate(['/unauthorized']);
    }
  }

  private checkExistingRestaurant(): void {
    this.restaurantService.checkChefHasRestaurant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hasRestaurant) => {
          if (hasRestaurant) {
            this.router.navigate(['/chef/chef-dashboard']);
          }
        },
        error: (error) => {
          console.warn('Could not check existing restaurant:', error.message);
        }
      });
  }

  onSubmit(): void {
    if (this.restaurantForm.valid && !this.isSubmitting) {
      this.createRestaurant();
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private createRestaurant(): void {
    this.isSubmitting = true;
    this.clearMessages();

    const restaurantData: RestaurantInputDto = {
      name: this.restaurantForm.value.name.trim(),
      description: this.restaurantForm.value.description.trim(),
      location: this.restaurantForm.value.location.trim()
    };

    this.restaurantService.createRestaurant(restaurantData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          setTimeout(() => {
            this.router.navigate(['/chef/chef-dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message;
        }
      });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.restaurantForm.controls).forEach(key => {
      this.restaurantForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/chef/chef-dashboard']);
  }

  getFieldError(fieldName: string): string {
    const field = this.restaurantForm.get(fieldName);
    if (field && field.touched && field.errors) {
      const errors = field.errors;
      const fieldDisplayName = this.getFieldDisplayName(fieldName);

      if (errors['required']) return `${fieldDisplayName} is required`;
      if (errors['minlength']) return `${fieldDisplayName} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['maxlength']) return `${fieldDisplayName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Restaurant name',
      description: 'Description',
      location: 'Location'
    };
    return displayNames[fieldName] || fieldName;
  }
}
