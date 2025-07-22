import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarNavigationComponent } from '../../sidebar-navigation-component/sidebar-navigation-component';
import { RouterOutlet } from '@angular/router';
import { DashboardHeaderComponent } from '../../dashboard-header-component/dashboard-header-component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, SidebarNavigationComponent, DashboardHeaderComponent],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css',
})
export class AdminDashboardComponent {}
