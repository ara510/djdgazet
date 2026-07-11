import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { VeilleService, VeilleItem } from '../../services/veille.service';
import { HomeVeilleService, HomeScale } from '../../services/home-veille.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { MarqueeBarComponent } from '../../components/marquee-bar/marquee-bar.component';
import { VeilleIconComponent } from '../../components/veille-icon/veille-icon';
import { ImageCarouselComponent } from '../../components/image-carousel/image-carousel.component';
import { sectorColor, sectorTint } from '../../services/sectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MarqueeBarComponent, VeilleIconComponent, ImageCarouselComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly veille = inject(VeilleService);
  private readonly homeVeille = inject(HomeVeilleService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly router = inject(Router);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly loggedIn = computed(() => this.auth.isLoggedIn());

  readonly loadingArticles = signal(true);
  readonly articles = signal<ArticleItem[]>([]);

  // ── Section « Veille média » (pilotée par l'admin, veilles taguées Actualité) ──
  readonly veilles = signal<VeilleItem[]>([]);
  readonly homeEnabled = signal(true);
  readonly homeScale = signal<HomeScale>('normal');

  readonly hero = computed(() => this.articles()[0] ?? null);
  readonly rest = computed(() => this.articles().slice(1, 9));

  /** Classes de grille selon l'échelle choisie par l'admin. */
  readonly gridClass = computed(() => {
    switch (this.homeScale()) {
      case 'compact': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'grand':   return 'grid-cols-1 md:grid-cols-2';
      default:        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  });
  /** Hauteur d'image (object-cover, sans letterbox) selon l'échelle. */
  readonly imgClass = computed(() => {
    switch (this.homeScale()) {
      case 'compact': return 'h-40';
      case 'grand':   return 'h-64';
      default:        return 'h-48';
    }
  });
  constructor() {
    this.articlesSvc.list().subscribe({
      next: rows => { this.articles.set(rows); this.loadingArticles.set(false); },
      error: () => this.loadingArticles.set(false),
    });
    // Recharge la section accueil au démarrage ET à chaque enregistrement admin (version).
    effect(() => {
      this.homeVeille.version();
      this.loadHomeVeille();
    });
  }

  private loadHomeVeille() {
    this.homeVeille.loadPublic().subscribe({
      next: r => { this.homeEnabled.set(r.enabled); this.homeScale.set(r.scale ?? 'normal'); this.veilles.set(r.items ?? []); },
      error: () => { this.homeEnabled.set(false); this.veilles.set([]); },
    });
  }

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }

  readonly tagLabels: Record<string, { fr: string; en: string }> = {
    actualite:     { fr: 'Actualité',     en: 'News'     },
    fait_marquant: { fr: 'Fait marquant', en: 'Key fact' },
  };
  tagLabel(t?: string | null): string { const o = t ? this.tagLabels[t] : null; return o ? (this.fr() ? o.fr : o.en) : ''; }
  tagsOf(v: VeilleItem): string[] { return v.tags?.length ? v.tags : []; }
  urlsOf(v: VeilleItem): string[] { return v.urls?.length ? v.urls : (v.url ? [v.url] : []); }
  heading(v: VeilleItem): string { return v.title || this.sectorLabel(v.sector) || v.source || (this.fr() ? 'Veille' : 'Watch'); }

  // ── Types de source, réseaux, secteurs : libellés + codes couleur (repris de la veille) ──
  readonly TYPE_COLORS: Record<string, string> = { web: '#8B6B3D', social: '#2f6fb0', radio: '#7d5ba6', tv: '#c0563b', presse: '#2e8b6b', institution: '#0e7490' };
  readonly NET_COLORS: Record<string, string> = { facebook: '#1877F2', youtube: '#FF0000', instagram: '#E4405F', x: '#1d1d1f', linkedin: '#0A66C2' };
  readonly sourceTypes: { value: string; fr: string; en: string }[] = [
    { value: 'web', fr: 'Site web', en: 'Website' }, { value: 'social', fr: 'Réseau social', en: 'Social media' },
    { value: 'radio', fr: 'Radio', en: 'Radio' }, { value: 'tv', fr: 'Télévision', en: 'TV' },
    { value: 'presse', fr: 'Presse écrite', en: 'Print press' }, { value: 'institution', fr: 'Institution', en: 'Institution' },
  ];
  readonly networks: Record<string, string> = { facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn' };

  typesOf(v: VeilleItem): string[] { return v.source_types?.length ? v.source_types : (v.source_type ? [v.source_type] : []); }
  networksOf(v: VeilleItem): string[] { return v.social_networks?.length ? v.social_networks : (v.social_network ? [v.social_network] : []); }
  sourcesOf(v: VeilleItem): string[] { return v.sources?.length ? v.sources : (v.source ? [v.source] : []); }
  typeLabel(t?: string | null): string { const o = this.sourceTypes.find(x => x.value === t); return o ? (this.fr() ? o.fr : o.en) : ''; }
  typeColor(t?: string | null): string { return this.TYPE_COLORS[t || ''] || '#607D8B'; }
  networkLabel(n?: string | null): string { return n ? (this.networks[n] ?? '') : ''; }
  netColor(n?: string | null): string { return this.NET_COLORS[n || ''] || '#607D8B'; }
  secColor(s?: string | null): string { return sectorColor(s); }
  secTint(s?: string | null): string { return sectorTint(s); }
  /** Toutes les images de la veille (tableau `images`, repli sur l'image principale). */
  imagesOf(v: VeilleItem): string[] { return v.images?.length ? v.images : (v.image ? [v.image] : []); }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /** Texte brut extrait de la description HTML (aperçu des cartes article). */
  excerpt(html?: string | null, len = 160): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').replace(/\s+/g, ' ').trim().slice(0, len);
  }

  /** Bouton veille : connecté → tableau de bord ; visiteur → inscription. */
  openVeille() {
    if (this.loggedIn()) this.veille.open();
    else this.authModal.open('signup');
  }

  /** Teaser verrouillé : connecté → offres ; visiteur → inscription. */
  goLocked() {
    if (this.loggedIn()) this.router.navigate(['/abonnements']);
    else this.authModal.open('signup');
  }

  signup() { this.authModal.open('signup'); }
}
