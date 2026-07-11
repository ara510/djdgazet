import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { VeilleService } from '../../services/veille.service';
import { MarqueeService } from '../../services/marquee.service';
import { HomeVeilleService } from '../../services/home-veille.service';
import { MarqueeBarComponent } from '../marquee-bar/marquee-bar.component';
import { MarqueeAdminComponent } from '../marquee-admin/marquee-admin.component';
import { HomeVeilleAdminComponent } from '../home-veille-admin/home-veille-admin.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MarqueeBarComponent, MarqueeAdminComponent, HomeVeilleAdminComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly veille = inject(VeilleService);
  protected readonly marquee = inject(MarqueeService);
  protected readonly homeVeille = inject(HomeVeilleService);
  private readonly router = inject(Router);

  @Output() openAuth = new EventEmitter<'login' | 'signup'>();

  constructor() {
    this.marquee.load(); // charge l'état public de la bande (affichée si activée)
  }

  // ── Menu d'actions (Veille / Articles / Administration / Bande d'actu) ──
  readonly actionsMenuOpen = signal(false);
  toggleActionsMenu() { this.actionsMenuOpen.update((v) => !v); }
  closeActionsMenu() { this.actionsMenuOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape() { this.actionsMenuOpen.set(false); }

  openVeille() {
    this.closeActionsMenu();
    this.veille.open();
  }

  openMarquee() {
    this.closeActionsMenu();
    this.marquee.openAdmin();
  }

  openHomeVeille() {
    this.closeActionsMenu();
    this.homeVeille.openAdmin();
  }

  doLogout() {
    this.closeActionsMenu();
    this.auth.logout();
    this.router.navigate(['/']);
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
}
