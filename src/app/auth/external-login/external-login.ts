import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-external-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './external-login.html',
  styleUrls: ['./external-login.css']
})
export class ExternalLogin implements OnInit {
  isLoading = false;
  currentProvider = '';
  selectedRole = 'Customer';
  message: string | null = null;
  isSuccess = false;

  roles = [
    { value: 'Customer', label: 'Customer', icon: 'fas fa-user' },
    { value: 'Chef', label: 'Chef', icon: 'fas fa-utensils' },
    { value: 'Admin', label: 'Admin', icon: 'fas fa-user-shield' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private googleAuthService: GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.initializeGoogleSignIn();
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

        // Render Google button in external login page
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

      // Render Google button in external login page
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton(): void {
    const buttonContainer = document.getElementById('google-signin-button-external');
    if (buttonContainer && (window as any).google) {
      (window as any).google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%'
      });
    }
  }

  public loginWithGoogle(): void {
    if (!this.selectedRole) {
      this.message = 'Please select a role before continuing.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.currentProvider = 'Google';
    this.message = null;

    if (typeof (window as any).google === 'undefined') {
      console.error('Google API not loaded');
      this.isLoading = false;
      this.currentProvider = '';
      return;
    }

    // Simply trigger the Google One Tap prompt
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
    const existingButton = document.getElementById('temp-google-button-external');
    if (existingButton) {
      existingButton.remove();
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'temp-google-button-external';
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
      this.currentProvider = '';
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

    this.googleAuthService.sendTokenToBackend(response.credential, this.selectedRole)
      .subscribe({
        next: (backendResponse) => {
          console.log('Backend response:', backendResponse);
          if (backendResponse.token) {
            localStorage.setItem('authToken', backendResponse.token);
            this.message = "Google authentication successful! Redirecting...";
            this.isSuccess = true;
            setTimeout(() => {
              this.router.navigateByUrl('/main');
            }, 1500);
          }
          this.isLoading = false;
          this.currentProvider = '';
        },
        error: (error) => {
          console.error('Backend error details:', error);
          this.message = error.error?.message || 'Google login failed';
          this.isSuccess = false;
          this.isLoading = false;
          this.currentProvider = '';
        }
      });
  }

  public loginWithFacebook(): void {
    if (!this.selectedRole) {
      this.message = 'Please select a role before continuing.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.currentProvider = 'Facebook';
    this.message = null;

    // Facebook OAuth URL construction
    // const clientId = environment.facebookClientId; // You'll need to add this to environment
    const clientId = 213; // You'll need to add this to environment

    const redirectUri = encodeURIComponent(window.location.origin + '/auth-callback?type=facebook');
    const scope = encodeURIComponent('email');
    const state = encodeURIComponent(JSON.stringify({ role: this.selectedRole }));

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `state=${state}`;

    // Open popup or redirect
    const popup = window.open(facebookAuthUrl, 'facebook-auth', 'width=600,height=600');

    if (!popup) {
      this.message = 'Please allow popups for Facebook Sign-In';
      this.isLoading = false;
      this.currentProvider = '';
      return;
    }

    // Monitor popup
    this.monitorAuthPopup(popup, 'Facebook');
  }

  public loginWithTwitter(): void {
    if (!this.selectedRole) {
      this.message = 'Please select a role before continuing.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.currentProvider = 'Twitter';
    this.message = null;

    // Twitter OAuth 1.0a requires initial request token
    // This would typically be handled server-side first
    const apiUrl = window.location.hostname == 'localhost'
      ? 'https://localhost:7045/api/Auth/twitter-request-token'
      : 'http://akelni.tryasp.net/api/Auth/twitter-request-token';

    this.http.post(apiUrl, { role: this.selectedRole }).subscribe({
      next: (response: any) => {
        if (response.authUrl) {
          const popup = window.open(response.authUrl, 'twitter-auth', 'width=600,height=600');
          if (popup) {
            this.monitorAuthPopup(popup, 'Twitter');
          } else {
            this.message = 'Please allow popups for Twitter Sign-In';
            this.isLoading = false;
            this.currentProvider = '';
          }
        }
      },
      error: (error) => {
        console.error('Twitter request token error:', error);
        this.message = 'Failed to initiate Twitter authentication';
        this.isSuccess = false;
        this.isLoading = false;
        this.currentProvider = '';
      }
    });
  }

  private monitorAuthPopup(popup: Window, provider: string): void {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        this.isLoading = false;
        this.currentProvider = '';
        this.message = `${provider} authentication was cancelled.`;
        this.isSuccess = false;
      }
    }, 1000);

    // Listen for messages from the popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'AUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageListener);

        // Handle successful authentication
        localStorage.setItem('authToken', event.data.token);
        this.message = `${provider} authentication successful! Redirecting...`;
        this.isSuccess = true;
        this.isLoading = false;
        this.currentProvider = '';

        setTimeout(() => {
          this.router.navigateByUrl('/main');
        }, 1500);
      } else if (event.data.type === 'AUTH_ERROR') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', messageListener);

        this.message = event.data.message || `${provider} authentication failed`;
        this.isSuccess = false;
        this.isLoading = false;
        this.currentProvider = '';
      }
    };

    window.addEventListener('message', messageListener);
  }
}
