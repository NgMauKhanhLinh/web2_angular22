import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCatalogShellComponent } from '../../../../shared/admin-catalog-shell/admin-catalog-shell.component';
import { RouterLink } from '@angular/router';
import { STAFF_PREVIEW, JOB_LABELS, StaffPreview, JobRole, StaffStatus, displayStaffName, displayStaffShift } from '../models/staff-preview.model';

@Component({
  selector: 'app-admin-staff-list',
  standalone: true,
  imports: [AdminCatalogShellComponent, FormsModule, RouterLink],
  templateUrl: './admin-staff-list.component.html',
  styleUrl: './admin-staff-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStaffListComponent {
  readonly pageSize = 6;
  readonly roles = JOB_LABELS;
  readonly roleChoices = Object.keys(JOB_LABELS) as JobRole[];
  readonly branches = [...new Set(STAFF_PREVIEW.flatMap(s => s.branches))].sort();
  readonly query = signal('');
  readonly roleFilter = signal<JobRole | 'ALL'>('ALL');
  readonly branchFilter = signal('ALL');
  readonly statusFilter = signal<StaffStatus | 'ALL'>('ALL');
  readonly page = signal(1);
  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('vi');
    return STAFF_PREVIEW.filter(s =>
      (!q || [s.id, s.fullName, this.displayName(s)].some(v => v.toLocaleLowerCase('vi').includes(q))) &&
      (this.roleFilter() === 'ALL' || s.jobRole === this.roleFilter()) &&
      (this.branchFilter() === 'ALL' || s.branches.includes(this.branchFilter())) &&
      (this.statusFilter() === 'ALL' || s.accountStatus === this.statusFilter()),
    );
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly rows = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));

  displayName(staff: StaffPreview): string {
    // fullName stays raw; prefix is presentation-only.
    return displayStaffName(staff);
  }
  roleName(role: JobRole): string { return JOB_LABELS[role]; }

  // Display-only formatting; preserve the original Shift start/end values.
  displayShift(value: string): string {
    return displayStaffShift(value);
  }

  updateQuery(value: string): void { this.query.set(value); this.page.set(1); }
  updateRole(value: string): void { this.roleFilter.set(value as JobRole | 'ALL'); this.page.set(1); }
  updateBranch(value: string): void { this.branchFilter.set(value); this.page.set(1); }
  updateStatus(value: string): void { this.statusFilter.set(value as StaffStatus | 'ALL'); this.page.set(1); }
  changePage(next: number): void { if (next > 0 && next <= this.pages()) this.page.set(next); }
  clearFilters(): void {
    this.query.set(''); this.roleFilter.set('ALL'); this.branchFilter.set('ALL');
    this.statusFilter.set('ALL'); this.page.set(1);
  }
}
