export interface OrderItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface GuestInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ward?: string;
  district: string;
  city: string;
}

export interface CheckoutGuestPayload {
  guest: GuestInfo;
  paymentMethod: 'cod' | 'online';
  voucherCode?: string;
  note?: string;
  items: OrderItem[];
}

export interface CheckoutAuthPayload {
  addressId: string;
  paymentMethod: 'cod' | 'online';
  voucherCode?: string;
  note?: string;
  items: OrderItem[];
}

export interface OrderRecord {
  id: string;
  code: string;
  total: number;
  statusLabel: string;
  paymentMethod: string;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  createdAt: string;
  items: OrderItem[];
}