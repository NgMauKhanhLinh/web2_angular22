import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

const ASSET = '/assets/customer/images/grooming/';
const SERVICES = [
  { title: 'Tắm & Sấy khô', description: 'Sữa tắm cao cấp phù hợp với từng loại da và màu lông của bé.', price: 'Từ 50.000đ', image: 'service-bath-55474c.png' },
  { title: 'Massage chuyên sâu', description: 'Massage nhẹ nhàng giúp thú cưng thư giãn và thoải mái.', price: 'Từ 50.000đ', image: 'service-massage.png' },
  { title: 'Vệ sinh răng miệng', description: 'Làm sạch mảng bám, chăm sóc răng và khử mùi hôi miệng.', price: 'Từ 30.000đ', image: 'service-teeth.png' },
  { title: 'Cắt & mài móng', description: 'Cắt móng đúng kỹ thuật, mài mịn các góc sắc nhọn.', price: 'Từ 30.000đ', image: 'service-nail.png' },
  { title: 'Chăm sóc bàn chân', description: 'Vệ sinh kẽ móng và chăm sóc phần đệm chân của bé.', price: 'Từ 30.000đ', image: 'service-paw-care.png' },
  { title: 'Điều trị ký sinh trùng', description: 'Hỗ trợ làm sạch ve rận và chăm sóc da lông.', price: 'Từ 80.000đ', image: 'service-parasite.png' },
  { title: 'Cắt tỉa tạo kiểu', description: 'Tạo kiểu theo yêu cầu và đặc điểm của từng giống thú cưng.', price: 'Từ 50.000đ', image: 'service-grooming-56586a.png' },
  { title: 'Nhuộm lông thời trang', description: 'Tạo điểm nhấn cho bé với màu sắc nổi bật.', price: 'Từ 80.000đ', image: 'service-dye-f15f02.png' },
  { title: 'Vắt tuyến hôi', description: 'Chăm sóc vệ sinh, giúp giảm mùi khó chịu.', price: 'Từ 50.000đ', image: 'service-scent.png' },
];
const FAQS = [
  { q: 'Bao lâu thì nên tắm cho thú cưng?', a: 'Với chó, tắm khoảng mỗi tháng một lần thường là phù hợp; tránh tắm quá thường xuyên nếu không có chỉ định. Mèo thường tự làm sạch và chỉ cần tắm khi thực sự cần thiết.' },
  { q: 'Thú cưng chưa tiêm phòng đầy đủ có được làm spa không?', a: 'Để đảm bảo an toàn cho thú cưng và các bé khác, spa có thể từ chối tiếp nhận khi chưa tiêm đủ các mũi vaccine cần thiết. Hãy liên hệ trước để được tư vấn.' },
  { q: 'Bao lâu thì nên cắt móng cho thú cưng?', a: 'Thông thường nên kiểm tra và cắt móng định kỳ khoảng 2–4 tuần/lần, tùy mức độ hoạt động và tốc độ mọc móng của mỗi bé.' },
  { q: 'Chủ nuôi có được ở lại xem quá trình làm spa không?', a: 'Bạn vui lòng hỏi chi nhánh khi đặt lịch. Nhân viên sẽ tư vấn phương án phù hợp để thú cưng cảm thấy bình tĩnh và an toàn.' },
  { q: 'Thú cưng nhát hoặc sợ nước có được nhận không?', a: 'Hãy thông báo trước với nhân viên về tính cách và tình trạng của bé để đội ngũ chuẩn bị cách tiếp cận nhẹ nhàng, phù hợp.' },
];
@Component({
  selector: 'app-grooming-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="grooming">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">DR. PET'S HOUSE · CHĂM SÓC THÚ CƯNG</span>
          <h1>Dịch vụ<br>Grooming &amp; Spa</h1>
          <p>Dịch vụ tắm sấy, cắt tỉa lông và chăm sóc vệ sinh giúp thú cưng luôn sạch sẽ, khỏe mạnh và thoải mái.</p>
          <div class="hero-actions"><a routerLink="/booking" class="primary">ĐẶT LỊCH NGAY</a><a href="#danh-sach-dich-vu" class="secondary">BẮT ĐẦU THÔI</a></div>
          <div class="hero-note"><span>✦</span> Dịu dàng chăm sóc, bé cưng luôn vui khỏe</div>
        </div>
        <div class="hero-art"><img class="hero-bg" [src]="asset + 'hero-bg.svg'" alt=""><img class="hero-pet" [src]="asset + 'hero-pet-composite.png'" alt="Chó được chăm sóc tại Dr. Pet's House"><img class="hero-paw" [src]="asset + 'hero-paw-4a83ed.png'" alt=""></div>
      </section>

      <section class="services-section" id="danh-sach-dich-vu">
        <div class="section-heading"><span class="kicker">CHĂM SÓC TOÀN DIỆN</span><h2>Dịch vụ Grooming &amp; Spa</h2><p>Từ vệ sinh cơ bản đến làm đẹp tạo kiểu — mọi trải nghiệm đều được thiết kế cho sự thoải mái của bé.</p></div>
        <div class="service-grid">
          @for (service of services; track service.title; let i = $index) {
            <article class="service-card" [class.alt]="i % 3 === 1">
              <div class="service-image"><img [src]="asset + service.image" [alt]="service.title" loading="lazy"><span class="service-number">0{{i + 1}}</span></div>
              <div class="service-copy"><h3>{{service.title}}</h3><p>{{service.description}}</p><div class="service-bottom"><strong>{{service.price}}</strong><a routerLink="/booking" [queryParams]="{service: service.title}" aria-label="Đặt lịch dịch vụ">↗</a></div></div>
            </article>
          }
        </div>
      </section>

      <section class="banner">
        <div><span>YÊU THƯƠNG TRONG TỪNG CHI TIẾT</span><h2>Cho bé một ngày thật<br>thơm tho và hạnh phúc!</h2><p>Đội ngũ chăm sóc tận tâm, quy trình nhẹ nhàng và sản phẩm phù hợp cho thú cưng.</p><a routerLink="/booking" class="primary">ĐẶT LỊCH CHO BÉ</a></div>
        <img [src]="asset + 'banner-dog.png'" alt="Thú cưng sau khi grooming" loading="lazy">
      </section>

      <section class="why-section">
        <div class="why-art"><img [src]="asset + 'whyus-bg-full.png'" alt="" class="why-bg"><img [src]="asset + 'whyus-main.png'" alt="Chuyên viên chăm sóc thú cưng" class="why-main"><img [src]="asset + 'whyus-secondary-54616e.png'" alt="" class="why-secondary"></div>
        <div class="why-copy"><span class="kicker">VÌ BÉ XỨNG ĐÁNG ĐƯỢC YÊU THƯƠNG</span><h2>Vì sao chọn<br>Dr. Pet's House?</h2>
          <div class="reason"><b>01</b><div><h3>Sản phẩm chăm sóc an toàn</h3><p>Ưu tiên sự an toàn và thoải mái, lựa chọn sản phẩm chăm sóc phù hợp cho từng bé.</p></div></div>
          <div class="reason"><b>02</b><div><h3>Chuyên viên tận tâm</h3><p>Đội ngũ yêu động vật, thao tác nhẹ nhàng và quan tâm đến cảm xúc của thú cưng.</p></div></div>
          <div class="reason"><b>03</b><div><h3>Chi phí rõ ràng</h3><p>Bảng giá minh bạch, tư vấn trước khi thực hiện để bạn an tâm lựa chọn.</p></div></div>
        </div>
      </section>

      <section class="combo-section">
        <div class="section-heading"><span class="kicker">TIẾT KIỆM HƠN CHO BÉ</span><h2>Combo chăm sóc nổi bật</h2><p>Chọn gói chăm sóc phù hợp với nhu cầu của thú cưng.</p></div>
        <div class="combo-grid">
          <article class="combo-card bath"><img [src]="asset + 'combo-bath-6a132a.png'" alt="" loading="lazy"><span>01 · LÀM SẠCH</span><h3>Combo Tắm 11 bước</h3><p>Làm sạch toàn diện từ da, lông đến vệ sinh cơ bản.</p><strong>Từ 150.000đ</strong><a routerLink="/booking" [queryParams]="{service: 'Combo Tắm 11 bước'}">Chọn combo <span>↗</span></a></article>
          <article class="combo-card groom"><img [src]="asset + 'combo-grooming.png'" alt="" loading="lazy"><span>02 · LÀM ĐẸP</span><h3>Combo Tắm &amp; Cắt tỉa</h3><p>Tắm sạch, sấy bông và tạo kiểu gọn gàng cho bé.</p><strong>Từ 100.000đ</strong><a routerLink="/booking" [queryParams]="{service: 'Combo Tắm và Cắt tỉa'}">Chọn combo <span>↗</span></a></article>
          <article class="combo-card nail"><img [src]="asset + 'combo-nail.png'" alt="" loading="lazy"><span>03 · CHĂM SÓC</span><h3>Combo chăm sóc móng</h3><p>Cắt, mài móng và chăm sóc bàn chân nhẹ nhàng.</p><strong>Từ 80.000đ</strong><a routerLink="/booking" [queryParams]="{service: 'Combo chăm sóc móng'}">Chọn combo <span>↗</span></a></article>
        </div>
      </section>

      <section class="faq-section">
        <div class="faq-intro"><span class="kicker">BẠN CÓ THỂ ĐANG THẮC MẮC</span><h2>Câu hỏi thường gặp</h2><p>Một vài thông tin hữu ích để bạn chuẩn bị cho buổi spa đầu tiên của bé.</p><img [src]="asset + 'faq-img1.png'" alt="" loading="lazy"></div>
        <div class="faq-list">@for (faq of faqs; track faq.q; let i = $index) {<article class="faq-item" [class.open]="openFaq() === i"><button (click)="toggleFaq(i)" [attr.aria-expanded]="openFaq() === i"><span>{{faq.q}}</span><b>{{openFaq() === i ? '−' : '+'}}</b></button>@if (openFaq() === i) {<p>{{faq.a}}</p>}</article>}</div>
      </section>

      <section class="feedback">
        <img class="feedback-bg" [src]="asset + 'feedback-bg.png'" alt="">
        <div class="section-heading"><span class="kicker">LỜI YÊU THƯƠNG TỪ KHÁCH HÀNG</span><h2>Ba mẹ nói gì về chúng mình?</h2></div>
        <div class="feedback-grid"><article><div class="stars">★★★★★</div><p>“Các bạn rất nhẹ nhàng và kiên nhẫn với bé nhà mình. Bé thơm tho, sạch sẽ và trông rất vui sau buổi spa.”</p><div class="reviewer"><img [src]="asset + 'feedback-avatar.png'" alt=""><div><b>Khách hàng Dr. Pet's House</b><span>Khách hàng thân thiết</span></div></div></article><article><div class="stars">★★★★★</div><p>“Quy trình chăm sóc chu đáo, tư vấn rõ ràng. Mình rất yên tâm khi gửi bé đến đây.”</p><div class="reviewer"><img [src]="asset + 'feedback-avatar.png'" alt=""><div><b>Ba mẹ của bé cưng</b><span>Khách hàng Grooming &amp; Spa</span></div></div></article><article><div class="stars">★★★★★</div><p>“Bé được cắt tỉa gọn gàng, nhân viên thân thiện và không gian sạch sẽ. Chắc chắn sẽ quay lại.”</p><div class="reviewer"><img [src]="asset + 'feedback-avatar.png'" alt=""><div><b>Gia đình thú cưng</b><span>Khách hàng Grooming &amp; Spa</span></div></div></article></div>
      </section>
      <section class="last-cta"><div><h2>Sẵn sàng cho diện mạo mới của bé?</h2><p>Đặt lịch ngay để chúng mình chăm sóc người bạn nhỏ của bạn.</p></div><a routerLink="/booking" class="primary">ĐẶT LỊCH NGAY <span>↗</span></a></section>
    </main>
  `,
  styles: [`
    :host{display:block;color:#172033;font-family:Roboto,Arial,sans-serif;--blue:#8fcdf6;--pale:#e5f6fd;--yellow:#fdd835;--navy:#103f87}*{box-sizing:border-box}.grooming{overflow:hidden;background:#fff}.hero{max-width:1440px;min-height:620px;margin:0 auto;padding:62px clamp(24px,8.3vw,120px) 52px;display:grid;grid-template-columns:1fr 1fr;gap:55px;align-items:center;position:relative}.hero:before{content:"";position:absolute;inset:0 0 12% 0;background:#e5f6fd;clip-path:ellipse(88% 77% at 36% 10%);z-index:0}.hero-copy{position:relative;z-index:1;padding:18px 0 40px}.eyebrow,.kicker{font-size:12px;font-weight:800;letter-spacing:1.5px;color:#1763a8}.hero h1{font-size:clamp(42px,4.4vw,64px);line-height:1.05;letter-spacing:-1.5px;color:#0f172a;margin:22px 0 24px;font-weight:850}.hero-copy>p{font-size:19px;line-height:1.65;max-width:570px;margin:0;color:#26364b}.hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-top:34px}.primary,.secondary{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:5px;font-size:13px;font-weight:800;letter-spacing:.4px;text-decoration:none;box-shadow:0 3px 8px #0002;transition:.2s}.primary{background:#fdd835;color:#111}.secondary{background:#fff9c4;color:#111}.primary:hover,.secondary:hover{transform:translateY(-2px);box-shadow:0 7px 15px #0002}.hero-note{margin-top:34px;color:#31526b;font-size:13px}.hero-note span{color:#f4bf00;font-size:22px;margin-right:8px}.hero-art{position:relative;min-width:0;height:480px;display:grid;place-items:center;z-index:1}.hero-bg{position:absolute;width:115%;height:100%;object-fit:contain;inset:0 -5%}.hero-pet{position:relative;width:100%;height:100%;object-fit:contain;z-index:1}.hero-paw{position:absolute;width:62px;height:62px;left:0;bottom:24px;object-fit:contain;z-index:2}
    .services-section,.combo-section{padding:90px clamp(20px,6vw,86px);max-width:1440px;margin:auto}.section-heading{text-align:center;max-width:720px;margin:0 auto 46px}.section-heading h2,.why-copy h2,.faq-intro h2{font-size:clamp(30px,3vw,42px);line-height:1.12;color:#12264b;margin:12px 0 14px;font-weight:850;letter-spacing:-.7px}.section-heading p{font-size:15px;line-height:1.7;color:#627084;margin:0}.service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}.service-card{border:1px solid #d5eafa;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 8px 24px #174d7510;transition:transform .2s,box-shadow .2s}.service-card:hover{transform:translateY(-5px);box-shadow:0 14px 30px #174d7520}.service-image{height:230px;position:relative;background:#e7f6fd;overflow:hidden}.service-card.alt .service-image{background:#fff7d6}.service-image img{width:100%;height:100%;object-fit:contain;padding:15px}.service-number{position:absolute;top:14px;left:16px;color:#1763a8;font-size:12px;font-weight:800;letter-spacing:1px}.service-copy{padding:22px 22px 20px}.service-copy h3{font-size:19px;margin:0 0 10px;color:#142c52}.service-copy p{font-size:13px;line-height:1.65;color:#667085;min-height:43px;margin:0 0 18px}.service-bottom{border-top:1px solid #edf1f5;padding-top:16px;display:flex;align-items:center;justify-content:space-between}.service-bottom strong{font-size:15px;color:#1459a6}.service-bottom a{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#fdd835;color:#111;text-decoration:none;font-size:19px}
    .banner{max-width:1260px;margin:10px auto 45px;min-height:320px;border-radius:28px;background:#fdd835;display:grid;grid-template-columns:1fr .85fr;align-items:center;overflow:hidden;padding:44px clamp(24px,5vw,70px);position:relative}.banner:before{content:"";position:absolute;width:340px;height:340px;border:1px solid #fff7;border-radius:50%;left:36%;top:-220px}.banner>div{position:relative;z-index:1}.banner>div>span{font-size:11px;font-weight:900;letter-spacing:1.4px}.banner h2{font-size:clamp(28px,3vw,40px);line-height:1.15;margin:14px 0;color:#14233c}.banner p{max-width:480px;line-height:1.65;font-size:14px;color:#3d4552;margin:0 0 24px}.banner img{width:100%;height:290px;object-fit:contain;position:relative;z-index:1}.banner .primary{background:#fff;border-radius:5px}
    .why-section{background:#e5f6fd;display:grid;grid-template-columns:1fr 1fr;gap:55px;align-items:center;padding:85px clamp(24px,8vw,115px);position:relative}.why-art{height:520px;position:relative;display:grid;place-items:center}.why-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.why-main{position:relative;width:80%;height:86%;object-fit:contain;z-index:1}.why-secondary{position:absolute;width:34%;height:40%;object-fit:contain;right:0;bottom:0;z-index:2}.why-copy h2{font-size:clamp(34px,3.4vw,46px);margin-bottom:30px}.reason{display:grid;grid-template-columns:48px 1fr;gap:14px;margin:23px 0}.reason>b{width:42px;height:42px;border-radius:12px;background:#fff;color:#1763a8;display:grid;place-items:center;font-size:13px;box-shadow:0 3px 8px #0001}.reason h3{font-size:17px;margin:0 0 7px;color:#18375b}.reason p{font-size:13px;line-height:1.7;color:#5d6c7c;margin:0}
    .combo-section{padding-top:90px}.combo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.combo-card{position:relative;min-height:360px;padding:28px;border-radius:22px;overflow:hidden;isolation:isolate;background:#e8f2ff}.combo-card.groom{background:#e0faf4}.combo-card.nail{background:#fff5d7}.combo-card:after{content:"";position:absolute;width:230px;height:230px;border-radius:50%;right:-100px;top:-100px;background:#fff8;z-index:-1}.combo-card img{position:absolute;right:0;top:0;width:55%;height:58%;object-fit:contain;z-index:-1}.combo-card>span{display:block;font-size:10px;font-weight:900;letter-spacing:1.2px;color:#2866a9;margin:95px 0 10px}.combo-card h3{font-size:22px;color:#13294a;margin:0 0 10px}.combo-card p{font-size:13px;line-height:1.6;color:#5c6879;max-width:280px;min-height:42px}.combo-card>strong{display:block;color:#125ba8;font-size:16px;margin:18px 0}.combo-card>a{display:flex;justify-content:space-between;align-items:center;color:#14233c;text-decoration:none;border-top:1px solid #13294a25;padding-top:14px;font-size:12px;font-weight:800}.combo-card>a span{font-size:20px}
    .faq-section{padding:85px clamp(24px,8vw,115px);display:grid;grid-template-columns:.8fr 1.2fr;gap:70px;align-items:center;background:#f9fcff}.faq-intro h2{font-size:clamp(32px,3vw,42px)}.faq-intro p{font-size:14px;line-height:1.7;color:#627084}.faq-intro img{width:190px;height:150px;object-fit:contain;margin-top:15px}.faq-item{border-bottom:1px solid #dce7f0}.faq-item:first-child{border-top:1px solid #dce7f0}.faq-item>button{width:100%;border:0;background:transparent;padding:20px 0;display:flex;align-items:center;justify-content:space-between;gap:20px;text-align:left;color:#20334d;font-size:15px;font-weight:700;cursor:pointer}.faq-item>button b{font-size:23px;color:#1763a8;flex-shrink:0}.faq-item>p{font-size:13px;line-height:1.8;color:#64748b;margin:0;padding:0 30px 20px 0}.faq-item.open>button{color:#1763a8}
    .feedback{position:relative;padding:82px clamp(20px,7vw,100px) 90px;overflow:hidden;background:#e5f6fd}.feedback-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.23;pointer-events:none}.feedback .section-heading,.feedback-grid{position:relative;z-index:1}.feedback-grid{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.feedback-grid article{background:#fff;border-radius:18px;padding:25px 24px;box-shadow:0 8px 24px #163c5b0d}.stars{color:#ffba08;letter-spacing:3px;font-size:15px}.feedback-grid article>p{font-size:13px;line-height:1.8;color:#596779;min-height:92px}.reviewer{display:flex;gap:12px;align-items:center;border-top:1px solid #eef2f6;padding-top:15px}.reviewer img{width:42px;height:42px;object-fit:contain;border-radius:50%;background:#e5f6fd}.reviewer b,.reviewer span{display:block;font-size:11px}.reviewer b{color:#243b59}.reviewer span{color:#8b96a5;margin-top:4px}.last-cta{max-width:1260px;margin:65px auto;padding:30px clamp(22px,4vw,55px);border-radius:20px;background:#142b4d;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:24px}.last-cta h2{font-size:clamp(22px,2.5vw,32px);margin:0 0 9px}.last-cta p{font-size:13px;color:#d2dfef;margin:0}.last-cta .primary{flex-shrink:0}
    @media(max-width:900px){.hero{gap:20px;padding-left:35px;padding-right:35px;min-height:550px}.hero-art{height:390px}.service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.why-section{gap:25px;padding-left:35px;padding-right:35px}.why-art{height:400px}.combo-grid{gap:14px}.combo-card{padding:20px}.faq-section{gap:30px;padding-left:35px;padding-right:35px}.banner{margin-left:20px;margin-right:20px}}
    @media(max-width:600px){.hero{grid-template-columns:1fr;gap:5px;padding:45px 22px 28px;min-height:0}.hero:before{inset:0 0 18% 0}.hero-copy{padding:0}.hero h1{font-size:43px;margin:16px 0}.hero-copy>p{font-size:16px}.hero-actions{margin-top:24px;gap:10px}.primary,.secondary{min-height:44px;padding:0 16px;font-size:11px}.hero-note{margin-top:22px}.hero-art{height:280px;margin-top:0}.hero-paw{width:42px;height:42px}.services-section,.combo-section{padding:55px 16px}.section-heading{margin-bottom:28px}.section-heading h2,.why-copy h2,.faq-intro h2{font-size:30px}.service-grid{grid-template-columns:1fr;gap:16px}.service-image{height:220px}.service-copy{padding:18px}.banner{grid-template-columns:1fr;margin:0 14px 28px;padding:28px 22px;gap:0}.banner img{height:190px;grid-row:1}.banner h2{font-size:30px}.why-section{grid-template-columns:1fr;gap:20px;padding:50px 20px}.why-art{height:280px;order:2}.why-copy{order:1}.reason{margin:18px 0}.combo-grid{grid-template-columns:1fr;gap:16px}.combo-card{min-height:330px}.combo-card>span{margin-top:95px}.faq-section{grid-template-columns:1fr;padding:55px 20px;gap:20px}.faq-intro img{display:none}.faq-item>button{font-size:13px;padding:17px 0}.feedback{padding:55px 16px}.feedback-grid{grid-template-columns:1fr;gap:12px}.feedback-grid article>p{min-height:0}.last-cta{margin:35px 14px;padding:24px;align-items:flex-start;flex-direction:column}.last-cta h2{font-size:25px}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroomingPageComponent {
  readonly asset = ASSET;
  readonly services = SERVICES;
  readonly faqs = FAQS;
  readonly openFaq = signal<number>(0);
  toggleFaq(index: number): void { this.openFaq.update(current => current === index ? -1 : index); }
}
