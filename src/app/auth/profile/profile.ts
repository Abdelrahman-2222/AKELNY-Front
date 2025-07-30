import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { ProfileDto, Address, User } from '../../models/Profile.model';
import { LucideAngularModule, Plus, Trash2, User as UserIcon, Mail, Phone, MapPin, Lock, Camera } from 'lucide-angular';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { UserService } from '../../services/user.service';

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
    private profileService: ProfileService,
    private userService: UserService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  // Add this property to track form validity properly
  get isFormValid(): boolean {
    // Check if main form fields are valid (excluding async validators for now)
    const mainFieldsValid = this.profileForm.get('firstName')?.valid &&
      this.profileForm.get('lastName')?.valid &&
      this.profileForm.get('phoneNumber')?.valid &&
      this.addresses.valid;

    // Check email field (excluding async validator if pending)
    const emailField = this.profileForm.get('email');
    const emailValid = emailField?.valid || (emailField?.pending && !emailField?.errors);

    // Check password section only if it's shown
    const passwordValid = !this.showPasswordSection || this.passwordSection.valid;

    return !!(mainFieldsValid && emailValid && passwordValid);
  }

  // private createForm(): FormGroup {
  //   const form = this.fb.group({
  //     firstName: ['', [Validators.required, Validators.minLength(2)]],
  //     lastName: ['', [Validators.required, Validators.minLength(2)]],
  //     email: ['', [Validators.required, Validators.email, this.tempEmailApiValidator(this.profileService.http)]],
  //     phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,}$/)]],
  //     imageUrl: [''],
  //     addresses: this.fb.array([]),
  //     passwordSection: this.fb.group({
  //       oldPassword: [''],
  //       newPassword: [''],
  //       confirmPassword: ['']
  //     }, { validators: this.passwordMatchValidator })
  //   });
  //
  //   this.setPasswordValidators(form.get('passwordSection') as FormGroup, false);
  //
  //   return form;
  // }
  // Update your createForm method to make email validation less strict initially
  private createForm(): FormGroup {
    const form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]], // Remove async validator for now
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,}$/)]],
      imageUrl: [''],
      addresses: this.fb.array([]),
      passwordSection: this.fb.group({
        oldPassword: [''],
        newPassword: [''],
        confirmPassword: ['']
      }, { validators: this.passwordMatchValidator })
    });

    this.setPasswordValidators(form.get('passwordSection') as FormGroup, false);

    // Add async validator after a delay to avoid initial validation issues
    setTimeout(() => {
      const emailControl = form.get('email');
      if (emailControl) {
        emailControl.updateValueAndValidity();
      }
    }, 500);

    return form;
  }

  private setPasswordValidators(passwordGroup: FormGroup, required: boolean) {
    const oldPassword = passwordGroup.get('oldPassword');
    const newPassword = passwordGroup.get('newPassword');
    const confirmPassword = passwordGroup.get('confirmPassword');

    if (required) {
      newPassword?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)
      ]);
      confirmPassword?.setValidators([Validators.required]);
      oldPassword?.setValidators([Validators.required]);
    } else {
      // Clear validators completely
      newPassword?.clearValidators();
      confirmPassword?.clearValidators();
      oldPassword?.clearValidators();

      // Clear any existing errors
      newPassword?.setErrors(null);
      confirmPassword?.setErrors(null);
      oldPassword?.setErrors(null);

      // Mark as untouched
      newPassword?.markAsUntouched();
      confirmPassword?.markAsUntouched();
      oldPassword?.markAsUntouched();
    }

    // Update validity for all fields
    newPassword?.updateValueAndValidity();
    confirmPassword?.updateValueAndValidity();
    oldPassword?.updateValueAndValidity();

    // Update the group validity
    passwordGroup.updateValueAndValidity();
  }


  // private tempEmailApiValidator(http: HttpClient) {
  //   return (control: AbstractControl) => {
  //     if (!control.value) return of(null);
  //     const email = control.value;
  //     const apiKey = 'acc3b923b01749c6bdebb041660541d2';
  //     const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
  //     return http.get<any>(url).pipe(
  //       map(res => res.is_disposable_email?.value === true ? { tempEmail: true } : null),
  //       catchError(() => of(null))
  //     );
  //   };
  // }

  // // Update the tempEmailApiValidator to be less aggressive
  // private tempEmailApiValidator(http: HttpClient) {
  //   return (control: AbstractControl) => {
  //     if (!control.value || !control.value.includes('@')) {
  //       return of(null);
  //     }
  //
  //     const email = control.value;
  //
  //     // Only validate if email format is correct first
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(email)) {
  //       return of(null); // Let the email validator handle format issues
  //     }
  //
  //     const apiKey = 'acc3b923b01749c6bdebb041660541d2';
  //     const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
  //
  //     return http.get<any>(url).pipe(
  //       map(res => res.is_disposable_email?.value === true ? { tempEmail: true } : null),
  //       catchError(() => of(null)) // Don't fail validation if API is down
  //     );
  //   };
  // }

  // private passwordMatchValidator = (group: FormGroup) => {
  //   const newPassword = group.get('newPassword')?.value;
  //   const confirmPassword = group.get('confirmPassword')?.value;
  //   // Only validate if at least one password field is filled
  //   if (newPassword || confirmPassword) {
  //     if (newPassword !== confirmPassword) {
  //       return { passwordMismatch: true };
  //     }
  //   }
  //   return null;
  // };
  // Fix the passwordMatchValidator to handle empty states better
  private passwordMatchValidator = (group: FormGroup) => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    // If password section is not shown, don't validate
    if (!this.showPasswordSection) {
      return null;
    }

    // Only validate if both fields have values
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        return { passwordMismatch: true };
      }
    }

    return null;
  };

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

        this.imagePreview = user.imageUrl
          ? `https://localhost:7045${user.imageUrl}`  // 👈 prepend your backend base URL
          : null;

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

  // togglePasswordSection() {
  //   this.showPasswordSection = !this.showPasswordSection;
  //   this.setPasswordValidators(this.passwordSection, this.showPasswordSection);
  //
  //   if (!this.showPasswordSection) {
  //     // Reset the password section completely
  //     this.passwordSection.reset();
  //     // Clear any validation errors
  //     this.passwordSection.setErrors(null);
  //     // Mark as untouched to clear any touched state
  //     this.passwordSection.markAsUntouched();
  //     // Update validity after clearing everything
  //     this.passwordSection.updateValueAndValidity();
  //   }
  // }
  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;

    if (!this.showPasswordSection) {
      // Reset the password section completely
      this.passwordSection.reset();
      this.passwordSection.setErrors(null);
      this.passwordSection.markAsUntouched();
      this.passwordSection.markAsPristine();

      // Clear individual field errors and states
      ['oldPassword', 'newPassword', 'confirmPassword'].forEach(field => {
        const control = this.passwordSection.get(field);
        if (control) {
          control.setErrors(null);
          control.markAsUntouched();
          control.markAsPristine();
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });

      // Update the group
      this.passwordSection.updateValueAndValidity();

      // Force main form update
      this.profileForm.updateValueAndValidity();
    } else {
      this.setPasswordValidators(this.passwordSection, true);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        // Store the base64 data for sending to backend
        this.selectedImageFile = file;
      };
      reader.readAsDataURL(file);
    }
  }

  // async onSubmit() {
  //   if (this.profileForm.invalid) {
  //     this.markAllFieldsAsTouched();
  //     return;
  //   }
  //
  //   this.isLoading = true;
  //   this.errorMessage = '';
  //   this.successMessage = '';
  //
  //   try {
  //     const formValue = this.profileForm.value;
  //     const profileData: ProfileDto = {
  //       firstName: formValue.firstName,
  //       lastName: formValue.lastName,
  //       email: formValue.email,
  //       phoneNumber: formValue.phoneNumber,
  //       imageUrl: formValue.imageUrl,
  //       addresses: formValue.addresses
  //     };
  //
  //     // Add image data if a new image was selected
  //     if (this.selectedImageFile && this.imagePreview) {
  //       profileData.imageData = this.imagePreview;
  //     }
  //
  //     // Add password fields if changing password
  //     if (this.showPasswordSection && formValue.passwordSection.oldPassword) {
  //       profileData.oldPassword = formValue.passwordSection.oldPassword;
  //       profileData.newPassword = formValue.passwordSection.newPassword;
  //     }
  //
  //     this.profileService.updateProfile(profileData).subscribe({
  //       next: (response) => {
  //         this.successMessage = 'Profile updated successfully!';
  //         this.showPasswordSection = false;
  //         this.passwordSection.reset();
  //         this.selectedImageFile = null;
  //
  //         // Update localStorage user data if it exists
  //         // const userData = localStorage.getItem('user');
  //         // if (userData) {
  //         //   try {
  //         //     const user = JSON.parse(userData);
  //         //     user.firstName = profileData.firstName;
  //         //     user.lastName = profileData.lastName;
  //         //     user.email = profileData.email;
  //         //
  //         //     // 🔥 ADD THIS LINE - Update the imageUrl in localStorage!
  //         //     if (response.imageUrl) {
  //         //       user.imageUrl = response.imageUrl;
  //         //     }
  //         //     if(response.imageData)
  //         //     {
  //         //       user.imageData = response.imageData;
  //         //     }
  //         //
  //         //     localStorage.setItem('user', JSON.stringify(user));
  //         //
  //         //     // 🔥 TRIGGER STORAGE EVENT to notify navbar of the change
  //         //     window.dispatchEvent(new StorageEvent('storage', {
  //         //       key: 'user',
  //         //       newValue: JSON.stringify(user)
  //         //     }));
  //         //
  //         //   } catch (e) {
  //         //     console.warn('Could not update localStorage user data');
  //         //   }
  //         // }
  //
  //         localStorage.setItem('token', token); // JWT only
  //
  //         this.userService.setUser(updatedUser);
  //
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('Profile update error:', error);
  //         this.errorMessage = error.error?.message || 'Failed to update profile';
  //         this.isLoading = false;
  //       }
  //     });
  //   } catch (error) {
  //     this.errorMessage = 'Failed to process request';
  //     this.isLoading = false;
  //   }
  // }

  async onSubmit() {
    if (this.profileForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.profileForm.value;
      const profileData: ProfileDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        imageUrl: formValue.imageUrl,
        addresses: formValue.addresses
      };

      if (this.selectedImageFile && this.imagePreview) {
        profileData.imageData = this.imagePreview;
      }

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

          // After successful update, refetch fresh profile data from backend
          this.profileService.getCurrentUser().subscribe({
            next: (updatedUser) => {
              this.userService.setUser(updatedUser);
            },
            error: () => {
              console.warn('Failed to fetch updated user');
            }
          });

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
