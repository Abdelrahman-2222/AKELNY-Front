import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Restaurant, RestaurantInputDto } from '../../models/AddRestaurant.model';
import { LucideAngularModule, X, Save, MapPin, FileText, Store, Clock, Image } from 'lucide-angular';


@Component({
  selector: 'app-chef-restaurant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: 'chef-restaurant-settings.html'
})

export class ChefRestaurantSettingsComponent implements OnInit, OnChanges {
  @Input() restaurant: Restaurant | null = null;
  @Output() save = new EventEmitter<Partial<RestaurantInputDto>>();
  @Output() cancel = new EventEmitter<void>();

  settingsForm: FormGroup;
  isSubmitting = false;

  readonly X = X;
  readonly Save = Save;
  readonly MapPin = MapPin;
  readonly FileText = FileText;
  readonly Store = Store;
  readonly Clock = Clock;
  readonly Image = Image;

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

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  ngOnChanges(): void {
    if (this.restaurant && this.settingsForm) {
      this.populateForm();
    }
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
        openTime: ['09:00'],
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

  private populateForm(): void {
    if (!this.restaurant) return;

    // Set basic fields
    this.settingsForm.patchValue({
      name: this.restaurant.name,
      description: this.restaurant.description,
      location: this.restaurant.location,
      imageUrl: this.restaurant.imageUrl,
      isOpen: this.restaurant.isOpen
    });

    // Parse and set opening hours
    this.parseAndSetOpeningHours(this.restaurant.openingHours);
  }

  private parseAndSetOpeningHours(openingHoursStr: string): void {
    if (!openingHoursStr) return;

    try {
      // Parse the string format: "Monday: 9:00 AM - 10:00 PM, Tuesday: 9:00 AM - 10:00 PM, ..."
      const dayHoursPairs = openingHoursStr.split(', ');

      this.daysOfWeek.forEach(day => {
        const dayPair = dayHoursPairs.find(pair => pair.startsWith(day.label));
        const dayGroup = this.getDayGroup(day.key);

        if (dayPair) {
          const [dayName, hours] = dayPair.split(': ');
          const isOpen = hours.toLowerCase() !== 'closed';

          if (isOpen) {
            // Parse time range like "9:00 AM - 10:00 PM"
            const [openTime, closeTime] = hours.split(' - ');
            dayGroup.patchValue({
              isOpen: true,
              openTime: this.convertTo24Hour(openTime.trim()),
              closeTime: this.convertTo24Hour(closeTime.trim())
            });
          } else {
            dayGroup.patchValue({
              isOpen: false,
              openTime: '09:00',
              closeTime: '22:00'
            });
          }
        } else {
          // Day not found, assume closed
          dayGroup.patchValue({
            isOpen: false,
            openTime: '09:00',
            closeTime: '22:00'
          });
        }
      });
    } catch (error) {
      console.error('Error parsing opening hours for edit:', error);
      // Set default values if parsing fails
      this.daysOfWeek.forEach(day => {
        this.getDayGroup(day.key).patchValue({
          isOpen: true,
          openTime: '09:00',
          closeTime: '22:00'
        });
      });
    }
  }

  private convertTo24Hour(time12: string): string {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Get opening hours form group
  get openingHoursGroup() {
    return this.settingsForm.get('openingHours') as FormGroup;
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

  onSave(): void {
    if (this.settingsForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Convert opening hours to string format for backend
      const openingHoursString = this.convertOpeningHoursToString();

      const updateData: Partial<RestaurantInputDto> = {
        name: this.settingsForm.value.name.trim(),
        description: this.settingsForm.value.description.trim(),
        location: this.settingsForm.value.location.trim(),
        imageUrl: this.settingsForm.value.imageUrl.trim(),
        openingHours: openingHoursString,
        isOpen: this.settingsForm.value.isOpen
      };

      this.save.emit(updateData);
      this.isSubmitting = false;
    } else {
      this.markAllFieldsAsTouched();
    }
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

  onCancel(): void {
    this.cancel.emit();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      this.settingsForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
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

