/**
 * Task 3.8 FE-only preview data. Do not treat these values as real Staff/Shift records,
 * authentication credentials, BE role assignments, or an available API contract.
 */
export type JobRole = 'VETERINARIAN' | 'NURSE' | 'RECEPTIONIST' | 'CARE_STAFF' | 'MANAGER';
export type StaffStatus = 'ACTIVE' | 'BLOCKED';

export interface StaffPreview {
  id: string;
  fullName: string;
  jobRole: JobRole;
  branches: readonly string[];
  todayShift: string;
  accountStatus: StaffStatus;
  /** Optional fields are populated only where the Staff Detail Figma explicitly provides values. */
  homeBranch?: string;
  phone?: string;
  email?: string;
  loginUsername?: string;
}

export interface StaffShiftPreview {
  staffId: string;
  isoDate: string; // YYYY-MM-DD, branch-local business date
  branch: string;
  shiftName: string;
  time: string;
}

export const JOB_LABELS: Record<JobRole, string> = {
  VETERINARIAN: 'Bác sĩ thú y',
  NURSE: 'Y tá',
  RECEPTIONIST: 'Lễ tân',
  CARE_STAFF: 'Nhân viên chăm sóc',
  MANAGER: 'Quản lý',
};

export const JOB_PREFIX: Record<JobRole, string> = {
  VETERINARIAN: 'BS.',
  NURSE: 'YT.',
  RECEPTIONIST: 'LT.',
  CARE_STAFF: 'CS.',
  MANAGER: 'QL.',
};

/** Existing Staff List sample rows; retained unchanged to avoid breaking accepted UI. */
export const STAFF_PREVIEW: readonly StaffPreview[] = [
  { id: 'NV001', fullName: 'Minh Anh', jobRole: 'VETERINARIAN',
    branches: ['Quận 1', 'Quận 3'], homeBranch: 'Quận 1', phone: '0901 234 567',
    email: 'minhanh@drpetshouse.vn', loginUsername: 'minhanhbsthuy', todayShift: '07:00–15:00', accountStatus: 'ACTIVE' },
  { id: 'NV002', fullName: 'Gia Bảo', jobRole: 'CARE_STAFF',
    branches: ['Quận 3'], todayShift: '08:00–17:00', accountStatus: 'ACTIVE' },
  { id: 'NV003', fullName: 'Thu Hà', jobRole: 'MANAGER',
    branches: ['Quận 1', 'Quận 3'], todayShift: '—', accountStatus: 'ACTIVE' },
  { id: 'NV004', fullName: 'Quốc Huy', jobRole: 'RECEPTIONIST',
    branches: ['Bình Thạnh'], todayShift: '08:00–16:00', accountStatus: 'ACTIVE' },
  { id: 'NV005', fullName: 'Thanh Huy', jobRole: 'RECEPTIONIST',
    branches: ['Quận 10'], todayShift: '07:00–15:00', accountStatus: 'ACTIVE' },
  { id: 'NV006', fullName: 'Phương Vy', jobRole: 'NURSE',
    branches: ['Thủ Đức', 'Bình Thạnh'], todayShift: '—', accountStatus: 'BLOCKED' },
  { id: 'NV007', fullName: 'Hoàng Khang', jobRole: 'CARE_STAFF',
    branches: ['Quận 3'], todayShift: '08:00–17:00', accountStatus: 'ACTIVE' },
];

/** Exact weekly sample from Figma Staff Detail wireframe, for NV001 only. */
export const STAFF_SHIFTS_PREVIEW: readonly StaffShiftPreview[] = [
  { staffId: 'NV001', isoDate: '2026-10-19', branch: 'Quận 1', shiftName: 'Ca sáng', time: '07:00–15:00' },
  { staffId: 'NV001', isoDate: '2026-10-21', branch: 'Quận 3', shiftName: 'Ca sáng', time: '08:00–12:00' },
  { staffId: 'NV001', isoDate: '2026-10-23', branch: 'Quận 1', shiftName: 'Ca chiều', time: '15:00–22:00' },
  { staffId: 'NV001', isoDate: '2026-10-24', branch: 'Quận 1', shiftName: 'Ca sáng', time: '07:00–15:00' },
];

export function displayStaffName(staff: StaffPreview): string {
  return `${JOB_PREFIX[staff.jobRole]} ${staff.fullName}`;
}

export function displayStaffShift(value: string): string {
  return value === '—' ? value : value.replace(/\s*[–—]\s*/g, ' - ');
}
