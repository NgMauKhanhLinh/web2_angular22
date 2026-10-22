import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-pet-profile-page',
  standalone: true,
  template: `
    <main class="pets-page">
      <header class="page-heading"><div><p class="eyebrow">HỒ SƠ THÚ CƯNG</p><h1>Những người bạn nhỏ</h1><p>Lưu giữ thông tin và theo dõi hành trình chăm sóc sức khỏe của các bé.</p></div><button class="add-button" type="button" (click)="showForm.update(v => !v)">＋ Thêm thú cưng</button></header>
      @if (showForm()) {
        <section class="pet-form"><div class="form-title"><div><h2>Thêm hồ sơ mới</h2><p>Nhập thông tin cơ bản của thú cưng.</p></div><button type="button" class="close" (click)="showForm.set(false)" aria-label="Đóng">×</button></div>
          <form (submit)="addPet($event)"><label>Tên thú cưng<input name="name" required maxlength="60" placeholder="Ví dụ: Bông"></label><label>Loài<select name="species"><option value="Chó">Chó</option><option value="Mèo">Mèo</option><option value="Khác">Khác</option></select></label><label>Giống<input name="breed" placeholder="Ví dụ: Corgi"></label><label>Ngày sinh<input name="birthDate" type="date"></label><button class="add-button" type="submit">Tạo hồ sơ</button></form>
        </section>
      }
      @if (pets().length) {
        <section class="pet-grid">@for (pet of pets(); track pet.id) { <article class="pet-card"><div class="pet-illustration">{{ pet.species === 'Mèo' ? '🐱' : pet.species === 'Chó' ? '🐶' : '🐾' }}</div><div class="pet-content"><span class="species">{{ pet.species }}</span><h2>{{ pet.name }}</h2><p>{{ pet.breed || 'Chưa cập nhật giống' }}</p><div class="pet-meta"><span>🎂 {{ pet.birthDate || 'Chưa rõ ngày sinh' }}</span></div><button type="button" class="details" (click)="selectedPet.set(pet.id)">Xem hồ sơ <span>→</span></button>@if (selectedPet() === pet.id) { <p class="local-note">Hồ sơ này đang được lưu tạm trong phiên giao diện. Cần tích hợp API thú cưng để đồng bộ dữ liệu.</p> }</div></article> }</section>
      } @else {
        <section class="empty-state"><div class="empty-art">🐾</div><h2>Chưa có hồ sơ thú cưng</h2><p>Thêm thông tin bé yêu của bạn để tiện theo dõi sức khỏe và đặt lịch khám.</p><button type="button" class="add-button" (click)="showForm.set(true)">Thêm hồ sơ đầu tiên</button></section>
      }
      <p class="data-note">Lưu ý: dữ liệu thêm mới hiện chỉ dùng để xem thử giao diện, chưa được lưu lên máy chủ.</p>
    </main>`,
  styles: [`
    :host{display:block;color:#203444}.pets-page{max-width:1100px;margin:0 auto;padding:42px 22px 70px}.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow{color:#1685bd;font-size:11px;font-weight:750;letter-spacing:1.4px;margin:0 0 8px}.page-heading h1{font-size:clamp(26px,4vw,36px);margin:0 0 8px}.page-heading p:last-child{color:#718392;margin:0;line-height:1.6}.add-button{border:0;border-radius:10px;background:#ffdc45;color:#263846;padding:13px 18px;font-weight:750;white-space:nowrap;cursor:pointer}.empty-state{display:flex;flex-direction:column;align-items:center;text-align:center;padding:54px 20px;background:#f7fbfd;border:1px dashed #c8dfe9;border-radius:20px}.empty-art{display:grid;place-items:center;width:100px;height:100px;border-radius:50%;background:#e4f6ff;font-size:45px}.empty-state h2{font-size:22px;margin:20px 0 8px}.empty-state p{max-width:430px;color:#738391;line-height:1.7;margin:0 0 22px}.pet-form{background:#fff;border:1px solid #e1eaf0;border-radius:16px;padding:22px;margin-bottom:20px;box-shadow:0 10px 30px #18364d08}.form-title{display:flex;justify-content:space-between;align-items:start}.form-title h2{margin:0 0 6px;font-size:20px}.form-title p{margin:0 0 20px;color:#718392}.close{border:0;background:transparent;font-size:25px;cursor:pointer}.pet-form form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pet-form label{display:grid;gap:7px;color:#526473;font-size:13px;font-weight:650}.pet-form input,.pet-form select{box-sizing:border-box;width:100%;height:43px;border:1px solid #d8e3ea;border-radius:8px;padding:0 11px;background:#fff;font:inherit;color:#203444}.pet-form form>button{justify-self:start;align-self:end}.pet-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.pet-card{border:1px solid #e3ebf0;border-radius:17px;overflow:hidden;background:#fff;box-shadow:0 10px 30px #18364d08}.pet-illustration{height:155px;display:grid;place-items:center;background:linear-gradient(135deg,#e5f7ff,#f5fbff);font-size:78px}.pet-content{padding:19px}.species{font-size:11px;font-weight:750;color:#0b82ba;background:#e9f7ff;border-radius:30px;padding:5px 9px}.pet-content h2{font-size:21px;margin:12px 0 4px}.pet-content>p{margin:0;color:#758492;font-size:13px}.pet-meta{margin:16px 0;color:#5f7180;font-size:12px}.details{width:100%;display:flex;justify-content:space-between;align-items:center;background:#f7fafc;border:1px solid #e5edf2;border-radius:8px;padding:10px 12px;color:#187ead;font-weight:700;cursor:pointer}.local-note{margin-top:12px!important;line-height:1.5;color:#8a6b16!important}.data-note{text-align:center;font-size:12px;color:#84929e;margin:20px 0 0}@media(max-width:760px){.pets-page{padding:28px 14px}.page-heading{align-items:flex-start;flex-direction:column}.pet-grid{grid-template-columns:1fr}.pet-form form{grid-template-columns:1fr}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfilePageComponent {
  readonly showForm = signal(false);
  readonly selectedPet = signal<number | null>(null);
  readonly pets = signal<Array<{id:number;name:string;species:string;breed:string;birthDate:string}>>([]);
  private nextId = 1;
  addPet(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    this.pets.update(items => [...items, {
      id: this.nextId++,
      name: String(data.get('name') ?? '').trim(),
      species: String(data.get('species') ?? 'Chó'),
      breed: String(data.get('breed') ?? '').trim(),
      birthDate: String(data.get('birthDate') ?? ''),
    }]);
    form.reset();
    this.showForm.set(false);
  }
}
