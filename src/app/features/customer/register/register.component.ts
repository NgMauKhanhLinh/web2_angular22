import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/customer/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <aside class="welcome">
          <a routerLink="/" class="brand">Dr. <strong>Pet's</strong> House</a>
          <div class="pet-art" aria-hidden="true">🐶</div>
          <h2>Bắt đầu hành trình chăm sóc bé yêu!</h2>
          <p>Tạo tài khoản để quản lý hồ sơ thú cưng và đặt lịch khám dễ dàng hơn.</p>
        </aside>
        <section class="form-panel">
          <a routerLink="/" class="mobile-brand">Dr. <strong>Pet's</strong> House</a>
          <h1>Tạo tài khoản</h1>
          <p class="subtitle">Điền thông tin bên dưới để tham gia cùng chúng tôi.</p>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label>Họ và tên <span>*</span>
              <input formControlName="fullName" placeholder="Nguyễn Văn An" autocomplete="name">
              @if (form.controls.fullName.touched && form.controls.fullName.invalid) { <small>Vui lòng nhập họ và tên.</small> }
            </label>
            <label>Số điện thoại <span>*</span>
              <input formControlName="phone" placeholder="0901234567" autocomplete="tel" inputmode="tel">
              @if (form.controls.phone.touched && form.controls.phone.invalid) { <small>Số điện thoại chưa đúng định dạng.</small> }
            </label>
            <label>Email
              <input formControlName="email" type="email" placeholder="ban@email.com" autocomplete="email">
              @if (form.controls.email.touched && form.controls.email.invalid) { <small>Vui lòng nhập email hợp lệ.</small> }
            </label>
            <label>Mật khẩu <span>*</span>
              <div class="password"><input formControlName="password" [type]="showPassword() ? 'text' : 'password'" placeholder="Tối thiểu 8 ký tự" autocomplete="new-password"><button type="button" (click)="showPassword.update(v => !v)">{{ showPassword() ? 'Ẩn' : 'Hiện' }}</button></div>
              @if (form.controls.password.touched && form.controls.password.invalid) { <small>Mật khẩu cần có ít nhất 8 ký tự.</small> }
            </label>
            <label>Xác nhận mật khẩu <span>*</span>
              <input formControlName="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" autocomplete="new-password">
              @if (form.controls.confirmPassword.touched && form.controls.confirmPassword.value !== form.controls.password.value) { <small>Mật khẩu xác nhận không khớp.</small> }
            </label>
            @if (errorMessage()) { <div class="error-banner" role="alert">{{ errorMessage() }}</div> }
            @if (successMessage()) { <div class="success-banner" role="status">{{ successMessage() }}</div> }
            <button class="submit" type="submit" [disabled]="loading()">{{ loading() ? 'ĐANG TẠO TÀI KHOẢN…' : 'ĐĂNG KÝ' }}</button>
          </form>
          <p class="switch">Đã có tài khoản? <a routerLink="/login">Đăng nhập</a></p>
        </section>
      </section>
    </main>`,
  styles: [`
    :host{display:block;color:#192b3a}.auth-page{min-height:calc(100vh - 80px);display:grid;place-items:center;padding:36px 20px;background:radial-gradient(circle at 12% 10%,#f1fbff,transparent 35%),#f7fafc}
    .auth-card{width:min(100%,1000px);display:grid;grid-template-columns:.85fr 1.15fr;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 22px 70px #17324d16;border:1px solid #e7edf2}
    .welcome{background:linear-gradient(145deg,#e3f7ff,#f4fbff);padding:42px;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center}.brand,.mobile-brand{align-self:flex-start;text-decoration:none;color:#19364b;font-size:21px;font-weight:700}.brand strong,.mobile-brand strong{color:#168bd2}.pet-art{display:grid;place-items:center;width:190px;height:190px;margin:48px 0 28px;border-radius:50%;background:#fff;box-shadow:0 12px 30px #2b8bc21a;font-size:100px}.welcome h2{font-size:26px;line-height:1.3;margin:0 0 12px}.welcome p{line-height:1.7;color:#657789;margin:0;max-width:330px}
    .form-panel{padding:42px 54px}.form-panel h1{font-size:30px;margin:0 0 8px}.subtitle{margin:0 0 26px;color:#718092}.mobile-brand{display:none}
    form{display:grid;gap:15px}label{display:grid;gap:7px;font-size:13px;font-weight:650;color:#34495a}label span{color:#d43d3d}input{box-sizing:border-box;width:100%;height:44px;border:1px solid #d5dfe7;border-radius:9px;padding:0 13px;font:inherit;font-weight:400;font-size:14px;outline:none;background:#fff}input:focus{border-color:#2196d2;box-shadow:0 0 0 3px #2196d21c}small{font-size:12px;color:#c0392b;font-weight:400}.password{position:relative}.password input{padding-right:55px}.password button{position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:none;color:#187ab1;cursor:pointer}.submit{height:48px;border:0;border-radius:10px;background:#ffdc45;color:#253746;font-weight:750;cursor:pointer;margin-top:5px}.submit:disabled{opacity:.65;cursor:wait}.switch{text-align:center;color:#66798a;font-size:14px;margin:22px 0 0}.switch a{color:#087bb7;font-weight:700;text-decoration:none}.error-banner,.success-banner{border-radius:8px;padding:11px 13px;font-size:13px}.error-banner{background:#fff1f0;color:#b42318}.success-banner{background:#edfff5;color:#087443}
    @media(max-width:760px){.auth-page{padding:18px 12px}.auth-card{grid-template-columns:1fr}.welcome{display:none}.form-panel{padding:30px 22px}.mobile-brand{display:block;margin-bottom:28px}.form-panel h1{font-size:26px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/)]],
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.form.controls.confirmPassword.markAsTouched();
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }
    this.loading.set(true);
    this.auth.register({ fullName: value.fullName.trim(), phone: value.phone.trim(), email: value.email.trim(), password: value.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.');
        this.form.reset();
        setTimeout(() => void this.router.navigate(['/login']), 1200);
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Không thể đăng ký lúc này. Vui lòng thử lại.');
      },
    });
  }
}
