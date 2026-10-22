import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/customer/services/auth.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="account-page">
      <header class="page-heading"><div><p class="eyebrow">TÀI KHOẢN CỦA BẠN</p><h1>Thông tin người dùng</h1><p>Quản lý thông tin liên hệ để việc chăm sóc bé yêu thuận tiện hơn.</p></div><div class="avatar">{{ initials() }}</div></header>
      <section class="profile-card">
        <div class="card-heading"><div><h2>Thông tin cá nhân</h2><p>Cập nhật thông tin liên hệ của bạn.</p></div><button type="button" class="edit-button" (click)="editing.update(v => !v)">{{ editing() ? 'Hủy chỉnh sửa' : 'Chỉnh sửa' }}</button></div>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="fields">
            <label>Họ và tên<input formControlName="fullName" [readOnly]="!editing()"></label>
            <label>Email<input formControlName="email" type="email" [readOnly]="!editing()"></label>
            <label>Số điện thoại<input formControlName="phone" [readOnly]="!editing()"></label>
            <label>Vai trò<input [value]="roleLabel()" readonly></label>
          </div>
          @if (notice()) { <p class="notice" role="status">{{ notice() }}</p> }
          @if (editing()) { <button class="save-button" type="submit" [disabled]="form.invalid">Lưu thay đổi</button> }
        </form>
      </section>
      <section class="quick-links"><a routerLink="/thu-cung-cua-toi"><span>🐾</span><div><strong>Thú cưng của tôi</strong><small>Xem và quản lý hồ sơ các bé</small></div><b>→</b></a><a routerLink="/booking"><span>📅</span><div><strong>Đặt lịch khám</strong><small>Đặt lịch chăm sóc thú cưng</small></div><b>→</b></a></section>
    </main>`,
  styles: [`
    :host{display:block;color:#203444}.account-page{max-width:1060px;margin:0 auto;padding:42px 22px 70px}.page-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}.eyebrow{color:#1685bd;font-weight:750;font-size:11px;letter-spacing:1.4px;margin:0 0 8px}.page-heading h1{font-size:clamp(26px,4vw,36px);margin:0 0 8px}.page-heading p:last-child{color:#728291;margin:0;line-height:1.6}.avatar{width:64px;height:64px;display:grid;place-items:center;border-radius:50%;background:#dff4ff;color:#117db2;font-weight:800;font-size:21px}.profile-card{background:#fff;border:1px solid #e4ebf0;border-radius:18px;padding:26px;box-shadow:0 10px 35px #18364d08}.card-heading{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:24px}.card-heading h2{font-size:20px;margin:0 0 6px}.card-heading p{margin:0;color:#778795;font-size:14px}.edit-button{background:#fff;border:1px solid #b8dced;color:#087eb7;border-radius:9px;padding:10px 15px;font-weight:700;cursor:pointer}.fields{display:grid;grid-template-columns:1fr 1fr;gap:20px}label{display:grid;gap:8px;font-size:13px;color:#5b6b79;font-weight:650}input{width:100%;box-sizing:border-box;height:45px;border:1px solid #e0e7ec;border-radius:9px;padding:0 12px;font:inherit;font-weight:400;color:#263b4b;background:#f9fbfc}input:not([readonly]){background:#fff;border-color:#8bc9e6;outline-color:#8bc9e6}.save-button{margin-top:22px;background:#ffdc45;border:0;border-radius:9px;padding:12px 20px;font-weight:750;cursor:pointer}.notice{color:#087443;font-size:13px}.quick-links{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.quick-links a{display:flex;align-items:center;gap:14px;padding:20px;background:#f6fbfe;border:1px solid #e3edf3;border-radius:14px;text-decoration:none;color:#263b4b}.quick-links a>span{font-size:26px}.quick-links a div{display:grid;gap:5px;flex:1}.quick-links small{color:#718392}.quick-links b{color:#1485bd}@media(max-width:620px){.account-page{padding:28px 14px}.fields,.quick-links{grid-template-columns:1fr}.profile-card{padding:18px}.page-heading{align-items:flex-start}.avatar{width:48px;height:48px;font-size:16px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPageComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  readonly editing = signal(false);
  readonly notice = signal('');
  readonly user = this.auth.currentUser;
  readonly initials = computed(() => (this.user()?.fullName || 'Khách hàng').split(/\s+/).slice(-2).map(part => part[0] ?? '').join('').toUpperCase());
  readonly roleLabel = computed(() => this.user()?.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng');
  readonly form = this.fb.nonNullable.group({
    fullName: [this.user()?.fullName ?? '', [Validators.required, Validators.maxLength(100)]],
    email: [this.user()?.email ?? '', [Validators.email]],
    phone: [this.user()?.phone ?? ''],
  });
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.notice.set('Thông tin đã được cập nhật trên biểu mẫu. Cần kết nối API cập nhật hồ sơ để lưu dữ liệu lên máy chủ.');
    this.editing.set(false);
  }
}
