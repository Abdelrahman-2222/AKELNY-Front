import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar-component/navbar-component';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent implements OnInit {
  private router: Router = inject(Router);
  ngOnInit(): void {
    // alert(
    //   'Your Order is placed Successfully, Thank you for choosing Akalni :)'
    // );
    setTimeout(() => {
      this.router.navigate(['/main']);
    }, 10000);
  }
}
