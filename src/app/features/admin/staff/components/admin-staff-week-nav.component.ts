import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input,
  Output, ViewChild,
} from '@angular/core';

/**
 * Identical week navigation in Staff Detail, Staff Edit, Shift Assignment
 * and the Weekly Schedule. The parent owns the current week and its logic.
 */
@Component({
  selector: 'app-admin-staff-week-nav',
  standalone: true,
  templateUrl: './admin-staff-week-nav.component.html',
  styleUrl: './admin-staff-week-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStaffWeekNavComponent {
  @Input() monday = '';
  @Input() label = '';
  @Output() previousWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();
  @Output() currentWeek = new EventEmitter<void>();
  @Output() dateSelected = new EventEmitter<string>();

  @ViewChild('dateInput') private dateInput?: ElementRef<HTMLInputElement>;

  openCalendar(): void {
    const input = this.dateInput?.nativeElement;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      try { input.showPicker(); return; } catch { /* Fallback for browsers that disallow showPicker. */ }
    }
    input.focus();
    input.click();
  }

  onDateSelected(value: string): void {
    if (value) this.dateSelected.emit(value);
  }
}
