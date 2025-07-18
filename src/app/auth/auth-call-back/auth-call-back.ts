import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-call-back',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="text-center mt-5">
    <h3>Redirecting...</h3>
    <p>You will be redirected automatically.</p>
  </div>`
})
export class AuthCallBack implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Since we're using direct Google GSI, redirect to register
    // This route might be hit from old bookmarks or external links
    console.log('AuthCallback hit - redirecting to register');
    this.router.navigateByUrl('/register');
  }
}
