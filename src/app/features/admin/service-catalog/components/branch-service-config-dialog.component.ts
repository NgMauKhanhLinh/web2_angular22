import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { CatalogBranch, CatalogService } from '../models/service-catalog.model';

interface BlockedWindow {
  id: number;
  start: string;
  end: string;
}

/**
 * Phase 3 BranchService preview — opened ONLY from Branch Detail.
 * No Backend writes. Availability is computed by BE, never manually configured.
 */
@Component({
  selector: 'app-branch-service-config-dialog',
  standalone: true,
  templateUrl: './branch-service-config-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchServiceConfigDialogComponent implements OnInit, AfterViewInit {
  private readonly session = inject(AuthSessionService);

  @Input({ required: true }) service!: CatalogService;
  @Input({ required: true }) branches: readonly CatalogBranch[] = [];
  @Input({ required: true }) initialBranchId = '';

  @Output() readonly dismiss = new EventEmitter<void>();
  @ViewChild('dialog') private dialogRef?: ElementRef<HTMLElement>;

  readonly selectedBranchId = signal('');
  readonly capacity = signal(0);
  readonly enabled = signal(false);
  readonly blockedWindows = signal<readonly BlockedWindow[]>([]);
  readonly blockStart = signal('');
  readonly blockEnd = signal('');
  readonly dirty = signal(false);
  readonly feedback = signal('');
  readonly errors = signal<string[]>([]);
  readonly confirmDiscard = signal(false);
  readonly isManager = this.session.user()?.systemRole === 'MANAGER';
  private nextBlockedId = 1;

  get isServiceActive(): boolean {
    return this.service.status === 'ACTIVE';
  }

  get selectedBranch(): CatalogBranch | undefined {
    return this.branches.find((branch) => branch.id === this.selectedBranchId());
  }

  get canEnable(): boolean {
    return this.isServiceActive && this.capacity() > 0;
  }

  ngOnInit(): void {
    const branch = this.branches.find((item) => item.id === this.initialBranchId);
    if (!branch) {
      this.errors.set(['Chi nhánh không hợp lệ hoặc không nằm trong phạm vi được phép.']);
      return;
    }
    const current = this.service.branchServices.find((entry) => entry.branchId === branch.id);
    const count = current?.capacity ?? 0;
    this.selectedBranchId.set(branch.id);
    this.capacity.set(Math.max(0, count));
    this.enabled.set(this.isServiceActive && count > 0 && (current?.enabled ?? false));
    // Empty until the BE exposes per-service blocked windows. Do not invent existing periods.
    this.blockedWindows.set([]);
  }

  ngAfterViewInit(): void {
    this.dialogRef?.nativeElement.focus();
  }

  decrease(): void {
    this.updateCapacity(this.capacity() - 1);
  }

  increase(): void {
    this.updateCapacity(this.capacity() + 1);
  }

  updateCapacity(raw: number): void {
    const count = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.trunc(raw))) : 0;
    this.capacity.set(count);
    if (count === 0) this.enabled.set(false);
    this.markChanged();
  }

  toggleEnabled(): void {
    if (!this.canEnable) return;
    this.enabled.update((old) => !old);
    this.markChanged();
  }

  updateStart(value: string): void {
    this.blockStart.set(value);
    this.markChanged();
  }

  updateEnd(value: string): void {
    this.blockEnd.set(value);
    this.markChanged();
  }

  private validWindow(start: string, end: string): boolean {
    const from = new Date(start).getTime();
    const to = new Date(end).getTime();
    return !!start && !!end && Number.isFinite(from) && Number.isFinite(to) && to > from;
  }

  addBlockedWindow(): void {
    const start = this.blockStart();
    const end = this.blockEnd();
    if (!this.validWindow(start, end)) {
      this.errors.set(['Khoảng tạm khóa phải có ngày/giờ kết thúc sau ngày/giờ bắt đầu.']);
      return;
    }
    const first = new Date(start).getTime();
    const last = new Date(end).getTime();
    const overlaps = this.blockedWindows().some((window) =>
      first < new Date(window.end).getTime() && last > new Date(window.start).getTime(),
    );
    if (overlaps) {
      this.errors.set(['Khoảng tạm khóa mới bị trùng với khoảng đã nhập.']);
      return;
    }
    this.blockedWindows.update((windows) => [...windows, {
      id: this.nextBlockedId++,
      start,
      end,
    }].sort((a, b) => a.start.localeCompare(b.start)));
    this.blockStart.set('');
    this.blockEnd.set('');
    this.markChanged();
  }

  removeBlockedWindow(id: number): void {
    this.blockedWindows.update((windows) => windows.filter((window) => window.id !== id));
    this.markChanged();
  }

  private markChanged(): void {
    this.dirty.set(true);
    this.feedback.set('');
    this.errors.set([]);
  }

  validatePreview(): void {
    const errors: string[] = [];
    if (!this.selectedBranch) {
      errors.push('Không tìm thấy chi nhánh hợp lệ.');
    }
    if (!Number.isInteger(this.capacity()) || this.capacity() < 0) {
      errors.push('Sức chứa phải là số nguyên không âm.');
    }
    if (this.enabled() && !this.canEnable) {
      errors.push('Không thể bật khi capacity bằng 0 hoặc dịch vụ tạm ngưng.');
    }
    if (this.blockStart() || this.blockEnd()) {
      errors.push('Bạn còn khoảng tạm khóa đang nhập dở. Hãy thêm hoặc xóa dữ liệu vừa nhập.');
    }
    for (const window of this.blockedWindows()) {
      if (!this.validWindow(window.start, window.end)) {
        errors.push('Có khoảng tạm khóa không hợp lệ.');
      }
    }
    this.errors.set(errors);
    if (errors.length) {
      this.feedback.set('');
      return;
    }
    this.feedback.set(
      'Dữ liệu hợp lệ (bản xem trước). Không có thay đổi nào được lưu vào Backend.',
    );
  }

  requestClose(): void {
    if (this.dirty()) {
      this.confirmDiscard.set(true);
    } else {
      this.dismiss.emit();
    }
  }

  discardChanges(): void {
    this.dismiss.emit();
  }

  cancelDiscard(): void {
    this.confirmDiscard.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmDiscard()) {
      this.confirmDiscard.set(false);
      return;
    }
    this.requestClose();
  }

  @HostListener('document:keydown.tab', ['$event'])
  trapFocus(event: Event): void {
    if (!this.dialogRef) return;
    const keyboardEvent = event as KeyboardEvent;
    const root = this.dialogRef.nativeElement;
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (keyboardEvent.shiftKey && (active === first || active === root)) {
      keyboardEvent.preventDefault();
      last.focus();
    } else if (!keyboardEvent.shiftKey && (active === last || active === root)) {
      keyboardEvent.preventDefault();
      first.focus();
    }
  }
}
