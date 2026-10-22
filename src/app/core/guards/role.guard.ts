import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';

import { AuthRestoreService } from '../services/auth-restore.service';
import { AuthSessionService } from '../services/auth-session.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authSession = inject(AuthSessionService);
  const authRestore = inject(AuthRestoreService);
  const router = inject(Router);
  const configuredRoles = route.data['roles'];

  if (!isValidRoleConfiguration(configuredRoles)) {
    return forbiddenRedirect(router);
  }

  if (authSession.isAuthenticated()) {
    return authSession.hasAnyRole(configuredRoles)
      ? true
      : forbiddenRedirect(router);
  }

  return authRestore.ensureSession().pipe(
    map((restored) => {
      if (!restored) {
        return router.createUrlTree(['/admin/login'], {
          queryParams: {
            returnUrl: state.url,
          },
        });
      }

      return authSession.hasAnyRole(configuredRoles)
        ? true
        : forbiddenRedirect(router);
    }),
  );
};

function isValidRoleConfiguration(
  configuredRoles: unknown,
): configuredRoles is string[] {
  return (
    Array.isArray(configuredRoles) &&
    configuredRoles.length > 0 &&
    configuredRoles.every(
      (role) => typeof role === 'string' && role.trim().length > 0,
    )
  );
}

function forbiddenRedirect(router: Router): UrlTree {
  return router.createUrlTree(['/admin/forbidden']);
}
