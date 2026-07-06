import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { VeilleService } from '../../services/veille.service';
import { ArticleService, ArticleItem } from '../../services/article.service';

interface PublicVeille {
  id: number;
  title: string | null;
  excerpt?: string | null;
  source?: string | null;
  source_type?: string | null;
  source_types?: string[] | null;
  sector?: string | null;
  sectors?: string[] | null;
  image?: string | null;
  tier: 'generale' | 'sectorielle' | 'dediee';
  locked: boolean;
  published_at?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly veille = inject(VeilleService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly http = inject(HttpClient);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly loggedIn = computed(() => this.auth.isLoggedIn());

  readonly loadingArticles = signal(true);
  readonly articles = signal<ArticleItem[]>([]);
  readonly veilles = signal<PublicVeille[]>([]);

  readonly hero = computed(() => this.articles()[0] ?? null);
  readonly rest = computed(() => this.articles().slice(1, 9));
  /** Aperçu veille : le visiteur ne voit pas plus de 5 veilles. */
  readonly veillePreview = computed(() => this.veilles().slice(0, this.loggedIn() ? 8 : 5));

  constructor() {
    this.articlesSvc.list().subscribe({
      next: rows => { this.articles.set(rows); this.loadingArticles.set(false); },
      error: () => this.loadingArticles.set(false),
    });
    this.http.get<PublicVeille[]>('/api/veille/public').subscribe({
      next: rows => this.veilles.set(rows ?? []),
      error: () => this.veilles.set([]),
    });
  }

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }

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

  signup() { this.authModal.open('signup'); }
}
