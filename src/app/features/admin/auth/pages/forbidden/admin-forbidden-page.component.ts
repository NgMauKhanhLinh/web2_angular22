import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-forbidden-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="forbidden-page">
      <section class="forbidden-card" aria-labelledby="forbidden-title">
        <p class="forbidden-card__code">403</p>
        <h1 id="forbidden-title">Bạn không có quyền truy cập</h1>
        <p>
          Tài khoản hiện tại không có role hoặc permission phù hợp với khu vực này.
        </p>
        <div class="forbidden-card__actions">
          <a routerLink="/">Về trang chủ</a>
          <a routerLink="/admin/login" class="secondary">Đăng nhập tài khoản khác</a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .forbidden-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #f8fafc;
      color: #0f172a;
    }

    .forbidden-card {
      width: min(560px, 100%);
      padding: 42px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 18px 45px rgb(15 23 42 / 8%);
      text-align: center;
    }

    .forbidden-card__code {
      margin: 0;
      color: #dc2626;
      font-size: 4rem;
      font-weight: 800;
      line-height: 1;
    }

    h1 {
      margin: 18px 0 0;
      font-size: clamp(1.7rem, 5vw, 2.4rem);
    }

    .forbidden-card > p:not(.forbidden-card__code) {
      margin: 14px auto 0;
      max-width: 440px;
      color: #64748b;
      line-height: 1.6;
    }

    .forbidden-card__actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 28px;
    }

    .forbidden-card__actions a {
      padding: 11px 16px;
      border-radius: 10px;
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-decoration: none;
    }

    .forbidden-card__actions a.secondary {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #0f172a;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminForbiddenPageComponent {}
