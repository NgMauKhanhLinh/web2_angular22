import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminCatalogShellComponent } from '../../../../shared/admin-catalog-shell/admin-catalog-shell.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  AdminCategory,
  CategoryStatus,
  SaveCategoryRequest,
} from '../models/admin-category.model';
import { AdminCategoryService } from '../services/admin-category.service';
import { ADMIN_TABLE_PAGE_SIZE, countCursorItems } from '../../../../shared/utils/admin-table-pagination';
import { AdminToastService } from '../../../../shared/services/admin-toast.service';

@Component({
  selector: 'app-admin-category-page',
  standalone: true,
  imports: [FormsModule, AdminCatalogShellComponent],
  templateUrl: './admin-category-page.component.html',
  styleUrl: './admin-category-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminCategoryPageComponent implements OnInit {
  private readonly categoryService = inject(AdminCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  readonly categories = signal<AdminCategory[]>([]);
  readonly parentOptions = signal<AdminCategory[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly nextCursor = signal<string | null>(null);
  readonly totalCategories = signal<number | null>(null);
  readonly dialogOpen = signal(false);
  readonly errorMessage = signal('');
  readonly notice = signal('');
  private readonly toast = inject(AdminToastService);
  private readonly notifyError = effect(() => { if (this.errorMessage()) this.toast.show(this.errorMessage()); });
  private readonly notifyForm = effect(() => { if (this.formError()) this.toast.show(this.formError()); });
  private readonly notifySuccess = effect(() => { if (this.notice()) this.toast.show(this.notice(), 'success'); });
  readonly formError = signal('');

  searchTerm = '';
  statusFilter: 'ALL' | CategoryStatus = 'ALL';
  formName = '';
  formSlug = '';
  formParentId = '';
  formStatus: CategoryStatus = 'ACTIVE';
  editing: AdminCategory | null = null;

  private currentCursor: string | null = null;
  private cursorStack: (string | null)[] = [];
  private countGeneration = 0;
  private countRequested = false;
  private loadSequence = 0;

  get hasPreviousPage(): boolean {
    return this.cursorStack.length > 0;
  }

  get pageNumber(): number {
    return this.cursorStack.length + 1;
  }

  ngOnInit(): void {
    this.loadPage(null);
    this.loadParentOptions();
  }

  private loadParentOptions(): void {
    this.categoryService.listCategories({ limit: 100 }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => this.parentOptions.set(response.items),
      error: () => {
        // Listing still works even when the parent selector cannot be loaded.
        this.parentOptions.set([]);
      },
    });
  }

  loadPage(cursor: string | null): void {
    const serial = ++this.loadSequence;
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryService.listCategories({
      q: this.searchTerm,
      status: this.statusFilter === 'ALL' ? undefined : this.statusFilter,
      limit: this.pageSize,
      cursor,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { if (serial === this.loadSequence) this.loading.set(false); }),
    ).subscribe({
      next: (response) => {
        if (serial !== this.loadSequence) return;
        const meta = response as typeof response & { total?: number; totalCount?: number; totalItems?: number };
        const apiTotal = meta.totalItems ?? meta.totalCount ?? meta.total;
        if (typeof apiTotal === 'number' && Number.isSafeInteger(apiTotal) && apiTotal >= 0) {
          this.totalCategories.set(apiTotal);
        } else if (this.pageNumber === 1 && !response.nextCursor) {
          this.totalCategories.set(response.items.length);
        } else {
          this.countDisplayedCategories();
        }
        this.categories.set(response.items);
        this.nextCursor.set(response.nextCursor);
        this.currentCursor = cursor;
      },
      error: (err: unknown) => {
        if (serial !== this.loadSequence) return;
        this.errorMessage.set(this.errorText(err, 'Không thể tải danh sách danh mục.'));
      },
    });
  }

  private countDisplayedCategories(): void {
    if (this.countRequested || this.totalCategories() !== null) return;
    this.countRequested = true;
    const generation = this.countGeneration;
    const q = this.searchTerm;
    const status = this.statusFilter === 'ALL' ? undefined : this.statusFilter;
    void countCursorItems(
      (cursor) => this.categoryService.listCategories({ q, status, limit: 100, cursor }),
    ).then((total) => {
      if (generation === this.countGeneration && total !== null) {
        this.totalCategories.set(total);
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    if (!value.trim()) this.applyFilters();
  }

  applyFilters(): void {
    ++this.countGeneration;
    this.countRequested = false;
    this.totalCategories.set(null);
    this.cursorStack = [];
    this.currentCursor = null;
    this.loadPage(null);
  }

  nextPage(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loading()) return;
    this.cursorStack.push(this.currentCursor);
    this.loadPage(cursor);
  }

  previousPage(): void {
    if (!this.cursorStack.length || this.loading()) return;
    const cursor = this.cursorStack.pop() ?? null;
    this.loadPage(cursor);
  }

  parentName(parentId: string | null): string {
    if (!parentId) return 'Danh mục gốc';
    const parent = this.parentOptions().find(item => item.id === parentId);
    return parent?.name ?? 'Danh mục cha khác';
  }

  isEligibleParent(item: AdminCategory): boolean {
    if (!this.editing) return true;
    if (item.id === this.editing.id) return false;
    // Avoid turning a category into the child of one of its descendants.
    const seen = new Set<string>();
    let id: string | null = item.parentId;
    while (id && !seen.has(id)) {
      if (id === this.editing.id) return false;
      seen.add(id);
      id = this.parentOptions().find(candidate => candidate.id === id)?.parentId ?? null;
    }
    return true;
  }

  openCreate(): void {
    this.editing = null;
    this.formName = '';
    this.formSlug = '';
    this.formParentId = '';
    this.formStatus = 'ACTIVE';
    this.formError.set('');
    this.dialogOpen.set(true);
  }

  openEdit(item: AdminCategory): void {
    this.editing = item;
    this.formName = item.name;
    // Generate from the current Vietnamese name; legacy slugs are updated only on Save.
    this.formSlug = this.slugifyVietnamese(item.name);
    this.formParentId = item.parentId || '';
    this.formStatus = item.status;
    this.formError.set('');
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
    this.formError.set('');
  }

  /**
   * Convert Vietnamese accents into an SEO-friendly ASCII path segment.
   * The BE's current fallback slugifier removes accented letters entirely.
   */
  private slugifyVietnamese(text: string): string {
    return text.toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  onCategoryNameChange(value: string): void {
    this.formName = value;
    // Always regenerate on name changes, for create and edit alike.
    this.formSlug = this.slugifyVietnamese(value);
  }


  saveCategory(): void {
    if (this.saving()) return;
    const name = this.formName.trim();
    if (name.length < 2 || name.length > 120) {
      this.formError.set('Tên danh mục phải có từ 2 đến 120 ký tự.');
      return;
    }
    const slug = this.slugifyVietnamese(this.formSlug);
    if (!slug || slug.length > 120) {
      this.formError.set('Đường dẫn phải có 1–120 ký tự hợp lệ (chữ, số và dấu gạch ngang).');
      return;
    }
    if (this.formParentId && !this.parentOptions().some(
      item => item.id === this.formParentId && this.isEligibleParent(item),
    )) {
      this.formError.set('Danh mục cha không hợp lệ.');
      return;
    }
    if (this.editing?.parentId && !this.formParentId) {
      this.formError.set('API hiện chưa hỗ trợ chuyển danh mục con thành danh mục gốc. Vui lòng giữ danh mục cha hoặc nhờ BE cập nhật schema.');
      return;
    }

    const body: SaveCategoryRequest = {
      name,
      status: this.formStatus,
      // The OpenAPI v7 schema rejects parentId:null. For a new root category
      // or edits without a parent, leave this field out of the request body.
      ...(this.formParentId ? { parentId: this.formParentId } : {}),
      // Slug is derived from the name and persisted if it differs from the old one.
      ...(!this.editing || slug !== this.editing.slug ? { slug } : {}),
    };
    this.saving.set(true);
    this.formError.set('');
    const action = this.editing
      ? this.categoryService.updateCategory(this.editing.id, body)
      : this.categoryService.createCategory(body);

    action.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        const wasEdit = Boolean(this.editing);
        this.dialogOpen.set(false);
        this.notice.set(wasEdit ? 'Đã cập nhật danh mục thành công.' : 'Đã tạo danh mục thành công.');
        this.applyFilters();
        this.loadParentOptions();
      },
      error: (err: unknown) => {
        this.formError.set(this.errorText(err, 'Không thể lưu danh mục.'));
      },
    });
  }

  private errorText(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.';
      }
      if (error.status === 0) return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
      if (error.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      if (error.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
      if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
      const body: unknown = error.error;
      if (body && typeof body === 'object') {
        const details = body as { detail?: unknown; message?: unknown; errors?: unknown };
        if (typeof details.detail === 'string' && details.detail.trim()) return details.detail;
        if (typeof details.message === 'string' && details.message.trim()) return details.message;
      }
      if (error.status === 400) return 'Dữ liệu chưa đúng định dạng API. Vui lòng kiểm tra tên và đường dẫn.';
      if (error.status === 401 || error.status === 403) return 'Bạn không có quyền thực hiện thao tác này. Hãy đăng nhập bằng tài khoản ADMIN.';
      return fallback;
    }
    if (error instanceof Error && error.message && !/unauthoriz|failed to fetch|http failure/i.test(error.message)) return error.message;
    return fallback;
  }
}
