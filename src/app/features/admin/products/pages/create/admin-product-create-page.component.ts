import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, firstValueFrom, TimeoutError, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppHttpError } from '../../../../../core/models/app-http-error.model';
import { AdminCategory, CategoryPageResponse } from '../../../categories/models/admin-category.model';
import { AdminCategoryService } from '../../../categories/services/admin-category.service';
import { AdminProductService } from '../../services/admin-product.service';
import { ProductWrite } from '../../models/admin-product.model';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminCatalogShellComponent } from '../../../../../shared/admin-catalog-shell/admin-catalog-shell.component';
import { AdminToastService, adminErrorMessage } from '../../../../../shared/services/admin-toast.service';

interface ProductImageDraft {
  id: number;
  file: File;
  previewUrl: string;
}

interface VariantDraft {
  label: string;
  sku: string;
  price: number | null;
  discount: number;
  active: boolean;
  imageFile: File | null;
  imageUrl: string | null;
}

@Component({
  selector: 'app-admin-product-create-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminCatalogShellComponent],
  templateUrl: './admin-product-create-page.component.html',
  styleUrl: './admin-product-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminProductCreatePageComponent implements OnInit, OnDestroy {
  private readonly categoryService = inject(AdminCategoryService);
  private readonly productService = inject(AdminProductService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly toast = inject(AdminToastService);
  private createAttemptFingerprint: string | null = null;
  private createAttemptKey: string | null = null;
  private uploadedImageCache = new Map<number, { file: File; url: string; id: string }>();
  private uploadedVariantCache = new WeakMap<File, string>();

  categories: AdminCategory[] = [];
  loadingCategories = false;
  categoryError = '';
  saving = false;
  createdProductId: string | null = null;
  private destroyed = false;
  productName = '';
  categoryId = '';
  usageType = '';
  description = '';
  hasVariants = true;
  active = false;
  // Only show previews for photos that the user has actually uploaded.
  images: ProductImageDraft[] = [];
  primaryImageId: number | null = null;
  private feedbackValue = '';
  get feedback(): string { return this.feedbackValue; }
  set feedback(message: string) {
    this.feedbackValue = message;
    if (message) this.toast.show(message, /thành công/i.test(message) ? 'success' : 'error');
  }
  submitted = false;
  leaveDialogOpen = false;
  private leaveResolver: ((confirmed: boolean) => void) | null = null;

  // No demonstration SKU/price data should be accidentally saved.
  variants: VariantDraft[] = [this.newVariant()];

  private nextImageId = 1;
  private readonly maxImageCount = 10;
  private readonly maxImageSize = 5 * 1024 * 1024;

  get priceRange(): string {
    // The displayed range is the amount the customer actually pays, not list price.
    // Include every variant, even if its sale status is currently inactive.
    const prices = this.variants
      .filter(v => v.price !== null && Number.isFinite(Number(v.price)) && Number(v.price) > 0)
      .map(v => this.finalPrice(v));
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    const currency = (value: number) => value.toLocaleString('vi-VN') + 'đ';
    return min === max ? currency(min) : currency(min) + ' – ' + currency(max);
  }

  finalPrice(v: VariantDraft): number {
    return Math.round(
      Math.max(0, Number(v.price) || 0) *
      (1 - Math.min(100, Math.max(0, Number(v.discount) || 0)) / 100),
    );
  }

  private newVariant(label = '', price: number | null = null): VariantDraft {
    return {
      label,
      sku: '',
      price,
      discount: 0,
      active: false,
      imageFile: null,
      imageUrl: null,
    };
  }

  private releaseVariantImage(variant: VariantDraft): void {
    if (variant.imageUrl) URL.revokeObjectURL(variant.imageUrl);
    variant.imageFile = null;
    variant.imageUrl = null;
  }

  get nameInvalid(): boolean { return this.submitted && !this.productName.trim(); }
  get usageInvalid(): boolean { return this.submitted && !this.usageType; }
  get categoryInvalid(): boolean { return this.submitted && !this.categories.some(c => c.id === this.categoryId); }
  variantLabelInvalid(v: VariantDraft): boolean {
    return this.submitted && this.hasVariants && !v.label.trim();
  }
  variantPriceInvalid(v: VariantDraft): boolean {
    return this.submitted && (v.price == null || !Number.isSafeInteger(Number(v.price)) || Number(v.price) <= 0);
  }
  variantDiscountInvalid(v: VariantDraft): boolean {
    return this.submitted && (v.discount == null || !Number.isFinite(Number(v.discount)) || Number(v.discount) < 0 || Number(v.discount) > 100);
  }

  /** Select the complete existing number so typing replaces the default zero. */
  selectNumericInput(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  setProductActive(value: boolean): void {
    this.active = value;
    if (!value) {
      this.variants.forEach(v => { v.active = false; });
    } else if (!this.variants.some(v => v.active) && this.variants.length) {
      this.variants[0].active = true;
    }
  }

  toggleVariantActive(variant: VariantDraft): void {
    variant.active = !variant.active;
    this.active = this.variants.some(v => v.active);
  }

  selectVariantMode(value: boolean): void {
    if (value === this.hasVariants) return;
    this.variants.forEach(v => this.releaseVariantImage(v));
    this.hasVariants = value;
    this.active = false;
    this.variants = value
      ? [this.newVariant()]
      : [this.newVariant('Mặc định')];
  }

  addVariant(): void {
    this.variants.push(this.newVariant());
  }

  removeVariant(index: number): void {
    if (this.variants.length <= 1) return;
    const removed = this.variants.splice(index, 1)[0];
    if (removed) this.releaseVariantImage(removed);
    this.active = this.variants.some(v => v.active);
  }

  private isValidImage(file: File): boolean {
    return ['image/jpeg', 'image/png'].includes(file.type) &&
      file.size <= this.maxImageSize;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    const validFiles = files.filter(file => this.isValidImage(file));
    const allowed = validFiles.slice(
      0,
      Math.max(0, this.maxImageCount - this.images.length),
    );

    for (const file of allowed) {
      this.images.push({
        id: this.nextImageId++,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    // Exactly one main image: pick the first uploaded image, unless the
    // user has explicitly chosen a different existing one.
    if (this.primaryImageId === null && this.images.length > 0) {
      this.primaryImageId = this.images[0].id;
    }

    if (validFiles.length !== files.length) {
      this.feedback = 'Chỉ hỗ trợ ảnh JPG/PNG, tối đa 5MB mỗi ảnh.';
    } else if (allowed.length !== validFiles.length) {
      this.feedback = 'Chỉ được tải tối đa 10 ảnh sản phẩm.';
    } else {
      this.feedback = '';
    }
  }

  setPrimaryImage(id: number): void {
    if (this.images.some(image => image.id === id)) {
      this.primaryImageId = id;
    }
  }

  replaceProductImage(event: Event, id: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const image = this.images.find(item => item.id === id);
    if (!image) return;
    if (!this.isValidImage(file)) {
      this.feedback = 'Ảnh thay thế phải là JPG/PNG và không quá 5MB.';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    URL.revokeObjectURL(image.previewUrl);
    image.file = file;
    image.previewUrl = previewUrl;
    // Keep this image's ID and main-image selection unchanged.
    this.feedback = '';
  }

  removeProductImage(id: number): void {
    const index = this.images.findIndex(image => image.id === id);
    if (index === -1) return;
    const [removed] = this.images.splice(index, 1);
    URL.revokeObjectURL(removed.previewUrl);
    if (this.primaryImageId === id) {
      this.primaryImageId = this.images[0]?.id ?? null;
    }
  }

  onVariantImageSelected(event: Event, variant: VariantDraft): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!this.isValidImage(file)) {
      this.feedback = 'Ảnh biến thể phải là JPG/PNG và không quá 5MB.';
      return;
    }

    this.releaseVariantImage(variant);
    variant.imageFile = file;
    variant.imageUrl = URL.createObjectURL(file);
    this.feedback = '';
  }

  ngOnInit(): void {
    void this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    if (this.loadingCategories) return;
    this.loadingCategories = true;
    this.categoryError = '';
    try {
      const results = new Map<string, AdminCategory>();
      let cursor: string | null = null;
      // OpenAPI page limit is 100. Read subsequent pages for large catalogs.
      for (let page = 0; page < 30; page++) {
        const response: CategoryPageResponse = await firstValueFrom(this.categoryService.listCategories({
          limit: 100,
          status: 'ACTIVE',
          cursor,
        }));
        if (this.destroyed) return;
        for (const item of response.items) {
          if (item.status === 'ACTIVE') results.set(item.id, item);
        }
        cursor = response.nextCursor;
        if (!cursor) break;
        if (page === 29) {
          throw new Error('Danh mục quá nhiều, chưa thể tải hết. Vui lòng thử lại.');
        }
      }
      this.categories = [...results.values()].sort(
        (a, b) => a.name.localeCompare(b.name, 'vi'),
      );
      if (this.categoryId && !results.has(this.categoryId)) this.categoryId = '';
    } catch (error: unknown) {
      if (!this.destroyed) {
        this.categoryError = error instanceof Error ? error.message : 'Không thể tải danh mục.';
      }
    } finally {
      if (!this.destroyed) {
        this.loadingCategories = false;
        this.cdr.markForCheck();
      }
    }
  }

  /** Do not treat an untouched form as dirty, including its default empty variant row. */
  hasUnsavedChanges(): boolean {
    if (this.createdProductId) return false;
    if (this.productName.trim() || this.categoryId || this.usageType || this.description.trim()) return true;
    if (this.images.length || this.active || !this.hasVariants || this.variants.length !== 1) return true;
    return this.variants.some(v =>
      !!v.label.trim() || !!v.sku.trim() || Number(v.price) !== 0 ||
      Number(v.discount) !== 0 || v.active || !!v.imageFile,
    );
  }

  /** Angular CanDeactivate: covers breadcrumb, Cancel, sidebar and browser Back. */
  canLeavePage(): boolean | Promise<boolean> {
    if (this.saving) return false;
    if (!this.hasUnsavedChanges()) return true;
    if (this.leaveResolver) return false;
    this.leaveDialogOpen = true;
    this.cdr.markForCheck();
    return new Promise<boolean>(resolve => { this.leaveResolver = resolve; });
  }

  resolveLeave(confirmed: boolean): void {
    const resolver = this.leaveResolver;
    this.leaveResolver = null;
    this.leaveDialogOpen = false;
    this.cdr.markForCheck();
    resolver?.(confirmed);
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmBrowserUnload(event: BeforeUnloadEvent): void {
    if (!this.saving && !this.hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    this.variants.forEach(variant => this.releaseVariantImage(variant));
  }

  saveDraft(): void {
    if (this.saving || this.createdProductId) return;
    this.submitted = true;
    this.active = this.variants.some(v => v.active);
    const name = this.productName.trim();
    const selectedCategory = this.categories.find(item => item.id === this.categoryId);
    if (!name || !selectedCategory || !this.usageType) {
      this.feedback = 'Vui lòng nhập tên sản phẩm, chọn loại sử dụng và danh mục đang hoạt động.';
      return;
    }

    if (!this.variants.length || this.variants.some(v =>
      (this.hasVariants && !v.label.trim()) ||
      v.price == null || !Number.isSafeInteger(Number(v.price)) || Number(v.price) <= 0 ||
      v.discount == null || !Number.isFinite(Number(v.discount)) || Number(v.discount) < 0 || Number(v.discount) > 100
    )) {
      this.feedback = 'Mỗi biến thể phải có giá bán hợp lệ và khuyến mại từ 0 đến 100%.';
      return;
    }

    // BE generates productCode and SKU. Never send the old user-entered SKU.
    const initialPayload: ProductWrite = {
      name,
      description: this.description.trim(),
      categoryId: selectedCategory.id,
      productType: this.hasVariants ? 'VARIANT' : 'SIMPLE',
      usageType: this.usageType as 'SALE' | 'SHARED' | 'SERVICE_SUPPLY',
      status: this.active ? 'ACTIVE' : 'INACTIVE',
      variants: this.variants.map((v, i) => ({
        label: this.hasVariants ? v.label.trim() : 'Mặc định',
        price: Number(v.price),
        discountPercent: Number(v.discount),
        status: v.active ? 'ACTIVE' : 'INACTIVE',
      })),
    };

    this.saving = true;
    this.feedback = '';
    this.cdr.markForCheck();

    try {
      void this.saveProductWithUploads(initialPayload);
    } catch (error: unknown) {
      this.saving = false;
      this.feedback = error instanceof Error ? error.message : 'Không thể bắt đầu lưu sản phẩm.';
      this.cdr.markForCheck();
    }
  }

  private async saveProductWithUploads(initialPayload: ProductWrite): Promise<void> {
    try {
      const uploadedImages = [];
      for (const image of this.images) {
        let item = this.uploadedImageCache.get(image.id);
        if (!item || item.file !== image.file) {
          const response = await firstValueFrom(this.productService.uploadImages([image.file]).pipe(timeout({ first: 30000 })));
          const uploaded = response.items[0];
          if (!uploaded?.url) throw new Error('Không tải được ảnh sản phẩm. Vui lòng thử lại.');
          item = { file: image.file, id: uploaded.id, url: uploaded.url };
          this.uploadedImageCache.set(image.id, item);
        }
        uploadedImages.push({ id: item.id, url: item.url, isPrimary: image.id === this.primaryImageId, sortOrder: uploadedImages.length });
      }

      const variants = [];
      for (let i = 0; i < this.variants.length; i++) {
        const variant = this.variants[i];
        let imageUrl: string | null = null;
        if (variant.imageFile) {
          imageUrl = this.uploadedVariantCache.get(variant.imageFile) ?? null;
          if (!imageUrl) {
            const response = await firstValueFrom(this.productService.uploadImages([variant.imageFile]).pipe(timeout({ first: 30000 })));
            imageUrl = response.items[0]?.url ?? null;
            if (!imageUrl) throw new Error('Không tải được ảnh biến thể. Vui lòng thử lại.');
            this.uploadedVariantCache.set(variant.imageFile, imageUrl);
          }
        }
        variants.push({ ...initialPayload.variants[i], image: imageUrl });
      }
      const payload: ProductWrite = { ...initialPayload, images: uploadedImages, variants };
      const fingerprint = JSON.stringify(payload);
      if (this.createAttemptFingerprint !== fingerprint || !this.createAttemptKey) {
        this.createAttemptFingerprint = fingerprint;
        this.createAttemptKey = crypto.randomUUID();
      }
      const product = await firstValueFrom(this.productService.createProduct(payload, this.createAttemptKey).pipe(timeout({ first: 30000 })));
      if (this.destroyed) return;
      this.createdProductId = product.id;
      this.feedback = 'Đã tạo sản phẩm ' + (product.productCode ?? product.id) + ' thành công.';
      await this.router.navigate(['/admin/products'], {
        state: { productNotice: this.feedback },
      });
    } catch (error: unknown) {
      if (this.destroyed) return;
      this.feedback = error instanceof TimeoutError
        ? 'Quá 30 giây chưa nhận phản hồi. Sản phẩm có thể đã được tạo; hãy kiểm tra danh sách trước khi thử lại.'
        : adminErrorMessage(error, 'Không lưu được sản phẩm. Vui lòng thử lại.');
    } finally {
      this.saving = false;
      if (!this.destroyed) this.cdr.markForCheck();
    }

  }
}
