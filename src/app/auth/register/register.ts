// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http'; // Add HttpClientModule
// import { environment } from '../../../environments/environment';
// import { GoogleAuthService } from '../../services/google-auth.service';
//
// export interface RegisterDto {
//   email: string;
//   password: string;
//   role: string;
// }
//
// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
//   templateUrl: './register.html',
//   styleUrls: ['./register.css']
// })
// export class Register implements OnInit {
//   registerForm: FormGroup;
//   isLoading = false;
//   showPassword = false;
//   message: string | null = null;
//
//   roles = [
//     { value: 'Customer', label: 'Customer', icon: 'fas fa-user' },
//     { value: 'Chef', label: 'Chef', icon: 'fas fa-utensils' },
//     { value: 'Admin', label: 'Admin', icon: 'fas fa-user-shield' }
//   ];
//
//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private http: HttpClient,
//     private googleAuthService: GoogleAuthService
//   ) {
//     this.registerForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       role: ['Customer', Validators.required]
//     });
//   }
//
//   ngOnInit(): void {}
//
//   get email() { return this.registerForm.get('email'); }
//   get password() { return this.registerForm.get('password'); }
//   get role() { return this.registerForm.get('role'); }
//
//   togglePasswordVisibility(): void {
//     this.showPassword = !this.showPassword;
//   }
//
//   onSubmit(): void {
//     if (this.registerForm.valid) {
//       this.isLoading = true;
//       const registerDto: RegisterDto = this.registerForm.value;
//
//       const apiUrl = window.location.hostname == 'localhost'
//         ? 'https://localhost:7045/api/Auth/register'
//         : 'http://akelni.tryasp.net/api/Auth/register';
//
//       this.http.post(apiUrl, registerDto).subscribe({
//         next: () => {
//           this.isLoading = false;
//           this.message = "Registration successful! You are redirecting to the main page.";
//           console.log('Navigating to /main');
//           this.router.navigateByUrl('/main');
//         },
//         error: err => {
//           if (err.error && Array.isArray(err.error)) {
//             const duplicate = err.error.find((e: any) => e.code === 'DuplicateUserName');
//             if (duplicate) {
//               this.message = duplicate.description;
//             } else {
//               this.message = 'Registration failed. Please check your details.';
//             }
//           }
//         }
//       });
//     } else {
//       this.markFormGroupTouched();
//     }
//   }
//
//   onSocialLogin(provider: string): void {
//     this.isLoading = true;
//
//     switch(provider) {
//       case 'Google':
//         this.loginWithGoogle();
//         break;
//       case 'Facebook':
//         this.loginWithFacebook();
//         break;
//       case 'Twitter':
//         this.loginWithTwitter();
//         break;
//       default:
//         console.log(`Unknown provider: ${provider}`);
//         this.isLoading = false;
//     }
//   }
//
// // Remove the library call and use direct Google implementation
//   public loginWithGoogle(): void {
//     this.isLoading = true;
//
//     // Check if Google API is loaded
//     if (typeof google === 'undefined') {
//       console.error('Google API not loaded');
//       this.isLoading = false;
//       return;
//     }
//     if (typeof google !== 'undefined') {
//       try {
//         // Try FedCM first, fallback to One Tap
//         google.accounts.id.prompt((notification: any) => {
//           console.log('Prompt notification:', notification);
//           if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
//             // Fallback to popup mode if One Tap fails
//             this.openGooglePopup();
//           }
//         });
//       } catch (error) {
//         console.error('Google Sign-In error:', error);
//         this.openGooglePopup();
//       }
//     } else {
//       console.error('Google SDK not loaded');
//       this.isLoading = false;
//     }
//   }
//
//   private openGooglePopup(): void {
//     // Alternative popup-based authentication
//     const authUrl = `https://accounts.google.com/oauth/authorize?client_id=${environment.googleClientId}&redirect_uri=${window.location.origin}/auth/callback&response_type=code&scope=openid email profile`;
//     window.open(authUrl, 'googleAuth', 'width=500,height=600');
//   }
//     // Initialize Google Sign-In
//     google.accounts.id.initialize({
//       client_id: environment.googleClientId,
//       callback: this.handleGoogleResponse.bind(this)
//     });
//
//     // Render the sign-in button or use one-tap
//     google.accounts.id.prompt((notification: any) => {
//       if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
//         // Fallback to popup
//         const buttonElement = document.getElementById('google-signin-button');
//         if (buttonElement) {
//           google.accounts.id.renderButton(buttonElement, {
//             theme: 'outline',
//             size: 'large'
//           });
//         }
//       }
//     });
//   }
//
//   private handleGoogleResponse(response: any): void {
//     console.log('Google credential:', response.credential);
//
//     // Send the JWT token to your backend
//     this.googleAuthService.sendTokenToBackend(response.credential)
//       .subscribe({
//         next: (backendResponse) => {
//           console.log('Backend response:', backendResponse);
//           this.router.navigateByUrl('/main');
//           this.isLoading = false; // Move this here
//         },
//         error: (error) => {
//           console.error('Backend error:', error);
//           this.isLoading = false; // And here
//         }
//       });
//   }
//
//   private initializeGoogleSignIn(): void {
//     if (typeof google !== 'undefined') {
//       google.accounts.id.initialize({
//         client_id: environment.googleClientId,
//         callback: (response: any) => this.handleGoogleResponse(response),
//         use_fedcm_for_prompt: true, // Enable FedCM
//         auto_select: false,
//         cancel_on_tap_outside: true,
//         context: 'signup',
//         ux_mode: 'popup',
//         itp_support: true
//       });
//     }
//   }
//   private loginWithFacebook(): void {
//     // Implement Facebook login
//     window.open('https://www.facebook.com/dialog/oauth', '_blank');
//     this.isLoading = false;
//   }
//
//   private loginWithTwitter(): void {
//     // Implement Twitter login
//     window.open('https://api.twitter.com/oauth/authorize', '_blank');
//     this.isLoading = false;
//   }
//
//   private markFormGroupTouched(): void {
//     Object.keys(this.registerForm.controls).forEach(key => {
//       const control = this.registerForm.get(key);
//       control?.markAsTouched();
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleAuthService } from '../../services/google-auth.service';

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Customer', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get role() { return this.registerForm.get('role'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registerDto: RegisterDto = this.registerForm.value;

      const apiUrl = window.location.hostname == 'localhost'
        ? 'https://localhost:7045/api/Auth/register'
        : 'http://akelni.tryasp.net/api/Auth/register';

      this.http.post(apiUrl, registerDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.message = "Registration successful! You are redirecting to the main page.";
          console.log('Navigating to /main');
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
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

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
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signup'
      });

      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signup_with'
          });
        } else {
          console.warn('Google button container not found');
        }
      }, 100);
    }
  }
  public loginWithGoogle(): void {
    if (typeof google === 'undefined') {
      console.error('Google API not loaded');
      this.isLoading = false;
      return;
    }

    try {
      // Use only GSI - no fallback popup
      google.accounts.id.prompt((notification: any) => {
        console.log('Prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not available - user needs to enable third-party cookies or try incognito mode');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
      this.isLoading = false;
    }
  }

// Remove the openGooglePopup() method entirely

  private handleGoogleResponse(response: any): void {
    console.log('Google credential:', response.credential);

    // Get the selected role from the form
    const selectedRole = this.registerForm.get('role')?.value || 'Customer';

    this.googleAuthService.sendTokenToBackend(response.credential, selectedRole)
      .subscribe({
        next: (backendResponse) => {
          console.log('Backend response:', backendResponse);
          if (backendResponse.token) {
            localStorage.setItem('authToken', backendResponse.token);
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
