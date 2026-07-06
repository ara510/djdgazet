import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthComponent } from './components/auth/auth';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner';
import { PrivacyModalComponent } from './components/privacy-modal/privacy-modal';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget';
import { VeilleService } from './services/veille.service';
import { PrivacyService } from './services/privacy.service';
import { AuthModalService } from './services/auth-modal.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    AuthComponent,
    DashboardComponent,
    CookieBannerComponent,
    PrivacyModalComponent,
    ChatWidgetComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header (openAuth)="openAuth($event)" />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      @if (authModal.mode(); as mode) {
        <app-auth [initialTab]="mode" (closed)="authModal.close()" />
      }
      @if (veille.isOpen()) {
        <app-dashboard />
      }
      @if (showCookieBanner()) {
        <app-cookie-banner (accepted)="showCookieBanner.set(false)" />
      }
      @if (privacy.isOpen()) {
        <app-privacy-modal />
      }
      <app-chat-widget />
    </div>
  `,
})
export class AppComponent {
  protected readonly veille = inject(VeilleService);
  protected readonly privacy = inject(PrivacyService);
  protected readonly authModal = inject(AuthModalService);
  private readonly auth = inject(AuthService);
  readonly showCookieBanner = signal(false);

  constructor() {
    if (!localStorage.getItem('gazety_cookies')) {
      setTimeout(() => this.showCookieBanner.set(true), 3000);
    }
  }

  openAuth(mode: 'login' | 'signup') {
    this.authModal.open(mode);
  }

  // Réarme le minuteur d'inactivité (déconnexion auto après 2 h) à chaque activité.
  @HostListener('document:mousemove')
  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:scroll')
  @HostListener('document:touchstart')
  onActivity() { this.auth.resetActivityTimer(); }
}
