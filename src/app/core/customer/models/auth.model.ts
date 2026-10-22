export interface LoginPayload {
  loginId: string;
  password?: string;
  remember?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
  };
}

export interface LoginPayload {
  loginId: string;
  password?: string;
  remember?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
  };
}