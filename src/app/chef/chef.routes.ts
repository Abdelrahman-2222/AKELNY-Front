import { Routes } from '@angular/router';

export const chefRoutes: Routes = [
  { path: '', redirectTo: 'chef-dashboard', pathMatch: 'full' },

  {
    path: 'about',
    loadComponent: () =>
      import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'chef-dashboard',
    loadComponent: () =>
      import('./chef-dashboard/chef-dashboard-component/chef-dashboard-component').then(
        (m) => m.ChefDashboardComponent
      ),
  },
  {
    path: 'chef-dashboard-current-orders',
    loadComponent: () =>
      import('./chef-dashboard-current-orders/chef-dashboard-current-orders.component').then(
        (m) => m.ChefDashboardCurrentOrdersComponent
      ),
  },
  {
    path:'chef-dashboard-earnings',
    loadComponent: () =>
      import('./chef-dashboard-earnings/chef-dashboard-earnings.component').then(
        (m) => m.ChefDashboardEarningsComponent
      ),
  },
  {
    path: 'chef-dashboard-header',
    loadComponent: () =>
      import('./chef-dashboard-header/chef-dashboard-header.component').then(
        (m) => m.ChefDashboardHeaderComponent
      ),
  },
  {
    path: 'chef-dashboard-item',
    loadComponent: () =>
      import('./chef-dashboard-item/chef-dashboard-item.component').then(
        (m) => m.ChefDashboardItemComponent
      ),
  },
  {
    path: 'chef-dashboard-menu',
    loadComponent: () =>
      import('./chef-dashboard-menu/chef-dashboard-menu.component').then(
        (m) => m.ChefDashboardMenuComponent
      ),
  },
  {
    path: 'chef-dashboard-order',
    loadComponent: () =>
      import('./chef-dashboard-order/chef-dashboard-order.component').then(
        (m) => m.ChefDashboardOrderComponent
      ),
  },
  {
    path: 'chef-dashboard-past-order',
    loadComponent: () =>
      import('./chef-dashboard-past-order/chef-dashboard-past-order.component').then(
        (m) => m.ChefDashboardPastOrderComponent
      ),
  },
  {
    path: 'chef-dashboard-past-orders',
    loadComponent: () =>
      import('./chef-dashboard-past-orders/chef-dashboard-past-orders.component').then(
        (m) => m.ChefDashboardPastOrdersComponent
      ),
  },
  {
    path: 'chef-dashboard-stat-card',
    loadComponent: () =>
      import('./chef-dashboard-stat-card/chef-dashboard-stat-card.component').then(
        (m) => m.ChefDashboardStatCardComponent
      ),
  },
  {
    path: 'chef-dashboard-stat-cards',
    loadComponent: () =>
      import('./chef-dashboard-stats-cards/chef-dashboard-stats-cards.component').then(
        (m) => m.ChefDashboardStatsCardsComponent
      ),
  },
  {
    path: 'chef-payout',
    loadComponent: () =>
      import('./chef-payout/chef-payout.component').then(
        (m) => m.ChefPayoutComponent
      ),
  },
  {
    path: 'chef-hero-section',
    loadComponent: () =>
      import('../pages/chef-hero-section/chef-hero-section.component').then(
        (m) => m.ChefHeroSectionComponent
      ),
  },
  {
    path: 'chef-listing',
    loadComponent: () =>
      import('../pages/chef-listing/chef-listing-component/chef-listing-component').then(
        (m) => m.ChefListingComponent
      ),
  },
  {
    path: 'chef-menu',
    loadComponent: () =>
      import('../pages/chef-menu/chef-menu.component').then(
        (m) => m.ChefMenuComponent
      ),
  },
  {
    path: 'chef-profile',
    loadComponent: () =>
      import('../pages/chef-profile/chef-profile-component/chef-profile-component').then(
        (m) => m.ChefProfileComponent
      ),
  },
  {
    path: 'chef-reviews',
    loadComponent: () =>
      import('../pages/chef-reviews/chef-reviews.component').then(
        (m) => m.ChefReviewsComponent
      ),
  }
]
