import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { VeilleService, VeilleItem } from '../../services/veille.service';
import { HomeVeilleService, HomeScale } from '../../services/home-veille.service';
import { HomeArticlesService } from '../../services/home-articles.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { MarqueeBarComponent } from '../../components/marquee-bar/marquee-bar.component';
import { VeilleIconComponent } from '../../components/veille-icon/veille-icon';
import { ImageCarouselComponent } from '../../components/image-carousel/image-carousel.component';
import { sectorColor, sectorTint } from '../../services/sectors';
import { formatRecapText } from '../../services/rich-text';

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
  private readonly homeArticles = inject(HomeArticlesService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly router = inject(Router);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly loggedIn = computed(() => this.auth.isLoggedIn());

  // ── Articles de l'accueil (À la une + grille), pilotés par l'admin ──
  readonly loadingArticles = signal(true);
  readonly hero = signal<ArticleItem | null>(null);
  readonly rest = signal<ArticleItem[]>([]);
  readonly noArticles = computed(() => !this.hero() && this.rest().length === 0);

  // ── Section « Veille média » (pilotée par l'admin, veilles taguées Actualité) ──
  readonly veilles = signal<VeilleItem[]>([]);
  readonly homeEnabled = signal(true);
  readonly homeScale = signal<HomeScale>('normal');

  // ── Section « Dernières actualités » : fil complet paginé (aperçus → modale au clic) ──
  readonly latest        = signal<VeilleItem[]>([]);
  readonly latestLoading = signal(true);
  readonly latestPage    = signal(1);
  readonly latestTotal   = signal(0);
  readonly latestHasMore = signal(false);
  readonly latestGated   = signal(false);

  /** Le fil est scindé : à gauche les actus illustrées (vignette), à droite celles sans photo
   *  (titre seul, pleine largeur) — évite les vignettes grises vides. */
  readonly latestWithPhoto = computed(() => this.latest().filter(v => !!v.image));
  readonly latestNoPhoto   = computed(() => this.latest().filter(v => !v.image));

  /** Colonnes masonry (CSS multi-colonnes) selon l'échelle : cartes à hauteur naturelle,
   *  elles comblent les vides verticaux → pas de « gros blanc » (comme la veille admin). */
  readonly gridClass = computed(() => {
    switch (this.homeScale()) {
      case 'compact': return 'columns-1 sm:columns-2 lg:columns-4 [column-gap:1.25rem]';
      case 'grand':   return 'columns-1 md:columns-2 [column-gap:1.25rem]';
      default:        return 'columns-1 sm:columns-2 lg:columns-3 [column-gap:1.25rem]';
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
    // Articles : recharge au démarrage ET à chaque enregistrement de la modale admin.
    effect(() => {
      this.homeArticles.version();
      this.loadArticles();
    });
    // Recharge la section accueil au démarrage, à chaque enregistrement admin (version)
    // ET à la connexion/déconnexion (le contenu dépend du token : déverrouillage + plafond visiteur).
    effect(() => {
      this.homeVeille.version();
      this.auth.isLoggedIn();
      this.loadHomeVeille();
      this.loadLatest(1);
      // allowSignalWrites : loadLatest() bascule `latestLoading` de façon synchrone.
    }, { allowSignalWrites: true });
  }

  private loadArticles() {
    this.articlesSvc.loadHome().subscribe({
      next: r => { this.hero.set(r.hero); this.rest.set((r.items ?? []).slice(0, 8)); this.loadingArticles.set(false); },
      error: () => this.loadingArticles.set(false),
    });
  }

  // ── Fil « Dernières actualités » ──
  loadLatest(page = 1) {
    this.latestLoading.set(true);
    this.homeVeille.loadLatest(page).subscribe({
      next: r => {
        this.latest.set(r.items ?? []);
        this.latestPage.set(r.page ?? page);
        this.latestTotal.set(r.total ?? 0);
        this.latestHasMore.set(!!r.hasMore);
        this.latestGated.set(!!r.gated);
        this.latestLoading.set(false);
      },
      error: () => { this.latestLoading.set(false); },
    });
  }
  /** Suivant : le visiteur est arrêté par le mur d'inscription au-delà de la 1re page. */
  nextPage() {
    if (this.latestGated()) { this.signup(); return; }
    if (this.latestHasMore()) this.loadLatest(this.latestPage() + 1);
  }
  prevPage() { if (this.latestPage() > 1) this.loadLatest(this.latestPage() - 1); }

  /** Catégorie affichée dans le fil : secteur si présent, sinon le tag (Actualité…). */
  categoryOf(v: VeilleItem): string {
    if (v.sector) return this.sectorLabel(v.sector);
    const t = this.tagsOf(v)[0];
    return t ? this.tagLabel(t) : (this.fr() ? 'Actualité' : 'News');
  }
  categoryColor(v: VeilleItem): string { return v.sector ? this.secColor(v.sector) : '#B23A2E'; }

  /** Ancienneté relative (« il y a 2 h ») ; au-delà d'une semaine → date complète. */
  timeAgo(value?: string): string {
    if (!value) return '';
    const t = new Date(value).getTime();
    if (isNaN(t)) return '';
    const fr = this.fr();
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return fr ? `il y a ${s} s` : `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return fr ? `il y a ${m} min` : `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return fr ? `il y a ${h} h` : `${h}h ago`;
    const j = Math.floor(h / 24);
    if (j < 7)  return fr ? `il y a ${j} j` : `${j}d ago`;
    return this.formatDate(value);
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
  /** Extrait avec formatage léger (**gras**, *italique*, ==surlignage==) → HTML pour [innerHTML]. */
  richText(t?: string | null): string { return formatRecapText(t); }
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

  // ── Lecture intégrale sur l'accueil (modale) + visionneuse photo ──
  readonly selected = signal<VeilleItem | null>(null);
  readonly photoOpen = signal(false);
  /** Clic sur une carte : verrouillée → mur d'abonnement ; sinon → lecture intégrale (modale). */
  openCard(v: VeilleItem) {
    if (v.locked) { this.goLocked(); return; }
    this.selected.set(v);
  }
  closeDetail() { this.selected.set(null); this.photoOpen.set(false); }
  /** Visionneuse plein écran de la photo (image entière, non rognée). */
  openPhoto() { this.photoOpen.set(true); }
  closePhoto() { this.photoOpen.set(false); }

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
