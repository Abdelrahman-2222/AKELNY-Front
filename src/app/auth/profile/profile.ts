import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { ProfileDto, Address, User } from '../../models/Profile.model';
import { LucideAngularModule, Plus, Trash2, User as UserIcon, Mail, Phone, MapPin, Lock, Camera } from 'lucide-angular';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showPasswordSection = false;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  // Expose icons to template
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly UserIcon = UserIcon;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Lock = Lock;
  readonly Camera = Camera;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.tempEmailApiValidator(this.profileService.http)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,}$/)]],
      imageUrl: [''],
      addresses: this.fb.array([]),
      passwordSection: this.fb.group({
        oldPassword: [''],
        newPassword: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
        ]],
        confirmPassword: ['']
      }, { validators: this.passwordMatchValidator })
    });
  }

  private tempEmailApiValidator(http: HttpClient) {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      const email = control.value;
      const apiKey = 'acc3b923b01749c6bdebb041660541d2';
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
      return http.get<any>(url).pipe(
        map(res => res.is_disposable_email?.value === true ? { tempEmail: true } : null),
        catchError(() => of(null))
      );
    };
  }
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get addresses(): FormArray {
    return this.profileForm.get('addresses') as FormArray;
  }

  get passwordSection(): FormGroup {
    return this.profileForm.get('passwordSection') as FormGroup;
  }

  private loadUserProfile() {
    this.isLoading = true;
    this.profileService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          imageUrl: user.imageUrl
        });

        this.imagePreview = user.imageUrl || null;

        // Clear and populate addresses
        this.addresses.clear();
        user.addresses.forEach(address => {
          this.addresses.push(this.createAddressGroup(address));
        });

        // Add one empty address if none exist
        if (user.addresses.length === 0) {
          this.addAddress();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile data';
        this.isLoading = false;
        // Add one empty address for new users
        this.addAddress();
      }
    });
  }

  private createAddressGroup(address?: Address): FormGroup {
    return this.fb.group({
      description: [address?.description || '', Validators.required],
      street: [address?.street || '', Validators.required],
      city: [address?.city || '', Validators.required],
      country: [address?.country || '', Validators.required],
      zone: [address?.zone || '', Validators.required]
    });
  }

  addAddress() {
    this.addresses.push(this.createAddressGroup());
  }

  removeAddress(index: number) {
    if (this.addresses.length > 1) {
      this.addresses.removeAt(index);
    }
  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordSection.reset();
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  private async uploadImageIfSelected(): Promise<string | null> {
    if (!this.selectedImageFile) return null;

    try {
      const response = await this.profileService.uploadImage(this.selectedImageFile).toPromise();
      return response.imageUrl || response.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Upload image if selected
      let imageUrl = this.profileForm.get('imageUrl')?.value;
      if (this.selectedImageFile) {
        imageUrl = await this.uploadImageIfSelected();
      }

      const formValue = this.profileForm.value;
      const profileData: ProfileDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        imageUrl: imageUrl,
        addresses: formValue.addresses
      };

      // Add password fields if changing password
      if (this.showPasswordSection && formValue.passwordSection.oldPassword) {
        profileData.oldPassword = formValue.passwordSection.oldPassword;
        profileData.newPassword = formValue.passwordSection.newPassword;
      }

      this.profileService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.successMessage = 'Profile updated successfully!';
          this.showPasswordSection = false;
          this.passwordSection.reset();
          this.selectedImageFile = null;

          // Update localStorage user data if it exists
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              user.firstName = profileData.firstName;
              user.lastName = profileData.lastName;
              user.email = profileData.email;
              localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
              console.warn('Could not update localStorage user data');
            }
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Profile update error:', error);
          this.errorMessage = error.error?.message || 'Failed to update profile';
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Failed to process request';
      this.isLoading = false;
    }
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormArray) {
          control.controls.forEach(arrayControl => {
            if (arrayControl instanceof FormGroup) {
              Object.keys(arrayControl.controls).forEach(innerKey => {
                arrayControl.get(innerKey)?.markAsTouched();
              });
            }
          });
        } else if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(innerKey => {
            control.get(innerKey)?.markAsTouched();
          });
        }
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  getAddressFieldError(addressIndex: number, fieldName: string): string {
    const addressGroup = this.addresses.at(addressIndex) as FormGroup;
    const field = addressGroup.get(fieldName);

    if (field && field.touched && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
    }
    return '';
  }

  getPasswordError(): string {
    const passwordGroup = this.passwordSection;
    if (passwordGroup.touched && passwordGroup.errors) {
      if (passwordGroup.errors['passwordMismatch']) return 'Passwords do not match';
    }

    const newPasswordField = passwordGroup.get('newPassword');
    if (newPasswordField && newPasswordField.touched && newPasswordField.errors) {
      if (newPasswordField.errors['minlength']) return 'Password must be at least 6 characters';
    }

    return '';
  }
}
