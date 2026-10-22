import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../core/services/auth-session.service';
import { AdminAuthService } from '../../features/admin/auth/services/admin-auth.service';
import { AdminPermissionService } from '../../features/admin/auth/services/admin-permission.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  // 2. Tiêm các service bằng inject()
  private readonly authSession = inject(AuthSessionService);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly permissions = inject(AdminPermissionService);
  private readonly router = inject(Router);

  // 3. Bây giờ gán trực tiếp như thế này sẽ KHÔNG bị lỗi nữa
  readonly user = this.authSession.user;
  readonly isLoggingOut = signal(false);
  readonly canViewUsers = this.permissions.canViewUsers;

  // 4. Constructor bây giờ trống hoàn toàn, bạn có thể xóa hẳn block này đi
  constructor() {}

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);

    this.adminAuth
      .logout()
      .pipe(finalize(() => this.isLoggingOut.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/admin/login');
        },
        error: () => {
          void this.router.navigateByUrl('/admin/login');
        },
      });
  }
}