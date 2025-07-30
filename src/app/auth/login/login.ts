import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleAuthService } from '../../services/google-auth.service';
import {jwtDecode} from 'jwt-decode';
import { UserService } from '../../services/user.service';



export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  isLoading = false;
  isForgotPasswordLoading = false;
  showPassword = false;
  showForgotPasswordModal = false;
  message: string | null = null;
  forgotPasswordMessage: string | null = null;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private googleAuthService: GoogleAuthService,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // onSubmit(): void {
  //   if (!this.loginForm.valid) {
  //     this.markFormGroupTouched();
  //     return;
  //   }
  //
  //   this.isLoading = true;
  //   this.message = null;
  //
  //   const loginDto: LoginDto = {
  //     email: this.loginForm.get('email')?.value,
  //     password: this.loginForm.get('password')?.value,
  //     rememberMe: this.loginForm.get('rememberMe')?.value ? 'true' : 'false'
  //   };
  //
  //   const apiUrl = `${environment.apiUrl}/Auth/login`;
  //
  //   this.http.post(apiUrl, loginDto).subscribe({
  //     next: (response: any) => {
  //       this.isLoading = false;
  //
  //       if (response.token) {
  //         localStorage.setItem('token', response.token);
  //         try {
  //           const decodedToken: any = jwtDecode(response.token);
  //           const user = {
  //             id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
  //             email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
  //             role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  //           };
  //
  //
  //
  //           setTimeout(() => {
  //             this.userService.fetchAndSetCurrentUser().subscribe({
  //               complete: () => {
  //                 this.message = 'Login successful! Redirecting...';
  //                 this.isSuccess = true;
  //                 setTimeout(() => {
  //                   this.router.navigateByUrl('/main');
  //                 }, 1000);
  //               },
  //               error: (fetchError) => {
  //                 console.error('Failed to fetch user after login', fetchError);
  //                 this.message = 'Login succeeded, but failed to load profile.';
  //                 this.isSuccess = true;
  //               }
  //             });
  //           }, 0);
  //         } catch (error) {
  //           console.error('Error decoding token:', error);
  //           this.message = 'Invalid token received from server.';
  //           this.isSuccess = false;
  //         }
  //       } else {
  //         this.message = 'Login failed. Token not received.';
  //         this.isSuccess = false;
  //       }
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.isSuccess = false;
  //       if (err.status === 401) {
  //         this.message = 'Invalid email or password';
  //       } else {
  //         this.message = 'Login failed. Please try again.';
  //       }
  //     }
  //   });
  // }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.message = null;

    const loginDto: LoginDto = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value ? 'true' : 'false'
    };

    const apiUrl = `${environment.apiUrl}/Auth/login`;

    this.http.post(apiUrl, loginDto).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (!response.token) {
          this.message = 'Login failed. Token not received.';
          this.isSuccess = false;
          return;
        }

        // Save token to localStorage
        localStorage.setItem('token', response.token);

        // Optional: decode it if you want to inspect claims (not required)
        // try {
        //   const decodedToken: any = jwtDecode(response.token);
        //   console.log('✅ Decoded JWT:', decodedToken);
        // } catch (e) {
        //   console.warn('⚠️ Failed to decode token');
        // }

        // ⏳ Delay to ensure localStorage is updated before using it
        setTimeout(() => {
          const storedToken = localStorage.getItem('token');
          if (!storedToken) {
            this.message = 'Login failed. Token not available.';
            this.isSuccess = false;
            return;
          }

          this.userService.fetchAndSetCurrentUser().subscribe({
            next: (user) => {
              // console.log('✅ Fetched user:', user);
              this.message = 'Login successful! Redirecting...';
              this.isSuccess = true;

              setTimeout(() => {
                this.router.navigateByUrl('/main');
              }, 1000);
            },
            error: (fetchError) => {
              // console.error('❌ Failed to fetch user after login', fetchError);
              this.message = 'Login succeeded, but failed to load profile.';
              this.isSuccess = true;
            }
          });
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        if (err.status === 401) {
          this.message = 'Invalid email or password';
        } else {
          this.message = 'Login failed. Please try again.';
        }
      }
    });
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
    // Check if the Google script is loaded
    if (typeof (window as any).google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        (window as any).google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleResponse(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Also render a button if container exists
        this.renderGoogleButton();
      };
      document.head.appendChild(script);
    } else {
      (window as any).google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Also render a button if container exists
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton(): void {
    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer && (window as any).google) {
      (window as any).google.accounts.id.renderButton(buttonContainer, {
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

  public loginWithGoogle(): void {
    this.isLoading = true;

    if (typeof (window as any).google === 'undefined') {
      console.error('Google API not loaded');
      this.isLoading = false;
      return;
    }

    // Simply trigger the Google One Tap prompt - this is the most reliable method
    try {
      (window as any).google.accounts.id.prompt({
        moment_callback: (promptMoment: any) => {
          console.log('Prompt moment:', promptMoment);
          if (promptMoment.isNotDisplayed() || promptMoment.isSkippedMoment()) {
            // If One Tap fails, show the standard sign-in flow
            this.showGoogleSignInFallback();
          }
        }
      });
    } catch (error) {
      console.error('Google One Tap error:', error);
      this.showGoogleSignInFallback();
    }
  }

  private showGoogleSignInFallback(): void {
    // Create and show Google's standard sign-in button
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

    // Add a close button
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

    // Render Google button in the popup
    (window as any).google.accounts.id.renderButton(buttonDiv, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      width: 250
    });
  }

  private handleGoogleResponse(response: any): void {
    console.log('Google credential:', response.credential);

    // For login, we'll use 'Customer' as default role (can be changed later via profile)
    const defaultRole = 'Customer';

    this.googleAuthService.sendTokenToBackend(response.credential, defaultRole)
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
            } catch (error) {
              console.error('Error decoding token:', error);
            }
            this.message = "Google login successful! Redirecting...";
            this.isSuccess = true;
            setTimeout(() => {
              this.router.navigateByUrl('/main');
            }, 1000);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Backend error details:', error);
          this.message = error.error?.message || 'Google login failed';
          this.isSuccess = false;
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

  openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
    this.forgotPasswordMessage = null;
    this.forgotPasswordForm.reset();
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
    this.forgotPasswordMessage = null;
    this.isForgotPasswordLoading = false;
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isForgotPasswordLoading = true;
      this.forgotPasswordMessage = null;

      const forgotPasswordDto: ForgotPasswordDto = {
        email: this.forgotPasswordForm.get('email')?.value
      };

      // const apiUrl = window.location.hostname == 'localhost'
      //   ? 'https://localhost:7045/api/Auth/forgot-password'
      //   : 'http://akelni.tryasp.net/api/Auth/forgot-password';

      const apiUrl = `${environment.apiUrl}/Auth/forgot-password`;

      this.http.post(apiUrl, forgotPasswordDto).subscribe({
        next: () => {
          this.isForgotPasswordLoading = false;
          this.forgotPasswordMessage = "If an account with this email exists, you will receive a password reset link shortly.";
          // Auto close modal after 3 seconds
          setTimeout(() => {
            this.closeForgotPasswordModal();
          }, 3000);
        },
        error: (error) => {
          this.isForgotPasswordLoading = false;
          // For security, we don't reveal if email exists or not
          this.forgotPasswordMessage = "If an account with this email exists, you will receive a password reset link shortly.";
          setTimeout(() => {
            this.closeForgotPasswordModal();
          }, 3000);
        }
      });
    } else {
      this.markForgotPasswordFormTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private markForgotPasswordFormTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
