import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  StaffSubRole,
  SystemRole,
} from '../../../../core/models/auth.model';
import { AppHttpError } from '../../../../core/models/app-http-error.model';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { AdminPermissionService } from '../../auth/services/admin-permission.service';
import {
  AccountStatus,
  AdminUser,
} from '../models/admin-user.model';
import { AdminUsersService } from '../services/admin-users.service';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../../shared/utils/admin-table-pagination';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="users-page">
      <header class="page-heading">
        <div>
          <p class="eyebrow">AUTH / RBAC</p>
          <h1>Quản lý tài khoản nội bộ</h1>
          <p>
            Admin có thể tạo tài khoản và thay đổi role/status. Manager chỉ được
            xem danh sách trong phạm vi branch do Backend trả về.
          </p>
        </div>
        <button type="button" (click)="loadUsers()" [disabled]="loading()">
          {{ loading() ? 'Đang tải...' : 'Tải lại' }}
        </button>
      </header>

      @if (canManageInternalAccounts()) {
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h2>Tạo tài khoản nội bộ</h2>
              <p>Chỉ ADMIN được phép thực hiện thao tác này.</p>
            </div>
          </div>

          <form class="create-form" [formGroup]="createForm" (ngSubmit)="createUser()" autocomplete="off">
            <label>
              <span>Họ tên</span>
              <input type="text" formControlName="fullName" placeholder="Nguyễn Văn A" autocomplete="off" />
            </label>

            <label>
              <span>Số điện thoại</span>
              <input type="tel" formControlName="phone" placeholder="0901234567" autocomplete="off" />
              @if (createForm.controls.phone.invalid && createForm.controls.phone.touched) {
                <small class="form-error">Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.</small>
              }
            </label>

            <label>
              <span>Email</span>
              <input type="email" formControlName="email" placeholder="staff@petclinic.com" autocomplete="off" />
              @if (createForm.controls.email.invalid && createForm.controls.email.touched) {
                <small class="form-error">Email không đúng định dạng.</small>
              }
            </label>

            <label>
              <span>Mật khẩu tạm</span>
              <input type="password" formControlName="password" placeholder="Staff@1234" autocomplete="new-password" />
              @if (createForm.controls.password.invalid && createForm.controls.password.touched) {
                <small class="form-error">Ít nhất 8 ký tự, có 1 chữ hoa và 1 chữ số.</small>
              }
            </label>

            <label>
              <span>System role</span>
              <select formControlName="systemRole">
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>

            @if (createForm.controls.systemRole.value === 'STAFF') {
              <label>
                <span>Staff sub-role</span>
                <select formControlName="staffSubRole">
                  <option value="RECEPTIONIST">RECEPTIONIST</option>
                  <option value="CARE_STAFF_GROOMER">CARE_STAFF_GROOMER</option>
                  <option value="VETERINARIAN">VETERINARIAN</option>
                  <option value="NURSE">NURSE</option>
                </select>
              </label>
            }

            <div class="create-form__action">
              <button class="primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Đang tạo...' : 'Tạo tài khoản' }}
              </button>
            </div>
          </form>
        </section>
      }

      @if (notice()) {
        <p class="notice" role="status">{{ notice() }}</p>
      }

      @if (errorMessage()) {
        <p class="error" role="alert">{{ errorMessage() }}</p>
      }

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h2>Danh sách người dùng</h2>
            <p>Danh sách tài khoản trong phạm vi Backend cho phép.</p>
          </div>
        </div>

        @if (loading()) {
          <p class="empty-state">Đang tải danh sách...</p>
        } @else if (users().length === 0) {
          <p class="empty-state">Không có tài khoản nào trong phạm vi được phép xem.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Branch</th>
                  <th>Quyền thao tác FE</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track userId(user)) {
                  <tr>
                    <td>
                      <strong>{{ user.fullName }}</strong>
                      <small>{{ user.phone }}</small>
                      <small>{{ user.email || 'Chưa có email' }}</small>
                    </td>
                    <td>
                      @if (canManageRoles() && !isCurrentUser(user)) {
                        <select
                          class="compact-select"
                          [value]="user.systemRole"
                          (change)="changeRole(user, $any($event.target).value)"
                          [disabled]="saving()"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>

                        @if (user.systemRole === 'STAFF') {
                          <select
                            class="compact-select compact-select--sub"
                            [value]="user.staffSubRole || 'RECEPTIONIST'"
                            (change)="changeStaffSubRole(user, $any($event.target).value)"
                            [disabled]="saving()"
                          >
                            <option value="RECEPTIONIST">RECEPTIONIST</option>
                            <option value="CARE_STAFF_GROOMER">CARE_STAFF_GROOMER</option>
                            <option value="VETERINARIAN">VETERINARIAN</option>
                            <option value="NURSE">NURSE</option>
                          </select>
                        }
                      } @else {
                        <span class="role">{{ user.systemRole }}</span>
                        @if (user.staffSubRole) {
                          <small>{{ user.staffSubRole }}</small>
                        }
                      }
                    </td>
                    <td>
                      <span class="status" [attr.data-status]="user.accountStatus">
                        {{ user.accountStatus }}
                      </span>
                    </td>
                    <td>
                      {{ user.assignedBranchIds?.length || 0 }} branch
                    </td>
                    <td>
                      @if (canManageAccountStatus() && !isCurrentUser(user)) {
                        <button
                          type="button"
                          class="action-button"
                          (click)="toggleStatus(user)"
                          [disabled]="saving()"
                        >
                          {{ user.accountStatus === 'ACTIVE' ? 'Khóa' : 'Kích hoạt' }}
                        </button>
                      } @else if (isCurrentUser(user)) {
                        <span class="muted">Tài khoản hiện tại</span>
                      } @else {
                        <span class="muted">Chỉ xem</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (!loading() && !errorMessage()) {
          <footer class="users-pagination">
            <span>Đang hiển thị {{ users().length }} trên tổng số {{ total() }} tài khoản</span>
            <nav aria-label="Phân trang tài khoản">
              <button type="button" aria-label="Trang trước"
                [disabled]="page() === 1" (click)="goToPage(page() - 1)">‹</button>
              <span aria-current="page">{{ page() }}</span>
              <button type="button" aria-label="Trang tiếp"
                [disabled]="page() >= pageCount" (click)="goToPage(page() + 1)">›</button>
            </nav>
          </footer>
        }
      </section>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .users-page {
      display: grid;
      gap: 22px;
    }

    .page-heading,
    .panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
    }

    .page-heading h1,
    .panel h2 {
      margin: 0;
      color: #0f172a;
    }

    .page-heading h1 {
      margin-top: 4px;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
    }

    .page-heading p:not(.eyebrow),
    .panel-heading p {
      margin: 7px 0 0;
      color: #64748b;
      line-height: 1.55;
    }

    .eyebrow {
      margin: 0;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    button,
    input,
    select {
      font: inherit;
    }

    button {
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      cursor: pointer;
      background: #fff;
      color: #0f172a;
      font-weight: 700;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.6;
    }

    button.primary {
      border-color: #0f172a;
      background: #0f172a;
      color: #fff;
    }

    .panel {
      padding: 22px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #fff;
    }

    .create-form {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 20px;
    }

    label {
      display: grid;
      gap: 7px;
      color: #334155;
      font-size: 0.82rem;
      font-weight: 700;
    }

    input,
    select {
      width: 100%;
      min-height: 42px;
      padding: 0 11px;
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      outline: 0;
      background: #fff;
      color: #0f172a;
    }

    input:focus,
    select:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgb(96 165 250 / 12%);
    }

    .create-form__action {
      display: flex;
      align-items: end;
    }

    .form-error {
      color: #b91c1c;
      font-size: 0.72rem;
      font-weight: 600;
      line-height: 1.35;
    }

    .notice,
    .error {
      margin: 0;
      padding: 11px 14px;
      border-radius: 10px;
      font-weight: 600;
    }

    .notice {
      background: #ecfdf5;
      color: #047857;
    }

    .error {
      background: #fef2f2;
      color: #b91c1c;
    }

    .empty-state {
      margin: 22px 0 0;
      color: #64748b;
    }

    .users-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 18px;
      color: #64748b;
      font-size: 0.8rem;
    }
    .users-pagination nav {
      display: inline-flex;
      align-items: center;
      border: 1px solid #dce4ee;
      border-radius: 8px;
      overflow: hidden;
    }
    .users-pagination nav button {
      width: 40px;
      min-height: 38px;
      border: 0;
      border-radius: 0;
      padding: 0;
      color: #0d47a1;
    }
    .users-pagination nav button:disabled { opacity: .4; cursor: default; }
    .users-pagination nav span {
      display: grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border-left: 1px solid #dce4ee;
      border-right: 1px solid #dce4ee;
      background: #eaf3ff;
      font-weight: 700;
    }
    @media (max-width: 640px) {
      .users-pagination { align-items: flex-start; flex-direction: column; }
    }

    .table-wrap {
      margin-top: 18px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 850px;
    }

    th,
    td {
      padding: 13px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }

    th {
      color: #64748b;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    td {
      color: #334155;
      font-size: 0.88rem;
    }

    td strong,
    td small {
      display: block;
    }

    td small {
      margin-top: 3px;
      color: #64748b;
    }

    .role,
    .status {
      display: inline-flex;
      padding: 5px 8px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .status[data-status='BLOCKED'],
    .status[data-status='DEACTIVATED'] {
      background: #fef2f2;
      color: #b91c1c;
    }

    .status[data-status='ACTIVE'] {
      background: #ecfdf5;
      color: #047857;
    }

    .compact-select {
      min-height: 34px;
      padding: 0 8px;
      font-size: 0.78rem;
    }

    .compact-select--sub {
      margin-top: 7px;
    }

    .action-button {
      min-height: 34px;
      padding: 0 10px;
      font-size: 0.78rem;
    }

    .muted {
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .create-form {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .page-heading,
      .panel-heading {
        display: grid;
      }

      .create-form {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(AdminUsersService);
  private readonly authSession = inject(AuthSessionService);
  private readonly permissions = inject(AdminPermissionService);

  readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  readonly page = signal(1);
  readonly users = signal<AdminUser[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly notice = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly canManageInternalAccounts =
    this.permissions.canManageInternalAccounts;
  readonly canManageRoles = this.permissions.canManageRoles;
  readonly canManageAccountStatus = this.permissions.canManageAccountStatus;

  readonly createForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
    email: ['', [Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
      ],
    ],
    systemRole: ['STAFF' as SystemRole, [Validators.required]],
    staffSubRole: ['RECEPTIONIST' as StaffSubRole],
  });

  constructor() {
    this.loadUsers();
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pageCount || this.loading() || target === this.page()) return;
    this.page.set(target);
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.usersService
      .listUsers(this.page(), this.pageSize)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.users.set(response.users.slice(0, this.pageSize));
          this.total.set(response.pagination.total);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.messageForError(error));
        },
      });
  }

  createUser(): void {
    this.notice.set(null);
    this.errorMessage.set(null);
    this.createForm.markAllAsTouched();

    if (
      this.createForm.invalid ||
      this.saving() ||
      !this.canManageInternalAccounts()
    ) {
      return;
    }

    const value = this.createForm.getRawValue();
    this.saving.set(true);

    this.usersService
      .createInternalUser({
        phone: value.phone.trim(),
        fullName: value.fullName.trim(),
        email: value.email.trim() || undefined,
        password: value.password,
        systemRole: value.systemRole,
        staffSubRole:
          value.systemRole === 'STAFF' ? value.staffSubRole : null,
        assignedBranchIds: [],
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set('Đã tạo tài khoản nội bộ thành công.');
          this.createForm.reset({
            fullName: '',
            phone: '',
            email: '',
            password: '',
            systemRole: 'STAFF',
            staffSubRole: 'RECEPTIONIST',
          });
          this.loadUsers();
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.messageForError(error));
        },
      });
  }

  changeRole(user: AdminUser, role: string): void {
    if (!this.canManageRoles() || this.isCurrentUser(user)) {
      return;
    }

    const userId = this.userId(user);
    if (!userId) {
      return;
    }

    const systemRole = role as SystemRole;
    const staffSubRole =
      systemRole === 'STAFF'
        ? (user.staffSubRole ?? 'RECEPTIONIST')
        : null;

    this.runMutation(
      this.usersService.updateRole(userId, {
        systemRole,
        staffSubRole,
        assignedBranchIds: [...(user.assignedBranchIds ?? [])],
      }),
      'Đã cập nhật role.',
    );
  }

  changeStaffSubRole(user: AdminUser, subRole: string): void {
    if (
      !this.canManageRoles() ||
      this.isCurrentUser(user) ||
      user.systemRole !== 'STAFF'
    ) {
      return;
    }

    const userId = this.userId(user);
    if (!userId) {
      return;
    }

    this.runMutation(
      this.usersService.updateRole(userId, {
        systemRole: 'STAFF',
        staffSubRole: subRole,
        assignedBranchIds: [...(user.assignedBranchIds ?? [])],
      }),
      'Đã cập nhật staff sub-role.',
    );
  }

  toggleStatus(user: AdminUser): void {
    if (!this.canManageAccountStatus() || this.isCurrentUser(user)) {
      return;
    }

    const userId = this.userId(user);
    if (!userId) {
      return;
    }

    const accountStatus: AccountStatus =
      user.accountStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    this.runMutation(
      this.usersService.updateStatus(userId, {
        accountStatus,
        reason:
          accountStatus === 'BLOCKED'
            ? 'Updated from Admin Portal'
            : 'Reactivated from Admin Portal',
      }),
      accountStatus === 'BLOCKED'
        ? 'Đã khóa tài khoản.'
        : 'Đã kích hoạt tài khoản.',
    );
  }

  userId(user: AdminUser): string {
    return user.id ?? user._id ?? '';
  }

  isCurrentUser(user: AdminUser): boolean {
    return this.userId(user) === this.authSession.user()?.id;
  }

  private runMutation(
    request: ReturnType<AdminUsersService['updateRole']>,
    successMessage: string,
  ): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.notice.set(null);
    this.errorMessage.set(null);

    request
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set(successMessage);
          this.loadUsers();
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.messageForError(error));
          this.loadUsers();
        },
      });
  }

  private messageForError(error: unknown): string {
    if (error instanceof AppHttpError) {
      return error.message;
    }

    return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
  }
}
