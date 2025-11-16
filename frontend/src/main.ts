import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Clerk } from '@clerk/clerk-js';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));


