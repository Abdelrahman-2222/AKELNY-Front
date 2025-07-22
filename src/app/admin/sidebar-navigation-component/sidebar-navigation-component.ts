import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  badge: number | null;
  completed: boolean;
}

@Component({
  selector: 'app-sidebar-navigation',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-navigation-component.html',
  styleUrl: './sidebar-navigation-component.css'
})
export class SidebarNavigationComponent {
  menuItems: MenuItem[] = [
    { title: 'Chef Management', icon: 'fas fa-users', link: '/chefs', badge: null, completed: false },
    { title: 'Approve', icon: 'fas fa-check-circle', link: '/approve', badge: 5, completed: true },
    { title: 'Order Management', icon: 'fas fa-clipboard-list', link: '/orders', badge: null, completed: false },
    { title: 'Category Management', icon: 'fas fa-layer-group', link: '/categories', badge: 2, completed: false },
    { title: 'Reports', icon: 'fas fa-chart-bar', link: '/reports', badge: null, completed: false },
    { title: 'Analytics', icon: 'fas fa-chart-pie', link: '/analytics', badge: null, completed: false }
  ];

  getItemClasses(item: MenuItem) {
    return {
      'hover:bg-gray-100': true,
      'border-l-4 border-red-500': item.completed
    };
  }
}
