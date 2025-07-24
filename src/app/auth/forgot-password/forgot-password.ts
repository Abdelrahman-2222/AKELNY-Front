import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.message = null;

      const email = this.forgotPasswordForm.get('email')?.value;

      const apiUrl = window.location.hostname === 'localhost'
        ? 'https://localhost:7045/api/Auth/forgot-password'
        : 'http://akelni.tryasp.net/api/Auth/forgot-password';

      this.http.post(apiUrl, { email }).subscribe({
        next: () => {
          this.isLoading = false;
          this.message = 'If an account with this email exists, you will receive a password reset link shortly.';
          this.isSuccess = true;
          this.forgotPasswordForm.reset();
        },
        error: () => {
          this.isLoading = false;
          this.message = 'Something went wrong. Please try again later.';
          this.isSuccess = false;
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
