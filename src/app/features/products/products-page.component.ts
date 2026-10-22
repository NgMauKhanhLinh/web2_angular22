import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type ShopProduct = {
  id: number; name: string; price: number; originalPrice: number;
  category: string; image: string; rating: number; discount?: number;
};

const CATEGORIES = [
  { id: 'food', name: 'Thức ăn', count: 9 },
  { id: 'essentials', name: 'Đồ dùng thiết yếu', count: 5 },
  { id: 'health', name: 'Chăm sóc sức khỏe', count: 2 },
  { id: 'toys', name: 'Đồ chơi', count: 2 },
  { id: 'accessories', name: 'Phụ kiện', count: 0 },
];
const PRICE_RANGES = [
  { label: '20.000đ - 50.000đ', min: 20000, max: 50000 },
  { label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
  { label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
  { label: '200.000đ trở lên', min: 200000, max: Infinity },
];
const PRODUCTS: ShopProduct[] = Array.from({ length: 40 }, (_, i) => {
  const price = [13000, 35000, 48000, 68000, 92000, 125000, 155000, 185000][i % 8];
  return {
    id: i + 1,
    name: ['ten sp', 'Thức ăn cho chó', 'Thức ăn cho mèo', 'Sản phẩm chăm sóc thú cưng'][i % 4],
    price,
    originalPrice: Math.round(price * 1.75),
    category: CATEGORIES[i % CATEGORIES.length].id,
    image: '/assets/customer/images/product/card-placeholder.png',
    rating: 3.5,
    discount: [2, 7, 13, 19, 26, 31].includes(i) ? 56 : undefined,
  };
});

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="catalog">
      <div class="breadcrumb"><a routerLink="/">Trang chủ</a><span>›</span><b>Danh mục sản phẩm</b></div>
      <h1>Danh mục sản phẩm của chúng tôi</h1>
      <div class="catalog-layout">
        <aside class="filters">
          <h2><span class="funnel">▼</span> Bộ lọc tìm kiếm</h2>
          <section class="filter-box">
            <h3>Danh mục</h3>
            <label class="filter-option"><input type="checkbox" [checked]="!selectedCategories().length" (change)="toggleAllCategories($event)"> <span>Tất cả danh mục ({{products().length}})</span></label>
            @for (category of categories; track category.id) {
              <label class="filter-option"><input type="checkbox" [checked]="selectedCategories().includes(category.id)" (change)="toggleCategory(category.id)"> <span>{{category.name}} ({{category.count}})</span></label>
            }
          </section>
          <section class="filter-box">
            <h3>Khoảng giá</h3>
            @for (range of priceRanges; track range.label; let i = $index) {
              <label class="filter-option"><input type="checkbox" [checked]="selectedPrices().includes(i)" (change)="togglePrice(i)"> <span>{{range.label}}</span></label>
            }
          </section>
          <button class="clear" type="button" (click)="clearFilters()">XÓA BỘ LỌC</button>
        </aside>
        <main class="results">
          <form class="search-row" (submit)="$event.preventDefault()">
            <label class="searchbox"><input [(ngModel)]="search" name="search" placeholder="Bạn đang tìm kiếm gì?"><button type="submit" aria-label="Tìm kiếm">⌕</button></label>
            <label class="sortbox"><span>☰</span><select [(ngModel)]="sortOrder" name="sort"><option value="">Sắp xếp giá</option><option value="asc">Giá tăng dần</option><option value="desc">Giá giảm dần</option></select></label>
          </form>
          <p class="result-label">Kết quả tìm kiếm cho {{search ? '“' + search + '”' : '...'}}</p>
          @if (filteredProducts().length) {
            <div class="product-grid">
              @for (product of visibleProducts(); track product.id) {
                <article class="product-card">
                  <a class="product-link" [routerLink]="['/product-details', product.id]" [queryParams]="{id: product.id}">
                    <div class="product-image"><img [src]="product.image" [alt]="product.name" loading="lazy">@if (product.discount) {<span class="discount">{{product.discount}}%<br>OFF</span>}</div>
                    <strong class="product-name">{{product.name}}</strong>
                    <div class="price-row"><span class="old-price">{{formatPrice(product.originalPrice)}}</span><b>{{formatPrice(product.price)}}</b></div>
                    <div class="rating" aria-label="Đánh giá 3 trên 5"><span>★ ★ ★</span><i>☆ ☆</i></div>
                  </a>
                  <button class="cart-button" type="button" [attr.aria-label]="'Thêm ' + product.name + ' vào giỏ hàng'" (click)="addToCart(product)">🛒</button>
                </article>
              }
            </div>
          } @else {
            <div class="empty"><span>⌕</span><h3>Không tìm thấy sản phẩm</h3><p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p><button class="clear" (click)="clearFilters()">Xóa bộ lọc</button></div>
          }
          <div class="load-more">
            <p>Hiển thị {{visibleProducts().length ? 1 : 0}}–{{visibleProducts().length}} trong {{filteredProducts().length}} sản phẩm</p>
            <div class="progress"><span [style.width.%]="visibleProducts().length / (filteredProducts().length || 1) * 100"></span></div>
            @if (visibleProducts().length < filteredProducts().length) {<button class="clear" (click)="loadMore()">XEM THÊM ›</button>}
          </div>
        </main>
      </div>
      @if (toast()) {<div class="toast">✓ {{toast()}}</div>}
    </div>
  `,
  styles: [`
    :host{display:block;color:#242424;font-family:Arial,Helvetica,sans-serif}
    *{box-sizing:border-box}
    .catalog{max-width:1440px;margin:0 auto;padding:18px clamp(18px,5.5vw,80px) 42px;background:linear-gradient(180deg,#fff 0%,#f7fcff 18%,#e5f6fd 100%);min-height:calc(100vh - 80px)}
    .breadcrumb{height:25px;display:flex;align-items:center;gap:10px;font-size:12px;color:#555;margin-bottom:14px}
    .breadcrumb a{color:#0d47a1;text-decoration:none}.breadcrumb span{font-size:22px;color:#8a8a8a}
    h1{text-align:center;font-size:28px;margin:8px 0 22px;font-weight:750;color:#414141}
    .catalog-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px;align-items:start}
    .filters{padding-top:2px}
    .filters h2{font-size:18px;margin:0 0 20px;display:flex;align-items:center;gap:12px;color:#171717;white-space:nowrap}
    .funnel{font-size:17px;transform:scaleX(.8)}
    .filter-box{border:1px solid rgba(25,118,210,.42);background:#fff;border-radius:26px;padding:24px 18px 22px;margin-bottom:20px}
    .filter-box h3{font-size:16px;color:#0d47a1;margin:0 0 20px;padding-left:11px;border-left:3px solid #0d47a1;line-height:1.2}
    .filter-option{display:flex;align-items:flex-start;gap:10px;margin:0 0 14px;font-size:12px;line-height:1.45;color:#515151;cursor:pointer}
    .filter-option:last-child{margin-bottom:0}.filter-option input{margin:1px 0 0;accent-color:#0d47a1;flex:0 0 auto}
    .clear{border:0;background:#ffeb3b;color:#111;border-radius:4px;box-shadow:0 2px 4px #0002;padding:11px 17px;font-size:11px;font-weight:700;cursor:pointer}
    .filters>.clear{display:block;margin:8px auto}
    .search-row{display:flex;gap:10px;margin:0 0 23px}
    .searchbox{height:53px;display:flex;align-items:center;min-width:0;flex:1;background:#fff;border:1px solid rgba(25,118,210,.4);border-radius:30px;padding:4px 8px 4px 18px}
    .searchbox input{width:100%;min-width:0;border:0;outline:none;font-size:13px;color:#414141;background:transparent}
    .searchbox button{height:38px;width:38px;border:0;border-radius:50%;background:#ffdf35;font-size:27px;line-height:1;cursor:pointer}
    .sortbox{width:150px;flex-shrink:0;height:53px;border:1px solid rgba(25,118,210,.4);border-radius:30px;background:#fff;display:flex;align-items:center;gap:9px;padding:0 12px;color:#444}
    .sortbox select{min-width:0;width:100%;border:0;outline:0;background:transparent;font-size:12px;font-weight:600;color:#414141}
    .result-label{font-size:12px;color:#555;margin:0 0 22px}
    .product-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:40px 12px}
    .product-card{position:relative;min-width:0;height:158px;padding:6px;border:1px solid #a9d3ff;border-radius:23px;background:#fff;box-shadow:2px 3px 3px #0003;transition:transform .18s,box-shadow .18s}
    .product-card:hover{transform:translateY(-2px);box-shadow:0 5px 12px #0d47a133}
    .product-link{display:block;color:inherit;text-decoration:none}
    .product-image{position:relative;height:83px;border:1px solid #a9d3ff;border-radius:15px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff}
    .product-image img{width:100%;height:100%;object-fit:contain}
    .discount{position:absolute;right:0;top:0;background:#0754a5;color:#fff;border-radius:0 0 0 9px;font-size:9px;line-height:1.2;text-align:center;padding:5px 4px}
    .product-name{display:block;font-size:11px;font-weight:700;margin:7px 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:22px}
    .price-row{display:flex;gap:4px;align-items:center;font-size:9px;white-space:nowrap;overflow:hidden}
    .old-price{color:#777;text-decoration:line-through;font-size:8px}.price-row b{font-size:9px}
    .rating{margin-top:5px;font-size:17px;letter-spacing:-2px;white-space:nowrap;line-height:1;color:#ff9800}.rating i{font-style:normal;color:#b9b9b9}
    .cart-button{position:absolute;right:7px;bottom:40px;width:27px;height:27px;border:0;border-radius:50%;background:#ffdf22;display:grid;place-items:center;font-size:15px;cursor:pointer;box-shadow:0 1px 2px #0002}
    .load-more{display:flex;flex-direction:column;align-items:center;gap:20px;margin:38px auto 0;max-width:500px;text-align:center}
    .load-more p{font-size:12px;color:#555;margin:0}
    .progress{height:2px;background:#90caf9;width:100%;position:relative}.progress span{display:block;height:100%;background:#1976d2}
    .load-more .clear{padding:12px 18px}
    .empty{min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#64748b}
    .empty>span{font-size:45px;color:#0d47a1}.empty h3{color:#263238;margin:10px 0 0}.empty p{font-size:13px}
    .toast{position:fixed;right:24px;bottom:24px;z-index:1000;background:#176b47;color:white;padding:14px 20px;border-radius:8px;box-shadow:0 5px 20px #0002;font-size:14px}
    @media(min-width:1200px){.catalog{padding-left:80px;padding-right:80px}.catalog-layout{grid-template-columns:245px minmax(0,1fr);gap:32px}.product-card{height:158px}.product-image{height:83px}}
    @media(max-width:1050px){.catalog-layout{grid-template-columns:190px minmax(0,1fr);gap:18px}.filter-box{padding:20px 14px;border-radius:22px}.product-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 10px}.sortbox{width:140px}}
    @media(max-width:760px){.catalog{padding:12px 14px 30px}.breadcrumb{margin-bottom:10px}h1{font-size:23px;margin-bottom:18px}.catalog-layout{display:block}.filters{padding:0;margin-bottom:20px}.filters h2{font-size:16px;margin-bottom:12px}.filter-box{padding:16px;border-radius:18px;margin-bottom:12px}.filter-box h3{margin-bottom:13px}.filter-option{display:inline-flex;width:calc(50% - 8px);vertical-align:top;margin-bottom:10px;font-size:11px}.filters>.clear{margin:12px 0}.search-row{gap:7px}.searchbox{height:46px;padding-left:12px}.searchbox button{height:32px;width:32px}.sortbox{height:46px;width:125px;padding:0 9px;gap:5px}.sortbox select{font-size:10px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 12px}.product-card{height:168px;padding:7px;border-radius:20px}.product-image{height:91px}.product-name{font-size:12px}.price-row{font-size:10px}.cart-button{bottom:42px}.load-more{margin-top:28px}.result-label{margin-bottom:16px}}
    @media(min-width:761px) and (max-width:900px){.catalog-layout{grid-template-columns:165px minmax(0,1fr);gap:14px}.product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.filters h2{font-size:15px}.filter-option{font-size:11px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  readonly categories = CATEGORIES;
  readonly priceRanges = PRICE_RANGES;
  readonly products = signal(PRODUCTS);
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedPrices = signal<number[]>([]);
  readonly search = signal('');
  readonly sortOrder = signal('');
  readonly displayCount = signal(20);
  readonly toast = signal('');

  readonly filteredProducts = computed(() => {
    const keyword = this.search().trim().toLocaleLowerCase('vi');
    const categories = this.selectedCategories();
    const prices = this.selectedPrices();
    const sort = this.sortOrder();
    const rows = this.products().filter(product => {
      if (categories.length && !categories.includes(product.category)) return false;
      if (prices.length && !prices.some(index => product.price >= PRICE_RANGES[index].min && product.price < PRICE_RANGES[index].max)) return false;
      if (keyword && !product.name.toLocaleLowerCase('vi').includes(keyword)) return false;
      return true;
    });
    if (sort === 'asc') rows.sort((a, b) => a.price - b.price);
    if (sort === 'desc') rows.sort((a, b) => b.price - a.price);
    return rows;
  });
  readonly visibleProducts = computed(() => this.filteredProducts().slice(0, this.displayCount()));

  toggleAllCategories(event: Event): void {
    if ((event.target as HTMLInputElement).checked) this.selectedCategories.set([]);
  }
  toggleCategory(id: string): void {
    this.selectedCategories.update(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    this.displayCount.set(20);
  }
  togglePrice(index: number): void {
    this.selectedPrices.update(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
    this.displayCount.set(20);
  }
  clearFilters(): void {
    this.selectedCategories.set([]); this.selectedPrices.set([]); this.search.set(''); this.sortOrder.set(''); this.displayCount.set(20);
  }
  loadMore(): void { this.displayCount.update(count => count + 20); }
  formatPrice(price: number): string { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price) + 'đ'; }
  addToCart(product: ShopProduct): void {
    this.toast.set('Đã thêm ' + product.name + ' vào giỏ hàng (bản xem trước).');
    setTimeout(() => this.toast.set(''), 2400);
  }
}
