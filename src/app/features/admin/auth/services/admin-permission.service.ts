import { computed, inject, Injectable } from '@angular/core';

import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class AdminPermissionService {
  private readonly authSession = inject(AuthSessionService);

  readonly canViewUsers = computed(() =>
    this.authSession.hasAnyRole(['ADMIN', 'MANAGER']),
  );

  readonly canManageInternalAccounts = computed(() =>
    this.authSession.hasAnyRole(['ADMIN']),
  );

  readonly canManageRoles = computed(() =>
    this.authSession.hasAnyRole(['ADMIN']),
  );

  readonly canManageAccountStatus = computed(() =>
    this.authSession.hasAnyRole(['ADMIN']),
  );
}
