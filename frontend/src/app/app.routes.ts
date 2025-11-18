import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Commits } from './pages/commits/commits';
import { GetReports } from './pages/get-reports/get-reports';
import { ReportView } from './pages/report-view/report-view';

export const routes: Routes = [
  { path: '', redirectTo: 'get-reports', pathMatch: 'full' },
  { path: 'get-reports', component: GetReports },
  { path: 'dashboard', component: Dashboard },
  { path: 'commits/:repoName', component: Commits },
  { path: 'report/:id',component: ReportView},
];
