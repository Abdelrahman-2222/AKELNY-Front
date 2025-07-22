import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarComponent } from './navbar-component/navbar-component';
import { CartComponent } from './pages/cart/cart-component/cart-component';
import { HomeComponent } from './pages/home/home-component/home-component';
import { ChefDashboardComponent } from './chef/chef-dashboard/chef-dashboard-component/chef-dashboard-component';
import { ChefProfileComponent } from './pages/chef-profile/chef-profile-component/chef-profile-component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard-component/admin-dashboard-component';
import { OrderManagementComponent } from './admin/order-management-component/order-management-component';
// import {Register} from './auth/register/register';
// import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FontAwesomeModule,
    NavbarComponent,
    CartComponent,
    HomeComponent,
    ChefDashboardComponent,
    ChefProfileComponent,
    AdminDashboardComponent,
    OrderManagementComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AKELNY-Front');
}
