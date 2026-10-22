import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppHttpError } from '../../../../../core/models/app-http-error.model';
import { AuthSessionService } from '../../../../../core/services/auth-session.service';
import { AdminProfileService } from '../../services/admin-profile.service';

@Component({
  selector: 'app-admin-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="profile-page">
      <header>
        <p class="eyebrow">ACCOUNT</p>
        <h1>Hồ sơ tài khoản</h1>
        <p>Thông tin của tài khoản đang đăng nhập.</p>
      </header>

      <section class="profile-card">
        <div class="identity">
          <div class="avatar" aria-hidden="true">
            {{ initials() }}
          </div>
          <div>
            <strong>{{ user()?.fullName || 'Admin' }}</strong>
            <span>{{ user()?.systemRole || '—' }}</span>
            @if (user()?.staffSubRole) {
              <span>{{ user()?.staffSubRole }}</span>
            }
          </div>
        </div>

        <dl>
          <div>
            <dt>Số điện thoại</dt>
            <dd>{{ user()?.phone || '—' }}</dd>
          </div>
          <div>
            <dt>System role</dt>
            <dd>{{ user()?.systemRole || '—' }}</dd>
          </div>
        </dl>

        <form [formGroup]="form" (ngSubmit)="save()">
          <label>
            <span>Họ tên</span>
            <input type="text" formControlName="fullName" />
          </label>

          <label>
            <span>Email</span>
            <input type="email" formControlName="email" />
          </label>

          @if (notice()) {
            <p class="notice" role="status">{{ notice() }}</p>
          }

          @if (errorMessage()) {
            <p class="error" role="alert">{{ errorMessage() }}</p>
          }

          <button type="submit" [disabled]="saving()">
            {{ saving() ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </form>
      </section>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .profile-page {
      display: grid;
      gap: 22px;
      max-width: 760px;
    }

    header h1 {
      margin: 4px 0 0;
      color: #0f172a;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
    }

    header > p:not(.eyebrow) {
      margin: 7px 0 0;
      color: #64748b;
    }

    .eyebrow {
      margin: 0;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .profile-card {
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #fff;
    }

    .identity {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .identity strong,
    .identity span {
      display: block;
    }

    .identity strong {
      color: #0f172a;
      font-size: 1.05rem;
    }

    .identity span {
      margin-top: 3px;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .avatar {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: #0f172a;
      color: #fff;
      font-weight: 800;
    }

    dl {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 22px 0;
    }

    dl > div {
      padding: 13px;
      border-radius: 10px;
      background: #f8fafc;
    }

    dt {
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
    }

    dd {
      margin: 5px 0 0;
      color: #0f172a;
      font-weight: 700;
    }

    form {
      display: grid;
      gap: 14px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    label {
      display: grid;
      gap: 7px;
      color: #334155;
      font-size: 0.82rem;
      font-weight: 700;
    }

    input {
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      outline: 0;
      font: inherit;
    }

    input:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgb(96 165 250 / 12%);
    }

    button {
      justify-self: start;
      min-height: 42px;
      padding: 0 16px;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
      background: #0f172a;
      color: #fff;
      font: inherit;
      font-weight: 700;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .notice,
    .error {
      margin: 0;
      padding: 10px 12px;
      border-radius: 9px;
      font-weight: 600;
    }

    .notice {
      background: #ecfdf5;
      color: #047857;
    }

    .error {
      background: #fef2f2;
      color: #b91c1c;
    }

    @media (max-width: 560px) {
      dl {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProfilePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly profileService = inject(AdminProfileService);
  private readonly authSession = inject(AuthSessionService);

  readonly user = this.authSession.user;
  readonly saving = signal(false);
  readonly notice = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.email]],
  });

  constructor() {
    const current = this.user();
    if (current) {
      this.patchForm(current.fullName, current.email);
    }

    this.profileService.getProfile().subscribe({
      next: (user) => this.patchForm(user.fullName, user.email),
      error: (error: unknown) => {
        this.errorMessage.set(this.messageForError(error));
      },
    });
  }

  initials(): string {
    const name = this.user()?.fullName?.trim();
    if (!name) {
      return 'AD';
    }

    return name
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  save(): void {
    this.notice.set(null);
    this.errorMessage.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.saving()) {
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    this.profileService
      .updateProfile({
        fullName: value.fullName.trim(),
        email: value.email.trim() || null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) => {
          this.patchForm(user.fullName, user.email);
          this.notice.set('Đã cập nhật hồ sơ.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.messageForError(error));
        },
      });
  }

  private patchForm(fullName: string, email: string | null): void {
    this.form.patchValue({
      fullName,
      email: email ?? '',
    });
  }

  private messageForError(error: unknown): string {
    if (error instanceof AppHttpError) {
      return error.message;
    }

    return 'Không thể tải hoặc cập nhật hồ sơ.';
  }
}
