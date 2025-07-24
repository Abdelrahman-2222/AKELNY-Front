import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  isSuccess = false;
  token: string = '';
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';

      if (!this.token || !this.email) {
        this.message = 'Invalid reset link.';
        this.isSuccess = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token && this.email) {
      this.isLoading = true;
      this.message = null;

      const resetData = {
        email: this.email,
        token: this.token,
        newPassword: this.resetForm.get('newPassword')?.value
      };

      const apiUrl = window.location.hostname === 'localhost'
        ? 'https://localhost:7045/api/Auth/reset-password'
        : 'http://akelni.tryasp.net/api/Auth/reset-password';

      this.http.post(apiUrl, resetData).subscribe({
        next: () => {
          this.isLoading = false;
          this.message = 'Password reset successful! You can now login with your new password.';
          this.isSuccess = true;

          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 3000);
        },
        error: () => {
          this.isLoading = false;
          this.message = 'Failed to reset password. Please try again.';
          this.isSuccess = false;
        }
      });
    }
  }
}
