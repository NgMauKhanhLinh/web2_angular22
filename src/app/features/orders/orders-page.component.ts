import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageTitleComponent } from '../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [PageTitleComponent],
  template: `
    <section class="route-page">
      <app-page-title
        title="Orders"
        subtitle="Customer order history route foundation."
      />

      <div class="route-page__status">
        <strong>Orders</strong>
        <p>This route is wired correctly. Business UI will be migrated in later tasks.</p>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .route-page {
        display: grid;
        gap: 24px;
      }

      .route-page__status {
        padding: 20px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #ffffff;
      }

      .route-page__status p {
        margin: 8px 0 0;
        color: #64748b;
        line-height: 1.6;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent {}
