// import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { finalize } from 'rxjs';
// import { AuthService } from '../../core/services/auth.service';
// import { UserProfileService } from '../../core/services/user-profile-service';
// import { UserAddressRecord, UserProfileRecord } from '../../core/models/user-profile.model';
// import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

// const PROFILE_KEY = 'userProfile';
// const ADDRESSES_KEY = 'userAddresses';

// const EMPTY_PROFILE: UserProfileRecord = {
//   userId: '',
//   fullName: '',
//   email: '',
//   phone: '',
//   gender: '',
//   birthDate: '',
// };

// type AddressModalMode = 'add' | 'edit';

// @Component({
//   selector: 'app-user-profile',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SidebarComponent],
//   templateUrl: './user-profile.component.html',
//   styleUrls: ['./user-profile.component.scss'],
// })
// export class UserProfileComponent implements OnInit, OnDestroy {
//   private readonly auth = inject(AuthService);
//   private readonly profileService = inject(UserProfileService);

//   readonly defaultAvatar = '/assets/images/profile/user-avatar.png';

//   // Signals quản lý State
//   readonly profile = signal<UserProfileRecord>(this.loadStored(PROFILE_KEY, EMPTY_PROFILE));
//   readonly addresses = signal<UserAddressRecord[]>(this.loadStored(ADDRESSES_KEY, []));
//   readonly avatarPreview = signal<string>('');
//   readonly message = signal<string>('');
//   readonly messageType = signal<'success' | 'error'>('success');
//   readonly isLoading = signal<boolean>(false);
//   readonly isSaving = signal<boolean>(false);

//   // Address Modal States
//   readonly showAddressModal = signal<boolean>(false);
//   readonly addressModalMode = signal<AddressModalMode>('add');
//   readonly editingAddressId = signal<string>('');
//   addressForm: UserAddressRecord = this.emptyAddress();

//   // Password Modal States
//   readonly showPasswordModal = signal<boolean>(false);
//   readonly isChangingPassword = signal<boolean>(false);
//   readonly passwordError = signal<string>('');
//   passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };

//   private messageTimeout?: ReturnType<typeof setTimeout>;

//   ngOnInit(): void {
//     this.isLoading.set(true);
//     this.profileService.getDefaultProfileData().subscribe({
//       next: (data) => {
//         this.profile.set(this.loadStored(PROFILE_KEY, data.profile));
//         this.addresses.set(this.loadStored(ADDRESSES_KEY, data.addresses));
//         this.loadAuthenticatedProfile();
//       },
//       error: (error: Error) => {
//         this.isLoading.set(false);
//         this.showMessage(`${error.message} Không thể tải dữ liệu tài khoản mẫu.`, 'error');
//       },
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.messageTimeout) clearTimeout(this.messageTimeout);
//     if (this.avatarPreview()) URL.revokeObjectURL(this.avatarPreview());
//   }

//   saveProfile(): void {
//     const currentProfile = this.profile();
//     if (!currentProfile.fullName.trim()) {
//       this.showMessage('Vui lòng nhập họ và tên.', 'error');
//       return;
//     }

//     const userId = currentProfile.userId;
//     this.isSaving.set(true);

//     if (!userId) {
//       this.persistProfile(currentProfile);
//       this.isSaving.set(false);
//       this.showMessage(
//         'Không tìm thấy tài khoản đang đăng nhập; thông tin chỉ được lưu trên thiết bị.',
//         'error',
//       );
//       return;
//     }

//     this.profileService
//       .updateProfile(userId, currentProfile)
//       .pipe(finalize(() => this.isSaving.set(false)))
//       .subscribe({
//         next: (saved) => {
//           this.persistProfile({ ...currentProfile, ...saved });
//           this.showMessage('Đã lưu thông tin người dùng.');
//         },
//         error: (error: Error) => {
//           this.persistProfile(currentProfile);
//           this.showMessage(`${error.message} Thông tin hiện chỉ được lưu trên thiết bị.`, 'error');
//         },
//       });
//   }

//   chooseAvatar(event: Event): void {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//       this.showMessage('Chỉ hỗ trợ tệp ảnh làm ảnh đại diện.', 'error');
//       return;
//     }
//     if (file.size > 4 * 1024 * 1024) {
//       this.showMessage('Ảnh đại diện không được vượt quá 4 MB.', 'error');
//       return;
//     }

//     if (this.avatarPreview()) URL.revokeObjectURL(this.avatarPreview());
//     this.avatarPreview.set(URL.createObjectURL(file));
//     this.showMessage('Ảnh đang được xem trước; ứng dụng chưa kết nối API tải ảnh lên.', 'error');
//   }

//   openAddressForm(address?: UserAddressRecord): void {
//     this.addressModalMode.set(address ? 'edit' : 'add');
//     this.editingAddressId.set(address?.id ?? '');
//     this.addressForm = address
//       ? { ...address }
//       : {
//           ...this.emptyAddress(),
//           name: this.profile().fullName,
//           phone: this.profile().phone,
//           email: this.profile().email,
//         };
//     this.showAddressModal.set(true);
//   }

//   saveAddress(): void {
//     if (
//       !this.addressForm.name.trim() ||
//       !this.addressForm.phone.trim() ||
//       !this.addressForm.address.trim()
//     ) {
//       this.showMessage('Vui lòng nhập tên người nhận, số điện thoại và địa chỉ.', 'error');
//       return;
//     }

//     const editing = this.addressModalMode() === 'edit';
//     const currentAddresses = this.addresses();

//     const nextAddress: UserAddressRecord = {
//       ...this.addressForm,
//       id: this.editingAddressId() || `address-${Date.now()}`,
//       isDefault: this.addressForm.isDefault || currentAddresses.length === 0,
//     };

//     let updatedList = nextAddress.isDefault
//       ? currentAddresses.map((item) => ({ ...item, isDefault: false }))
//       : [...currentAddresses];

//     const localSave = (addr: UserAddressRecord) => {
//       const finalAddresses = editing
//         ? updatedList.map((item) => (item.id === addr.id ? addr : item))
//         : [...updatedList, addr];

//       this.addresses.set(finalAddresses);
//       this.persistAddresses();
//       this.showAddressModal.set(false);
//     };

//     if (!nextAddress.id.startsWith('address-') && editing) {
//       this.profileService.updateAddress(nextAddress.id, nextAddress).subscribe({
//         next: (saved) => {
//           localSave(saved);
//           this.showMessage('Đã cập nhật địa chỉ.');
//         },
//         error: (error: Error) => {
//           localSave(nextAddress);
//           this.showMessage(`${error.message} Địa chỉ đã được cập nhật trên thiết bị.`, 'error');
//         },
//       });
//       return;
//     }

//     if (!editing && this.profile().userId) {
//       this.profileService.createAddress(this.profile().userId, nextAddress).subscribe({
//         next: (saved) => {
//           localSave(saved);
//           this.showMessage('Đã thêm địa chỉ mới.');
//         },
//         error: (error: Error) => {
//           localSave(nextAddress);
//           this.showMessage(`${error.message} Địa chỉ đã được lưu trên thiết bị.`, 'error');
//         },
//       });
//       return;
//     }

//     localSave(nextAddress);
//     this.showMessage(
//       editing ? 'Đã cập nhật địa chỉ trên thiết bị.' : 'Đã lưu địa chỉ trên thiết bị.',
//     );
//   }

//   deleteAddress(address: UserAddressRecord): void {
//     if (!window.confirm(`Bạn có chắc muốn xóa địa chỉ của ${address.name}?`)) return;

//     const removeLocally = () => {
//       let nextList = this.addresses().filter((item) => item.id !== address.id);
//       if (address.isDefault && nextList.length) {
//         nextList = nextList.map((item, idx) => (idx === 0 ? { ...item, isDefault: true } : item));
//       }
//       this.addresses.set(nextList);
//       this.persistAddresses();
//     };

//     if (!address.id.startsWith('address-')) {
//       this.profileService.deleteAddress(address.id).subscribe({
//         next: () => {
//           removeLocally();
//           this.showMessage('Đã xóa địa chỉ.');
//         },
//         error: (error: Error) => {
//           removeLocally();
//           this.showMessage(`${error.message} Địa chỉ chỉ được xóa trên thiết bị.`, 'error');
//         },
//       });
//       return;
//     }

//     removeLocally();
//     this.showMessage('Đã xóa địa chỉ trên thiết bị.');
//   }

//   setDefaultAddress(address: UserAddressRecord): void {
//     const updated = { ...address, isDefault: true };

//     const persist = () => {
//       const nextList = this.addresses().map((item) => ({
//         ...item,
//         isDefault: item.id === address.id,
//       }));
//       this.addresses.set(nextList);
//       this.persistAddresses();
//     };

//     if (!address.id.startsWith('address-')) {
//       this.profileService.updateAddress(address.id, updated).subscribe({
//         next: persist,
//         error: (error: Error) => {
//           persist();
//           this.showMessage(
//             `${error.message} Địa chỉ mặc định chỉ được cập nhật trên thiết bị.`,
//             'error',
//           );
//         },
//       });
//       return;
//     }
//     persist();
//   }

//   changePassword(): void {
//     this.passwordError.set('');
//     const { oldPassword, newPassword, confirmPassword } = this.passwordForm;

//     if (!oldPassword || !newPassword || !confirmPassword) {
//       this.passwordError.set('Vui lòng nhập đầy đủ thông tin.');
//       return;
//     }
//     if (newPassword.length < 8) {
//       this.passwordError.set('Mật khẩu mới cần có ít nhất 8 ký tự.');
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       this.passwordError.set('Mật khẩu xác nhận không khớp.');
//       return;
//     }

//     this.isChangingPassword.set(true);
//     this.auth
//       .changePassword({ oldPassword, newPassword })
//       .pipe(finalize(() => this.isChangingPassword.set(false)))
//       .subscribe({
//         next: () => {
//           this.showPasswordModal.set(false);
//           this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
//           this.showMessage('Đổi mật khẩu thành công.');
//         },
//         error: (error: Error) => this.passwordError.set(error.message),
//       });
//   }

//   addressLabel(address: UserAddressRecord): string {
//     const parts = [address.address, address.ward, address.district, address.city].filter(Boolean);
//     return parts
//       .filter(
//         (part, index) =>
//           !parts
//             .slice(0, index)
//             .some((previous) => previous.toLocaleLowerCase().includes(part.toLocaleLowerCase())),
//       )
//       .join(', ');
//   }

//   private loadRemoteData(userId: string): void {
//     this.isLoading.set(true);
//     let completed = 0;

//     const finish = () => {
//       completed++;
//       if (completed === 2) this.isLoading.set(false);
//     };

//     this.profileService.getProfile(userId).subscribe({
//       next: (profile) => {
//         const nextProfile = { ...this.profile(), ...profile };
//         this.profile.set(nextProfile);
//         this.persistProfile(nextProfile);
//         finish();
//       },
//       error: (error: Error) => {
//         this.showMessage(`${error.message} Đang dùng thông tin đã lưu trên thiết bị.`, 'error');
//         finish();
//       },
//     });

//     this.profileService.getAddresses(userId).subscribe({
//       next: (addresses) => {
//         this.addresses.set(addresses);
//         this.persistAddresses();
//         finish();
//       },
//       error: (error: Error) => {
//         this.showMessage(`${error.message} Đang dùng địa chỉ đã lưu trên thiết bị.`, 'error');
//         finish();
//       },
//     });
//   }

//   private loadAuthenticatedProfile(): void {
//     const user = this.auth.currentUser();
//     if (!user) {
//       this.isLoading.set(false);
//       return;
//     }

//     const currentProfile = this.profile();
//     const updated = {
//       ...currentProfile,
//       userId: user.id,
//       fullName: user.fullName || currentProfile.fullName,
//       email: user.email || currentProfile.email,
//       phone: user.phone || currentProfile.phone,
//     };

//     this.profile.set(updated);
//     this.loadRemoteData(user.id);
//   }

//   private persistProfile(prof: UserProfileRecord): void {
//     this.profile.set({ ...prof });
//     localStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
//     this.auth.updateCurrentUser({
//       fullName: prof.fullName,
//       email: prof.email,
//       phone: prof.phone,
//     });
//   }

//   private persistAddresses(): void {
//     localStorage.setItem(ADDRESSES_KEY, JSON.stringify(this.addresses()));
//   }

//   private loadStored<T>(key: string, fallback: T): T {
//     try {
//       const stored = localStorage.getItem(key);
//       if (!stored) return structuredClone(fallback);
//       const parsed: unknown = JSON.parse(stored);
//       if (Array.isArray(fallback))
//         return (Array.isArray(parsed) ? parsed : structuredClone(fallback)) as T;
//       if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
//         return { ...(fallback as object), ...parsed } as T;
//       }
//       return structuredClone(fallback);
//     } catch {
//       return structuredClone(fallback);
//     }
//   }

//   private emptyAddress(): UserAddressRecord {
//     return {
//       id: '',
//       name: '',
//       phone: '',
//       email: '',
//       country: 'Việt Nam',
//       address: '',
//       ward: '',
//       district: '',
//       city: '',
//       isDefault: false,
//     };
//   }

//   private showMessage(msg: string, type: 'success' | 'error' = 'success'): void {
//     this.message.set(msg);
//     this.messageType.set(type);
//     if (this.messageTimeout) clearTimeout(this.messageTimeout);
//     this.messageTimeout = setTimeout(() => this.message.set(''), 4500);
//   }
// }