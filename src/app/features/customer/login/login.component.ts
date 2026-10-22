import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/customer/services/auth.service';


const PHONE_PATTERN = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals quản lý trạng thái
  readonly errorMessage = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  readonly loginForm: FormGroup = this.fb.group({
    account: ['', [Validators.required, LoginComponent.accountValidator]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  static accountValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    return !value || PHONE_PATTERN.test(value) || EMAIL_PATTERN.test(value)
      ? null
      : { account: true };
  }

  togglePassword(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { account, password, remember } = this.loginForm.getRawValue();
    const loginId = String(account ?? '').trim();

    // Giả lập tài khoản Test Admin
    if (loginId === 'admin@test.com' && password === 'admin123') {
      setTimeout(() => {
        this.isLoading.set(false);
        localStorage.setItem('access_token', 'mock-jwt-token-admin');
        void this.router.navigate(['/thong-tin-nguoi-dung']);
      }, 500);
      return;
    }

    this.authService
      .loginPetClinic({
        loginId,
        password: password ?? '',
        remember: Boolean(remember),
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          void this.router.navigate(['/thong-tin-nguoi-dung']);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
          );
        },
      });
  }
}