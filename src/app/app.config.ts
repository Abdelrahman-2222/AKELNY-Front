// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { providePrimeNG } from 'primeng/config';
// import Aura from '@primeuix/themes/aura';
// import { routes } from './app.routes';
// import { provideHttpClient, withFetch } from '@angular/common/http';
// import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
// import { environment } from '../environments/environment';
//
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideAnimationsAsync(),
//     provideHttpClient(withFetch()),
//     providePrimeNG({
//       theme: {
//         preset: Aura
//       }
//     }),
//     {
//       provide: 'SocialAuthServiceConfig',
//       useValue: {
//         autoLogin: false,
//         providers: [
//           {
//             id: GoogleLoginProvider.PROVIDER_ID,
//             provider: new GoogleLoginProvider(environment.googleClientId)
//           }
//         ]
//       } as SocialAuthServiceConfig
//     }
//   ]
// };

// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
// import { SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
// import { routes } from './app.routes';
// import { environment } from '../environments/environment';
//
// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),
//     {
//       provide: 'SocialAuthServiceConfig',
//       useValue: {
//         autoLogin: false,
//         providers: [
//           {
//             id: GoogleLoginProvider.PROVIDER_ID,
//             provider: new GoogleLoginProvider(environment.googleClientId)
//           }
//         ],
//         onError: (err) => {
//           console.error(err);
//         }
//       } as SocialAuthServiceConfig,
//     }
//   ]
// };

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
