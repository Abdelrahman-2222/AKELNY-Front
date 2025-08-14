import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularComponent, LucideAngularModule } from 'lucide-angular';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
// bootstrapApplication(App, {
//   ...appConfig,
//   providers: [importProvidersFrom(LucideAngularComponent)],
// }).catch((err) => console.error(err));
