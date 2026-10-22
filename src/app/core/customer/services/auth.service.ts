import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, catchError, delay, map, of, tap, throwError } from 'rxjs';
import { ApiClientService } from '../../services/api-client.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  systemRole: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

const AUTH_SESSION_KEY = 'drPetAuthSession';
const REMEMBER_LOGIN_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiClient = inject(ApiClientService);

  private readonly currentUserSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor() {
    this.autoLogin();
  }

  login(credentials: { identifier: string; password: string; remember?: boolean }): Observable<LoginResponse> {
    return this.apiClient.post<LoginResponse, object>('/auth/login', credentials).pipe(
      tap((response) => {
        this.tokenSignal.set(response.access_token);
        this.currentUserSignal.set(response.user);

        if (credentials.remember) {
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
      }),
      catchError((error) => {
        const errorMessage = error?.error?.EM || error?.error?.message || error?.message || 'Đăng nhập thất bại.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  loginPetClinic(credentials: { loginId: string; password: string; remember?: boolean }): Observable<LoginResponse> {
    const inputId = String(credentials.loginId ?? '').trim();
    const inputPassword = String(credentials.password ?? '');

    // Offline Mock dành cho Admin test
    if (inputId === 'admin@test.com' && inputPassword === 'admin123') {
      const mockAdminResponse: LoginResponse = {
        access_token: 'mock-jwt-token-petclinic-admin-2026',
        user: {
          id: 'admin-uuid-1111-2222',
          fullName: 'Quản trị viên Hệ thống',
          email: 'admin@test.com',
          phone: '0987654321',
          systemRole: 'ADMIN',
        },
      };
      this.persistPetClinicLogin(mockAdminResponse, Boolean(credentials.remember));
      return of(mockAdminResponse).pipe(delay(300));
    }

    return this.apiClient.post<LoginResponse, object>('/login', {
      login_id: credentials.loginId,
      password: credentials.password,
      remember_me: credentials.remember ?? false,
    }).pipe(
      map((response) => ({ ...response, user: this.normalizeUser(response.user) })),
      tap((response) => this.persistPetClinicLogin(response, Boolean(credentials.remember))),
      catchError((error) => {
        const errorMessage = error?.error?.EM || error?.error?.message || error?.message || 'Đăng nhập thất bại.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.apiClient.post('/register', {
      full_name: data.fullName,
      phone: data.phone || undefined,
      email: data.email || undefined,
      password: data.password,
    });
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(AUTH_SESSION_KEY);
      storage.removeItem('accessToken');
      storage.removeItem('userData');
    }
  }

  getAccessToken(): string | null {
    return this.tokenSignal() || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  private autoLogin(): void {
    for (const storage of [localStorage, sessionStorage]) {
      const savedToken = storage.getItem('accessToken');
      const savedUser = storage.getItem('userData');
      if (savedToken && savedUser) {
        this.tokenSignal.set(savedToken);
        this.currentUserSignal.set(this.normalizeUser(JSON.parse(savedUser)));
        return;
      }
    }
  }

  private persistPetClinicLogin(response: LoginResponse, remember: boolean): void {
    this.tokenSignal.set(response.access_token);
    this.currentUserSignal.set(response.user);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_SESSION_KEY, JSON.stringify({ authenticated: true, remember }));
    storage.setItem('accessToken', response.access_token);
    storage.setItem('userData', JSON.stringify(response.user));
  }

  private normalizeUser(value: unknown): User {
    const user = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
    return {
      id: String(user['id'] ?? user['user_id'] ?? ''),
      fullName: String(user['fullName'] ?? user['full_name'] ?? ''),
      email: String(user['email'] ?? ''),
      phone: String(user['phone'] ?? ''),
      systemRole: user['systemRole'] === 'ADMIN' || user['role_code'] === 'ADMIN' ? 'ADMIN' : 'USER',
    };
  }
}