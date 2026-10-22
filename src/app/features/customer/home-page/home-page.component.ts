import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/customer/product-card/product-card.component';
import { Product } from '../../../core/customer/models/product.model';
import { Doctor, ServiceCard } from '../../../core/customer/models/service.model';
import { HomeFeaturedPost } from '../../../core/customer/models/blog.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly features = signal<string[]>([
    'Đội ngũ bác sĩ giàu kinh nghiệm',
    'Chăm sóc tận tâm, minh bạch',
    'Không gian thân thiện với thú cưng',
    'Dịch vụ và sản phẩm toàn diện',
  ]);

  readonly categories = signal([
    { name: 'Thức ăn', image: '/assets/customer/images/home/category1.png' },
    { name: 'Đồ chơi', image: '/assets/customer/images/home/category2.png' },
    { name: 'Chăm sóc', image: '/assets/customer/images/home/category3.png' },
    { name: 'Phụ kiện', image: '/assets/customer/images/home/category4.png' },
    { name: 'Sức khỏe', image: '/assets/customer/images/home/category5.png' },
  ]);

  readonly services = signal<ServiceCard[]>([
    {
      title: 'Khám và điều trị',
      text: 'Đội ngũ bác sĩ chuyên khoa cùng trang thiết bị hiện đại, chẩn đoán chính xác, điều trị tận tâm.',
      image: '/assets/customer/images/home/service-1.png',
      link: '/dich-vu/kham-dieu-tri',
    },
    {
      title: 'Grooming & Spa',
      text: 'Dịch vụ tắm sấy, cắt tỉa lông và chăm sóc vệ sinh giúp thú cưng luôn sạch sẽ, khỏe mạnh.',
      image: '/assets/customer/images/home/service-2.png',
      link: '/dich-vu/grooming-spa',
    },
    {
      title: 'Pet shop',
      text: 'Cung cấp đa dạng sản phẩm dành cho thú cưng như thức ăn, phụ kiện, đồ chơi uy tín.',
      image: '/assets/customer/images/home/service-3.png',
      link: '/cua-hang',
    },
  ]);

  readonly doctors = signal<Doctor[]>([
    { name: 'BS. Nguyễn Minh Anh', image: '/assets/customer/images/home/doctor-1.png' },
    { name: 'BS. Trần Quốc Huy', image: '/assets/customer/images/home/doctor-2.png' },
    { name: 'BS. Lê Khánh Linh', image: '/assets/customer/images/home/doctor-3.png' },
    { name: 'BS. Phạm Đức Thành', image: '/assets/customer/images/home/doctor-4.png' },
  ]);

  readonly products = signal<Product[]>(
    Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      name: `Sản phẩm chăm sóc thú cưng ${index + 1}`,
      category: ['Thức ăn', 'Đồ dùng thiết yếu', 'Chăm sóc sức khỏe'][index % 3],
      price: 45000 + index * 12500,
      image: '/assets/customer/images/home/product-placeholder.png',
      rating: 4.5,
      description: 'Mô tả sản phẩm',
      stock: 10,
    }))
  );

  readonly featuredPost = signal<HomeFeaturedPost>({
    author: 'John Doe',
    date: 'Aug 23, 2021',
    title: 'Mẹo chăm sóc thú cưng vào mùa hè oi bốt',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    image: '/assets/customer/images/home/blog-featured.png',
  });

  readonly latestPosts = signal([
    { author: 'John Doe', date: 'Aug 23, 2021', title: 'Cách nhận biết các bệnh phổ biến ở cún con', link: '/blog' },
    { author: 'John Doe', date: 'Aug 23, 2021', title: 'Top 5 loại vắc-xin cần thiết cho mèo', link: '/blog' },
    { author: 'John Doe', date: 'Aug 23, 2021', title: 'Chế độ dinh dưỡng hợp lý cho thú cưng trưởng thành', link: '/blog' },
  ]);

  onAddToCart(product: Product): void {
    // Gọi CartService hoặc StorefrontService ở đây
    console.log('Thêm vào giỏ:', product.name);
  }
}