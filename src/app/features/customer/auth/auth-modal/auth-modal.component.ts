import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  HostListener,
  ElementRef,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../../core/customer/services/auth.service';
import { AuthViewService } from './auth-view.service';
import { AuthScreen, EMAIL_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN } from '../../../../core/customer/models/auth-view.model';

function accountValidator(control: AbstractControl): ValidationErrors | null {
  const val = String(control.value || '').trim();
  if (!val) return null;
  const isPhone = PHONE_PATTERN.test(val);
  const isEmail = EMAIL_PATTERN.test(val);
  return isPhone || isEmail ? null : { invalidAccount: true };
}

function confirmPasswordValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  providers: [AuthViewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent {
  readonly viewService = inject(AuthViewService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isOpen = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly submitError = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly otpValues = signal<string[]>(Array(6).fill(''));
  readonly resetToken = signal<string>('');

  readonly loginForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required, accountValidator]],
    password: ['', Validators.required],
    remember: [false],
  });

  readonly registerForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      email: ['', Validators.pattern(EMAIL_PATTERN)],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: confirmPasswordValidator }
  );

  readonly forgotForm: FormGroup = this.fb.group({
    account: ['', [Validators.required, accountValidator]],
  });

  readonly resetForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: confirmPasswordValidator }
  );
  readonly otpInputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.isOpen.set(false);
  }

  changeScreen(screen: AuthScreen): void {
    this.submitError.set('');
    this.viewService.openScreen(screen);
  }

  togglePasswordVisibility(field: 'pass' | 'confirm'): void {
    if (field === 'pass') {
      this.showPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set('');

    const val = this.loginForm.value;
    this.authService.login({ identifier: val.phone, password: val.password, remember: val.remember }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.submitError.set(err.message || 'Đăng nhập không thành công');
      },
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set('');

    const val = this.registerForm.value;
    this.authService.register({ fullName: val.name, phone: val.phone, email: val.email, password: val.password }).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res?.frontendFallback) {
          this.closeModal();
        } else {
          this.changeScreen('registerOtp');
        }
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.submitError.set(err.message || 'Đăng ký không thành công');
      },
    });
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    const account = this.forgotForm.value.account.trim();
    if (!EMAIL_PATTERN.test(account)) {
      this.submitError.set('Backend hiện chỉ hỗ trợ gửi OTP quên mật khẩu qua Email');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');
    (this.authService as any).forgotPassword?.(account).subscribe({
      next: () => {
        this.submitting.set(false);
        this.changeScreen('resetOtp');
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.submitError.set(err.message || 'Không thể gửi mã OTP');
      },
    });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    const current = [...this.otpValues()];
    current[index] = digit;
    this.otpValues.set(current);

    if (digit && index < 5) {
      this.otpInputs()[index + 1]?.nativeElement.focus();
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpValues()[index] && index > 0) {
      this.otpInputs()[index - 1]?.nativeElement.focus();
    }
  }

  onOtpSubmit(): void {
    const code = this.otpValues().join('');
    if (code.length !== 6) return;

    this.submitting.set(true);
    this.submitError.set('');

    const isRegister = this.viewService.screen() === 'registerOtp';
    if (isRegister) {
      const regVal = this.registerForm.value;
      (this.authService as any).verifyRegisterOtp?.({ loginId: regVal.email || regVal.phone, otpCode: code }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.changeScreen('success');
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.submitError.set(err.message || 'Mã OTP không hợp lệ');
        },
      });
    } else {
      const email = this.forgotForm.value.account;
      (this.authService as any).verifyForgotOtp?.({ email, otpCode: code }).subscribe({
        next: (res: any) => {
          this.submitting.set(false);
          this.resetToken.set(res?.reset_token || '');
          this.changeScreen('reset');
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.submitError.set(err.message || 'Mã OTP không hợp lệ');
        },
      });
    }
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set('');

    (this.authService as any)
      .resetPassword?.({ resetToken: this.resetToken(), newPassword: this.resetForm.value.password })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.changeScreen('login');
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.submitError.set(err.message || 'Không thể đổi mật khẩu');
        },
      });
  }

  get otpRecipient(): string {
    if (this.viewService.screen() === 'registerOtp') {
      return this.registerForm.value.email || this.registerForm.value.phone;
    }
    return this.forgotForm.value.account;
  }
}
