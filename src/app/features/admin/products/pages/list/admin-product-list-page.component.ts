import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom, timeout } from 'rxjs';

import { AdminCatalogShellComponent } from '../../../../../shared/admin-catalog-shell/admin-catalog-shell.component';
import { AdminCategoryService } from '../../../categories/services/admin-category.service';
import { AdminCategory } from '../../../categories/models/admin-category.model';
import { AdminProductService } from '../../services/admin-product.service';
import { AdminProduct, ProductQuery, ProductSort, ProductStatus, ProductUsageType } from '../../models/admin-product.model';
import { ADMIN_TABLE_PAGE_SIZE, countCursorItems } from '../../../../../shared/utils/admin-table-pagination';
import { AdminToastService, adminErrorMessage } from '../../../../../shared/services/admin-toast.service';

@Component({
  selector: 'app-admin-product-list-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminCatalogShellComponent],
  templateUrl: './admin-product-list-page.component.html',
  styleUrl: './admin-product-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductListPageComponent implements OnInit {
  private readonly productsApi = inject(AdminProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(AdminToastService);
  private readonly showErrors = effect(() => { if (this.error()) this.toast.show(this.error()); });
  private readonly showArchiveErrors = effect(() => { if (this.archiveError()) this.toast.show(this.archiveError()); });
  private readonly showRestoreErrors = effect(() => { if (this.restoreError()) this.toast.show(this.restoreError()); });
  private readonly categoriesApi = inject(AdminCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  readonly products = signal<AdminProduct[]>([]);
  readonly categories = signal<AdminCategory[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly updatingId = signal<string | null>(null);
  readonly archiveTarget = signal<AdminProduct | null>(null);
  readonly archiveError = signal('');
  readonly restoreTarget = signal<AdminProduct | null>(null);
  readonly restoreError = signal('');
  private readonly archiveKeys = new Map<string, string>();
  readonly pageNumber = signal(1);
  readonly hasNextPage = signal(false);
  readonly totalProducts = signal<number | null>(null);

  searchTerm = '';
  categoryFilter = '';
  usageFilter: ProductUsageType | '' = '';
  priceFilter = '';
  daysFilter = 0;
  statusFilter: ProductStatus | '' = '';
  sort: ProductSort = 'NEWEST';
  archiveView = false;
  filterOpen = false;
  // Offset is within one BE cursor page, NOT a product variant index.
  // A BE page may contain archived products removed from the current tab,
  // so we resume at the exact raw product position after collecting 6 visible ones.
  private cursors: Array<{ cursor: string | null; offset: number }> = [
    { cursor: null, offset: 0 },
  ];
  private requestNumber = 0;
  private countGeneration = 0;
  private countRequested = false;

  ngOnInit(): void {
    this.archiveView = this.route.snapshot.queryParamMap.get('view') === 'archived';
    this.statusFilter = this.archiveView ? 'ARCHIVED' : '';
    const navState = window.history.state as { productNotice?: unknown } | null;
    if (typeof navState?.productNotice === 'string') {
      this.toast.show(navState.productNotice, 'success');
      // Do not re-show the same success notice after a reload.
      const { productNotice: ignored, ...rest } = navState;
      window.history.replaceState(rest, '', window.location.href);
    }
    void this.loadCategories();
    this.loadPage(1);
    // A newly created/updated product may briefly be absent from BE read replicas.
    // Refresh once without showing a mock result or reusing the previous list.
    if (typeof navState?.productNotice === 'string') {
      setTimeout(() => {
        if (!this.destroyRef.destroyed && this.pageNumber() === 1 && !this.archiveView &&
            !this.searchTerm && !this.categoryFilter) this.applyFilters();
      }, 900);
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      const result = await firstValueFrom(this.categoriesApi.listCategories({ limit: 100 }));
      this.categories.set(result.items);
    } catch {
      // List remains usable with category IDs if metadata is temporarily unavailable.
    }
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    if (!value.trim()) this.applyFilters();
  }

  toggleCategory(id: string): void {
    this.categoryFilter = this.categoryFilter === id ? '' : id;
  }

  toggleUsage(value: ProductUsageType): void {
    this.usageFilter = this.usageFilter === value ? '' : value;
  }

  togglePrice(value: string): void {
    this.priceFilter = this.priceFilter === value ? '' : value;
  }

  toggleDays(value: number): void {
    this.daysFilter = this.daysFilter === value ? 0 : value;
  }

  toggleStatus(status: 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
  }

  clearFilters(): void {
    this.categoryFilter = '';
    this.usageFilter = '';
    this.priceFilter = '';
    this.daysFilter = 0;
    this.statusFilter = this.archiveView ? 'ARCHIVED' : '';
    this.searchTerm = '';
    this.sort = 'NEWEST';
    this.applyFilters();
    this.filterOpen = false;
  }

  applyFilters(): void {
    ++this.countGeneration;
    this.countRequested = false;
    this.totalProducts.set(null);
    this.cursors = [{ cursor: null, offset: 0 }];
    this.hasNextPage.set(false);
    this.pageNumber.set(1);
    this.loadPage(1);
  }

  selectArchiveView(archived: boolean): void {
    if (this.archiveView === archived) return;
    this.archiveView = archived;
    this.statusFilter = archived ? 'ARCHIVED' : '';
    this.filterOpen = false;
    this.applyFilters();
  }

  loadPage(page: number): void {
    const position = this.cursors[page - 1];
    if (page < 1 || !position) return;

    const serial = ++this.requestNumber;
    this.loading.set(true);
    this.error.set('');

    const query: ProductQuery = {
      // A backend chunk is not a visual page: archived products may be mixed in.
      // Read chunks, then paginate only the filtered parent Product records.
      limit: 20,
      q: this.searchTerm.trim() || undefined,
      categoryId: this.categoryFilter || undefined,
      usageType: this.usageFilter || undefined,
      createdWithinDays: this.daysFilter || undefined,
      minPrice: this.priceFilter === 'MID' ? 100000 : this.priceFilter === 'HIGH' ? 500001 : undefined,
      maxPrice: this.priceFilter === 'LOW' ? 99999 : this.priceFilter === 'MID' ? 500000 : undefined,
      status: this.archiveView ? 'ARCHIVED' : this.statusFilter || undefined,
      sort: this.sort,
    };

    void this.loadVisibleProductPage(query, position)
      .then(({ items, nextPosition, apiTotal }) => {
        if (serial !== this.requestNumber || this.destroyRef.destroyed) return;
        this.products.set(items);
        this.pageNumber.set(page);
        this.hasNextPage.set(nextPosition !== null);
        this.cursors = this.cursors.slice(0, page);
        if (nextPosition) this.cursors[page] = nextPosition;

        // Count parent Product records, not entries in product.variants.
        // Unfiltered BE totals may include ARCHIVED products excluded from this tab.
        if (
          (this.archiveView || !!this.statusFilter) &&
          typeof apiTotal === 'number' && Number.isSafeInteger(apiTotal) && apiTotal >= 0
        ) {
          this.totalProducts.set(apiTotal);
        } else if (!nextPosition) {
          this.totalProducts.set((page - 1) * this.pageSize + items.length);
        } else {
          this.countDisplayedProducts(query);
        }
      })
      .catch((error: unknown) => {
        if (serial !== this.requestNumber || this.destroyRef.destroyed) return;
        this.error.set(adminErrorMessage(error, 'Không thể tải danh sách sản phẩm.'));
        this.products.set([]);
        this.hasNextPage.set(false);
      })
      .finally(() => {
        if (serial === this.requestNumber && !this.destroyRef.destroyed) {
          this.loading.set(false);
        }
      });
  }

  /**
   * Cursor points to the NEXT backend chunk, not to the next visible Product.
   * Look ahead for a seventh non-archived Product so that Next is only enabled
   * if the following UI page has an actual parent record.
   */
  private async loadVisibleProductPage(
    query: ProductQuery,
    initial: { cursor: string | null; offset: number },
  ): Promise<{
    items: AdminProduct[];
    nextPosition: { cursor: string | null; offset: number } | null;
    apiTotal: number | null;
  }> {
    const items: AdminProduct[] = [];
    const knownCursors = new Set<string>();
    let cursor = initial.cursor;
    let offset = initial.offset;
    let apiTotal: number | null = null;

    // Guard against an invalid cursor loop; never silently misreport the count.
    for (let chunk = 0; chunk < 100; chunk++) {
      if (cursor !== null) {
        if (knownCursors.has(cursor)) throw new Error('Backend trả về cursor phân trang lặp.');
        knownCursors.add(cursor);
      }
      const result = await firstValueFrom(
        this.productsApi.listProducts({ ...query, cursor }).pipe(
          timeout({ first: 30000 }),
          takeUntilDestroyed(this.destroyRef),
        ),
      );

      if (apiTotal === null) {
        const reported = result.totalItems ?? result.totalCount ?? result.total;
        if (typeof reported === 'number' && Number.isSafeInteger(reported) && reported >= 0) {
          apiTotal = reported;
        }
      }

      // Every item is one Product Master (variants are nested inside it).
      for (let index = offset; index < result.items.length; index++) {
        const product = result.items[index];
        const visible = this.archiveView
          ? product.status === 'ARCHIVED'
          : product.status !== 'ARCHIVED';
        if (!visible) continue;

        if (items.length === this.pageSize) {
          return { items, nextPosition: { cursor, offset: index }, apiTotal };
        }
        items.push(product);
      }

      if (!result.nextCursor) {
        return { items, nextPosition: null, apiTotal };
      }
      cursor = result.nextCursor;
      offset = 0;
    }
    throw new Error('Danh sách quá dài để phân trang tại giao diện. Vui lòng thu hẹp bộ lọc.');
  }

  private countDisplayedProducts(query: ProductQuery): void {
    if (this.countRequested || this.totalProducts() !== null) return;
    this.countRequested = true;
    const generation = this.countGeneration;
    const archiveView = this.archiveView;
    void countCursorItems(
      (cursor) => this.productsApi.listProducts({ ...query, cursor, limit: 100 }),
      (product: AdminProduct) => archiveView
        ? product.status === 'ARCHIVED'
        : product.status !== 'ARCHIVED',
    ).then((total) => {
      if (generation === this.countGeneration && total !== null) {
        this.totalProducts.set(total);
      }
    });
  }


  visiblePageNumbers(): number[] {
    const total = this.totalProducts();
    const count = total === null ? this.pageNumber() + (this.hasNextPage() ? 1 : 0)
      : Math.max(1, Math.ceil(total / this.pageSize));
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  async goToPage(page: number): Promise<void> {
    const total = this.totalProducts();
    if (!Number.isInteger(page) || page < 1 ||
        (total !== null && page > Math.max(1, Math.ceil(total / this.pageSize))) ||
        this.loading() || page === this.pageNumber()) return;
    if (this.cursors[page - 1]) { this.loadPage(page); return; }
    // BE uses cursors rather than offsets; discover boundaries before jumping.
    const generation = this.requestNumber;
    const query: ProductQuery = {
      limit: 20, q: this.searchTerm.trim() || undefined,
      categoryId: this.categoryFilter || undefined,
      usageType: this.usageFilter || undefined,
      createdWithinDays: this.daysFilter || undefined,
      minPrice: this.priceFilter === 'MID' ? 100000 : this.priceFilter === 'HIGH' ? 500001 : undefined,
      maxPrice: this.priceFilter === 'LOW' ? 99999 : this.priceFilter === 'MID' ? 500000 : undefined,
      status: this.archiveView ? 'ARCHIVED' : this.statusFilter || undefined,
      sort: this.sort,
    };
    this.loading.set(true);
    try {
      while (this.cursors.length < page) {
        const position = this.cursors[this.cursors.length - 1];
        const result = await this.loadVisibleProductPage(query, position);
        if (generation !== this.requestNumber || this.destroyRef.destroyed) return;
        if (!result.nextPosition) return;
        this.cursors.push(result.nextPosition);
      }
    } catch (error) {
      if (generation === this.requestNumber && !this.destroyRef.destroyed)
        this.error.set(adminErrorMessage(error, 'Không thể chuyển đến trang này.'));
      return;
    } finally {
      if (generation === this.requestNumber && !this.destroyRef.destroyed) this.loading.set(false);
    }
    if (generation === this.requestNumber && !this.destroyRef.destroyed) this.loadPage(page);
  }

  previous(): void {
    if (this.pageNumber() > 1) this.loadPage(this.pageNumber() - 1);
  }

  next(): void {
    if (this.hasNextPage()) this.loadPage(this.pageNumber() + 1);
  }

  categoryName(id: string): string {
    return this.categories().find(item => item.id === id)?.name || '—';
  }

  productSku(product: AdminProduct): string {
    return product.variants.map(v => v.sku).join(', ') || '—';
  }

  priceRange(product: AdminProduct): string {
    // Keep Product List pricing consistent with Create/Edit and the payable price.
    const prices = product.variants
      .filter(v => Number.isFinite(Number(v.price)) && Number(v.price) >= 0)
      .map(v => {
        const discount = Math.min(100, Math.max(0, Number(v.discountPercent) || 0));
        return Math.round(Number(v.price) * (1 - discount / 100));
      });
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    const currency = (value: number) => value.toLocaleString('vi-VN') + 'đ';
    return min === max ? currency(min) : currency(min) + ' – ' + currency(max);
  }

  updateStatus(product: AdminProduct): void {
    if (product.status === 'ARCHIVED' || this.updatingId()) return;
    this.updatingId.set(product.id);
    this.error.set('');
    // OpenAPI v7 PATCH currently validates against ProductWrite, whose
    // required name/category/variants must be present even for status changes.
    this.productsApi.updateProduct(product.id, {
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId,
      variants: product.variants.map(v => ({
        id: v.id, label: v.label, sku: v.sku, price: v.price, status: v.status,
      })),
      status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    }).pipe(
      timeout({ first: 30000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.updatingId.set(null)),
    ).subscribe({
      next: updated => {
        this.products.update(rows => rows.map(row => row.id === product.id ? updated : row));
      },
      error: err => this.error.set(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.'),
    });
  }

  requestArchive(product: AdminProduct): void {
    if (product.status === 'ARCHIVED' || this.updatingId()) return;
    this.archiveError.set('');
    this.archiveTarget.set(product);
  }

  closeArchiveDialog(): void {
    if (!this.updatingId()) this.archiveTarget.set(null);
  }

  confirmArchive(): void {
    const product = this.archiveTarget();
    if (!product || this.updatingId()) return;
    const key = this.archiveKeys.get(product.id) ?? crypto.randomUUID();
    this.archiveKeys.set(product.id, key);
    this.updatingId.set(product.id);
    this.archiveError.set('');
    this.productsApi.archiveProduct(product.id, key).pipe(
      timeout({ first: 30000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.updatingId.set(null)),
    ).subscribe({
      next: () => {
        this.archiveKeys.delete(product.id);
        this.archiveTarget.set(null);
        this.toast.show('Đã lưu trữ sản phẩm thành công.', 'success');
        this.applyFilters();
      },
      error: error => {
        this.archiveError.set(
          adminErrorMessage(error, 'Không thể lưu trữ sản phẩm.') +
          ' Nếu kết quả chưa rõ, hãy kiểm tra tab Đã lưu trữ trước khi thử lại.',
        );
      },
    });
  }

  requestRestore(product: AdminProduct): void {
    if (product.status !== 'ARCHIVED' || this.updatingId()) return;
    this.restoreError.set('');
    this.restoreTarget.set(product);
  }

  closeRestoreDialog(): void {
    if (!this.updatingId()) this.restoreTarget.set(null);
  }

  confirmRestore(): void {
    const product = this.restoreTarget();
    if (!product || product.status !== 'ARCHIVED' || this.updatingId()) return;
    this.restoreError.set('');
    this.updatingId.set(product.id);
    this.productsApi.restoreProduct(product.id, crypto.randomUUID()).pipe(
      timeout({ first: 30000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.updatingId.set(null)),
    ).subscribe({
      next: () => {
        this.restoreTarget.set(null);
        this.toast.show('Đã khôi phục sản phẩm thành công.', 'success');
        this.applyFilters();
      },
      error: (error: unknown) => {
        this.restoreError.set(
          adminErrorMessage(error, 'Không thể khôi phục sản phẩm.') +
          ' Nếu chưa rõ kết quả, hãy kiểm tra tab Sản phẩm hiện tại trước khi thử lại.',
        );
      },
    });
  }

  trackProduct(_index: number, item: AdminProduct): string { return item.id; }
}
