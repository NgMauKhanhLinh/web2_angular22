import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import {
  AuthUser,
  CurrentUserResponse,
} from '../../../../core/models/auth.model';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

export interface UpdateProfileRequest {
  fullName: string;
  email: string | null;
  avatarUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProfileService {
  private readonly api = inject(ApiClientService);
  private readonly authSession = inject(AuthSessionService);

  getProfile(): Observable<AuthUser> {
    return this.api.get<CurrentUserResponse>('/auth/me').pipe(
      map((response) => this.normalizeUser(response)),
      tap((user) => this.authSession.updateUser(user)),
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<AuthUser> {
    return this.api
      .put<CurrentUserResponse, UpdateProfileRequest>('/auth/me', request)
      .pipe(
        map((response) => this.normalizeUser(response)),
        tap((user) => this.authSession.updateUser(user)),
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
