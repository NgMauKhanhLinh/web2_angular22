import { computed, Injectable, signal } from '@angular/core';

import { AuthUser } from '../models/auth.model';

export interface AuthSession {
  accessToken: string | null;
  roles: readonly string[];
  user: AuthUser | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly accessTokenState = signal<string | null>(null);
  private readonly rolesState = signal<readonly string[]>([]);
  private readonly userState = signal<AuthUser | null>(null);

  readonly accessToken = this.accessTokenState.asReadonly();
  readonly roles = this.rolesState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.accessTokenState()));

  setSession(session: AuthSession): void {
    this.accessTokenState.set(session.accessToken);
    this.rolesState.set([...session.roles]);
    this.userState.set(session.user);
  }

  updateAccessToken(accessToken: string): void {
    this.accessTokenState.set(accessToken);
  }

  updateUser(user: AuthUser): void {
    this.userState.set(user);
    this.rolesState.set([user.systemRole]);
  }

  clearSession(): void {
    this.accessTokenState.set(null);
    this.rolesState.set([]);
    this.userState.set(null);
  }

  hasAnyRole(requiredRoles: readonly string[]): boolean {
    if (requiredRoles.length === 0) {
      return true;
    }

    const currentRoles = new Set(this.rolesState());
    return requiredRoles.some((role) => currentRoles.has(role));
  }
}
