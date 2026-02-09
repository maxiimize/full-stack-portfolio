import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
  // Example admin-protected route:
  // {
  //   path: 'admin',
  //   canActivate: [adminGuard],
  //   loadComponent: () =>
  //     import('./components/admin/admin.component').then(
  //       (m) => m.AdminComponent
  //     ),
  // },
];
