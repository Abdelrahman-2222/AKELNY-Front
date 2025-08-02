// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
// import { routes } from './app.routes';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AuthInterceptor } from './shared/guards/auth.interceptor';
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
//     provideRouter(routes),
//     provideHttpClient()
//   ]
// };

// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './shared/guards/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('token');
          if (token) {
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            // console.log('🛡️ Token added to request:', token?.substring(0, 20) + '...');
            return next(cloned);
          }
          return next(req);
        }
      ])
    )
  ]
};
