import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay, tap, timeout } from 'rxjs';

import { RefreshResponse } from '../models/auth.model';
import { ApiClientService } from './api-client.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenRefreshService {
  private readonly api = inject(ApiClientService);
  private readonly authSession = inject(AuthSessionService);

  private refreshRequest$: Observable<string> | null = null;

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.api
      .post<RefreshResponse, Record<string, never>>('/auth/refresh', {})
      .pipe(
        // Render can cold-start or fail to respond. Never leave route guards
        // waiting forever, and cancel the underlying request on timeout.
        timeout({ first: 12000 }),
        map((response) => response.accessToken),
        tap((accessToken) => {
          this.authSession.updateAccessToken(accessToken);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshRequest$;
  }
}
