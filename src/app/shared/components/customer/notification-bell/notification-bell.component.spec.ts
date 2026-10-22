// import { ComponentFixture, TestBed } from '@angular/core';
// import { NotificationBellComponent } from './notification-bell.component';
// import { NotificationService } from '../../core/services/notification.service';
// import { of } from 'rxjs';

// describe('NotificationBellComponent', () => {
//   let component: NotificationBellComponent;
//   let fixture: ComponentFixture<NotificationBellComponent>;

//   const mockNotificationService = {
//     notifications: signal([]),
//     fetchNotifications: vi.fn(),
//     markAsRead: vi.fn(),
//     markAllAsRead: vi.fn(),
//   };

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [NotificationBellComponent],
//       providers: [
//         { provide: NotificationService, useValue: mockNotificationService },
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(NotificationBellComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create notification bell component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should toggle popup visibility', () => {
//     expect(component.isOpen()).toBe(false);
//     component.toggleOpen();
//     expect(component.isOpen()).toBe(true);
//   });
// });