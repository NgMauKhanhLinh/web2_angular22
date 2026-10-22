export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  birthDate?: string;
}

export interface UserAddressRecord {
  id: string;
  name: string;
  recipient?: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault: boolean;
}