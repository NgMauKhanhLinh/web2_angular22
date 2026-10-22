import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/customer/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

export interface NavbarLink {
  label: string;
  path: string;
  category?: string;
  children?: NavbarLink[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive,
    NotificationBellComponent
  ],

  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  readonly logo = '/public/assets/customer/images/home/logo.png';
  readonly avatar = '/public/assets/customer/images/navbar/avatar.png';

  readonly links: NavbarLink[] = [
    { label: 'Trang chủ', path: '/' },
    {
      label: 'Dịch vụ',
      path: '/dich-vu',
      children: [
        { label: 'Khám & Điều trị', path: '/dich-vu/kham-dieu-tri' },
        { label: 'Grooming & Spa', path: '/dich-vu/grooming-spa' },
      ],
    },
    {
      label: 'Mua sắm',
      path: '/cua-hang',
      children: [
        { label: 'Thức ăn', path: '/san-pham', category: 'Thức ăn' },
        { label: 'Đồ dùng thiết yếu', path: '/san-pham', category: 'Đồ dùng thiết yếu' },
        { label: 'Chăm sóc sức khỏe', path: '/san-pham', category: 'Chăm sóc sức khỏe' },
        { label: 'Đồ chơi', path: '/san-pham', category: 'Đồ chơi' },
        { label: 'Phụ kiện', path: '/san-pham', category: 'Phụ kiện' },
      ],
    },
    {
      label: 'Blog',
      path: '/blog',
      children: [
        { label: 'Kiến thức thú cưng', path: '/blog' },
        { label: 'Cộng đồng chia sẻ', path: '/blog/cong-dong' },
        { label: 'Cẩm nang sơ cứu', path: '/blog/so-cuu' },
      ],
    },
    { label: 'Cứu trợ', path: '/cuu-tro' },
    { label: 'Về chúng tôi', path: '/ve-chung-toi' },
    { label: 'Liên hệ', path: '/lien-he' },
  ];

  readonly accountLinks: NavbarLink[] = [
    { label: 'Thông tin người dùng', path: '/thong-tin-nguoi-dung' },
    { label: 'Quản lý thú cưng', path: '/thu-cung-cua-toi' },
    { label: 'Lịch sử đặt lịch', path: '/lich-su-dat-lich' },
    { label: 'Đơn hàng của tôi', path: '/don-hang-cua-toi' },
  ];

  readonly searchTerms = [
    'Khám và điều trị',
    'Grooming & Spa',
    'Thức ăn',
    'Đồ dùng thiết yếu',
    'Chăm sóc sức khỏe',
    'Đồ chơi',
    'Phụ kiện',
    'Cẩm nang sơ cứu',
  ];

  // State quản lý bằng Angular Signals
  readonly searchTerm = signal<string>('');
  readonly searchOpen = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly accountMenuOpen = signal<boolean>(false);
  readonly expandedMenu = signal<string>('');

  // Tự động tính toán gợi ý tìm kiếm
  readonly filteredSearchTerms = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('vi');
    if (!query) return [];
    return this.searchTerms
      .filter((term) => term.toLocaleLowerCase('vi').includes(query))
      .slice(0, 5);
  });

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeOverlays();
  }

  submitSearch(term = this.searchTerm()): void {
    const query = term.trim();
    this.closeOverlays();
    void this.router.navigate(['/search'], query ? { queryParams: { q: query } } : {});
  }

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
    this.mobileMenuOpen.set(false);
    this.accountMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
    this.searchOpen.set(false);
    this.accountMenuOpen.set(false);
  }

  toggleAccountMenu(): void {
    this.accountMenuOpen.update((v) => !v);
    this.mobileMenuOpen.set(false);
  }

  toggleExpandedMenu(label: string): void {
    this.expandedMenu.update((current) => (current === label ? '' : label));
  }

  navigateCategory(category: string): void {
    this.closeOverlays();
    void this.router.navigate(['/san-pham'], { queryParams: { category } });
  }

  logout(): void {
    this.closeOverlays();
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }

  closeOverlays(): void {
    this.searchOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.accountMenuOpen.set(false);
    this.expandedMenu.set('');
  }

  isCategoryLink(link: NavbarLink): boolean {
    return Boolean(link.category);
  }

  categoryFor(link: NavbarLink): string {
    return link.category ?? '';
  }
}