export type SystemRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

export type StaffSubRole =
  | 'RECEPTIONIST'
  | 'CARE_STAFF_GROOMER'
  | 'VETERINARIAN'
  | 'NURSE'
  | string;

export interface AuthUser {
  id: string;
  phone: string;
  fullName: string;
  email: string | null;
  systemRole: SystemRole;
  staffSubRole: StaffSubRole | null;
  avatarUrl: string | null;
}

export interface CurrentUserResponse {
  id?: string;
  _id?: string;
  phone: string;
  fullName: string;
  email?: string | null;
  systemRole: SystemRole;
  staffSubRole?: StaffSubRole | null;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}
