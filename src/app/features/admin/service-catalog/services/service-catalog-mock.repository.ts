import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import {
  CatalogBranch,
  CatalogListQuery,
  CatalogListResult,
  CatalogService,
  BranchAvailability,
  ServiceBookingMode,
  ServiceMasterStatus,
} from '../models/service-catalog.model';

/**
 * PHASE 1 UI ADAPTER ONLY.
 * Replace this with the backend list contract when 3.7 APIs are ready.
 * These are illustrative records, NOT server data or an authorization scope.
 */
export const DEMO_BRANCHES: readonly CatalogBranch[] = [
  { id: 'demo-q1', name: 'Chi nhánh Quận 1' },
  { id: 'demo-q3', name: 'Chi nhánh Quận 3' },
  { id: 'demo-q7', name: 'Chi nhánh Quận 7' },
];

function demoService(
  id: string,
  serviceCode: string,
  name: string,
  category: string,
  bookingMode: ServiceBookingMode,
  durationMinutes: number | null,
  referencePrice: number | null,
  minFixedTierPrice: number | null,
  enabledBranchIds: readonly string[],
  status: ServiceMasterStatus = 'ACTIVE',
  availability: BranchAvailability = 'BY_SHIFT',
): CatalogService {
  return {
    id,
    serviceCode,
    name,
    category,
    executorRole: category === 'GROOMING' ? 'CARE_STAFF_GROOMER' : 'VETERINARIAN',
    bookingMode,
    durationMinutes,
    status,
    referencePrice,
    minFixedTierPrice,
    branchServices: DEMO_BRANCHES.map((branch) => ({
      branchId: branch.id,
      capacity: enabledBranchIds.includes(branch.id) ? 2 : 0,
      enabled: enabledBranchIds.includes(branch.id),
      availability,
    })),
  };
}

const DEMO_SERVICES: readonly CatalogService[] = [
  demoService('demo-1', 'GRM01', 'Tắm & Sấy khô', 'GROOMING', 'BOOKABLE', 60, null, 70000, ['demo-q1', 'demo-q3']),
  demoService('demo-2', 'GRM02', 'Massage chuyên sâu', 'GROOMING', 'BOOKABLE', 45, null, 75000, ['demo-q1', 'demo-q3']),
  demoService('demo-3', 'MED01', 'Khám sức khỏe tổng quát', 'MEDICAL', 'BOOKABLE', 30, 150000, null, ['demo-q1']),
  demoService('demo-4', 'MED02', 'Tiêm phòng', 'MEDICAL', 'BOOKABLE', 20, 200000, null, ['demo-q1']),
  demoService('demo-5', 'MED06', 'Phẫu thuật / Triệt sản', 'MEDICAL', 'REQUEST_ONLY', 120, null, 800000, []),
  demoService('demo-6', 'MED07', 'Cấp cứu 24/7', 'MEDICAL', 'CONTACT_ONLY', null, null, null, [], 'INACTIVE', 'CONTACT'),
  demoService('demo-7', 'GRM03', 'Cắt tỉa lông', 'GROOMING', 'BOOKABLE', 50, 190000, null, ['demo-q3']),
  demoService('demo-8', 'GRM04', 'Vệ sinh tai', 'GROOMING', 'BOOKABLE', 20, 90000, null, ['demo-q1', 'demo-q7']),
  demoService('demo-9', 'MED03', 'Xét nghiệm tổng quát', 'MEDICAL', 'REQUEST_ONLY', 40, 350000, null, ['demo-q7']),
  demoService('demo-10', 'MED04', 'Khám da liễu', 'MEDICAL', 'BOOKABLE', 30, 220000, null, ['demo-q1', 'demo-q3']),
  demoService('demo-11', 'GRM05', 'Tắm trị liệu', 'GROOMING', 'BOOKABLE', 60, null, 120000, ['demo-q7']),
  demoService('demo-12', 'MED05', 'Tư vấn dinh dưỡng', 'MEDICAL', 'CONTACT_ONLY', null, null, null, [], 'ACTIVE', 'CONTACT'),
];

function foldText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi').trim();
}

@Injectable({ providedIn: 'root' })
export class ServiceCatalogMockRepository {
  readonly branches = DEMO_BRANCHES;

  getAll(): readonly CatalogService[] {
    return DEMO_SERVICES;
  }

  getById(id: string): CatalogService | null {
    return DEMO_SERVICES.find((service) => service.id === id) ?? null;
  }

  list(
    query: CatalogListQuery,
    options: { empty?: boolean; fail?: boolean } = {},
  ): Observable<CatalogListResult> {
    if (options.fail) {
      return throwError(() => new Error('Demo: lỗi tải danh sách')).pipe(delay(180));
    }

    const source = options.empty ? [] : DEMO_SERVICES;
    const search = foldText(query.search);
    const matches = source.filter((service) => {
      const matchesText =
        !search ||
        foldText(service.name).includes(search) ||
        foldText(service.serviceCode).includes(search);
      const matchesBranch =
        query.branchId === 'ALL' ||
        service.branchServices.some((config) => config.branchId === query.branchId);
      return (
        matchesText &&
        matchesBranch &&
        (query.mode === 'ALL' || service.bookingMode === query.mode) &&
        (query.status === 'ALL' || service.status === query.status)
      );
    });

    const offset = (query.page - 1) * query.pageSize;
    return of({
      items: matches.slice(offset, offset + query.pageSize),
      total: matches.length,
      page: query.page,
      pageSize: query.pageSize,
    }).pipe(delay(220));
  }
}
