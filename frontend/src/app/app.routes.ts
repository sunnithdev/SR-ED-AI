import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Commits } from './pages/commits/commits';
import { App } from './app';
import { GetReports } from './pages/get-reports/get-reports';

export const routes: Routes = [
{ path: '', redirectTo: '', pathMatch: 'full' },
{path: 'get-reports', component: GetReports},
  { path: 'dashboard', component: Dashboard },
  { path: 'commits/:repoName', component: Commits },
];

