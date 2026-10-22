import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppHttpError } from '../../core/models/app-http-error.model';

export type AdminToastKind = 'error' | 'success' | 'info';
export interface AdminToast { message: string; kind: AdminToastKind; }

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  readonly current = signal<AdminToast | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(message: string, kind: AdminToastKind = 'error'): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.current.set({ message, kind });
    this.timeoutId = setTimeout(() => this.dismiss(), 4200);
  }

  dismiss(): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.current.set(null);
  }
}

/** Keep transport errors out of user-visible messages. */
export function adminErrorMessage(error: unknown, fallback = 'Thao tác chưa thành công. Vui lòng thử lại.'): string {
  if (error instanceof AppHttpError) {
    if (error.kind === 'network') return 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
    if (error.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.status === 403) return 'Tài khoản không có quyền thực hiện thao tác này.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    return error.message && !/unauthoriz|failed to fetch|http failure/i.test(error.message)
      ? error.message : fallback;
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
    if (error.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.status === 403) return 'Tài khoản không có quyền thực hiện thao tác này.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    return fallback;
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    return 'Máy chủ phản hồi quá lâu. Hãy kiểm tra dữ liệu trước khi thử lại.';
  }
  return fallback;
}
