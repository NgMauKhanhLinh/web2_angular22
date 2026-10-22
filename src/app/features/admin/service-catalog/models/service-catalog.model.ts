/** Raw BE Service Master contract; response fields are NOT demo data. */
export interface ServicePriceVariant {
  label: string;
  price: number;
  minWeightKg?: number;
  maxWeightKg?: number;
}
export interface ServiceDefaultMaterial {
  materialId: string;
  defaultQuantity: number;
  unit: string;
}
export interface ServiceWrite {
  name: string;
  serviceType: 'GROOMING' | 'MEDICAL';
  category?: string;
  description?: string;
  basePrice: number;
  priceVariants: ServicePriceVariant[];
  durationMinutes: number | null;
  requiredStaffRole: 'CARE_STAFF_GROOMER' | 'NURSE' | 'VETERINARIAN';
  bookingMode: ServiceBookingMode;
  status: ServiceMasterStatus;
}
export interface ServiceApiRecord extends ServiceWrite {
  id: string;
  code?: string;
  enabledBranchCount?: number;
  totalBranchCount?: number;
  isAvailable?: boolean;
  availabilityText?: string;
  branchConfig?: { enabled: boolean; capacity: number };
  defaultMaterials?: ServiceDefaultMaterial[];
  contactInfo?: { hotline?: string; instruction?: string };
}

export type ServiceCategory = 'GROOMING' | 'MEDICAL' | string;
export type ServiceBookingMode = 'BOOKABLE' | 'REQUEST_ONLY' | 'CONTACT_ONLY';
export type ServiceMasterStatus = 'ACTIVE' | 'INACTIVE';
export type BranchAvailability = 'BY_SHIFT' | 'CONTACT';

export interface CatalogBranch {
  id: string;
  name: string;
}

export interface BranchServicePreview {
  branchId: string;
  capacity: number;
  enabled: boolean;
  availability: BranchAvailability;
}

export interface CatalogService {
  id: string;
  serviceCode: string;
  name: string;
  category: ServiceCategory;
  executorRole: string;
  bookingMode: ServiceBookingMode;
  durationMinutes: number | null;
  status: ServiceMasterStatus;
  referencePrice: number | null;
  minFixedTierPrice: number | null;
  branchServices: BranchServicePreview[];
  enabledBranchCount?: number;
  totalBranchCount?: number;
  availabilityText?: string;
  isAvailable?: boolean;
  description?: string;
  basePrice?: number;
  priceVariants?: ServicePriceVariant[];
  defaultMaterials?: ServiceDefaultMaterial[];
  contactInfo?: { hotline?: string; instruction?: string };
}

export type CatalogFilterStatus = ServiceMasterStatus | 'ALL';
export type CatalogFilterMode = ServiceBookingMode | 'ALL';

export interface CatalogListQuery {
  search: string;
  branchId: string;
  mode: CatalogFilterMode;
  status: CatalogFilterStatus;
  page: number;
  pageSize: number;
}

export interface CatalogListResult {
  items: CatalogService[];
  total: number;
  page: number;
  pageSize: number;
}
