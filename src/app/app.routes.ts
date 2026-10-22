import { CanDeactivateFn, Routes } from '@angular/router';

import { adminLoginEntryGuard } from './core/guards/admin-login-entry.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const BACKOFFICE_ROLES = ['ADMIN', 'MANAGER', 'STAFF'];

/** Protect create/edit product drafts even when leaving via sidebar or browser Back. */
interface ProductLeaveAware {
  canLeavePage(): boolean | Promise<boolean>;
}
const confirmProductLeave: CanDeactivateFn<ProductLeaveAware> = (component) => component.canLeavePage();

const confirmStaffLeave: CanDeactivateFn<{ canLeavePage(): boolean | Promise<boolean> }> = component => component.canLeavePage();

export const routes: Routes = [
  {
    path: 'admin/staff/schedule',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    loadComponent: () => import('./features/admin/staff/pages/admin-staff-schedule.component')
      .then(component => component.AdminStaffScheduleComponent),
  },
  {
    path: 'admin/staff/shifts/assign',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () => import('./features/admin/staff/pages/admin-staff-shift-assign.component')
      .then(component => component.AdminStaffShiftAssignComponent),
  },
  {
    path: 'admin/staff/new',
    canActivate: [authGuard, roleGuard],
    canDeactivate: [confirmStaffLeave],
    data: { roles: ['ADMIN'], mode: 'create' },
    loadComponent: () => import('./features/admin/staff/pages/admin-staff-form.component')
      .then(component => component.AdminStaffFormComponent),
  },
  {
    path: 'admin/staff/:id/edit',
    canActivate: [authGuard, roleGuard],
    canDeactivate: [confirmStaffLeave],
    data: { roles: ['ADMIN', 'MANAGER'], mode: 'edit' },
    loadComponent: () => import('./features/admin/staff/pages/admin-staff-form.component')
      .then(component => component.AdminStaffFormComponent),
  },
  {
    path: 'admin/staff/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./features/admin/staff/pages/admin-staff-detail.component')
        .then(component => component.AdminStaffDetailComponent),
  },
  {
    path: 'admin/staff',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./features/admin/staff/pages/admin-staff-list.component')
        .then(component => component.AdminStaffListComponent),
  },

  {
    path: 'admin/branches/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./features/admin/branch-management/pages/branch-management-page.component')
        .then((component) => component.BranchManagementPageComponent),
  },
  {
    path: 'admin/branches',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () =>
      import('./features/admin/branch-management/pages/branch-management-page.component')
        .then((component) => component.BranchManagementPageComponent),
  },
  {
    path: 'admin/services/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'], editorMode: 'create' },
    loadComponent: () =>
      import('./features/admin/service-catalog/pages/service-catalog-editor.component')
        .then((component) => component.ServiceCatalogEditorComponent),
  },
  {
    path: 'admin/services/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'], editorMode: 'edit' },
    loadComponent: () =>
      import('./features/admin/service-catalog/pages/service-catalog-editor.component')
        .then((component) => component.ServiceCatalogEditorComponent),
  },
  {
    path: 'admin/services/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: BACKOFFICE_ROLES, editorMode: 'view' },
    loadComponent: () =>
      import('./features/admin/service-catalog/pages/service-catalog-editor.component')
        .then((component) => component.ServiceCatalogEditorComponent),
  },
  {
    path: 'admin/services',
    canActivate: [authGuard, roleGuard],
    data: { roles: BACKOFFICE_ROLES },
    loadComponent: () =>
      import(
        './features/admin/service-catalog/pages/service-catalog-list.component'
      ).then((component) => component.ServiceCatalogListComponent),
  },
  {
    path: 'admin',
    pathMatch: 'full',
    canActivate: [adminLoginEntryGuard],
    loadComponent: () =>
      import('./features/admin/auth/pages/login/admin-login-page.component').then(
        (component) => component.AdminLoginPageComponent,
      ),
  },
  {
    path: 'admin/login',
    canActivate: [adminLoginEntryGuard],
    loadComponent: () =>
      import('./features/admin/auth/pages/login/admin-login-page.component').then(
        (component) => component.AdminLoginPageComponent,
      ),
  },
  {
    path: 'admin/forbidden',
    loadComponent: () =>
      import(
        './features/admin/auth/pages/forbidden/admin-forbidden-page.component'
      ).then((component) => component.AdminForbiddenPageComponent),
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/admin/categories/pages/admin-category-page.component').then(
        (component) => component.AdminCategoryPageComponent,
      ),
  },
  {
    path: 'admin/products',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/admin/products/pages/list/admin-product-list-page.component').then(
        (component) => component.AdminProductListPageComponent,
      ),
  },
  {
    path: 'admin/products/:id/edit',
    canActivate: [authGuard, roleGuard],
    canDeactivate: [confirmProductLeave],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/admin/products/pages/edit/admin-product-edit-page.component').then(
        (component) => component.AdminProductEditPageComponent,
      ),
  },
  {
    path: 'admin/products/new',
    canActivate: [authGuard, roleGuard],
    canDeactivate: [confirmProductLeave],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/admin/products/pages/create/admin-product-create-page.component').then(
        (component) => component.AdminProductCreatePageComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: BACKOFFICE_ROLES,
    },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (component) => component.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/admin/pages/dashboard/admin-dashboard-page.component'
          ).then((component) => component.AdminDashboardPageComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/pages/orders/admin-orders-page.component').then(
            (component) => component.AdminOrdersPageComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import(
            './features/admin/pages/appointments/admin-appointments-page.component'
          ).then((component) => component.AdminAppointmentsPageComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'MANAGER'],
        },
        loadComponent: () =>
          import(
            './features/admin/users/pages/admin-users-page.component'
          ).then((component) => component.AdminUsersPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            './features/admin/auth/pages/profile/admin-profile-page.component'
          ).then((component) => component.AdminProfilePageComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/customer-layout/customer-layout.component').then(
        (component) => component.CustomerLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/customer/home-page/home-page.component').then(
            (component) => component.HomePageComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products-page.component').then(
            (component) => component.ProductsPageComponent,
          ),
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('./features/booking/booking-page.component').then(
            (component) => component.BookingPageComponent,
          ),
      },
      {
        path: 'pets',
        loadComponent: () =>
          import('./features/pets/pets-page.component').then(
            (component) => component.PetsPageComponent,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/customer/login/login.component').then(
            (component) => component.LoginComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders-page.component').then(
            (component) => component.OrdersPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
