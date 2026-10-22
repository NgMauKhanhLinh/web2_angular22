import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { AdminToastService } from '../services/admin-toast.service';
import { RouterLink } from '@angular/router';

/**
 * Shared Admin catalog chrome for Category and Product screens.
 * Render the header/sidebar once here so switching routes keeps pixel-identical
 * dimensions, image rendering and navigation placement.
 */
@Component({
  selector: 'app-admin-catalog-shell',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-catalog-shell.component.html',
  styleUrl: './admin-catalog-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCatalogShellComponent {
  readonly toast = inject(AdminToastService);
  @Input({ required: true }) activeItem!: 'categories' | 'products' | 'services' | 'branches' | 'staff';

  salesExpanded = false;
  servicesExpanded = false;
  operationsExpanded = false;
  contentExpanded = false;
  feedbackExpanded = false;

  ngOnInit(): void {
    this.salesExpanded = this.activeItem === 'categories' || this.activeItem === 'products';
    this.servicesExpanded = this.activeItem === 'services';
    this.operationsExpanded = this.activeItem === 'branches' || this.activeItem === 'staff';
  }

  toggleSales(): void {
    this.salesExpanded = !this.salesExpanded;
  }

  toggleServices(): void {
    this.servicesExpanded = !this.servicesExpanded;
  }

  toggleOperations(): void {
    this.operationsExpanded = !this.operationsExpanded;
  }

  toggleContent(): void {
    this.contentExpanded = !this.contentExpanded;
  }

  toggleFeedback(): void {
    this.feedbackExpanded = !this.feedbackExpanded;
  }
}
