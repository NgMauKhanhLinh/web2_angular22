import {
  StaffSubRole,
  SystemRole,
} from '../../../../core/models/auth.model';

export type AccountStatus =
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'DEACTIVATED';

export interface AdminUser {
  _id?: string;
  id?: string;
  phone: string;
  fullName: string;
  email?: string | null;
  systemRole: SystemRole;
  staffSubRole?: StaffSubRole | null;
  assignedBranchIds?: readonly string[];
  accountStatus: AccountStatus;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateInternalUserRequest {
  phone: string;
  fullName: string;
  email?: string;
  password: string;
  systemRole: SystemRole;
  staffSubRole?: StaffSubRole | null;
  assignedBranchIds?: string[];
}

export interface UpdateUserStatusRequest {
  accountStatus: AccountStatus;
  reason?: string;
}

export interface UpdateUserRoleRequest {
  systemRole: SystemRole;
  staffSubRole?: StaffSubRole | null;
  assignedBranchIds?: string[];
}
