import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/customer/services/auth.service';
import { ApiClientService } from '../../../core/services/api-client.service';

type RecoveryStep = 'forgot' | 'otp' | 'reset' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="recovery-overlay">
      <section class="recovery-card">
        <button type="button" class="close" aria-label="Đóng" routerLink="/login">×</button>
        @if (step() === 'success') {
          <div class="success-view">
            <div class="success-check">✓</div>
            <h1>Đổi mật khẩu thành công!</h1>
            <p>Bạn có thể đăng nhập bằng mật khẩu mới.</p>
            <button class="primary" type="button" (click)="goLogin()">ĐĂNG NHẬP NGAY</button>
          </div>
        } @else {
          <aside class="art-panel">
            <img class="logo" src="/assets/customer/images/auth/logo-drpets.png" alt="Dr. Pet's House"
              onerror="this.style.display='none'">
            <div class="mascot"><img src="/assets/customer/images/auth/dog_search.png" alt="Bác sĩ thú y"
              onerror="this.src='/assets/customer/images/auth/login-dog.png'"></div>
          </aside>
          <section class="form-panel">
            @if (step() === 'forgot') {
              <h1>Quên mật khẩu?</h1>
              <p class="subtitle">Nhập SĐT hoặc email đã đăng ký để nhận mã xác nhận</p>
              <form [formGroup]="forgotForm" (ngSubmit)="sendOtp()">
                <label>Số điện thoại / Email
                  <input formControlName="account" autocomplete="username">
                  @if (forgotForm.controls.account.touched && forgotForm.controls.account.invalid) { <small>Vui lòng nhập email hợp lệ.</small> }
                </label>
                @if (error()) { <p class="error">{{ error() }}</p> }
                <button class="primary" [disabled]="loading()">{{ loading() ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN' }}</button>
                <button class="back" type="button" routerLink="/login">← Quay lại đăng nhập</button>
              </form>
            } @else if (step() === 'otp') {
              <h1>Xác nhận mã OTP</h1>
              <p class="subtitle">Nhập mã xác nhận đã gửi đến {{ account() }}</p>
              <form (ngSubmit)="verifyOtp()">
                <div class="otp-row">
                  @for (digit of otp(); track $index) {
                    <input [value]="digit" (input)="setDigit($index, $any($event.target).value)"
                      [attr.aria-label]="'Số OTP ' + ($index + 1)" inputmode="numeric" maxlength="1">
                  }
                </div>
                @if (error()) { <p class="error">{{ error() }}</p> }
                <button class="primary" [disabled]="loading() || otp().join('').length !== 6">{{ loading() ? 'ĐANG XÁC NHẬN...' : 'XÁC NHẬN' }}</button>
                <p class="resend">Không nhận được mã? <button type="button" (click)="sendOtp()">Gửi lại mã</button></p>
                <button class="back" type="button" (click)="step.set('forgot')">← Quay lại</button>
              </form>
            } @else {
              <h1>Tạo mật khẩu mới</h1>
              <p class="subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
              <form [formGroup]="resetForm" (ngSubmit)="resetPassword()">
                <label>Mật khẩu mới
                  <input type="password" formControlName="password" autocomplete="new-password">
                  <small>Tối thiểu 8 ký tự, 1 chữ hoa, 1 số</small>
                </label>
                <label>Xác nhận mật khẩu
                  <input type="password" formControlName="confirmPassword" autocomplete="new-password">
                </label>
                @if (error()) { <p class="error">{{ error() }}</p> }
                <button class="primary" [disabled]="loading()">{{ loading() ? 'ĐANG ĐỔI...' : 'ĐỔI MẬT KHẨU' }}</button>
              </form>
            }
          </section>
        }
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;font-family:Arial,Helvetica,sans-serif;color:#060b16}*{box-sizing:border-box}
    .recovery-overlay{min-height:100vh;display:grid;place-items:center;padding:12px;background:#06105a40}
    .recovery-card{position:relative;width:min(100%,930px);min-height:637px;display:grid;grid-template-columns:48% 52%;overflow:hidden;border-radius:12px;background:#e5f6fd;box-shadow:0 12px 35px #0003}
    .close{position:absolute;right:24px;top:20px;z-index:5;border:0;background:transparent;color:#697386;font-size:30px;line-height:1;cursor:pointer}
    .art-panel{position:relative;display:flex;align-items:center;justify-content:center;padding:70px 26px 35px;background:#e5f6fd;overflow:hidden}
    .art-panel:before{content:"";position:absolute;left:-10%;top:-15%;width:125%;height:42%;border-radius:0 0 50% 30%;background:#90caf9;transform:rotate(-5deg)}
    .logo{position:absolute;z-index:2;left:24px;top:20px;width:140px;height:78px;object-fit:contain;object-position:left top}
    .mascot{position:relative;width:min(100%,380px);height:350px;border-radius:50%;background:#fff;box-shadow:0 6px 18px #0002;display:grid;place-items:center;overflow:hidden}
    .mascot img{width:100%;height:100%;object-fit:contain}
    .form-panel{align-self:center;padding:64px 48px 45px;background:#e5f6fd}
    h1{font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.5px;margin:0 0 10px}
    .subtitle{font-size:16px;line-height:1.5;color:#4f5359;margin:0 0 26px}
    form{display:flex;flex-direction:column;gap:22px}
    label{display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:600}
    input{width:100%;height:48px;border:1px solid #c6dce3;border-radius:12px;background:#fafeff;padding:0 14px;font:16px Arial,sans-serif;outline:none}
    input:focus{border-color:#0d47a1;box-shadow:0 0 0 1px #0d47a1}
    small{font-size:12px;font-weight:400;color:#c62828}
    label small{color:#6c7278;font-style:italic}
    .primary{height:43px;width:100%;border:0;border-radius:5px;background:#ffda36;color:#080808;font-size:14px;font-weight:700;box-shadow:0 2px 4px #0002;cursor:pointer}
    .primary:disabled{opacity:.6;cursor:wait}
    .back{border:0;background:transparent;color:#7e8085;font-size:14px;cursor:pointer}
    .error{padding:10px;border-radius:5px;background:#fff0f0;color:#b42318;font-size:13px;margin:0}
    .otp-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
    .otp-row input{text-align:center;font-size:22px;font-weight:700;padding:0}
    .resend{text-align:center;font-size:13px;color:#555;margin:0}
    .resend button{border:0;background:none;color:#0d47a1;font-weight:600;cursor:pointer}
    .success-view{grid-column:1/-1;align-self:center;justify-self:center;width:min(100%,480px);padding:35px;text-align:center;background:white;border-radius:12px}
    .success-check{display:grid;place-items:center;width:74px;height:74px;border-radius:50%;margin:0 auto 24px;background:#2e7d32;color:white;font-size:48px}
    .success-view p{margin:0 0 26px;color:#4f5359}
    @media(max-width:760px){.recovery-card{min-height:0;grid-template-columns:1fr;max-width:500px}.art-panel{display:none}.form-panel{padding:66px 24px 32px}.form-panel h1{font-size:26px}.subtitle{font-size:14px}.close{right:16px;top:14px}.success-view{padding:30px 20px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiClientService);
  private readonly router = inject(Router);
  readonly step = signal<RecoveryStep>('forgot');
  readonly account = signal('');
  readonly otp = signal(['', '', '', '', '', '']);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly resetToken = signal('');
  readonly forgotForm = this.fb.nonNullable.group({ account: ['', [Validators.required, Validators.email]] });
  readonly resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\\d).{8,}$/)]],
    confirmPassword: ['', Validators.required],
  });

  sendOtp(): void {
    this.error.set('');
    if (this.step() === 'forgot') {
      if (this.forgotForm.invalid) { this.forgotForm.markAllAsTouched(); return; }
      this.account.set(this.forgotForm.controls.account.value.trim());
    }
    this.loading.set(true);
    this.api.post('/forgot-password', { email: this.account() }).subscribe({
      next: () => { this.loading.set(false); this.otp.set(['', '', '', '', '', '']); this.step.set('otp'); },
      error: (e: any) => { this.loading.set(false); this.error.set(e?.error?.EM || e?.error?.message || 'Không thể gửi mã xác nhận.'); },
    });
  }

  setDigit(index: number, value: string): void {
    const digit = value.replace(/\\D/g, '').slice(-1);
    this.otp.update(current => current.map((item, i) => i === index ? digit : item));
  }

  verifyOtp(): void {
    const otpCode = this.otp().join('');
    if (otpCode.length !== 6) return;
    this.loading.set(true); this.error.set('');
    this.api.post<any, object>('/verify-otp', { email: this.account(), otp_code: otpCode }).subscribe({
      next: response => {
        this.loading.set(false);
        const data = (response as any)?.DT ?? response;
        this.resetToken.set(data?.reset_token || data?.resetToken || '');
        this.step.set('reset');
      },
      error: (e: any) => { this.loading.set(false); this.error.set(e?.error?.EM || e?.error?.message || 'Mã OTP không hợp lệ.'); },
    });
  }

  resetPassword(): void {
    this.error.set('');
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    const value = this.resetForm.getRawValue();
    if (value.password !== value.confirmPassword) { this.error.set('Mật khẩu xác nhận chưa khớp.'); return; }
    this.loading.set(true);
    this.api.post('/reset-password', { reset_token: this.resetToken(), new_password: value.password }).subscribe({
      next: () => { this.loading.set(false); this.step.set('success'); },
      error: (e: any) => { this.loading.set(false); this.error.set(e?.error?.EM || e?.error?.message || 'Không thể đổi mật khẩu.'); },
    });
  }

  goLogin(): void { void this.router.navigate(['/login']); }
}
