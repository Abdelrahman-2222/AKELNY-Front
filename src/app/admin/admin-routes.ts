import {Routes} from '@angular/router';


export const adminRoutes: Routes = [
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard-component/admin-dashboard-component')
        .then((m) => m.AdminDashboardComponent)
  },
  {
    path: 'category-management-panel-component',
    loadComponent: () =>
      import('./category-management-panel-component/category-management-panel-component')
        .then((m) => m.CategoryManagementPanelComponent)
  },
  {
    path: 'chef-item',
    loadComponent: () =>
      import('./chef-item/chef-item.component')
        .then((m) => m.ChefItemComponent)
  },
  {
    path: 'chef-performance-chart-component',
    loadComponent: () =>
      import('./chef-performance-chart-component/chef-performance-chart-component')
        .then((m) => m.ChefPerformanceChartComponent)
  },
  {
    path: 'dashboard-header-component',
    loadComponent: () =>
      import('./dashboard-header-component/dashboard-header-component')
        .then((m) => m.DashboardHeaderComponent)
  },
  {
    path: 'mood-category-item',
    loadComponent: () =>
      import('./mood-category-item/mood-category-item.component')
        .then((m) => m.MoodCategoryItemComponent)
  },
  {
    path: 'order-management-component',
    loadComponent: () =>
      import('./order-management-component/order-management-component')
        .then((m) => m.OrderManagementComponent)
  },
  {
    path: 'order-status-cards-component',
    loadComponent: () =>
      import('./order-status-cards-component/order-status-cards-component')
        .then((m) => m.OrderStatusCardsComponent)
  },
  {
    path: 'orders-table-component',
    loadComponent: () =>
      import('./orders-table-component/orders-table-component')
        .then((m) => m.OrdersTableComponent)
  },
  {
    path: 'sales-chart-component',
    loadComponent: () =>
      import('./sales-chart-component/sales-chart-component')
        .then((m) => m.SalesChartComponent)
  },
  {
    path: 'sidebar-navigation-component',
    loadComponent: () =>
      import('./sidebar-navigation-component/sidebar-navigation-component')
        .then((m) => m.SidebarNavigationComponent)
  },
  {
    path: 'status-card',
    loadComponent: () =>
      import('./status-card/status-card.component')
        .then((m) => m.StatusCardComponent)
  }
]
