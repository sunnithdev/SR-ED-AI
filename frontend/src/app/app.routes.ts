import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Commits } from './pages/commits/commits';
import { App } from './app';

export const routes: Routes = [
{ path: '', redirectTo: '', pathMatch: 'full' },  // Default empty route
  { path: 'dashboard', component: Dashboard },
  { path: 'commits/:repoName', component: Commits },
];

