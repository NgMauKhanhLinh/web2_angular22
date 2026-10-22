import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthRestoreService } from '../services/auth-restore.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authSession = inject(AuthSessionService);
  const authRestore = inject(AuthRestoreService);
  const router = inject(Router);

  if (authSession.isAuthenticated()) {
    return true;
  }

  return authRestore.ensureSession().pipe(
    map((restored) =>
      restored
        ? true
        : router.createUrlTree(['/admin/login'], {
            queryParams: {
              returnUrl: state.url,
            },
          }),
    ),
  );
};
