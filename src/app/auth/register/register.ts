import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleAuthService } from '../../services/google-auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

// At the top of register.ts
const COMMON_WEAK_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', '111111', '123123', 'letmein', 'welcome', 'admin'
];
const WEAK_PASSWORD_REGEX = /^(?:([a-zA-Z]+)|(\d+)|(.{0,7}))$/; // Only letters, only digits, or less than 8 chars

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

// Custom email validator that matches ASP.NET Core Identity
function identityEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Let required validator handle empty values
  }

  // ASP.NET Core Identity email validation pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(control.value)) {
    return { email: true };
  }

  // Check for valid domain
  const domain = control.value.split('@')[1];
  if (domain && (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.'))) {
    return { email: true };
  }

  return null;
}

function tempEmailApiValidator(http: HttpClient) {
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

// Custom password validator that matches ASP.NET Core Identity default requirements
function identityPasswordValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const password = control.value;
  const errors: any = {};

  if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase()) || WEAK_PASSWORD_REGEX.test(password)) {
    errors.commonPassword = true;
  }

  // RequireDigit: Must contain at least one digit (0-9)
  if (!/\d/.test(password)) {
    errors.requireDigit = true;
  }

  // RequireLowercase: Must contain at least one lowercase letter (a-z)
  if (!/[a-z]/.test(password)) {
    errors.requireLowercase = true;
  }

  // RequireUppercase: Must contain at least one uppercase letter (A-Z)
  if (!/[A-Z]/.test(password)) {
    errors.requireUppercase = true;
  }

  // RequireNonAlphanumeric: Must contain at least one non-alphanumeric character
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.requireNonAlphanumeric = true;
  }

  // RequiredLength: Minimum 6 characters (default)
  if (password.length < 6) {
    errors.minlength = { requiredLength: 6, actualLength: password.length };
  }

  // RequiredUniqueChars: Default is 1, but let's check for at least 1 unique character
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 1) {
    errors.requireUniqueChars = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
export interface RegisterDto {
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  message: string | null = null;

  roles = [
    { value: 'Customer', label: 'Customer', icon: 'fas fa-user' },
    { value: 'Chef', label: 'Chef', icon: 'fas fa-utensils' },
    { value: 'Admin', label: 'Admin', icon: 'fas fa-user-shield' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private googleAuthService: GoogleAuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', {
        validators: [Validators.required, identityEmailValidator],
        asyncValidators: [tempEmailApiValidator(this.http)],
        updateOn: 'blur'
      }],      password: ['', [Validators.required, identityPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      role: ['Customer', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }

  // Helper methods for password validation display
  hasPasswordError(errorType: string): boolean {
    return this.password?.errors?.[errorType] && this.password?.touched;
  }

  getPasswordErrorMessage(): string {
    if (!this.password?.errors || !this.password?.touched) return '';

    const errors = [];
    if (this.password.errors['required']) errors.push('Password is required');
    if (this.password.errors['minlength']) errors.push('Password must be at least 6 characters long');
    if (this.password.errors['requireDigit']) errors.push('Password must contain at least one digit (0-9)');
    if (this.password.errors['requireLowercase']) errors.push('Password must contain at least one lowercase letter (a-z)');
    if (this.password.errors['requireUppercase']) errors.push('Password must contain at least one uppercase letter (A-Z)');
    if (this.password.errors['requireNonAlphanumeric']) errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');

    return errors.join(', ');
  }

  getPasswordRequirementClass(type: string): string {
    if (!this.password?.touched) return 'text-gray-400';
    return this.password?.errors?.[type] ? 'text-red-500' : 'text-green-600';
  }

  getPasswordRequirementIcon(type: string): string {
    if (!this.password?.touched) return 'fas fa-circle text-xs mr-1';
    return this.password?.errors?.[type]
      ? 'fas fa-times-circle mr-1'
      : 'fas fa-check-circle mr-1';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registerDto: RegisterDto = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role
      };

      // const apiUrl = window.location.hostname == 'localhost'
      //   ? 'https://localhost:7045/api/Auth/register'
      //   : 'http://akelni.tryasp.net/api/Auth/register';
      const apiUrl = `${environment.apiUrl}/Auth/register`;

      this.http.post(apiUrl, registerDto).subscribe({
        next: (response: any) => {
          this.isLoading = false;

          // Store the JWT token from the registration response
          if (response.token) {
            // localStorage.setItem('authToken', response.token);
            try {
              const decodedToken: any = jwtDecode(response.token);
              const user = {
                id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
              };
              // localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('token', response.token); // Also save as 'token'

              console.log('Saved user during registration:', user);
            } catch (error) {
              console.error('Error decoding token:', error);
            }
          }


          this.message = "Registration successful! You are redirecting to the main page.";
          // console.log('Navigating to /main');
          this.router.navigateByUrl('/main');
        },
        error: err => {
          this.isLoading = false;
          if (err.error && Array.isArray(err.error)) {
            const duplicate = err.error.find((e: any) => e.code === 'DuplicateUserName');
            if (duplicate) {
              this.message = duplicate.description;
            } else {
              this.message = 'Registration failed. Please check your details.';
            }
          } else if (err.error && err.error.errors) {
            // Handle ASP.NET Core model validation errors
            const modelErrors = err.error.errors;
            const errorMessages = [];

            if (modelErrors.Email) errorMessages.push(...modelErrors.Email);
            if (modelErrors.Password) errorMessages.push(...modelErrors.Password);

            this.message = errorMessages.join(', ') || 'Registration failed. Please check your details.';
          } else {
            this.message = err.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Rest of your existing methods...
  onSocialLogin(provider: string): void {
    this.isLoading = true;

    switch(provider) {
      case 'Google':
        this.loginWithGoogle();
        break;
      case 'Facebook':
        this.loginWithFacebook();
        break;
      case 'Twitter':
        this.loginWithTwitter();
        break;
      default:
        console.log(`Unknown provider: ${provider}`);
        this.isLoading = false;
    }
  }

  private initializeGoogleSignIn(): void {
    // if (typeof (window as any).google === 'undefined') {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // (window as any).google.accounts.id.initialize({
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleResponse(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        this.renderGoogleButton();
      };
      document.head.appendChild(script);
    } else {
      // (window as any).google.accounts.id.initialize({
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton(): void {
    const buttonContainer = document.getElementById('google-signin-button');
    // if (buttonContainer && (window as any).google) {
    //   (window as any).google.accounts.id.renderButton(buttonContainer, {
    if (buttonContainer && typeof google !== 'undefined') {
      google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      });
    }
  }

  // public loginWithGoogle(): void {
  //   this.isLoading = true;
  //
  //   // if (typeof (window as any).google === 'undefined') {
  //   if (typeof google === 'undefined') {
  //
  //     console.error('Google API not loaded');
  //     this.isLoading = false;
  //     return;
  //   }
  //
  //   try {
  //     // (window as any).google.accounts.id.prompt({
  //     // google.accounts.id.prompt({
  //     //
  //     //   moment_callback: (promptMoment: any) => {
  //     //     console.log('Prompt moment:', promptMoment);
  //     //     if (promptMoment.isNotDisplayed() || promptMoment.isSkippedMoment()) {
  //     //       this.showGoogleSignInFallback();
  //     //     }
  //     //   }
  //     // });
  //     // To this:
  //     google.accounts.id.prompt((promptMoment: PromptMomentNotification) => {
  //       console.log('Prompt moment:', promptMoment);
  //       if (promptMoment.isNotDisplayed() || promptMoment.isSkippedMoment()) {
  //         this.showGoogleSignInFallback();
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Google One Tap error:', error);
  //     this.showGoogleSignInFallback();
  //   }
  // }

  public loginWithGoogle(): void {
    this.isLoading = true;

    if (typeof google === 'undefined') {
      console.error('Google API not loaded');
      this.isLoading = false;
      return;
    }

    try {
      google.accounts.id.prompt((promptMoment: PromptMomentNotification) => {
        console.log('Prompt moment:', promptMoment);
        if (promptMoment.isNotDisplayed() || promptMoment.isSkippedMoment()) {
          this.showGoogleSignInFallback();
        }
      });
    } catch (error) {
      console.error('Google One Tap error:', error);
      this.showGoogleSignInFallback();
    }
  }
  private showGoogleSignInFallback(): void {
    const existingButton = document.getElementById('temp-google-button');
    if (existingButton) {
      existingButton.remove();
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'temp-google-button';
    buttonDiv.style.position = 'fixed';
    buttonDiv.style.top = '50%';
    buttonDiv.style.left = '50%';
    buttonDiv.style.transform = 'translate(-50%, -50%)';
    buttonDiv.style.zIndex = '10000';
    buttonDiv.style.backgroundColor = 'white';
    buttonDiv.style.padding = '20px';
    buttonDiv.style.borderRadius = '8px';
    buttonDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(buttonDiv);
      this.isLoading = false;
    };

    buttonDiv.appendChild(closeButton);
    document.body.appendChild(buttonDiv);

    // (window as any).google.accounts.id.renderButton(buttonDiv, {
    google.accounts.id.renderButton(buttonDiv, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      width: 250
    });
  }

  private loginWithGoogleOAuth(): void {
    const clientId = environment.googleClientId;
    const redirectUri = encodeURIComponent(window.location.origin + '/google-callback');
    const scope = encodeURIComponent('openid email profile');
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);

    const authUrl = `https://accounts.google.com/oauth/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=${responseType}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;

    const popup = window.open(
      authUrl,
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      this.message = 'Please allow popups for Google Sign-In';
      this.isLoading = false;
      return;
    }

    const authTimeout = setTimeout(() => {
      this.message = 'Google Sign-In timed out. Please try again.';
      this.isLoading = false;
      try {
        popup.close();
      } catch (e) {
        // Ignore COOP errors when trying to close
      }
    }, 60000);

    const messageListener = (event: MessageEvent) => {
      if (!event.origin.includes('accounts.google.com') && event.origin !== window.location.origin) {
        return;
      }

      clearTimeout(authTimeout);
      window.removeEventListener('message', messageListener);

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        try {
          popup.close();
        } catch (e) {
          // Ignore COOP errors
        }
        this.handleGoogleResponse({ credential: event.data.idToken });
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        try {
          popup.close();
        } catch (e) {
          // Ignore COOP errors
        }
        this.message = 'Google Sign-In failed';
        this.isLoading = false;
      }
    };

    window.addEventListener('message', messageListener);
  }

  private handleGoogleResponse(response: GoogleCredentialResponse): void {
    console.log('Google credential:', response.credential);

    const selectedRole = this.registerForm.get('role')?.value || 'Customer';

    this.googleAuthService.sendTokenToBackend(response.credential, selectedRole)
      .subscribe({
        next: (backendResponse) => {
          console.log('Backend response:', backendResponse);
          if (backendResponse.token) {
            // localStorage.setItem('authToken', backendResponse.token);
            try {
              const decodedToken: any = jwtDecode(backendResponse.token);
              const user = {
                id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
              };
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('token', backendResponse.token);

              console.log('Saved user during Google registration:', user);
            } catch (error) {
              console.error('Error decoding token:', error);
            }
            this.router.navigateByUrl('/main');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Backend error details:', error);
          this.message = error.error?.message || 'Google login failed';
          this.isLoading = false;
        }
      });
  }

  private loginWithFacebook(): void {
    window.open('https://www.facebook.com/dialog/oauth', '_blank');
    this.isLoading = false;
  }

  private loginWithTwitter(): void {
    window.open('https://api.twitter.com/oauth/authorize', '_blank');
    this.isLoading = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
