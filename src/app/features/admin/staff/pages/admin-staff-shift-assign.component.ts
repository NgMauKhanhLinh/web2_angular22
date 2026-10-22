import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminCatalogShellComponent } from '../../../../shared/admin-catalog-shell/admin-catalog-shell.component';
import { AdminStaffWeekNavComponent } from '../components/admin-staff-week-nav.component';
import { formatStaffWeekRange } from '../utils/staff-week-range';
import { JOB_LABELS, STAFF_PREVIEW, STAFF_SHIFTS_PREVIEW, displayStaffName } from '../models/staff-preview.model';

interface ShiftDraft { date: string; branch: string; template: string; start: string; end: string; }
const TEMPLATES: Record<string, { name: string; start: string; end: string }[]> = {
  'Quận 1': [{ name: 'Ca sáng', start: '07:00', end: '15:00' }, { name: 'Ca chiều', start: '15:00', end: '22:00' }],
  'Quận 3': [{ name: 'Ca sáng', start: '08:00', end: '12:00' }],
};
const monday = (date: string) => {
  const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
};
const plusDays = (date: string, n: number) => new Date(Date.parse(date + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

/** Preview only; no write to Staff or Shift backend. */
@Component({
  selector: 'app-admin-staff-shift-assign',
  standalone: true,
  imports: [AdminCatalogShellComponent, RouterLink, AdminStaffWeekNavComponent],
  templateUrl: './admin-staff-shift-assign.component.html',
  styleUrl: './admin-staff-shift-assign.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStaffShiftAssignComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly staff = STAFF_PREVIEW;
  readonly chosenId = signal(this.route.snapshot.queryParamMap.get('staffId') ?? '');
  readonly monday = signal(monday('2026-10-19'));
  readonly weekLabel = computed(() => formatStaffWeekRange(this.monday()));
  readonly draft = signal<readonly ShiftDraft[]>([]);
  readonly errors = signal<readonly string[]>([]);
  readonly success = signal('');
  readonly days = () => Array.from({length: 7}, (_, i) => plusDays(this.monday(), i));
  readonly hasChanges = signal(false);
  readonly confirmLeave = signal(false);
  readonly displayName = displayStaffName;
  readonly roles = JOB_LABELS;
  readonly templates = TEMPLATES;
  readonly selectedStaff = () => this.staff.find(s => s.id === this.chosenId());
  readonly branches = () => this.selectedStaff()?.branches ?? [];
  readonly options = (branch: string) => this.templates[branch] ?? [];
  readonly shiftsFor = (date: string) => this.draft().filter(s => s.date === date);
  readonly otherShifts = (date: string) => STAFF_SHIFTS_PREVIEW.filter(s => s.staffId === this.chosenId() && s.isoDate === date);

  setStaff(id: string) { this.chosenId.set(id); this.draft.set([]); this.errors.set([]); this.hasChanges.set(false); }
  changeWeek(week: number): void {
    if (this.hasChanges()) {
      this.errors.set(['Bạn có ca chưa lưu. Hãy xóa bản nháp trước khi chuyển tuần.']);
      return;
    }
    this.monday.set(plusDays(this.monday(), week * 7));
    this.errors.set([]);
  }
  goToday(): void {
    if (this.hasChanges()) {
      this.errors.set(['Bạn có ca chưa lưu. Hãy xóa bản nháp trước khi chuyển về tuần hiện tại.']);
      return;
    }
    const today = new Date();
    today.setDate(today.getDate() - (today.getDay() + 6) % 7);
    this.monday.set([
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-'));
    this.errors.set([]);
  }
  selectWeekDate(value: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    const selected = new Date(value + 'T00:00:00Z');
    if (Number.isNaN(selected.getTime()) || selected.toISOString().slice(0, 10) !== value) return;
    if (this.hasChanges()) {
      this.errors.set(['Bạn có ca chưa lưu. Hãy xóa bản nháp trước khi chọn tuần khác.']);
      return;
    }
    this.monday.set(monday(value));
    this.errors.set([]);
  }

  add(date: string, branch: string, templateName: string) {
    this.errors.set([]); this.success.set('');
    const staff = this.selectedStaff();
    const template = this.options(branch).find(t => t.name === templateName);
    if (!staff || !staff.branches.includes(branch) || !template) { this.errors.set(['Chọn nhân viên, chi nhánh được giao và mẫu ca hợp lệ.']); return; }
    const existing = [...this.shiftsFor(date), ...this.otherShifts(date).map(s => {
      const [start,end] = s.time.split(/[–—-]/).map(x => x.trim());
      return { start, end };
    })];
    if (existing.some(s => template.start < s.end && template.end > s.start)) {
      this.errors.set(['Ca bị trùng giờ với ca khác của nhân viên, kể cả ở chi nhánh khác.']); return;
    }
    this.draft.update(items => [...items, { date, branch, template: templateName, start: template.start, end: template.end }]);
    this.hasChanges.set(true);
  }
  remove(item: ShiftDraft) { this.draft.update(items => items.filter(s => s !== item)); this.hasChanges.set(true); this.errors.set([]); }
  validatePreview() {
    this.errors.set([]);
    if (!this.selectedStaff()) { this.errors.set(['Vui lòng chọn nhân viên.']); return; }
    if (!this.draft().length) { this.errors.set(['Chưa có ca mới trong bản nháp.']); return; }
    this.success.set('Các ca trong bản nháp hợp lệ. Chưa có API Shift nên chưa lưu lên máy chủ.');
  }
  requestClose() { if (this.hasChanges()) this.confirmLeave.set(true); else void this.router.navigateByUrl('/admin/staff/schedule'); }
  discard() { this.draft.set([]); this.hasChanges.set(false); this.confirmLeave.set(false); this.errors.set([]); void this.router.navigateByUrl('/admin/staff/schedule'); }
}
