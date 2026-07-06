import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { I18nService } from '../../services/i18n.service';
import { NewsService, Article } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, NewsCardComponent],
  templateUrl: './article.component.html',
})
export class ArticleComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly news = inject(NewsService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authModal = inject(AuthModalService);

  signup() { this.authModal.open('signup'); }

  private readonly idParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly fr = computed(() => this.i18n.isFrench());
  private isNumericId(id: string) { return /^\d+$/.test(id); }

  // ── Article backend (id numérique) ──────────────────────────────────────
  readonly backendArticle = signal<ArticleItem | null>(null);
  readonly favorite = signal(false);
  readonly favLoading = signal(false);
  readonly relatedBackend = signal<ArticleItem[]>([]);
  readonly showGallery = signal(false);

  /** Description enrichie (HTML rédigé par un admin → confiance, on garde la mise en forme). */
  readonly descriptionHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.backendArticle()?.description || '')
  );

  /** Toutes les photos de l'article (la 1re = principale). */
  readonly galleryImages = computed<string[]>(() => {
    const a = this.backendArticle();
    if (!a) return [];
    return a.images?.length ? a.images : (a.image ? [a.image] : []);
  });

  constructor() {
    // allowSignalWrites : l'effet réinitialise des signaux (showGallery/backendArticle) à chaque
    // changement d'id — interdit par défaut dans un effect Angular 18.
    effect(() => {
      const id = this.idParam();
      this.showGallery.set(false);
      if (this.isNumericId(id)) {
        this.articlesSvc.getOne(id).subscribe({
          next: a => {
            this.backendArticle.set(a);
            this.favorite.set(!!a.favorite);
            this.articlesSvc.list(a.sector).subscribe({
              next: rows => this.relatedBackend.set(rows.filter(r => r.id !== a.id).slice(0, 4)),
              error: () => this.relatedBackend.set([]),
            });
          },
          error: () => { this.backendArticle.set(null); this.relatedBackend.set([]); },
        });
      } else {
        this.backendArticle.set(null);
        this.relatedBackend.set([]);
      }
    }, { allowSignalWrites: true });
  }

  toggleGallery() { this.showGallery.update(v => !v); }

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }

  baDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /** Extrait en texte brut de la description HTML (pour les cartes « Sur le même secteur »). */
  relatedExcerpt(r: ArticleItem): string {
    if (!r.description) return '';
    const div = document.createElement('div');
    div.innerHTML = r.description;
    return (div.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  toggleFavorite() {
    const a = this.backendArticle();
    if (!a) return;
    if (!this.auth.isLoggedIn()) {
      this.toast.show(this.fr() ? 'Connectez-vous pour enregistrer cet article.' : 'Sign in to save this article.', 'error');
      return;
    }
    const next = !this.favorite();
    this.favLoading.set(true);
    this.articlesSvc.toggleFavorite(a.id, next).subscribe({
      next: r => {
        this.favorite.set(r.favorite);
        this.favLoading.set(false);
        this.toast.show(r.favorite ? (this.fr() ? 'Ajouté aux favoris' : 'Saved to favorites') : (this.fr() ? 'Retiré des favoris' : 'Removed from favorites'), 'success');
      },
      error: () => { this.favLoading.set(false); this.toast.show(this.fr() ? 'Action impossible.' : 'Action failed.', 'error'); },
    });
  }

  copyLink() {
    const url = window.location.href;
    const done = () => this.toast.show(this.fr() ? 'Lien copié !' : 'Link copied!', 'success');
    const fail = () => this.toast.show(this.fr() ? 'Copie impossible.' : 'Copy failed.', 'error');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done, fail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta); done();
      } catch { fail(); }
    }
  }

  // ── Article statique (id non numérique) — inchangé ──────────────────────
  readonly article = computed<Article | undefined>(() =>
    this.isNumericId(this.idParam()) ? undefined : this.news.getById(this.idParam())
  );

  readonly related = computed<Article[]>(() => {
    const current = this.article();
    if (!current) return [];
    return this.news
      .getByCategory(current.category)
      .filter((a) => a.id !== current.id)
      .slice(0, 3);
  });

  readonly isLocked = computed(() => {
    const a = this.article();
    if (!a) return false;
    return a.premium && this.auth.tier() === 'general';
  });

  title(a: Article): string {
    return this.i18n.isFrench() ? a.title.fr : a.title.en;
  }

  excerpt(a: Article): string {
    return this.i18n.isFrench() ? a.excerpt.fr : a.excerpt.en;
  }

  categoryLabel(a: Article): string {
    return this.news.categoryLabel(a.category, this.i18n.lang());
  }

  formattedDate(a: Article): string {
    return this.news.formatDate(a.publishedAt, this.i18n.lang());
  }
}
