import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/customer/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="register-overlay">
      <section class="register-modal" role="dialog" aria-labelledby="register-title">
        <button class="close-button" type="button" aria-label="Đóng" routerLink="/" (click)="close()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        @if (!registered()) {
          <aside class="welcome-panel">
            <a class="brand" routerLink="/" aria-label="Dr. Pet's House">
              <img src="/assets/customer/images/auth/logo-drpets.png" alt="Dr. Pet's House"
                onerror="this.style.display='none'">
              <span class="brand-fallback"><span>Dr.</span> Pet's<br><b>House</b></span>
            </a>
            <div class="mascot-frame">
              <img src="/assets/customer/images/auth/register-dog.png" alt="Bác sĩ thú y Dr. Pet's House"
                onerror="this.src='/assets/customer/images/auth/login-dog.png'">
            </div>
            <h2>Chào mừng bạn!</h2>
            <p>Tham gia cùng chúng tôi để nhận dịch vụ chăm sóc tốt nhất cho thú cưng của bạn.</p>
          </aside>

          <section class="form-panel">
            <h1 id="register-title">Đăng Ký Tài Khoản</h1>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <label class="field full">
                <span>Họ và Tên<em>*</em></span>
                <input formControlName="fullName" autocomplete="name" aria-label="Họ và tên">
                @if (form.controls.fullName.touched && form.controls.fullName.invalid) {
                  <small>Vui lòng nhập họ và tên.</small>
                }
              </label>

              <div class="two-columns">
                <label class="field">
                  <span>Số điện thoại<em>*</em></span>
                  <input formControlName="phone" autocomplete="tel" inputmode="tel" aria-label="Số điện thoại">
                  @if (form.controls.phone.touched && form.controls.phone.invalid) {
                    <small>Số điện thoại chưa đúng định dạng.</small>
                  }
                </label>
                <label class="field">
                  <span>Email</span>
                  <input formControlName="email" type="email" autocomplete="email" aria-label="Email">
                  @if (form.controls.email.touched && form.controls.email.invalid) {
                    <small>Vui lòng nhập email hợp lệ.</small>
                  }
                </label>
              </div>

              <label class="field full">
                <span>Mật khẩu<em>*</em></span>
                <div class="password-input">
                  <input formControlName="password" [type]="showPassword() ? 'text' : 'password'"
                    autocomplete="new-password" aria-label="Mật khẩu">
                  <button type="button" (click)="showPassword.update(v => !v)" aria-label="Hiện hoặc ẩn mật khẩu">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <small class="hint">Tối thiểu 8 ký tự, 1 chữ hoa, 1 số</small>
                @if (form.controls.password.touched && form.controls.password.invalid) {
                  <small>Mật khẩu cần ít nhất 8 ký tự.</small>
                }
              </label>

              <label class="field full">
                <span>Xác nhận mật khẩu<em>*</em></span>
                <div class="password-input">
                  <input formControlName="confirmPassword" [type]="showConfirmPassword() ? 'text' : 'password'"
                    autocomplete="new-password" aria-label="Xác nhận mật khẩu">
                  <button type="button" (click)="showConfirmPassword.update(v => !v)" aria-label="Hiện hoặc ẩn mật khẩu xác nhận">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                @if (form.controls.confirmPassword.touched && form.controls.confirmPassword.value !== form.controls.password.value) {
                  <small>Mật khẩu xác nhận không khớp.</small>
                }
              </label>

              <label class="terms">
                <input type="checkbox" [checked]="acceptedTerms()" (change)="acceptedTerms.set($any($event.target).checked)">
                <span>Tôi đồng ý với <a routerLink="/terms">Điều khoản dịch vụ</a> và <a routerLink="/privacy">Chính sách bảo mật</a>.</span>
              </label>

              @if (errorMessage()) { <div class="error-banner" role="alert">{{ errorMessage() }}</div> }

              <button class="submit-button" type="submit" [disabled]="loading()">
                {{ loading() ? 'ĐANG ĐĂNG KÝ…' : 'ĐĂNG KÝ NGAY' }}
              </button>
            </form>

            <div class="divider"><span>Hoặc tiếp tục với</span></div>
            <button type="button" class="google-button" (click)="googleUnavailable()">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              Tiếp tục với Google
            </button>
            <p class="login-prompt">Đã có tài khoản? <a routerLink="/login">Đăng nhập ngay</a></p>
          </section>
        } @else {
          <section class="success-layout">
            <div class="success-illustration">
              <img src="/assets/customer/images/auth/register-dog.png" alt="Bác sĩ thú y chúc mừng"
                onerror="this.src='/assets/customer/images/auth/login-dog.png'">
            </div>
            <div class="success-content">
              <div class="checkmark" aria-hidden="true">✓</div>
              <h1>Đăng ký thành công!</h1>
              <p>Chào mừng bạn đến với Dr. Pet's House</p>
              <button class="submit-button success-login" type="button" (click)="goToLogin()">ĐĂNG NHẬP NGAY <span>›</span></button>
              <div class="support">Cần hỗ trợ? <a href="mailto:support@drpetshouse.vn">Liên hệ đội ngũ chăm sóc</a></div>
            </div>
          </section>
        }
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;font-family:Arial,Helvetica,sans-serif;color:#242424}
    *{box-sizing:border-box}
    .register-overlay{min-height:100vh;display:grid;place-items:center;padding:12px;background:rgba(18,24,30,.24)}
    .register-modal{position:relative;width:min(100%,930px);min-height:730px;display:grid;grid-template-columns:48% 52%;overflow:hidden;background:#fff;border-radius:12px;box-shadow:0 10px 35px #0003}
    .close-button{position:absolute;z-index:3;right:25px;top:25px;width:22px;height:22px;padding:2px;border:0;background:transparent;color:#7b8491;cursor:pointer}
    .close-button svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
    .welcome-panel{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 38px 35px;background:#e4f6fd;isolation:isolate;overflow:hidden}
    .welcome-panel:before{content:"";position:absolute;z-index:-1;left:-13%;top:-17%;width:130%;height:35%;background:#91ccf8;border-radius:0 0 55% 35%;transform:rotate(-7deg)}
    .brand{align-self:flex-start;display:block;width:145px;height:76px;text-decoration:none;position:relative;z-index:1}
    .brand img{width:100%;height:100%;object-fit:contain;object-position:left top}
    .brand-fallback{display:none;color:#222831;font-size:29px;font-weight:800;line-height:.85;text-shadow:-2px -2px white,2px 2px white}
    .brand-fallback span{color:#69c8f5}
    .mascot-frame{width:258px;height:258px;flex:none;margin-top:86px;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;box-shadow:0 3px 5px #234a5c16}
    .mascot-frame img{width:100%;height:100%;object-fit:contain}
    .welcome-panel h2{font-size:24px;line-height:1.25;margin:25px 0 10px;font-weight:700}
    .welcome-panel p{font-size:16px;line-height:1.5;margin:0;max-width:345px}
    .form-panel{padding:50px 48px 28px;min-width:0}
    .form-panel h1{font-size:32px;line-height:1.2;margin:0 0 28px;font-weight:750;letter-spacing:-.5px}
    form{display:flex;flex-direction:column;gap:16px}
    .field{display:flex;flex-direction:column;gap:5px;min-width:0}
    .field>span{font-size:14px;font-weight:600}
    em{font-style:normal;color:#d71920;margin-left:2px}
    .two-columns{display:grid;grid-template-columns:.8fr 1.2fr;gap:21px}
    .field input{width:100%;height:38px;border:1px solid #999;border-radius:6px;background:#fff;padding:0 10px;font:14px Arial,sans-serif;outline:none}
    .field input:focus{border-color:#58b8ec;box-shadow:0 0 0 2px #58b8ec25}
    .password-input{position:relative}
    .password-input input{padding-right:38px}
    .password-input button{position:absolute;right:9px;top:50%;transform:translateY(-50%);border:0;padding:0;background:transparent;width:17px;height:17px;color:#929292;cursor:pointer}
    .password-input svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.6}
    .field small{font-size:11px;color:#c62828;font-weight:400}
    .field .hint{color:#777;font-style:italic;margin-top:1px}
    .terms{display:flex;align-items:flex-start;gap:8px;margin-top:16px;font-size:13px;line-height:1.5}
    .terms input{appearance:none;flex:none;width:16px;height:16px;margin:2px 0 0;border:1px solid #999;border-radius:4px;background:white;cursor:pointer}
    .terms input:checked{background:#ffda36;border-color:#e5bd14}
    .terms input:checked:after{content:"✓";display:block;text-align:center;font-size:12px;line-height:14px}
    .terms a,.login-prompt a,.support a{color:#0755bd;font-weight:600;text-decoration:underline}
    .submit-button{width:100%;height:44px;border:0;border-radius:5px;background:#ffda36;color:#080808;font-size:14px;font-weight:700;letter-spacing:.2px;box-shadow:0 2px 4px #0002;cursor:pointer}
    .submit-button:disabled{opacity:.65;cursor:wait}
    .divider{display:flex;align-items:center;gap:10px;margin:25px 0 24px;font-size:14px;white-space:nowrap}
    .divider:before,.divider:after{content:"";height:1px;background:#888;flex:1}
    .google-button{height:38px;width:100%;border:1px solid #242424;border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;cursor:pointer}
    .google-button svg{width:18px;height:18px}
    .login-prompt{text-align:center;margin:27px 0 0;font-size:14px}
    .login-prompt a{text-decoration:none}
    .error-banner{padding:10px 12px;border-radius:5px;background:#fff0f0;color:#b42318;font-size:13px}
    .success-layout{grid-column:1/-1;display:grid;grid-template-columns:1fr 1.2fr;align-items:center;gap:40px;padding:70px 50px}
    .success-illustration{width:320px;height:360px;margin:auto;background:#e4f6fd;border:2px dashed #ffda36;display:grid;place-items:center;overflow:hidden}
    .success-illustration img{width:100%;height:100%;object-fit:contain}
    .success-content{text-align:center}
    .checkmark{display:grid;place-items:center;width:74px;height:74px;margin:0 auto 26px;border-radius:50%;background:#2d8036;color:#fff;font-size:48px;font-weight:500}
    .success-content h1{font-size:32px;margin:0 0 18px}
    .success-content p{font-size:18px;margin:0 0 24px}
    .success-login{width:210px}
    .success-login span{font-size:23px;margin-left:12px}
    .support{border-top:1px solid #eee;margin-top:24px;padding-top:18px;font-size:14px}
    .support a{font-weight:400;text-decoration:none}
    @media(max-width:760px){.register-overlay{padding:10px}.register-modal{min-height:0;grid-template-columns:1fr;max-width:500px}.welcome-panel{display:none}.form-panel{padding:52px 24px 28px}.form-panel h1{font-size:27px;margin-bottom:24px}.close-button{right:17px;top:17px}.two-columns{grid-template-columns:1fr 1fr;gap:12px}.terms{margin-top:8px}.divider{margin:18px 0}.login-prompt{margin-top:22px}.success-layout{grid-template-columns:1fr;padding:50px 22px;gap:24px}.success-illustration{width:min(100%,260px);height:250px}.success-content h1{font-size:27px}}
    @media(max-width:390px){.two-columns{grid-template-columns:1fr}.form-panel{padding-left:18px;padding-right:18px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly acceptedTerms = signal(false);
  readonly registered = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\\+84|0)(?:3|5|7|8|9)\\d{8}$/)]],
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\\d).{8,}$/)]],
    confirmPassword: ['', Validators.required],
  });

  close(): void { void this.router.navigate(['/']); }

  googleUnavailable(): void {
    this.errorMessage.set('Đăng ký bằng Google chưa được cấu hình.');
  }

  goToLogin(): void { void this.router.navigate(['/login']); }

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.acceptedTerms()) {
      this.errorMessage.set('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }
    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.form.controls.confirmPassword.markAsTouched();
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    this.loading.set(true);
    this.auth.register({
      fullName: value.fullName.trim(),
      phone: value.phone.trim(),
      email: value.email.trim(),
      password: value.password,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.set(true);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Không thể đăng ký lúc này. Vui lòng thử lại.');
      },
    });
  }
}
