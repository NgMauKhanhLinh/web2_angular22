/** Backend Product contract (Task 3.6, feat/foundation-v6). */
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type VariantStatus = 'ACTIVE' | 'INACTIVE';
export type ProductType = 'SIMPLE' | 'VARIANT';
export type ProductUsageType = 'SALE' | 'SHARED' | 'SERVICE_SUPPLY';

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantWrite {
  id?: string;
  /** Optional on create; Backend allocates an immutable SKU. */
  sku?: string;
  label: string;
  price: number;
  discountPercent?: number;
  image?: string | null;
  status: VariantStatus;
}

export interface ProductWrite {
  name: string;
  description: string;
  categoryId: string;
  productType?: ProductType;
  usageType?: ProductUsageType;
  origin?: string | null;
  expiryInfo?: string | null;
  images?: ProductImage[];
  variants: ProductVariantWrite[];
  status: Exclude<ProductStatus, 'ARCHIVED'>;
}

export interface ProductVariant extends ProductVariantWrite {
  id: string;
  sku: string;
  finalPrice: number;
  availableStock?: number;
}

export interface AdminProduct extends Omit<ProductWrite, 'variants' | 'status' | 'images'> {
  id: string;
  productCode: string | null;
  productType: ProductType;
  usageType: ProductUsageType;
  variants: ProductVariant[];
  status: ProductStatus;
  images: ProductImage[];
  outOfStock: boolean;
  totalStock: number;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}

export interface ProductPageResponse {
  items: AdminProduct[];
  nextCursor: string | null;
  totalItems?: number;
  totalCount?: number;
  total?: number;
}

export interface UploadedProductImage {
  id: string;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductUploadResponse {
  items: UploadedProductImage[];
  total: number;
}

export type ProductSort = 'NEWEST' | 'NAME_ASC' | 'NAME_DESC' | 'PRICE_ASC' | 'PRICE_DESC';

export interface ProductQuery {
  q?: string;
  categoryId?: string;
  usageType?: ProductUsageType;
  createdWithinDays?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sort?: ProductSort;
  limit?: number;
  cursor?: string | null;
}
