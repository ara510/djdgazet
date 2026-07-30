import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { HomeVeilleService, FeedCat } from '../../services/home-veille.service';
import { VeilleItem } from '../../services/veille.service';
import { VeilleIconComponent } from '../../components/veille-icon/veille-icon';
import { ImageCarouselComponent } from '../../components/image-carousel/image-carousel.component';
import { sectorColor, sectorTint } from '../../services/sectors';
import { formatRecapText } from '../../services/rich-text';

/**
 * Fil plein écran d'une catégorie gratuite (Actualité / Fait marquant), façon Facebook :
 * une colonne, veilles affichées EN ENTIER (photos + texte + sources), scroll infini.
 * Contenu gratuit → accessible à tous ; le visiteur est arrêté après la 1re page (mur d'inscription).
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, VeilleIconComponent, ImageCarouselComponent],
  templateUrl: './feed.component.html',
})
export class FeedComponent implements AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly homeVeille = inject(HomeVeilleService);
  private readonly route = inject(ActivatedRoute);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly loggedIn = computed(() => this.auth.isLoggedIn());

  readonly cat      = signal<FeedCat>('actualite');
  readonly items    = signal<VeilleItem[]>([]);
  readonly loading  = signal(true);
  readonly page     = signal(1);
  readonly total    = signal(0);
  readonly hasMore  = signal(false);
  readonly gated    = signal(false);

  readonly title = computed(() =>
    this.cat() === 'fait_marquant'
      ? (this.fr() ? 'Faits marquants' : 'Key facts')
      : (this.fr() ? 'Actualités' : 'News'));

  @ViewChild('sentinel') sentinel?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  constructor() {
    // Catégorie depuis l'URL (/fil/actualite | /fil/fait-marquant) → recharge à chaque changement.
    this.route.paramMap.subscribe(p => {
      const raw = (p.get('cat') || 'actualite').replace('-', '_');
      this.cat.set(raw === 'fait_marquant' ? 'fait_marquant' : 'actualite');
      this.reset();
    });
    // Le contenu déverrouillé dépend du token → recharge à la connexion/déconnexion.
    effect(() => { this.auth.isLoggedIn(); this.reset(); }, { allowSignalWrites: true });
    // Verrouille le défilement du fond quand la visionneuse plein écran est ouverte.
    effect(() => { document.body.style.overflow = this.lightbox() ? 'hidden' : ''; });
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) this.loadMore();
    }, { rootMargin: '400px' });
    if (this.sentinel) this.observer.observe(this.sentinel.nativeElement);
  }
  ngOnDestroy() { this.observer?.disconnect(); document.body.style.overflow = ''; }

  // ── Visionneuse plein écran (coupures de journal : zoom pour lire le texte) ──
  readonly lightbox = signal<{ images: string[]; index: number } | null>(null);
  readonly zoomed   = signal(false);

  openLightbox(images: string[], i = 0) { if (images?.length) { this.zoomed.set(false); this.lightbox.set({ images, index: i }); } }
  closeLightbox() { this.lightbox.set(null); this.zoomed.set(false); }
  /** Clic sur l'image : bascule taille réelle ⇄ ajustée (lecture d'une coupure). */
  toggleZoom(ev?: Event) { ev?.stopPropagation(); this.zoomed.update(z => !z); }
  lightboxPrev(ev?: Event) { ev?.stopPropagation(); this.zoomed.set(false); this.lightbox.update(l => l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : l); }
  lightboxNext(ev?: Event) { ev?.stopPropagation(); this.zoomed.set(false); this.lightbox.update(l => l ? { ...l, index: (l.index + 1) % l.images.length } : l); }

  @HostListener('document:keydown.escape') onEsc() { if (this.lightbox()) this.closeLightbox(); }
  @HostListener('document:keydown.arrowleft')  onLeft()  { const l = this.lightbox(); if (l && l.images.length > 1) this.lightboxPrev(); }
  @HostListener('document:keydown.arrowright') onRight() { const l = this.lightbox(); if (l && l.images.length > 1) this.lightboxNext(); }

  private reset() {
    this.items.set([]);
    this.page.set(1);
    this.total.set(0);
    this.hasMore.set(false);
    this.gated.set(false);
    this.load(1);
  }

  private load(page: number) {
    this.loading.set(true);
    this.homeVeille.loadLatest(page, this.cat()).subscribe({
      next: r => {
        this.items.update(list => page === 1 ? (r.items ?? []) : [...list, ...(r.items ?? [])]);
        this.page.set(r.page ?? page);
        this.total.set(r.total ?? 0);
        this.hasMore.set(!!r.hasMore);
        this.gated.set(!!r.gated);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Charge la page suivante (scroll infini). Le visiteur est arrêté par le mur d'inscription. */
  loadMore() {
    if (this.loading() || this.gated() || !this.hasMore()) return;
    this.load(this.page() + 1);
  }

  signup() { this.authModal.open('signup'); }

  // ── Bouton « retour en haut » (apparaît quand on a défilé vers le bas) ──
  readonly showTop = signal(false);
  @HostListener('window:scroll') onWindowScroll() { this.showTop.set(window.scrollY > 700); }
  scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ── Helpers d'affichage de la carte veille (repris de l'accueil) ───────────
  readonly TYPE_COLORS: Record<string, string> = { web: '#8B6B3D', social: '#2f6fb0', radio: '#7d5ba6', tv: '#c0563b', presse: '#2e8b6b', institution: '#0e7490' };
  readonly NET_COLORS: Record<string, string> = { facebook: '#1877F2', youtube: '#FF0000', instagram: '#E4405F', x: '#1d1d1f', linkedin: '#0A66C2' };
  readonly sourceTypes: { value: string; fr: string; en: string }[] = [
    { value: 'web', fr: 'Site web', en: 'Website' }, { value: 'social', fr: 'Réseau social', en: 'Social media' },
    { value: 'radio', fr: 'Radio', en: 'Radio' }, { value: 'tv', fr: 'Télévision', en: 'TV' },
    { value: 'presse', fr: 'Presse écrite', en: 'Print press' }, { value: 'institution', fr: 'Institution', en: 'Institution' },
  ];
  readonly networks: Record<string, string> = { facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn' };
  readonly tagLabels: Record<string, { fr: string; en: string }> = {
    actualite:     { fr: 'Actualité',     en: 'News'     },
    fait_marquant: { fr: 'Fait marquant', en: 'Key fact' },
  };

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }
  tagLabel(t?: string | null): string { const o = t ? this.tagLabels[t] : null; return o ? (this.fr() ? o.fr : o.en) : ''; }
  tagsOf(v: VeilleItem): string[] { return v.tags?.length ? v.tags : []; }
  richText(t?: string | null): string { return formatRecapText(t); }
  urlsOf(v: VeilleItem): string[] { return v.urls?.length ? v.urls : (v.url ? [v.url] : []); }
  heading(v: VeilleItem): string { return v.title || this.sectorLabel(v.sector) || v.source || (this.fr() ? 'Veille' : 'Watch'); }
  typesOf(v: VeilleItem): string[] { return v.source_types?.length ? v.source_types : (v.source_type ? [v.source_type] : []); }
  networksOf(v: VeilleItem): string[] { return v.social_networks?.length ? v.social_networks : (v.social_network ? [v.social_network] : []); }
  sourcesOf(v: VeilleItem): string[] { return v.sources?.length ? v.sources : (v.source ? [v.source] : []); }
  typeLabel(t?: string | null): string { const o = this.sourceTypes.find(x => x.value === t); return o ? (this.fr() ? o.fr : o.en) : ''; }
  typeColor(t?: string | null): string { return this.TYPE_COLORS[t || ''] || '#607D8B'; }
  networkLabel(n?: string | null): string { return n ? (this.networks[n] ?? '') : ''; }
  netColor(n?: string | null): string { return this.NET_COLORS[n || ''] || '#607D8B'; }
  secColor(s?: string | null): string { return sectorColor(s); }
  secTint(s?: string | null): string { return sectorTint(s); }
  imagesOf(v: VeilleItem): string[] { return v.images?.length ? v.images : (v.image ? [v.image] : []); }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
