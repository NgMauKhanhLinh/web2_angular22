import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="detail">
      <nav class="crumb"><a routerLink="/products">Danh mục sản phẩm</a><span>›</span><span>{{product().name}}</span></nav>
      <section class="detail-top">
        <div class="gallery">
          <div class="thumbs"><button class="thumb active"><img src="/assets/customer/images/product/card-placeholder.png" alt="Ảnh sản phẩm"></button><button class="thumb"><img src="/assets/customer/images/product/card-placeholder.png" alt="Ảnh sản phẩm"></button></div>
          <div class="main-image"><img src="/assets/customer/images/product/detail-image.png" alt="Ảnh chi tiết sản phẩm" onerror="this.src='/assets/customer/images/product/card-placeholder.png'"></div>
        </div>
        <div class="info">
          <h1>{{product().name}}</h1>
          <div class="review"><span>★★★★★</span> <small>(32 đánh giá)</small></div>
          <div class="price"><strong>{{formatPrice(product().price)}}</strong><del>{{formatPrice(product().price * 1.3)}}</del><span>-18%</span></div>
          <p class="description">Sản phẩm chăm sóc thú cưng được lựa chọn dành cho chó mèo. Thông tin chi tiết và hướng dẫn sử dụng sẽ được cập nhật theo sản phẩm.</p>
          <div class="variant"><b>Loại</b><button [class.chosen]="selectedVariant() === 0" (click)="selectedVariant.set(0)"></button><button [class.chosen]="selectedVariant() === 1" (click)="selectedVariant.set(1)"></button><button [class.chosen]="selectedVariant() === 2" (click)="selectedVariant.set(2)"></button></div>
          <div class="purchase">
            <label><span class="sr-only">Dung tích</span><select aria-label="Dung tích"><option>100ml</option><option>250ml</option><option>500ml</option></select></label>
            <div class="quantity"><button (click)="quantity.update(q => Math.max(1, q - 1))">−</button><span>{{quantity()}}</span><button (click)="quantity.update(q => q + 1)">＋</button></div>
            <button class="add" (click)="notice.set('Đã thêm sản phẩm vào giỏ hàng (bản xem trước).')">THÊM VÀO GIỎ HÀNG</button>
          </div>
          <button class="buy" (click)="notice.set('Chức năng mua ngay sẽ được kết nối với giỏ hàng.')">MUA NGAY</button>
          @if (notice()) {<p class="notice">{{notice()}}</p>}
          <div class="shipping"><span>♧</span> Miễn phí vận chuyển cho đơn hàng đủ điều kiện</div><div class="shipping"><span>◷</span> Giao hàng dự kiến: 2–4 ngày</div>
        </div>
      </section>
      <section class="description-block"><div class="tabs"><button [class.active]="tab() === 'description'" (click)="tab.set('description')">Mô tả</button><span>|</span><button [class.active]="tab() === 'reviews'" (click)="tab.set('reviews')">Đánh giá</button></div>@if(tab() === 'description'){<p>Sản phẩm dành cho thú cưng tại Dr. Pet’s House. Vui lòng xem hướng dẫn trên bao bì và lựa chọn sản phẩm phù hợp với độ tuổi, cân nặng và nhu cầu chăm sóc của thú cưng.</p><ul><li>Thông tin sản phẩm được cập nhật theo từng mặt hàng.</li><li>Bảo quản nơi khô ráo, thoáng mát.</li><li>Liên hệ đội ngũ chăm sóc khách hàng nếu cần tư vấn.</li></ul>}@else{<p>Chưa có đánh giá hiển thị cho sản phẩm này.</p>}</section>
      <section class="similar"><h2>Sản phẩm tương tự</h2><div class="similar-grid">@for (item of similar(); track item.id) {<a [routerLink]="['/product-details', item.id]" class="similar-card"><img src="/assets/customer/images/product/card-placeholder.png" alt=""><b>{{item.name}}</b><span>{{formatPrice(item.price)}}</span><span class="stars">★★★☆☆</span></a>}</div></section>
    </main>
  `,
  styles: [`
    :host{display:block;color:#414141;font-family:Arial,Helvetica,sans-serif}*{box-sizing:border-box}.detail{max-width:1280px;margin:auto;padding:24px clamp(18px,5.5vw,80px) 55px;background:#fff}.crumb{display:flex;gap:10px;align-items:center;font-size:12px;margin-bottom:22px}.crumb a{color:#0d47a1;text-decoration:none}.crumb span:nth-child(2){font-size:22px;color:#999}.detail-top{display:grid;grid-template-columns:1.15fr 1fr;gap:44px;min-height:420px}.gallery{display:grid;grid-template-columns:96px minmax(0,1fr);gap:18px;max-height:420px}.thumbs{display:flex;flex-direction:column;gap:12px}.thumb{height:100px;border:1px solid #ddd;border-radius:5px;background:#fff;overflow:hidden}.thumb.active{border:1px solid #90caf9}.thumb img,.main-image img{width:100%;height:100%;object-fit:contain}.main-image{height:410px;background:#fff;display:flex;align-items:center;justify-content:center}.main-image img{max-width:100%;max-height:100%}.info h1{font-size:26px;line-height:1.35;color:#0d47a1;margin:0 0 10px}.review{display:flex;align-items:center;gap:12px;margin-bottom:12px}.review span,.stars{color:#aaa;letter-spacing:1px}.review small{font-size:11px;color:#777}.price{display:flex;align-items:center;gap:12px;margin-bottom:20px}.price strong{font-size:25px;font-weight:500;color:#d32f2f}.price del{font-size:16px;color:#999}.price>span{background:#d32f2f;color:#fff;border-radius:12px;padding:3px 8px;font-size:11px}.description{font-size:13px;line-height:1.7;border-top:1px solid #eee;border-bottom:1px solid #eee;padding:18px 0;color:#555}.variant{display:flex;align-items:center;gap:16px;border-bottom:1px solid #eee;padding:16px 0}.variant b{margin-right:8px}.variant button{height:44px;width:56px;border:1px solid transparent;border-radius:9px;background:#f1f3f6;cursor:pointer}.variant button.chosen{border-color:#90caf9;background:#e5f6fd}.purchase{display:flex;gap:10px;align-items:center;margin-top:25px}.purchase select,.quantity{height:42px;background:#f4f6f8;border:0;border-radius:4px;padding:0 12px}.quantity{display:flex;align-items:center;gap:12px;padding:0 8px}.quantity button{border:0;background:none;font-size:18px;cursor:pointer}.add{flex:1;min-height:42px;background:#ffda36;border:0;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;padding:0 12px}.buy{width:100%;height:38px;margin-top:12px;border:1px solid #ffda36;border-radius:4px;background:#fff;color:#d6a900;font-size:11px;cursor:pointer}.shipping{display:flex;align-items:center;gap:12px;margin-top:16px;font-size:11px;color:#777}.shipping span{font-size:19px;color:#aaa}.notice{padding:10px;background:#e8f5e9;color:#276738;font-size:12px;border-radius:5px}.description-block{margin:46px calc(clamp(18px,5.5vw,80px) * -1) 0;padding:40px clamp(18px,5.5vw,80px);background:#e5f6fd;min-height:250px}.tabs{display:flex;gap:12px;align-items:center;margin-bottom:22px}.tabs button{border:0;background:none;font-size:20px;color:#999;padding:0;cursor:pointer}.tabs button.active{color:#0d47a1;font-weight:700}.tabs span{color:#777}.description-block p,.description-block li{font-size:13px;line-height:1.7;color:#626262}.similar{padding-top:36px}.similar h2{font-size:23px;color:#0d47a1;margin-bottom:24px}.similar-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}.similar-card{min-width:0;padding:8px;border:1px solid #b4d8fa;border-radius:20px;box-shadow:2px 3px 4px #0002;text-decoration:none;color:#222;display:flex;flex-direction:column;gap:7px;font-size:11px}.similar-card img{width:100%;height:105px;object-fit:contain;border:1px solid #c3e0fb;border-radius:12px}.similar-card b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.similar-card>span:not(.stars){font-weight:700}.similar-card .stars{color:#ff9800;font-size:15px}@media(max-width:760px){.detail{padding:16px}.detail-top{grid-template-columns:1fr;gap:25px}.gallery{grid-template-columns:65px minmax(0,1fr);gap:10px;max-height:300px}.thumb{height:70px}.main-image{height:290px}.info h1{font-size:22px}.purchase{flex-wrap:wrap}.add{min-width:150px}.description-block{margin-left:-16px;margin-right:-16px;padding:28px 16px}.similar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.similar-card img{height:120px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent {
  private route = inject(ActivatedRoute);
  readonly productId = Number(this.route.snapshot.paramMap.get('id') || 1);
  readonly products = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, name: ['ten sp', 'Thức ăn cho chó', 'Thức ăn cho mèo', 'Sản phẩm chăm sóc thú cưng'][i % 4], price: [13000, 35000, 48000, 68000, 92000, 125000][i % 6] }));
  readonly product = computed(() => this.products.find(p => p.id === this.productId) || this.products[0]);
  readonly similar = computed(() => this.products.filter(p => p.id !== this.product().id).slice(0, 6));
  readonly quantity = signal(1);
  readonly selectedVariant = signal(0);
  readonly tab = signal<'description' | 'reviews'>('description');
  readonly notice = signal('');
  formatPrice(price: number): string { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price); }
}
