export type AuthScreen =
  | 'login'
  | 'register'
  | 'forgot'
  | 'resetOtp'
  | 'registerOtp'
  | 'reset'
  | 'success';

export type AuthEntryScreen = Extract<AuthScreen, 'login' | 'register'>;

export interface AuthScreenContent {
  heading: string;
  description: string;
}

export interface AuthWelcomeContent {
  heading: string;
  description: string;
}

export interface AuthViewModel {
  assets: {
    logo: string;
    loginArtwork: string;
    registerArtwork: string;
    recoveryArtwork: string;
    successArtwork: string;
    backgroundBlob: string;
  };
  welcome: Record<AuthEntryScreen, AuthWelcomeContent>;
  screens: Record<AuthScreen, AuthScreenContent>;
}

export const PHONE_PATTERN = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const AUTH_VIEW_CONTENT = {
  welcome: {
    login: {
      heading: 'Chào mừng trở lại!',
      description: 'Đăng nhập để quản lý hồ sơ thú cưng và đặt lịch hẹn dễ dàng.',
    },
    register: {
      heading: 'Chào mừng bạn!',
      description: 'Tham gia cùng chúng tôi để nhận dịch vụ chăm sóc tốt nhất cho thú cưng của bạn.',
    },
  },
  screens: {
    login: {
      heading: 'Đăng Nhập',
      description: 'Vui lòng nhập thông tin của bạn.',
    },
    register: {
      heading: 'Đăng Ký Tài Khoản',
      description: 'Tạo tài khoản để chăm sóc thú cưng thuận tiện hơn.',
    },
    forgot: {
      heading: 'Quên mật khẩu?',
      description: 'Nhập SĐT hoặc email đã đăng ký để nhận mã xác nhận',
    },
    resetOtp: {
      heading: 'Xác nhận mã OTP',
      description: 'Chúng tôi đã gửi mã 6 số đến {{recipient}}',
    },
    registerOtp: {
      heading: 'Xác nhận mã OTP',
      description: 'Chúng tôi đã gửi mã 6 số đến {{recipient}}',
    },
    reset: {
      heading: 'Tạo mật khẩu mới',
      description: 'Nhập mật khẩu mới cho tài khoản của bạn',
    },
    success: {
      heading: 'Đăng ký thành công!',
      description: 'Chào mừng bạn đến với Dr. Pet’s House',
    },
  },
} satisfies Pick<AuthViewModel, 'welcome' | 'screens'>;