import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, timeout } from 'rxjs';

import { AuthUser, CurrentUserResponse } from '../models/auth.model';
import { ApiClientService } from './api-client.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenRefreshService } from './auth-token-refresh.service';

@Injectable({
  providedIn: 'root',
})
export class AuthRestoreService {
  private readonly api = inject(ApiClientService);
  private readonly authSession = inject(AuthSessionService);
  private readonly tokenRefresh = inject(AuthTokenRefreshService);

  ensureSession(): Observable<boolean> {
    if (this.authSession.isAuthenticated() && this.authSession.user()) {
      return of(true);
    }

    return this.tokenRefresh.refreshAccessToken().pipe(
      switchMap(() => this.api.get<CurrentUserResponse>('/auth/me')),
      map((response) => this.normalizeUser(response)),
      tap((user) => {
        this.authSession.setSession({
          accessToken: this.authSession.accessToken(),
          roles: [user.systemRole],
          user,
        });
      }),
      map(() => true),
      // Cover both refresh and /auth/me with a bounded total wait.
      timeout({ first: 18000 }),
      catchError(() => {
        this.authSession.clearSession();
        return of(false);
      }),
    );
  }

  private normalizeUser(response: CurrentUserResponse): AuthUser {
    return {
      id: response.id ?? response._id ?? '',
      phone: response.phone,
      fullName: response.fullName,
      email: response.email ?? null,
      systemRole: response.systemRole,
      staffSubRole: response.staffSubRole ?? null,
      avatarUrl: response.avatarUrl ?? null,
    };
  }
}
