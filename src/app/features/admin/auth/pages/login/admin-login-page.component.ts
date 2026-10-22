import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'; // Thêm 'inject' vào đây
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AppHttpError } from '../../../../../core/models/app-http-error.model';
import { AdminAuthService } from '../../services/admin-auth.service';

type LoginControlName = 'identifier' | 'password';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPageComponent {
  // 1. Tiêm các Service bằng inject() thay thế cho constructor
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly passwordVisible = signal(false);
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);

  // 2. Bây giờ gọi formBuilder tại đây sẽ không bao giờ bị báo lỗi initialization nữa
  readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // 3. Xóa bỏ hoàn toàn các tham số cũ trong constructor
  constructor() {}

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  submit(): void {
    this.submitted.set(true);
    this.apiError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    const { identifier, password } = this.form.getRawValue();

    this.adminAuth
      .login({
        identifier: identifier.trim(),
        password,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.safeReturnUrl());
        },
        error: (error: unknown) => {
          this.apiError.set(this.loginErrorMessage(error));
        },
      });
  }

  showError(controlName: LoginControlName): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl &&
      returnUrl.startsWith('/admin/') &&
      returnUrl !== '/admin/login' &&
      returnUrl !== '/admin/forbidden'
    ) {
      return returnUrl;
    }

    return '/admin/dashboard';
  }

  private loginErrorMessage(error: unknown): string {
    if (!(error instanceof AppHttpError)) {
      return 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
    }

    const code = this.backendErrorCode(error.details);

    switch (code) {
      case 'INVALID_CREDENTIALS':
        return 'Tài khoản hoặc mật khẩu không đúng.';
      case 'ACCOUNT_NOT_ACTIVATED':
        return 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.';
      case 'ACCOUNT_BLOCKED':
        return 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.';
      case 'ACCOUNT_LOCKED':
        return 'Tài khoản đang tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.';
      default:
        if (error.kind === 'network') {
          return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend đang chạy.';
        }

        if (error.kind === 'unauthorized') return 'Tài khoản hoặc mật khẩu không đúng.';
        if (error.kind === 'forbidden') return 'Tài khoản không có quyền truy cập khu vực quản trị.';
        if (error.kind === 'server') return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
        return 'Đăng nhập thất bại. Vui lòng thử lại.';
    }
  }

  private backendErrorCode(details: unknown): string | null {
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
}
