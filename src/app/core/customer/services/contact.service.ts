import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ContactBranch, ContactFormPayload } from '../models/contact.model';
import { ApiClientService } from '../../services/api-client.service';

const FALLBACK_BRANCHES: ContactBranch[] = [
  { id: '1', name: 'Chi nhánh 1', address: '669 Đỗ Mười, khu phố 13, Linh Xuân, Hồ Chí Minh', hours: '24/7', phone: '0987.654.321', email: '' },
  { id: '2', name: 'Chi nhánh 2', address: '530 Huỳnh Tấn Phát, Tân Thuận, Hồ Chí Minh', hours: '24/7', phone: '0123.456.789', email: '' },
];

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiClient = inject(ApiClientService);

  getFallbackBranches(): ContactBranch[] {
    return FALLBACK_BRANCHES.map((branch) => ({ ...branch }));
  }

  getBranches(): Observable<ContactBranch[]> {
    return this.apiClient.get<Array<Record<string, unknown>>>('/branches').pipe(
      map((data) =>
        data.map((branch, index) => ({
          id: String(branch['branch_id'] ?? branch['id'] ?? index + 1),
          name: String(branch['branch_name'] ?? branch['name'] ?? `Chi nhánh ${index + 1}`),
          address: String(branch['address'] ?? ''),
          hours: String(branch['operating_hours'] ?? branch['hours'] ?? '8:00 - 22:00'),
          phone: String(branch['phone'] ?? ''),
          email: String(branch['email'] ?? ''),
        }))
      )
    );
  }

  submitMessage(form: ContactFormPayload): Observable<unknown> {
    return this.apiClient.post('/contacts', {
      name: form.name.trim(),
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
  }
}