import {Routes} from '@angular/router';

export const customerRoutes: Routes = [

  {path: '', redirectTo: 'categories', pathMatch: 'full'},
  {
    path: 'cart-component',
    loadComponent: () =>
      import('./pages/cart/cart-component/cart-component')
        .then((m) => m.CartComponent)
  },
  {
    path: 'order-body',
    loadComponent: () =>
      import('./pages/cart/order-body/order-body.component')
        .then((m) => m.OrderBodyComponent)
  },
  {
    path: 'order-promocode',
    loadComponent: () =>
      import('./pages/cart/order-promocode/order-promocode.component')
        .then((m) => m.OrderPromocodeComponent)
  },
  {
    path: 'order-summary',
    loadComponent: () =>
      import('./pages/cart/order-summary/order-summary.component')
        .then((m) => m.OrderSummaryComponent)
  },
  {
    path: 'shopping-cart-item',
    loadComponent: () =>
      import('./pages/cart/shopping-cart-item/shopping-cart-item.component')
        .then((m) => m.ShoppingCartItemComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout-component/checkout-component')
        .then((m) => m.CheckoutComponent)
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/home/categories/categories.component')
        .then((m) => m.CategoriesComponent)
  },
  {
    path: 'featured-chef-card',
    loadComponent: () =>
      import('./pages/home/featured-chef-card/featured-chef-card.component')
        .then((m) => m.FeaturedChefCardComponent)
  },
  {
    path: 'featured-chefs',
    loadComponent: () =>
      import('./pages/home/featured-chefs/featured-chefs.component')
        .then((m) => m.FeaturedChefsComponent)
  },
  {
    path: 'food-category-card',
    loadComponent: () =>
      import('./pages/home/food-category-card/food-category-card.component')
        .then((m) => m.FoodCategoryCardComponent)
  },
  {
    path: 'hero-section',
    loadComponent: () =>
      import('./pages/home/hero-section/hero-section.component')
        .then((m) => m.HeroSectionComponent)
  },
  {
    path: 'home-component',
    loadComponent: () =>
      import('./pages/home/home-component/home-component')
        .then((m) => m.HomeComponent)
  },
  {
    path: 'trending-dish-card',
    loadComponent: () =>
      import('./pages/home/trending-dish-card/trending-dish-card.component')
        .then((m) => m.TrendingDishCardComponent)
  },
  {
    path: 'trending-dishes',
    loadComponent: () =>
      import('./pages/home/trending-dishes/trending-dishes.component')
        .then((m) => m.TrendingDishesComponent)
  },
  {
    path: 'menu-item',
    loadComponent: () =>
      import('./pages/menu-item/menu-item-component/menu-item-component')
        .then((m) => m.MenuItemComponent)
  }
]
