import { inject, Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
} from '../../../../core/models/auth.model';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly api = inject(ApiClientService);
  private readonly authSession = inject(AuthSessionService);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse, LoginRequest>('/auth/login', request)
      .pipe(
        tap((response) => {
          this.authSession.setSession({
            accessToken: response.accessToken,
            roles: [response.user.systemRole],
            user: response.user,
          });
        }),
      );
  }

  logout(): Observable<void> {
    return this.api
      .post<void, Record<string, never>>('/auth/logout', {})
      .pipe(
        finalize(() => {
          this.authSession.clearSession();
        }),
      );
  }
}
