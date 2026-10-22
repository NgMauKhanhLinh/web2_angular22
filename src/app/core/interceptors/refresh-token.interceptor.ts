import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AppHttpError } from '../models/app-http-error.model';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthTokenRefreshService } from '../services/auth-token-refresh.service';

export const refreshTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const tokenRefresh = inject(AuthTokenRefreshService);
  const router = inject(Router);

  if (isRefreshRequest(request.url)) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!isTokenExpiredError(error)) {
        return throwError(() => error);
      }

      return tokenRefresh.refreshAccessToken().pipe(
        switchMap((accessToken) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          authSession.clearSession();
          void router.navigateByUrl('/admin/login');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function isRefreshRequest(url: string): boolean {
  return /\/auth\/refresh(?:$|[?#])/.test(url);
}

function isTokenExpiredError(error: unknown): boolean {
  if (error instanceof AppHttpError) {
    return (
      error.status === 401 &&
      backendErrorCode(error.details) === 'TOKEN_EXPIRED'
    );
  }

  if (error instanceof HttpErrorResponse) {
    return error.status === 401 && backendErrorCode(error.error) === 'TOKEN_EXPIRED';
  }

  return false;
}

function backendErrorCode(details: unknown): string | null {
  if (
    typeof details === 'object' &&
    details !== null &&
    'code' in details &&
    typeof (details as { code?: unknown }).code === 'string'
  ) {
    return (details as { code: string }).code;
  }

  return null;
}
