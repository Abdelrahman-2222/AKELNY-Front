import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LucideAngularModule, MapPin, FileText, Store, ArrowLeft, Clock, Image, Star } from 'lucide-angular';

import { AuthService } from '../../services/auth.service';
import { RestaurantInputDto, OpeningHours } from '../../models/AddRestaurant.model';
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

  readonly Clock = Clock;
  readonly Image = Image;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly FileText = FileText;
  readonly Store = Store;
  readonly ArrowLeft = ArrowLeft;

  // Days of the week
  daysOfWeek = [
    { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' }
  ];

  private destroy$ = new Subject<void>();

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

  private imageUrlValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const standardImagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    const imageHostingServices = [
      /^https:\/\/lh\d+\.googleusercontent\.com/,
      /^https:\/\/.*\.googleapis\.com/,
      /^https:\/\/images\.unsplash\.com/,
      /^https:\/\/.*\.imgur\.com/,
      /^https:\/\/.*\.cloudinary\.com/,
      /^https:\/\/.*\.amazonaws\.com/
    ];

    const isValid = standardImagePattern.test(value) ||
      imageHostingServices.some(pattern => pattern.test(value));

    return isValid ? null : { invalidImageUrl: true };
  }

  private createForm(): FormGroup {
    const openingHoursGroup = this.fb.group({});

    // Create form controls for each day
    this.daysOfWeek.forEach(day => {
      openingHoursGroup.addControl(day.key, this.fb.group({
        isOpen: [true],
        openTime: ['09:00'], // 24-hour format for HTML5 time input
        closeTime: ['22:00']
      }));
    });

    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      location: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      imageUrl: ['', [Validators.required, this.imageUrlValidator]],
      openingHours: openingHoursGroup,
      isOpen: [true]
    });
  }

  // Get opening hours form group
  get openingHoursGroup() {
    return this.restaurantForm.get('openingHours') as FormGroup;
  }

  // Get specific day form group
  getDayGroup(dayKey: string) {
    return this.openingHoursGroup.get(dayKey) as FormGroup;
  }

  // Helper methods to get specific form controls with proper typing
  getDayIsOpenControl(dayKey: string): FormControl {
    return this.getDayGroup(dayKey).get('isOpen') as FormControl;
  }

  getDayOpenTimeControl(dayKey: string): FormControl {
    return this.getDayGroup(dayKey).get('openTime') as FormControl;
  }

  getDayCloseTimeControl(dayKey: string): FormControl {
    return this.getDayGroup(dayKey).get('closeTime') as FormControl;
  }

  // Copy hours to all days
  copyToAllDays(sourceDay: string): void {
    const sourceGroup = this.getDayGroup(sourceDay);
    const sourceValues = sourceGroup.value;

    this.daysOfWeek.forEach(day => {
      if (day.key !== sourceDay) {
        const dayGroup = this.getDayGroup(day.key);
        dayGroup.patchValue({
          isOpen: sourceValues.isOpen,
          openTime: sourceValues.openTime,
          closeTime: sourceValues.closeTime
        });
      }
    });
  }

  // Set all days closed
  setAllDaysClosed(): void {
    this.daysOfWeek.forEach(day => {
      this.getDayGroup(day.key).patchValue({ isOpen: false });
    });
  }

  // Set all days open
  setAllDaysOpen(): void {
    this.daysOfWeek.forEach(day => {
      this.getDayGroup(day.key).patchValue({ isOpen: true });
    });
  }

  // Convert 24-hour time to 12-hour format for display
  formatTime12Hour(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Check if a day is open
  isDayOpen(dayKey: string): boolean {
    return this.getDayIsOpenControl(dayKey).value === true;
  }

  // Toggle day open/closed
  toggleDay(dayKey: string): void {
    const control = this.getDayIsOpenControl(dayKey);
    control.setValue(!control.value);
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

    // Convert opening hours to string format for backend
    const openingHoursString = this.convertOpeningHoursToString();

    const restaurantData = {
      name: this.restaurantForm.value.name.trim(),
      description: this.restaurantForm.value.description.trim(),
      location: this.restaurantForm.value.location.trim(),
      imageUrl: this.restaurantForm.value.imageUrl.trim(),
      openingHours: openingHoursString, // Changed to string
      isOpen: this.restaurantForm.value.isOpen
    };
    console.log('Sending restaurant data:', restaurantData);

    this.restaurantService.createRestaurant(restaurantData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Restaurant created successfully!';
          setTimeout(() => {
            this.router.navigate(['/chef/chef-dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message;
          console.error('Error creating restaurant:', error);
        }
      });
  }

  private convertOpeningHoursToString(): string {
    const openingHours: string[] = [];

    this.daysOfWeek.forEach(day => {
      const dayData = this.getDayGroup(day.key).value;
      if (dayData.isOpen) {
        const openTime = this.formatTime12Hour(dayData.openTime);
        const closeTime = this.formatTime12Hour(dayData.closeTime);
        openingHours.push(`${day.label}: ${openTime} - ${closeTime}`);
      } else {
        openingHours.push(`${day.label}: Closed`);
      }
    });

    return openingHours.join(', ');
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
      if (errors['invalidImageUrl']) return 'Please enter a valid image URL from a supported service';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Restaurant name',
      description: 'Description',
      location: 'Location',
      imageUrl: 'Image URL',
      openingHours: 'Opening Hours',
      isOpen: 'Restaurant Status'
    };
    return displayNames[fieldName] || fieldName;
  }
}
