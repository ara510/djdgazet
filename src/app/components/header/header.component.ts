import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);

  @Output() openAuth = new EventEmitter<'login' | 'signup'>();

  readonly mobileMenuOpen = signal(false);
  readonly searchOpen = signal(false);

  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  readonly todayEn = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  readonly categories = [
    { key: 'politics', route: '/category/politics', i18n: 'nav.politics' },
    { key: 'economy', route: '/category/economy', i18n: 'nav.economy' },
    { key: 'society', route: '/category/society', i18n: 'nav.society' },
    { key: 'culture', route: '/category/culture', i18n: 'nav.culture' },
    { key: 'sport', route: '/category/sport', i18n: 'nav.sport' },
    { key: 'tech', route: '/category/tech', i18n: 'nav.tech' },
    { key: 'tourism', route: '/category/tourism', i18n: 'nav.tourism' },
    { key: 'environment', route: '/category/environment', i18n: 'nav.environment' },
    { key: 'opinion', route: '/category/opinion', i18n: 'nav.opinion' },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  toggleSearch() {
    this.searchOpen.update((v) => !v);
  }

  toggleLang() {
    this.i18n.toggle();
  }

  logout() {
    this.auth.logout();
  }
}
