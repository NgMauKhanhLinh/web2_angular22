import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthRestoreService } from '../services/auth-restore.service';
import { AuthSessionService } from '../services/auth-session.service';

export const adminLoginEntryGuard: CanActivateFn = (_route, state) => {
  const authSession = inject(AuthSessionService);
  const authRestore = inject(AuthRestoreService);
  const router = inject(Router);

  if (authSession.isAuthenticated()) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  // Direct access to /admin/login must not wait for a possibly sleeping BE.
  // Protected pages and /admin still attempt to restore an existing session.
  if (state.url.startsWith('/admin/login')) {
    return true;
  }

  return authRestore.ensureSession().pipe(
    map((restored) =>
      restored ? router.createUrlTree(['/admin/dashboard']) : true,
    ),
  );
};
