import { computed, Injectable, signal } from '@angular/core';
import {
  AUTH_VIEW_CONTENT,
  AuthScreen,
  AuthViewModel,
} from '../../../../core/customer/models/auth-view.model';

@Injectable()
export class AuthViewService {
  private readonly currentScreen = signal<AuthScreen>('login');

  readonly screen = this.currentScreen.asReadonly();
  readonly isSplitScreen = computed(
    () => this.currentScreen() === 'login' || this.currentScreen() === 'register'
  );

  readonly viewModel: AuthViewModel = {
    assets: {
      logo: '/public/assets/customer/images/auth/logo.png',
      loginArtwork: '/public/assets/customer/images/auth/login-dog.png',
      registerArtwork: '/public/assets/customer/images/auth/register-dog.png',
      recoveryArtwork: '/public/assets/customer/images/auth/search-dog.png',
      successArtwork: '/public/assets/customer/images/auth/success-dog.png',
      backgroundBlob: '/public/assets/customer/images/auth/background-blob.png',
    },
    ...AUTH_VIEW_CONTENT,
  };

  openScreen(screen: AuthScreen): void {
    this.currentScreen.set(screen);
  }

  screenContent(screen: AuthScreen, recipient = ''): AuthViewModel['screens'][AuthScreen] {
    const content = AUTH_VIEW_CONTENT.screens[screen];
    return {
      ...content,
      description: content.description.replace('{{recipient}}', recipient),
    };
  }
}