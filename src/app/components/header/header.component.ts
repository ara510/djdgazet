import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { VeilleService } from '../../services/veille.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly veille = inject(VeilleService);

  @Output() openAuth = new EventEmitter<'login' | 'signup'>();

  openVeille() {
    this.veille.open();
  }

  readonly mobileMenuOpen = signal(false);

  // Secteurs = colonne `sectors` de la base (cf. VEILLE_SECTORS côté serveur).
  readonly categories = [
    { key: 'politique',     route: '/secteur/politique',     i18n: 'sector.politique' },
    { key: 'economie',      route: '/secteur/economie',      i18n: 'sector.economie' },
    { key: 'international',  route: '/secteur/international',  i18n: 'sector.international' },
    { key: 'social',        route: '/secteur/social',        i18n: 'sector.social' },
    { key: 'environnement', route: '/secteur/environnement', i18n: 'sector.environnement' },
    { key: 'agriculture',   route: '/secteur/agriculture',   i18n: 'sector.agriculture' },
    { key: 'tourisme',      route: '/secteur/tourisme',      i18n: 'sector.tourisme' },
    { key: 'mines',         route: '/secteur/mines',         i18n: 'sector.mines' },
    { key: 'telecoms',      route: '/secteur/telecoms',      i18n: 'sector.telecoms' },
    { key: 'autre',         route: '/secteur/autre',         i18n: 'sector.autre' },
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  toggleLang() {
    this.i18n.toggle();
  }
}
