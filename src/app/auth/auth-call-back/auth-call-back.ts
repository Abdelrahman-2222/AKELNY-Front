import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.html',
  styleUrls: ['./auth-callback.css']
})
export class AuthCallback implements OnInit {
  isProcessing = true;
  error = false;
  success = false;
  errorMessage = '';
  successMessage = '';
  countdown = 3;
  countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.processCallback();
  }

  private processCallback(): void {
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.showError(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        this.showError('No authorization code received.');
        return;
      }

      // Since you only have Google implemented in backend,
      // redirect other providers to external login with message
      if (type !== 'google') {
        this.showError(`${type} authentication is not yet implemented.`);
        return;
      }

      this.processGoogleCallback(code);
    });
  }

  private processGoogleCallback(code: string): void {
    // For now, show error since Google should use the direct ID token method
    this.showError('Google authentication should use the direct sign-in method, not OAuth callback.');
  }

  private showError(message: string): void {
    this.isProcessing = false;
    this.error = true;
    this.success = false;
    this.errorMessage = message;
  }

  private showSuccess(message: string): void {
    this.isProcessing = false;
    this.error = false;
    this.success = true;
    this.successMessage = message;
  }

  private redirectAfterDelay(route: string): void {
    this.countdown = 3;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigateByUrl(route);
      }
    }, 1000);
  }

  public retryAuthentication(): void {
    this.router.navigateByUrl('/external-login');
  }

  public goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
